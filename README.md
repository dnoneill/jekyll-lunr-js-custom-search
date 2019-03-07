# Advanced search for [Jekyll](http://jekyllrb.com/) websites using [lunr.js](http://lunrjs.com/)

Originally forked from [jekyll-lunr-js-search](https://github.com/slashdotdash/jekyll-lunr-js-search) and refactored for advanced search and customization for collections. This will also work with posts because they are classified as the collection 'posts'.

## How to use

### 1. Install the plugin

Choose to install as either a Ruby Gem, or by copying the pre-built plugin file to your Jekyll site.

#### 1a. Install as a Ruby Gem

1. Add gem to Gemfile

        gem "jekyll-lunr-advanced-js-search", :git => "git://github.com/dnoneill/jekyll-lunr-js-search.git"

2. Modify your Jekyll `_config.yml` file to include the Gem.

        plugins:
          - jekyll-lunr-js-search

#### 1b. Install by copying the plugin to your Jekyll site.

1. Place `build/jekyll_lunr_advanced_js_search.rb` inside the `_plugins` folder in the root of your Jekyll site.

The content from all Jekyll posts and pages will be indexed to a `js/index.js` file ready for lunr.js to consume. This happens each time the site is generated.

A JavaScript plugin is provided in `js/lunr.advanced.search.js` to handle the configuration of lunr.js and generate the search data.

Dependencies for the JavaScript plugin are as follows.

* [jQuery](http://jquery.com)
* [lunr.js](http://lunrjs.com)
* [paginationjs](http://pagination.js.org)
* [lodash](http://lodash.com)
* [fontawesome](http://fontawesome.com) (Optional)

A pre-built version of the JavaScript plugin, along with all of the above dependencies, concatenated is available in the [build/advanced-search.js](https://github.com/dnoneill/jekyll-lunr-js-search/blob/master/build/advanced-search.js).

### 2. Copy the JavaScript plugin and add a script reference.

#### 2a. Using the pre-built, JavaScript plugin from the gem.

The plugin will automatically add the JavaScript file `js/advanced-search.js` to your `_site` and will also add `css/advanced-search.css` to your `_site`

To use it, you must add a script reference at the top of the search page and load the index into the search page.

        <script src="{{site.baseurl}}/js/index.js"></script>
        <script src="{{site.baseurl}}/js/advanced-search.js"></script>
        <link rel="stylesheet" type="text/css" href="{{site.baseurl}}/css/advanced-search.css">

### 3. Define Collections and Lunr Configuration

If the collection is not posts you will have define the collection in the `_config.yml` file. An example can be seen below. Two collections are being defined. The people collection whose files are in a `_people` folder and the works collection which is in the `_works` folder. It also defines the permalink for all the items in the folders.

    collections:
      people:
          output: true
          permalink: /people/:path
      works:
          output: true
          permalink: /works/:path

Next the lunr settings need to be defined. It requires a good grasp on your data. Firstly the collection defines which collection or collections is going to get indexed.
The fields will define the search fields, the fields in the 

  ```
  lunr_settings:
    {"collections": ["people"],
    "fields": [
        {"searchfield": "id", "boost": 1, "jekyllfields": ["slug"]},
        {"searchfield": "ethnicity", "boost": 10, "jekyllfields": ["ethnicity"], "facetfield": true},
        {"searchfield": "name", "boost": 10, "jekyllfields": ["preferredName", "variantNames"]},
        {"searchfield": "occupation", "boost": 10, "jekyllfields": ["occupation"], "facetfield": true},
        {"searchfield": "description", "boost": 1, "jekyllfields": ["content"]},
        {"searchfield": "contributor", "boost": 1, "jekyllfields": ["contributions"], "widget": "flatten"},
        {"searchfield": "cities", "boost": 10, "parentfield": "workLocations", "jekyllfields": ["wlCity"], "widget": "nested", "facetfield": true},
        {"searchfield": "countries", "boost": 10, "parentfield": "workLocations", "jekyllfields": ["wlCountry"], "widget": "nested", "facetfield": true},
        {"searchfield": "works", "boost": 10, "widget": "relational", "collection": "works", "jekyllfields": ["preferredName", "variantName"], "matchfield" : "contributor", "secondaryfield": "contributorId"}
    ],
    "headerfield": "preferredName",
    "displayfields": [
      {"field" : "variantNames", "label": "Variant Name(s)"},
      {"field": "occupation", "label":"Occupation(s)", "joiner": "; ", "truncate": 2},
      {"field": "born", "label":"Birth Year"},
      {"field": "works", "label":"Work(s)", "joiner": "; ", "conditional": "true"}
    ],
    "atozsortfield" : 'preferredName',
    "fuzzysearchfields": ["name", "birthplace", "residences", "worklocations", "description"]
}
```

    <form action="/search" method="get">
      <input type="text" id="search-query" name="q" placeholder="Search" autocomplete="off">
    </form>

### 7. Configure the jQuery plugin for the search input field.

    <script type="text/javascript">

    </script>

### 10. Alternate data directory

You can choose to store `index.js`, `advanced-search.js` and `lunr.js` in a different directory like this:

    lunr_search:
      js_dir: "javascript"

### Requirements

Install [Bundler](http://bundler.io/) and then run the following.

	bundle install

Install [Bower](http://bower.io).

To build the plugin.

    rake build

Then copy `build/jekyll_lunr_js_search.rb` to your Jekyll site's `_plugins` folder and the `build/*.min.js` files to your site's `js` folder.

If you include the `.js` and `.js.map` files your browser developer console will link to the unminified code.
