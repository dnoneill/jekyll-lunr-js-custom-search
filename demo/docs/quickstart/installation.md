---
layout: default
title: Install
parent: Quickstart
nav_order: 1
---

Install the plugin either as a Ruby gem or by copying the pre-built plugin file to your Jekyll site.

# Install as Ruby Gem

1. Add gem to Gemfile
```
 gem "jekyll-lunr-js-custom-search", :git => "git://github.com/dnoneill/jekyll-lunr-js-custom-search.git"
```

2. Modify your Jekyll _config.yml file to include the Gem.
```
plugins:
  - jekyll-lunr-js-custom-search
```

# Install pre-built plugin

Place build/jekyll_lunr_js_custom_search.rb inside the `_plugins` folder in the root of your Jekyll site.

Each time the site is generated, the content from all Jekyll posts and pages will be indexed to a js/index.js file ready for lunr.js to consume.

`js/lunr.custom.search.js` provides a JavaScript plugin to handle the lunr.js configuration and generate the search data.

Dependencies for the JavaScript plugin:
* [jQuery](http://jquery.com)
* [lunr.js](http://lunrjs.com)
* [paginationjs](http://pagination.js.org)
* [lodash](http://lodash.com)
* [fontawesome](http://fontawesome.com) (Optional)

You can find a pre-built version of the JavaScript plugin, along with all of the above dependencies, concatenated in [build/custom-search.js](https://github.com/dnoneill/jekyll-lunr-js-search/blob/master/build/custom-search.js).
