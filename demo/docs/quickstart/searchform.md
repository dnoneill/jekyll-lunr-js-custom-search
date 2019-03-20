---
layout: default
title: Create a Search Form
parent: Quickstart
nav_order: 3
---
The only really important thing when creating the search form is to make sure the "name" field matches the "searchfield" in the fields in _config.yml file you would like to search against.

An example of this form can be seen below. This is the code being used in the [demo]({{site.baseurl}}/demo)

```
{% raw %}
{% assign ethnicities = site.people | map: "ethnicity" | compact %}
{% assign ethnicities = ethnicities | join: ','  | split: ','  | uniq | sort %}

{% assign occupations = site.people | map: "occupation" | compact %}
{% assign occupations = occupations | join: ','  | split: ','  | uniq | sort %}
 
<form role="search">
<div class="search-control" style="display:none;">
    <input type="search" id="person-serarch" name="query"
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
{% endraw %}
```
