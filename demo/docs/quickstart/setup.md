---
layout: default
title: _config.yml setup
parent: Quickstart
nav_order: 2
---
- TOC
{:toc}

If the collection is not `posts` you will have define the collection in the `_config.yml` file. An example can be seen below. Two collections are being defined. The people collection whose files are in a `_people` folder and the works collection which is in the `_works` folder. It also defines the permalink for all the items in the folders.

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
Next the lunr settings need to be defined. It requires a good grasp on your data. Firstly the collection defines which collection or collections is going to get indexed. **This must be a list even for a single collection**

```
lunr_settings:
  collections: 
  - people
```

## Fields 
Fields defines the fields which get indexed. Each field entry has three required fields and two optional fields: 
- **searchfield** is the field used in the search form. It should be one word. 
- **boost** which determines how important a match in lunr is. [More information on boosts](https://lunrjs.com/guides/searching.html#boosts)). 
- **jekyllfields** is also always a list even if a single jekyll field. This is the field in the markdown file. It allows for multiple fields to be searched in a single search field. For example, searching `name` will match the query against the `preferredName` and the `variantNames` [see full example](#full-settings-example)
- **facetfield (optional)** has a value of **true** if used. If set as true, it will create a facet in the search interface for the field. (These are ethnicities, occupation, cities, and counties in the [demo]({{site.baseurl}}/demo?q=&name=&ethnicity=))
- **widget (optional)** type of cleaner for complex data. It can require more data based upon the type of widget. See [section below](#widgets-for-complex-fields) for information on widgets.

### Widgets for complex fields
There are additional fields called widgets for more complex data. They are not needed for jekyll fields that are strings or lists of strings.

#### Nested widget
The **nested** widget takes a complex field like the example below. The example below is the most complex instance that will work with the nested widget. 

It would also work if wlCity was not in a list. It also requires the field **parentfield**. In the example below the parent field would be "workLocations" and the jekyllfields would be wlCity and/or wlCounty.


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

It requires a **collection** field which defines the collection which has the relational data. 

It also requires a **matchfield**. This is where the collection's slug will be located. 

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


## Headerfield
The **headerfield** defines what will display for header field in the results. This is a single field.

```
lunr_settings:
  headerfield: preferredName
```

## Display fields
The **displayfields** is a list of fields that will display in a table for results. Like **fields** it allows for multiple fields. 

The only required field is **field** which defines what field is being displayed. 

It can be a Jekyll field or if a widget has been used on a search field, the search field can be used as the for the **field** value. 

**label** is the plain text label which will display in the information table. This should be entered in the singular form. If the results are plural it will add an `s` to the label. 

**joiner** will join multiple results with whatever is the field. By default it is `', '`. 

**conditional** means the results will only appear if there is a match in that field, option is true. Additionally, for multiple results the results can be truncated in the table by a number. [Conditional example]({{site.baseurl}}/demo?q=loa)

**truncate** will truncate a list of options at a number of results. [See occupation field for truncate example]({{site.baseurl}}/demo?q=)

```
displayfields:
  - field: variantNames
    joiner: '<br>'
    label: Variant Name
    truncate: 3
  - conditional: true
    field: works
    joiner: '; '
    label: Building
```

An excerpt field also get automatically generated. To hide the field add the following to the css:
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
**fuzzysearchfields** should be fields that have an input not a dropdown search field. This basically says any of these fields do not have to match exactly, otherwise . This sets the [editDistance](https://lunrjs.com/guides/searching.html#fuzzy-matches) to 1. editDistance is also 1 for the query field. Otherwise the search will expect an exact match. An searchfields in this list will do a fuzzy match. **This must be a searchfield value from the fields settings**.

```
lunr_settings:
  fuzzysearchfields: [name]
```

## Full settings example
An example of all these settings can be seen below. An example of it running is here: [https://dnoneill.github.io/jekyll-advancedsearch/search?q=&name=&ethnicity=](https://dnoneill.github.io/jekyll-advancedsearch/search?q=&name=&ethnicity=)
  ```
lunr_settings:
  atozsortfield: preferredName
  collections: [people]
  displayfields:
  - {field: variantNames, label: Variant Name}
  - {field: occupation, joiner: '; ', label: Occupation, truncate: 2}
  - {field: born, label: Birth Year}
  - {conditional: 'True', field: works, joiner: '; ', label: Work}
  fields:
  - boost: 1
    jekyllfields: [slug]
    searchfield: id
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
  headerfield: preferredName
```