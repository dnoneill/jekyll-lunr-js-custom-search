---
layout: default
title: Install
parent: Quickstart
nav_order: 1
---

Install the plugin
Choose to install as either a Ruby Gem, or by copying the pre-built plugin file to your Jekyll site.


# Install as Ruby Gem
1. Add gem to Gemfile
```
 gem "jekyll-lunr-js-custom-search", :git => "git://github.com/dnoneill/jekyll-lunr-js-search.git"
```

2. Modify your Jekyll _config.yml file to include the Gem.
```
plugins:
  - jekyll-lunr-js-custom-search
```

# OR Install pre-built plugin
1. Place build/jekyll_lunr_advanced_js_search.rb inside the `_plugins` folder in the root of your Jekyll site.

The content from all Jekyll posts and pages will be indexed to a js/index.js file ready for lunr.js to consume. This happens each time the site is generated.

A JavaScript plugin is provided in js/lunr.advanced.search.js to handle the configuration of lunr.js and generate the search data.

Dependencies for the JavaScript plugin are as follows.

* [jQuery](http://jquery.com)
* [lunr.js](http://lunrjs.com)
* [paginationjs](http://pagination.js.org)
* [lodash](http://lodash.com)
* [fontawesome](http://fontawesome.com) (Optional)

A pre-built version of the JavaScript plugin, along with all of the above dependencies, concatenated is available in the [build/advanced-search.js](https://github.com/dnoneill/jekyll-lunr-js-search/blob/master/build/advanced-search.js).
