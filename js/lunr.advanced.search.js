function createSearch(values, origsearch_dict, sort, lunr_settings){
  var idx = lunr.Index.load(JSON.parse(index))
  lunr.tokenizer.separator = /[\s,.;:/?!()]+/;
  idx.pipeline.remove(lunr.stemmer)
  idx.pipeline.remove(lunr.stopWordFilter)
  var search_dict = {}
  for (var key in origsearch_dict){
    search_dict[key.replace("facet_", "")] = origsearch_dict[key]
  }
  try {

    var results = idx.query(function (query) {
    for(var i in search_dict) {
      lunr.tokenizer(search_dict[i]).forEach(function(token) {
        if(lunr_settings['fuzzysearchfields'].includes(i)) {
          query.term(lunr.tokenizer(token), {fields: [i], editDistance: 1, presence: lunr.Query.presence.REQUIRED})
        } else if (i == "q"){
          if (token.toString().length > 1){
            query.term(lunr.tokenizer(token), {presence: lunr.Query.presence.REQUIRED, editDistance: 1})
          } else {
            query.term(lunr.tokenizer(token), {presence: lunr.Query.presence.REQUIRED})
          }
        } else {
          query.term(lunr.tokenizer(token), {fields: [i], presence: lunr.Query.presence.REQUIRED})
        }
      })
    }
  })
} catch(err) {
  return []
}
  var all_results = {}
  var names = {}
  var highlight_display = {}
  var mapfields =   new Map(lunr_settings['fields'].map(item => !item.widget ? [item.searchfield, item.jekyllfields[0]] : []))
  mapfields.forEach ((v,k) => { highlight_display[k] = v })
  for (var i=0; i<results.length; i++){
    var dictionary = values[results[i].ref]
    var matchMeta = results[i].matchData.metadata
    for (var matchvalue in matchMeta){
      for (var field in matchMeta[matchvalue]){
        var getorigkey = Object.keys(origsearch_dict).find(orig_key => origsearch_dict[orig_key].toString().toLowerCase().includes(matchvalue))
        getorigkey = getorigkey != undefined ? getorigkey : '';
        if (matchvalue.length > 1 && getorigkey.indexOf("facet") == -1) {
          if (Object.keys(highlight_display).indexOf(field) > -1){
            field = highlight_display[field]
          }
          var join_array = Array.isArray(dictionary[field])? dictionary[field].join("***") : dictionary[field];
          var start_index = join_array.toLowerCase().indexOf(matchvalue)
          var end_index = start_index + matchvalue.length
          var regEx = new RegExp(matchvalue, "i");
          var match = regEx.exec(dictionary[field]);
          if (match){
            var marktext = join_array.replace(match[0], `<mark>${match[0]}</mark>`);
            marktext = Array.isArray(dictionary[field]) ? marktext.split("***") : marktext;
            dictionary[field] = marktext;
          }
        }
      }
    }
    all_results[results[i].ref] = dictionary
    names[values[results[i].ref][lunr_settings['atozsortfield']]] = results[i].ref
  }

  if (sort == 'atoz'){
    var sort_names = Object.keys(names).sort()
    var sorted_results = {}
    for (var i=0; i<sort_names.length; i++){
      var id = names[sort_names[i]]
      sorted_results[id] = all_results[id]
    }
    all_results = sorted_results
  }
  return all_results
}

function remove_facet(facet){
  var current_url = window.location.href;
  if (facet == 'all'){
    full_url = current_url.split("?")[0] + "?q="
  } else {
    current_url = current_url.replace(/%20/g, '+');
    facet = facet.replace(/%20/g, '+');
    full_url = current_url.replace(facet, "").replace(decodeURIComponent(facet), "")
  }
  window.location = full_url;
}

function simpleTemplating(data, values, settings) {
var html = '';
var dispfields = lunr_settings['displayfields']
  $.each(data, function(index, key){

    html += `<li id="result"><h2><a href="${baseurl}${values[key].url}">${values[key][lunr_settings['headerfield']]}</a></h2>`
    if (dispfields && dispfields.length > 0) {
      html += `<table class="searchResultMetadata"><tbody>`
      for (var j = 0; j<dispfields.length; j++){
        var joiner = dispfields[j]['joiner'] ? dispfields[j]['joiner'] : ", "
        var field_value = Array.isArray(values[key][dispfields[j]['field']])? values[key][dispfields[j]['field']].join(joiner) : values[key][dispfields[j]['field']];
        var display = 0;
        if (dispfields[j]['conditional'] && field_value){
          var display = field_value.indexOf('<mark>')
          field_value = field_value.split(joiner).filter(element => element.includes("mark>")).join(joiner)
        } 
        if (dispfields[j]['truncate'] && field_value) {
        	first_field_values = field_value.split(joiner).filter(element => element.includes("mark>"))
        	field_value = _.uniq(first_field_values.concat(field_value.split(joiner))).slice(0, dispfields[j]['truncate'])
        	field_value = field_value.length >= dispfields[j]['truncate'] ? field_value.join(joiner) + '...' : field_value.join(joiner);
        }
        var label = field_value && field_value.toString().split(joiner).length > 1 ? dispfields[j]['label'] + 's' : dispfields[j]['label'];
        html += `${field_value && display != -1 ? `
          <tr>
          	${dispfields[j]['label'] ? `<td class="searchResultLeftColumn">${label}:</td>` : ``}
            <td class="searchResultRightColumn">
            ${field_value}
            </td>
          </tr>
        ` : ``}`
      }
      html += `</tbody></table>`
    }
    html += `<div class="excerpt">
        ${values[key]['content'].indexOf("<mark>") > -1 && values[key].excerpt.indexOf("<mark>") == -1 ? `
        ...${values[key]['content'].slice(values[key]['content'].indexOf("<mark>"), ).split(" ").slice(0,101).join(" ")}...` :
        `${values[key]['content'].split(" ").splice(0,101).join(" ")}${values[key]['content'].split(" ").length > 101 ? `...` : `` }</div>`
        }`
    });
return html;
}
function loadsearchtemplate(settings){
	view_facets = view_facets ? view_facets : 4;
    var site_url = window.location.origin + window.location.pathname;
    var query = window.location.search.substring(1);
    if (query != ''){
      var index_search = query.search("&sort");
      var sort_type = '';
      if (index_search > -1){
        var sort_string = query.slice(index_search)
        if (sort_string.split("&").length > 2){
          sort_string = sort_string.substr(0, sort_string.indexOf("&", sort_string.indexOf("&") + 1));
        }
        query = query.replace(sort_string, "")
        var sort_type = sort_string.split("=")[1]
      }
      if (sort_type == 'name'){
        sort_type = 'atoz'
      }
      var vars = query.split('&');
      var pairs = {}
      var redirect = {'placeOfOrigin':'birthplace', 'query': 'q', 'residenceHeadquarter':'residences', 'workLocation':'worklocations', 'trade': 'facet_trades', 'principalBuildingStyle': 'styles', 'principalBuildingType':'buildingtypes', 'workLocationCity':'cities', 'workLocationCounty':'counties', 'contributor':'author', 'centuriesSearch':''}
      var needs_redirect = false;
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        pair[0] = pair[0].replace('facet.', '').replace('field.', '')
        if (Object.keys(redirect).indexOf(pair[0]) >= 0){
          if (pair[0] != 'centuriesSearch'){
            pair[0] = redirect[pair[0]]
            needs_redirect = true;
          } else {
            pair[1] = ''
          }
        }
        if (pair[1].length > 0){
            if (pair[0] in pairs){
              var existing_value = pairs[pair[0]]
              existing_value = _.isString(existing_value) ? [existing_value] : existing_value
              var new_list = []
              pairs[pair[0]] = new_list.concat(existing_value, decodeURIComponent(pair[1]).replace(/\+/g, " "))
            } else {
              pairs[pair[0]] = decodeURIComponent(pair[1]).replace(/\+/g, " ")
            }
        }
      }
      if (needs_redirect){
        var queryString = Object.keys(pairs).map((key) => {
          return encodeURIComponent(key) + '=' + encodeURIComponent(pairs[key])
        }).join('&');
        queryString = "?" + queryString + '&sort=' + encodeURIComponent(sort_type)
        window.location.href = site_url + queryString;
      }
      values = createSearch(docs, pairs, sort_type, lunr_settings)
      var current_page = localStorage['currentpage']
      var is_reload = localStorage['currenturl'] == window.location.href
      localStorage.setItem('currenturl', window.location.href)
      var search_items = [].concat.apply([], Object.values(pairs))
      var search_values = search_items.length != 0 ? search_items.join(" : ") : "All Results"

      $("title").html(`Search results for ${search_values}`)
      var results = Object.keys(values).length

      if(results > 0){
        var facet_fields = {}
        var mapfields =   new Map(lunr_settings['fields'].filter(item => item.facetfield).map(item => !item.widget ? [item.searchfield, item.jekyllfields[0]] : [item.searchfield, item.searchfield]))
        mapfields.forEach ((v,k) => { facet_fields[k] = v })
        var all_facets = {}
        facet_html = ''
        var breadcrumbs = "<span id='breadcrumbs'>"
        breadcrumbs += search_items.length != 0 ? "Results for: " : "All Results"
        for (var index = 0; index < search_items.length; index++){
          var encode_facet = encodeURIComponent(search_items[index]).replace("'", "%27")
          breadcrumbs += `<button class="facet_button" type="button" onclick="remove_facet('${encode_facet}')">
              ${search_items[index]} <i class="fa fa-times-circle"></i>
              </button>`
        }
        breadcrumbs += search_items.length > 1 ? `<button class="facet_button" type="button" onclick="remove_facet('all')">
            Clear All <i class="fa fa-times-circle"></i>
            </button>` : ''
        breadcrumbs += `</span>`
        $("#header_info").css("display", "block").html(breadcrumbs)
        for (var key in values){
          for (var searchfield in facet_fields){
            values_field = facet_fields[searchfield]
            if (values[key][values_field]){
              values[key][values_field] = [].concat(values[key][values_field])
              var facet_value = values[key][values_field].join("*").indexOf("<mark>") > -1 ? values[key][values_field].join("*").replace(/<mark>/g, "").replace(/<\/mark>/g, "").split("*") : values[key][values_field]
              if (all_facets[searchfield]){
                all_facets[searchfield] = all_facets[searchfield].concat(facet_value)
              } else {
                all_facets[searchfield] = [].concat(facet_value)
              }
            }
          }
        }
        var concat_fields = {}
        for (var key in all_facets){
          concat_fields[key] = _.countBy(_.compact(all_facets[key]));
        }
        for (var facet_value in concat_fields){
          var ordered = {}
          Object.keys(concat_fields[facet_value]).sort().forEach(function(key) {
              ordered[key] = concat_fields[facet_value][key];
          });

          var sorted_list = Object.keys(ordered).map(function(key) {
            return [key, concat_fields[facet_value][key]];
          });

          sorted_list.sort(function(first, second) {
            return second[1] - first[1];
          });
          var current_url = site_url + window.location.search + "&facet_" + facet_value.replace("_", "") + "="
          var facet_header = facet_value.replace("_", " ");
          facet_html += `<h4>${facet_header.charAt(0).toUpperCase()}${facet_header.slice(1)}</h4>`
          var greater_length = false;
          for (var i = 0; i<sorted_list.length; i++){
            var link_html =  `<a onclick="location.href='${current_url}${sorted_list[i][0]}';">
            ${sorted_list[i][0]} (${sorted_list[i][1]})</a><br>`
            if (i == view_facets + 1){
              facet_html += `<div id="${facet_value}_facet" style="display:none;">` + link_html
              greater_length = true
            } else {
              facet_html += link_html
            }
          }
          if (greater_length == true){
            facet_html += `</div>
            <a href="javascript:showmore('${facet_value}_facet')" id="button_${facet_value}_facet">
              <b>Show All</b>
            </a>`
          }
        }
        var facets_ident = settings && settings['facets'] ? settings['facets'] : "#facets";
        var pagination_ident = settings && settings['pagination'] ? settings['pagination'] : "#pagination";
        var results_ident = settings && settings['results'] ? settings['results'] : "#resultslist";
		if ($(facets_ident)) {
        	$(facets_ident).html(facet_html)
        }
        $(pagination_ident).pagination({
        dataSource: Object.keys(values),
        pageSize: 10,
        showGoInput: true,
        showGoButton: true,
        callback: function(data, pagination) {
            localStorage.setItem("currentpage", parseInt(pagination.pageNumber))
            var from = pagination.pageSize * pagination.pageNumber - pagination.pageSize + 1
            var to = pagination.pageSize * pagination.pageNumber
            to = to > pagination.totalNumber ? pagination.totalNumber : to
            var search_info = `${from}-${to} of ${results} results`
            var html = simpleTemplating(data, docs);
            $("#number_results").html(search_info);
            $(results_ident).html(html);
            if($(results_ident).parent().length > 0) {
            	$(results_ident).parent().css('display', '');
            }
          }
        })

        if (is_reload == true){
            $(pagination_ident).pagination('go', current_page)
        }
        $("#sort_by select option[value='" + sort_type + "']").prop('selected', true);
        localStorage.setItem('sort_type', sort_type)
      } else {
        $(".search-control").css("display", "block").prepend("<div id='no_results'>No results found. Try a new search, or browse the collection.</div>")
      }
    } else {
      $(".search-control").css("display", "block")
    }

}

function changeSort(event) {
  var site_url = window.location.origin + window.location.pathname;
  var sort_type = localStorage['sort_type']
  var window_url = window.location.search.replace("&sort=" + sort_type, "")
  sort_type = $(event.target).find("option:selected").val()
  window.location =  site_url + window_url + "&sort=" + sort_type
};

function showmore(identifier){
  if ($("#"+identifier).css("display") == 'none'){
    $("#"+identifier).css("display", "block")
    $("#button_"+identifier).html("<b>Show Fewer</b>")
  } else {
      $("#"+identifier).css("display", "none")
      $("#button_"+identifier).html("<b>Show All</b>")
  }
}