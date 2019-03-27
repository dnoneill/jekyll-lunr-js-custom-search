function createSearch(values, origsearch_dict, sort, lunr_settings){
  var idx = lunr.Index.load(JSON.parse(index));
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
        } else if (i == "query" || i == "q"){
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
        nohighlight = lunr_settings['displayfields'].filter(element => element['highlight'] == false).map(x => x['field'])
        if (matchvalue.length > 1 && getorigkey.indexOf("facet") == -1) {
          if (Object.keys(highlight_display).indexOf(field) > -1){
            field = highlight_display[field]
          }
          if (!nohighlight.includes(field)) {
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
    }
    all_results[results[i].ref] = dictionary
  }

  if (sort){
  	var sort_field = sort == 'atoz' ? lunr_settings['atozsortfield'] : sort;
    var sorted = _.sortBy(Object.values(all_results), function(item) {
     return [String(item[sort_field]).normalize('NFD'), String(item[lunr_settings['atozsortfield']]).normalize('NFD')];
    })
    var sorted_dict = {}
    for (var j=0; j<sorted.length; j++){
      sorted_dict[sorted[j]['slug']] = sorted[j]
    }
    all_results = sorted_dict
  }
  return all_results
}

function remove_facet(facet){
  var current_url = window.location.search;
  if (facet == 'all'){
    full_url = current_url.split("?")[0] + "?q="
  } else {
    current_url = current_url.replace(/%20/g, '+').replace(/[^a-zA-Z=+_&]/g, '');
    var clean_values = window.location.search.split("?").slice(-1)[0].split("&");
    url_components = current_url.split('&');
    facet = facet.replace(/%20/g, '+').replace(/[^a-zA-Z=+_&]/g, '');
    clean_values.splice(url_components.indexOf(facet), 1);
    clean_values = clean_values.length > 0 ? clean_values : ['query='];
    full_url = window.location.pathname + "?" + clean_values.join("&");
  }
  window.location = full_url;
}

function simpleTemplating(data, values, settings) {
  var html = '';
  var disp_settings = lunr_settings['displayfields']
  $.each(data, function(index, key){
    var exclude = ['headerimage', 'contentfield', 'headerfield']
    var header_field = disp_settings.filter(element => element['headerfield'] == true)[0]['field'];
    var image_field = disp_settings.filter(element => element['headerimage'] == true);
    var content_field = disp_settings.filter(element => element['contentfield'] == true);
    var dispfields = disp_settings.filter(element => !Object.keys(element).some(r=> exclude.includes(r)));
    var image_data = image_field.length > 0 ? values[key][image_field[0]['field']] : '';
    var image_link = image_data && image_data[0] == '<' ? image_data : `<img src="${image_data}">`
    html += `<li id="result">${image_data ? `<div class="thumbnail">${image_link}</div>` : ``}
    <h2><a href="${baseurl}${values[key].url}">${values[key][header_field]}</a></h2><div class="results_data">`
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
          field_value = _.uniq(first_field_values.concat(field_value.split(joiner)))
          field_value = field_value.length > dispfields[j]['truncate'] ? field_value.slice(0, dispfields[j]['truncate']).join(joiner) + '...' : field_value.join(joiner);
        }
        var plural = dispfields[j]['plural'] ? dispfields[j]['plural'] : dispfields[j]['label'] + 's';
        var label = field_value && field_value.toString().split(joiner).length > 1 ? plural : dispfields[j]['label'];
        html += `${field_value && display != -1 ? `
          <tr>
            ${dispfields[j]['label'] ? `<td class="searchResultLeftColumn">${label}:</td>` : ``}
            <td class="searchResultRightColumn">
            ${field_value}
            </td>
          </tr>
        ` : ``}`
      }
      html += `</tbody></table></div>`
    }
    var content = content_field.length > 0 ? values[key][content_field[0]['field']] : values[key]['content'];
    content = content.replace(/<mark>/g,"&gt;mark&lt;").replace(/<\/mark>/g,"&gt;/mark&lt;").replace(/<(.|\n)*?>/g, "");
    content = content.replace(/&gt;/g, "<").replace(/&lt;/g, ">").replace(/\r?\n|\r/g, " ").replace(/ {1,}/g, " ");
    var truncate = content_field.length > 0 ? parseInt(content_field[0]['truncate']) : 101;
    var mark_index = values[key]['content'].indexOf("<mark>");
  var content_data = mark_index > truncate ? content.split(" ").slice(mark_index, ) : content.split(" ");
    html += `<div class="excerpt">
        ${content_data.length > 0 ? `${mark_index > truncate ? `<span class="ellipses">...</span>` : ``}
        ${content_data.slice(0,truncate).join(" ")}${content_data.length > truncate ? `<span class="ellipses">...</span>` : ``}` :
        `` }`
  html += `</li>`;
  });
  return html;
}

function loadsearchtemplate(settings){
	var script_url = '';
	var need_to_load = true;
	var scripts = document.getElementsByTagName('script');
	for (var ar=0; ar < scripts.length; ar++){
		if(scripts[ar].src.indexOf('index.js') > -1){
			need_to_load = false;
		} 
		if(scripts[ar].src.indexOf('advanced-search.js') > -1){
			script_url = scripts[ar].src;
		}
	}
	if (need_to_load == true) {
		var leading_url = script_url.split(/\/(?=[a-zA-Z])/gm);
		leading_url.pop()
		var url = settings && settings['settingsurl'] ? settings['settingsurl'] : leading_url.join("/") + '/index.js';
		var get_data = function () {
	    	var tmp = null;
	    	$.ajax({
	        	'async': false,
	        	'type': "GET",
	        	'dataType': "script",
	        	'url': url,
	        	'success': function (data) {
	            	tmp = data;
	        	}
	    	});
	    	return tmp;
		}();
	}
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
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
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
            } else if (!all_facets[searchfield]) {
            	all_facets[searchfield] = []
            }
          }
        }
        var concat_fields = {}
        for (var key in all_facets){
        	if (Object.keys(all_facets[key]).length > 0) {
          		concat_fields[key] = _.countBy(_.compact(all_facets[key]));
          	}
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
            var link_html =  `<a onclick="location.href='${current_url}${sorted_list[i][0]}';" id="${sorted_list[i][0].toLowerCase().replace(/[^A-Za-z0-9]/g, "")}">
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
        facet_html = facet_html != '' ? facet_html : '<div>No Facets</div>';
		if ($(facets_ident)) {
        	$(facets_ident).html(facet_html)
        }
        var breadcrumbs = "<span id='breadcrumbs'>"
        breadcrumbs += search_items.length != 0 ? "Results for: " : "All Results";
        for (var querytype in pairs){
          var queries = [].concat(pairs[querytype])
          for (var query = 0; query < queries.length; query++) {
            var facet_data = queries[query]
            var encode_facet = encodeURIComponent(facet_data).replace("'", "%27")
            var facet_id = facet_data.toLowerCase().replace(/[^A-Za-z0-9]/g, "");
            if (querytype.indexOf('facet') > -1){
              $(`#${facet_id}`).attr('onclick', `remove_facet("${querytype}=${encode_facet}")`).css('text-decoration', 'none').css('color', 'black');
              $(`#${facet_id}`).append(' <i class="fas fa-times"></i>');
            }
            breadcrumbs += `<button class="facet_button" type="button" onclick="remove_facet('${querytype}=${encode_facet}')">
                ${querytype.replace("facet_", "").charAt(0).toUpperCase()}${querytype.replace("facet_", "").slice(1,)}: ${facet_data} <i class="fa fa-times-circle"></i>
                </button>`
          }
        }
        breadcrumbs += search_items.length > 1 ? `<button class="facet_button" type="button" onclick="remove_facet('all')">
            Clear All <i class="fa fa-times-circle"></i>
            </button>` : ''
        breadcrumbs += `</span>`
        $("#header_info").css("display", "block").html(breadcrumbs)
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