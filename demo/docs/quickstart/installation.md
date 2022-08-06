---
layout: default
title: Install
parent: Quickstart
nav_order: 1
---

Install the plugin either as a Ruby gem or by copying the pre-built plugin file to your Jekyll site.

# Install the plugin as Ruby Gem

1. Add the Ruby gem to your `Gemfile`:
  ```
   gem "jekyll-lunr-js-custom-search", :git => "git://github.com/dnoneill/jekyll-lunr-js-custom-search.git"
  ```

2. Add `jekyll-lunr-js-custom-search` as plugin to you your Jekyll `_config.yml` file:
  ```
  plugins:
    - jekyll-lunr-js-custom-search
  ```

<!-- Result or next steps? --> 

# Copy pre-built plugin file

1. Copy the `build/jekyll_lunr_js_custom_search.rb` file to the `_plugins` folder in the root of your Jekyll site.
2. Build your Jekyll site.

During each build, all Jekyll posts and pages will be indexed. The index for the Lunr.js search is stored in `js/index.js`.

<!-- Alternative below? Or it is an additional requirement to use the pre-built plugin file? -->

The `js/lunr.custom.search.js` file provides a JavaScript plugin to handle the Lunr.js configuration and generate the search data.
You can find a pre-built plugin version in [build/custom-search.js](https://github.com/dnoneill/jekyll-lunr-js-search/blob/master/build/custom-search.js). 

The pre-built plugin inlcudes the following dependencies:
* [jQuery](http://jquery.com)
* [Lunr.js](http://lunrjs.com)
* [Pagination.js](http://pagination.js.org)
* [Lodash](http://lodash.com)
* [Font Awesome](http://fontawesome.com) (Optional)
