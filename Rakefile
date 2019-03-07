require 'rake'
require 'jsmin'
require 'fileutils'

task :default => :build

desc "Ensures all dependent JS libraries are installed and builds the gem."
task :build_gem => :build do
  exec("gem build jekyll-lunr-advanced-js-search.gemspec")
end

task :build => [
  :bower_update,
  :create_build_dir,
  :copy_jekyll_plugin,
  :concat_js,
  :concat_css
  ]

task :bower_update do
  abort "Please ensure bower is installed: npm install -g bower" unless system('bower install')
end

task :create_build_dir do
  Dir.mkdir('build') unless Dir.exists?('build')
end

task :copy_jekyll_plugin do
  lunr_version = File.read("bower_components/lunr/VERSION").strip
  open("build/jekyll_lunr_advanced_js_search.rb", "w") do |concat|
    Dir.glob("lib/jekyll_lunr_advanced_js_search/*.rb") do |file|
      ruby = File.read(file).sub(/LUNR_VERSION = .*$/, "LUNR_VERSION = \"#{lunr_version}\"")
      concat.puts ruby
    end
  end
end

task :concat_js do
  files = [
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/lunr/lunr.js',
    'bower_components/paginationjs/dist/pagination.min.js',
    'bower_components/lodash/dist/lodash.min.js',
    'bower_components/fontawesome/js/all.min.js',
    'js/lunr.advanced.search.js'
  ]

  File.open('build/advanced-search.js', 'w') do |file|
    file.write(files.inject('') { |data, file|
      data << File.read(file)
    })
  end

  # Lunr is stored separately so we can use it for index generation
  FileUtils.cp('bower_components/lunr/lunr.js', 'build/lunr.js')
end

task :concat_css do
  files = [
    'bower_components/paginationjs/dist/pagination.css',
    'bower_components/fontawesome/css/all.min.css',
    'css/advanced-search.css'
  ]

  File.open('build/advanced-search.css', 'w') do |file|
    file.write(files.inject('') { |data, file|
      data << File.read(file)
    })
  end
end

#task :minify_js do
# out = JSMin.minify(File.open('build/advanced-search.js', 'r').read)
# File.open('build/advanced-search.min.js', 'w') {|f| f.write(out) }
#end