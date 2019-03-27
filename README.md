# Custom search for [Jekyll](http://jekyllrb.com/) websites using [lunr.js](http://lunrjs.com/)

Originally forked from [jekyll-lunr-js-search](https://github.com/slashdotdash/jekyll-lunr-js-search) and refactored for advanced or query search with customization for collections. This will also work with posts because they are classified as the collection 'posts'.

### Using gem
Quickstart instructions are located here: [https://dnoneill.github.io/jekyll-lunr-js-custom-search/quickstart](https://dnoneill.github.io/jekyll-lunr-js-custom-search/quickstart)

### 6. Alternate data directory

You can choose to store `index.js`, `custom-search.js` and `lunr.js` in a different directory like this:

    lunr_search:
      js_dir: "javascript"

### Development Requirements

Install [Bundler](http://bundler.io/) and then run the following.

	bundle install

Install [Bower](http://bower.io).

To build the plugin.

    rake build

Then copy `build/jekyll_lunr_js_search.rb` to your Jekyll site's `_plugins` folder and the `build/*.min.js` files to your site's `js` folder.

If you include the `.js` and `.js.map` files your browser developer console will link to the unminified code.
