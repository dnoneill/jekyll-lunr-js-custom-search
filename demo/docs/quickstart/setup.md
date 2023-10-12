---
layout: default
title: _config.yml setup
parent: Quickstart
nav_order: 2
---
- TOC
{:toc}

If the collection is not `posts`, define the collection in the `_config.yml` file. The example below uses two collections:
- people: the files are in a `_people` folder. 
- works:  the files are in the `_works` folder. 

It also sets a permalink for the path of all items in the folders relative to the collection's directory

```
collections:
    people:
        output: true
        permalink: /people/:path
    works:
        output: true
        permalink: /works/:path
```

## Collections
Setting up the lunr settings requires a good grasp on your data. In collections, you define which collections will be indexed. **This must be a list even for a single collection.**

```
lunr_settings:
  collections: 
  - people
```

## Fields 
Fields defines the fields which get indexed. Each field entry has three required and two optional fields: 
- **searchfield** is the field used in the search form. It should be one word. 
- **boost** which determines how important a match in lunr is. [Learn more about lunr boosts](https://lunrjs.com/guides/searching.html#boosts). 
- **jekyllfields** is also always a list even if a single Jekyll field. This is the field in the markdown file. It allows for multiple fields to be searched in a single search field. For example, searching `name` will match the query against the `preferredName` and the `variantNames` [see full example](#full-settings-example)
- **facetfield (optional)** has a value of **true** if used. If set as true, it will create a facet in the search interface for the field. (These are ethnicities, occupation, cities, and counties in the [demo]({{site.baseurl}}/demo?q=&name=&ethnicity=))
- **widget (optional)** type of cleaner for complex data. It can require more data based upon the type of widget. See [section below](#widgets-for-complex-fields) for information on widgets.

### Widgets for complex fields
There are additional fields called widgets for more complex data. They are not needed for Jekyll fields that are strings or lists of strings.

#### Nested widget
The **nested** widget takes a complex field. The example below is the most complex instance that will work with the nested widget. 

It would also work if wlCity was not in a list. It requires the field **parentfield**. In the example below the parent field would be "workLocations" and the jekyllfields would be wlCity and/or wlCounty.

```
workLocations:
- wlCity: Owego
  wlCountry: United States
- wlCity: Washington D.C.
  wlCountry: United States
``` 

```
lunr_settings:
  fields:
  - boost: 5
    jekyllfields: [wlCountry, wlCity]
    parentfield: workLocations
    searchfield: worklocations
    widget: nested
```

#### Flatten widget
The **flatten** widget takes a complex field like the one seen below. This will get the values in dictionary.

```
contributions:
 authors:
 - Author 1
 - Author 2
 updates:
 - Content Updater 1
```

```
lunr_settings:
  fields:
  - boost: 1
    jekyllfields: [contributions]
    searchfield: author
    widget: flatten
```

#### Relational widget
The final widget is **relational** widget. This piggybacks on traditional database structures. 

It requires two other fields: 
- **collection**: This defines the collection which has the relational data. 
- **matchfield**: This is where the collection's slug will be located. 

If that is nested a **secondaryfield** is available but not required. The example below shows the snippet of text targeted in a **works** file. The contributorId corresponds to the P000004.md file. The works file has a field named `contributor` which is a list and the slug is located in the contributorId field. If there is a match if will pull out the jekyll fields in the work field for indexing. 

```
preferredName: Loa to Divine Narcissus
variantName:
- El Divino Narciso
contributor:
- contributorId: P000004
  contributorRole: Author
```

```
lunr_settings:
  - boost: 10
    collection: works
    jekyllfields: [preferredName, variantName]
    matchfield: contributor
    searchfield: works
    secondaryfield: contributorId
    widget: relational
```

## Display fields

The **displayfields** key defines a list of fields that will display in the results page. You can add multiple fields. 

- **field**: REQUIRED. Defines what field is being displayed. It can be a Jekyll field or if a widget has been used on a search field, the search field can be used as the for the **field** value. 

- **headerfield**: REQUIRED. Should only get instantiated once. The value is **true**. The **label** field does not apply.

- **headerimage**: Optional. Adds a thumbnail image to the search results if the record has one. Either a HTML link to the image or the URL to the image. Both will work. The value is **true**

- **contentfield** Optional. By default the content field is a 100 words of the 'content' section of the Jekyll markdown. This can be overwritten by setting the **contentfield** to **true**.

- **label**: Plain text label which will display in the information table. This should be entered in the singular form. If the results are plural it will add an `s` to the label. This can be overwritten with the **plural** field, in which you can define what the plural version of the label is.

- **joiner**: Joins multiple results with whatever is the field. By default it is `', '`. 

- **conditional**: The results will only appear if there is a match in that field, option is true. Additionally, for multiple results the results can be truncated in the table by a number. [Conditional example]({{site.baseurl}}/demo?q=loa)

- **truncate**: Truncates a list of options at a number of results. If used for the **contentfield** it will truncate to the number of words. [See occupation field for truncate example]({{site.baseurl}}/demo?q=)

- **highlight**: By default, matches in results get highlighted. In order to override this section, set highlight to false.

```
displayfields:
  - field: preferredName
    headerfield: true
    highlight: false
  - field: variantNames
    joiner: '<br>'
    label: Variant Name
    truncate: 3
  - conditional: true
    field: works
    joiner: '; '
    label: Building
  - field: content
    contentfield: true
    highlight: false
    truncate: 20
  - field: ethnicity
    plural: Ethnicities
    label: Ethnicity
  - field: imagesrc
    headerimage: true
    highlight: false
```

An excerpt field also get automatically generated. To hide the field, add the following to the CSS:
```
.excerpt {
  display: none
}
```

## atozsortfield
**atozsortfield** is the field the sort by 'name' field sorts on. This will sort the field from atoz. If you want to add more options for sorting this will be the secondary field that will be sorted. For example, in this demo we added a sort by birth year. Élisabeth Sophie Chéron and Sor Juana Inés de la Cruz have the same birth year. To provide some structure they get sorted by birthyear and then their preferredName (the atozsortfield). This should be a single string field, not a list.

```
lunr_settings:
  atozsortfield: preferredName
```

## fuzzysearchfields
**fuzzysearchfields** should be fields that have an input not a drop-down search field. This basically says any of these fields do not have to match exactly, otherwise . This sets the [editDistance for lunr fuzzy-matches](https://lunrjs.com/guides/searching.html#fuzzy-matches) to 1. editDistance is also 1 for the query field. Otherwise the search will expect an exact match. An searchfields in this list will do a fuzzy match. **This must be a searchfield value from the fields settings**.

```
lunr_settings:
  fuzzysearchfields: [name]
```

## view_facets
**view_facets** should be a number field. This is an **optional** field, if it is not set it will revert to the **default** setting of 4. This determines how many facets are shown, if there are more facets then view_facets the remaining facets will be hidden but can be displayed with the "Show All" button that is automatically generated.

## js_dir
You can store `index.js`, `custom-search.js` and `lunr.js` in a different directory like this:

```
lunr_settings:
  js_dir: "javascript"
```

## Full settings example
An example of all these settings can be seen below. An example of it running is here: [https://dnoneill.github.io/jekyll-lunr-js-custom-search/demo?name=&ethnicity=](https://dnoneill.github.io/jekyll-lunr-js-custom-search/demo?name=&ethnicity=)

```
lunr_settings:
  atozsortfield: preferredName
  collections: [people]
  displayfields:
  - {field: preferredName, headerfield: true, highlight: false}
  - {field: imagesrc, headerimage: true, highlight: false}
  - {field: variantNames, label: Variant Name}
  - {field: occupation, joiner: '; ', label: Occupation, truncate: 2}
  - {field: born, label: Birth Year}
  - {field: ethnicity, label: Ethnicity, plural: Ethnicities}
  - {conditional: 'True', field: works, joiner: '; ', label: Work}
  fields:
  - boost: 10
    facetfield: true
    jekyllfields: [ethnicity]
    searchfield: ethnicity
  - boost: 10
    jekyllfields: [preferredName, variantNames]
    searchfield: name
  - boost: 10
    facetfield: true
    jekyllfields: [occupation]
    searchfield: occupation
  - boost: 1
    jekyllfields: [content]
    searchfield: description
  - boost: 1
    jekyllfields: [contributions]
    searchfield: contributor
    widget: flatten
  - boost: 10
    facetfield: true
    jekyllfields: [wlCity]
    parentfield: workLocations
    searchfield: cities
    widget: nested
  - boost: 10
    facetfield: true
    jekyllfields: [wlCountry]
    parentfield: workLocations
    searchfield: countries
    widget: nested
  - boost: 10
    collection: works
    jekyllfields: [preferredName, variantName]
    matchfield: contributor
    searchfield: works
    secondaryfield: contributorId
    widget: relational
  fuzzysearchfields: [name, birthplace, residences, worklocations]
  view_facets: 5
```
