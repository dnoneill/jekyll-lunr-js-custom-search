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

Next the lunr settings need to be defined. It requires a good grasp on your data. Firstly the collection defines which collection or collections is going to get indexed. ***This must be a list even for one collection***

***Fields*** Have three required fields. ***searchfield*** which is the field used in the search form. ***boost*** which determines how important a match in lunr is. [More information on boosts](https://lunrjs.com/guides/searching.html#boosts)). ***jekyllfields*** is also always a list even if a single jekyll field. This is the field in the markdown file. It allows for multiple fields to be searched in a single search field. For example, searching `name` will match the query against the `preferredName` and the `variantNames`.

There are additional fields called widgets for more complex data. They are not needed for jekyll fields that are strings or lists.

The ***nested*** widget takes a complex field seen below. It will take any field with nested field below. The example below is the most complex instance. It would also work if wlCity was not in a list. It also requires the parent field be defined. In the example below the parent field would be "workLocations" and the jekyllfields would be wlCity and/or wlCounty.
```
workLocations:
- wlCity: Owego
  wlCountry: United States
- wlCity: Washington D.C.
  wlCountry: United States
```
The ***flatten*** widget takes a complex field like the one seen below. This will not work on a list.

```
contributions:
 authors:
 - Author 1
 - Author 2
 updates:
 - Content Updater 1
```

The final widget is ***relational***. This piggybacks on database structures. It requires the collection which has the relational data to be defined. It also requires a match field. This is where the collection's slug will be located. If that is nested a secondaryfield is available but not required. The example below shows the snippet of text targeted in a ***works*** file. The works file has a field named `contributor` which is a list and the slug is located in the contributorId field. This will check all entries. If there is a match if will pull out the jekyll fields in the work field for indexing.

```
preferredName: Loa to Divine Narcissus
variantName:
- El Divino Narciso
contributor:
- contributorId: P000004
  contributorRole: Author
```
The ***headerfield*** defines what will display for header field in the results. This is a single field.

The ***display*** fields is a list of fields that will display in a table for results. The only required field is **field** which defines what field is being displayed. It can be a Jekyll field or if a widget has been used on a search field, a search field can be used as the for the **field** value. **label** is the plain text label which will display in the information table. This is not a required table. This should be entered in the singular form. If the results are plural it will add an `s` to the label. **joiner** will join multiple results with whatever is the field. By default it is `', '`. **conditional** means the results will only appear if there is a match in that field. Default is false.

An excerpt field also get automatically generated. To hide the field add the following to the css:
```
.excerpt {
  display: none
}
```

**atozsortfield** is the field the sort by 'name' field sorts on. This will sort the field from atoz.

**fuzzysearchfields** should be fields that have an input not a dropdown field. This basically says any of these fields do not have to match exactly. This sets the editDistance to 1. editDistance is also 1 for the query field. Otherwise the search will expect an exact match. An searchfields in this list will do a fuzzy match. **This must be a searchfield value**

An example of all these settings can be seen below. An example of it running is here: [https://dnoneill.github.io/jekyll-advancedsearch/search?q=&name=&ethnicity=](https://dnoneill.github.io/jekyll-advancedsearch/search?q=&name=&ethnicity=)
  ```
  lunr_settings:
    "collections": ["people"],
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
```

## 4. Create search form
The only really important thing when creating the search form is to make sure the "name" field matches the "searchfield" you would like to search against.

<form role="search">
<div class="search-control" style="display:none;">
    <input type="search" id="person-serarch" name="q"
           placeholder="Keyword Search"
           aria-label="Search people using keyword">
    <input type="search" id="person-search" name="name"
           placeholder="Search Name"
           aria-label="Search people using name">
    <select id="ethnicitieselect" name="ethnicity"
      aria-label="Dropdown for ethnicity">
        <option value="">All ethnicities</option>
        {% for ethnicity in ethnicities %}
          {% if ethnicity != '' %}
          <option value="{{ethnicity}}">{{ethnicity}}</option>
          {% endif %}
        {% endfor %}
    </select>
    <select multiple="multiple" size="10" id="occupationSelect" name="occupation"
      aria-label="occupation search">
      <optgroup label="Occupations">
        {% for occupation in occupations %}
          {% if occupation != '' %}
          <option value="{{occupation}}">{{occupation}}</option>
          {% endif %}
        {% endfor %}
      </optgroup>
    </select>
    <button class="custom_button" style="float: right;">Search</button>
</div>
</form>

### 5. Create results page
Add the following libraries to search page. The spinner div is not required but it provides a spinner. **Also make sure that the search form is included in this page**.

```
<script src="{{site.baseurl}}/js/index.js"></script>
<script src="{{site.baseurl}}/css/advanced-search.js"></script>
<link rel="stylesheet" type="text/css" href="{{site.baseurl}}/css/advanced-search.css">
<div id="spinner"><i class="fa fa-spinner fa-spin"></i></div>
```

There are three required html items that have to be defined in order for the results to render. **facets** by default are in a id field of `facets`. The results get dumped in the `search_results` and pagination gets dumped in `pagination`


These fields can be changed when the search is initialized. See code below for how to initialize.
```
window.addEventListener("load", function(){
    loadsearchtemplate(dict)
    $('#spinner').hide()
});
```

Below also shows how to initialize and override default fields for results.
```
window.addEventListener("load", function(){
    var dict = {facets: '#new_facet_field', pagination: '#paginationid', "results": ".results-class-override"}
    loadsearchtemplate(dict)
    $('#spinner').hide()
});
```

### 6. Alternate data directory

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
