---
layout: default
title: Add results rendering
parent: Quickstart
nav_order: 4
---
Add the following to the same page as the search form.

{% raw %}
```
<script src="{{site.baseurl}}/dist/custom-search.js"></script>
<link rel="stylesheet" type="text/css" href="{{site.baseurl}}/dist/custom-search.css">
<div id="spinner"><i class="fa fa-spinner fa-spin"></i></div>
```
{% endraw %}

The following can be added to increase speed on large indexes. Otherwise the JavaScript plugin assumes that the url for the index is the same path as the JavaScript script. If this problematic, when initiating the assumed url can be overridden ([information for overriding url](#with-overrides-below))
{% raw %}
```
<script src="{{site.baseurl}}/js/index.js"></script>
```
{% endraw %}

The spinner div is not required but it provides a spinner. 

There are three required html items that have to be defined in order for the results, facets and pagination to render. 

**facets** by default are in a id field of `facets`. This is not required if you do not want any facets. 

The results get dumped in the `search_results` and pagination gets dumped in `pagination`. 

These preset tags can be overridden on initialization. The framework used in this website is below. 

Additionally, if you want any sort fields besides relevance or name, another option field needs to be added. Make sure the value option matches the jekyll field or search field in your config. This field does not have to be set in the config field, it just needs to exist in the jekyll fields. It can also be set as a search field from the config settings. For best results make sure the sort field is not a list. 

You can also have reverse order sort. In order to do this add three underscores followed by `desc` to the field (`___desc`). See example below.

```
<div id="header_info"></div>
<div style="float: left; width: 20%; ">
  <div id="facets">
  </div>
</div>
<div style="float: left; width: 80%; display: none; border: 1px solid #ccc" class="all_results">
  <div id="search_results">
    <div id="searchInfo">
      <span id="number_results"></span>
      <span id="sort_by" class="dropdownsort"><label for="sortSelect">Sort By:</label>
        <select id="sortSelect" name="sort" onchange="changeSort(event);">
          <option value="">Relevance</option>
          <option value="atoz">Name (Asc)</option>
          <option value="atoz___desc">Name (Desc)</option>
          <option value="born">Birth Year</option>
        </select>
      </span>
    </div>
  </div>
  <ul id="resultslist">
  </ul>
  <div id="pagination"></div>
</div>
<div style="clear:both"><span></span></div>
```

The final step requires the search to be initialized on page load. Add the following code to the page. The example below also shows how to initialize and override default fields for results.

### Simple Initialization
```
<script>
window.addEventListener("load", function(){
    loadsearchtemplate();
    $('#spinner').hide();
});
</script>
```

### With overrides (below)
```
<script>
window.addEventListener("load", function(){
    var dict = {facets: '#new_facet_field', pagination: '#paginationid', "results": ".results-class-override", settingsurl: "http://hostname.com/javascript/index.js"}
    loadsearchtemplate(dict);
    $('#spinner').hide();
});
</script>
```