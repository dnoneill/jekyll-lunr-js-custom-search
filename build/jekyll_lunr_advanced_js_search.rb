require 'fileutils'
require 'net/http'
require 'json'
require 'uri'
require 'execjs'
require 'kramdown'
require 'nokogiri'

module Jekyll
    module LunrJsSearch
        class Indexer < Jekyll::Generator
            def initialize(config = {})
                super(config)
                @jekyllconfig = config
                @config = config['lunr_settings']
                fields = Hash[@config['fields'].collect { |field| [field['searchfield'], field['boost']] }]
                @lunr_config = {
                    'js_dir' => 'js',
                    'css_dir' => 'css'
                }.merge!(config['lunr_search'] || {})
                @lunr_config['fields'] = fields
                @js_dir = @lunr_config['js_dir']
                @css_dir = @lunr_config['css_dir']
                gem_lunr = File.join(File.dirname(__FILE__), "../../build/lunr.js")
                @lunr_path = File.exist?(gem_lunr) ? gem_lunr : File.join(@js_dir, File.basename(gem_lunr))
                raise "Could not find #{@lunr_path}" if !File.exist?(@lunr_path)
                
                lunr_src = open(@lunr_path).read
                ctx = ExecJS.compile(lunr_src)
                @lunr_version = ctx.eval('lunr.version')
                @docs = {}
            end
            
            # Index all pages except pages matching any value in config['lunr_excludes'] or with date['exclude_from_search']
            # The main content from each page is extracted and saved to disk as json
            def generate(site)
                Jekyll.logger.info "Lunr:", 'Creating search index...'
                
                @site = site
                # gather pages and posts
                data = pages_to_index(site)
                items = data[:items]
                index = []
                
                index_js = open(@lunr_path).read
                index_js << 'var idx = lunr(function() {this.pipeline.remove(lunr.stemmer);this.searchPipeline.remove(lunr.stemmer);this.pipeline.remove(lunr.stopWordFilter);this.searchPipeline.remove(lunr.stopWordFilter);this.tokenizer.separator = /[\s,.;:/?!()]+/;'
                @lunr_config['fields'].each_pair do |name, boost|
                    index_js << "this.field('#{name}', {'boost': #{boost}});"
                end
                items.each_with_index do |item_data, i|
                    doc = {}
                    flat_data = {}
                    item = item_data.to_liquid
                    @config["fields"].each do |field|
                        field["jekyllfields"].each do |jekyllfield|
                            widget = field['widget']
                            orig_field = item[jekyllfield]
                            if widget
                                if widget == 'flatten' && orig_field
                                    orig_field = orig_field.values.flatten()
                                end
                                if widget == 'relational'
                                    if field['secondaryfield']
                                        orig_field = site.collections[field['collection']].docs.collect {|collection| collection[jekyllfield] if collection.to_liquid[field['matchfield']] and collection.to_liquid[field['matchfield']].map{ |i| i[field['secondaryfield']] }.include? item['slug'] }
                                        else
                                        orig_field = site.collections[field['collection']].docs.collect {|collection| collection[jekyllfield] if collection.to_liquid[field['matchfield']] and collection.to_liquid[field['matchfield']].include? item['slug'] }
                                    end
                                end
                                if widget == 'nested'
                                    if item[field["parentfield"]]
                                        if item[field["parentfield"]].class == Array
                                            orig_field = item[field["parentfield"]].map {| parent | parent[jekyllfield]}
                                            else
                                            orig_field = item[field["parentfield"]][jekyllfield]
                                        end
                                    end
                                end
                                if orig_field
                                    orig_field = orig_field.compact.uniq.flatten()
                                    orig_field = [].concat(orig_field)
                                end
                                flat_data[field["searchfield"]] = flat_data[field["searchfield"]] ? flat_data[field["searchfield"]].concat(orig_field) : orig_field
                            end
                            format_field = orig_field.class == Array ?  orig_field.compact.uniq.join(" ") : orig_field
                            if format_field != nil
                                if doc[field["searchfield"]] == nil
                                    doc[field["searchfield"]] = format_field.strip()
                                    else
                                    doc[field["searchfield"]] += " " + format_field.strip()
                                end
                            end
                        end
                    end
                    index_js << 'this.add(' << ::JSON.generate(doc, quirks_mode: true) << ');'
                    final_dict = item.to_hash
                    final_dict['content'] = Nokogiri::HTML(Kramdown::Document.new(item.content).to_html).text.tr("\n"," ")
                    @docs[item["slug"]] = final_dict.merge(flat_data)
                    Jekyll.logger.debug "Lunr:", (item['title'] ? "#{item['title']} (#{item['url']})" : item['url'])
                end
                index_js << '});'
                FileUtils.mkdir_p(File.join(site.dest, @js_dir))
                FileUtils.mkdir_p(File.join(site.dest, @css_dir))
                filename = File.join(@js_dir, 'index.js')
                
                ctx = ExecJS.compile(index_js)
                
                index = ctx.eval('JSON.stringify(idx)')
                total = "var docs = #{@docs.to_json}\nvar index = #{index.to_json}\nvar view_facets = #{@jekyllconfig['view_facets'].to_json}\nvar baseurl = #{@jekyllconfig['baseurl'].to_json}\nvar lunr_settings = #{@config.to_json}"
                filepath = File.join(site.dest, filename)
                File.open(filepath, "w") { |f| f.write(total) }
                Jekyll.logger.info "Lunr:", "Index ready (lunr.js v#{@lunr_version})"
                added_files = [filename]
                
                site_js = File.join(site.dest, @js_dir)
                site_css = File.join(site.dest, @css_dir)
                
                # If we're using the gem, add the lunr and search JS files to the _site
                if File.expand_path(site_js) != File.dirname(@lunr_path)
                    extras = Dir.glob(File.join(File.dirname(@lunr_path), "*.js"))
                    if extras.length > 0
                        FileUtils.cp(extras, site_js)
                        extras.map! { |min| File.join(@js_dir, File.basename(min)) }
                        Jekyll.logger.debug "Lunr:", "Added JavaScript to #{@js_dir}"
                        added_files.push(*extras)
                    end
                    extrascss = Dir.glob(File.join(File.dirname(@lunr_path), "*.css"))
                    if extrascss.length > 0
                        FileUtils.cp(extrascss, site_css)
                        extrascss.map! { |min| File.join(@css_dir, File.basename(min)) }
                        Jekyll.logger.debug "Lunr:", "Added CSS to #{@css_dir}"
                        added_files.push(*extrascss)
                    end
                end
                
                # Keep the written files from being cleaned by Jekyll
                added_files.each do |filename|
                    site.static_files << SearchIndexFile.new(site, site.dest, "/", filename)
                end
            end
            
            def output_ext(doc)
                if doc.is_a?(Jekyll::Document)
                    Jekyll::Renderer.new(@site, doc).output_ext
                    else
                    doc.output_ext
                end
            end
            
            def pages_to_index(site)
                items = []
                
                # deep copy pages and documents (all collections, including posts)
                @config['collections'].each do |collection|
                    site.collections[collection].docs.each do |filedata|
                        items.push(filedata)
                    end
                end
                {:items => items}
            end
        end
    end
end
module Jekyll
  module LunrJsSearch  
    class SearchIndexFile < Jekyll::StaticFile
      # Override write as the index.json index file has already been created 
      def write(dest)
        true
      end
    end
  end
end
module Jekyll
  module LunrJsSearch
    VERSION = "1.0.0"
  end
end
