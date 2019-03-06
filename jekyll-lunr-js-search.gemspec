lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'jekyll_lunr_advanced_js_search/version'

Gem::Specification.new do |s|
  s.name          = 'jekyll-lunr-advanced-js-search'
  s.version       = Jekyll::LunrJsSearch::VERSION
  s.licenses      = ['MIT']
  s.summary       = 'Advanced search plugin for collections in Jekyll'
  s.description   = 'Use lunr.js to provide advanced search, using JavaScript in your browser, for your Jekyll static website.'
  s.authors       = ['Ben Smith', "Niqui O'Neill"]
  s.files         = Dir.glob("lib/**/*.rb") + Dir.glob("build/*.min.js")
  s.homepage      = 'https://github.com/slashdotdash/jekyll-lunr-advanced-js-search'
  s.require_paths = ['lib']

  s.add_runtime_dependency 'nokogiri', '~> 1.7'
  s.add_runtime_dependency 'json', '~> 2.0'
  s.add_runtime_dependency 'execjs', '~> 2.7'

  s.add_development_dependency 'rake', '~> 12.0'
  s.add_development_dependency 'jsmin', '~> 1.0.1'
end
