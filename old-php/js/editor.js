$(function() {
	String.prototype.trunc = String.prototype.trunc || function(n) {
		return (this.length > n) ? this.substr(0,n-1)+'&hellip;' : this;
	};

	function getQuery() {
		var query_string = {};
		var query = window.location.search.substring(1);
		var vars = query.split("&");

		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split("=");

			if (typeof query_string[pair[0]] === "undefined") {
				query_string[pair[0]] = decodeURIComponent(pair[1]);
			} else if (typeof query_string[pair[0]] === "string") {
				var arr = [query_string[pair[0]], decodeURIComponent(pair[1]) ];
				query_string[pair[0]] = arr;
			} else {
				query_string[pair[0]].push(decodeURIComponent(pair[1]));
			}
		} 
		return query_string;
	};

	var initQuery = getQuery();
	var editor = ace.edit("editor");
	var languageTools = ace.require("ace/ext/language_tools");
	var editHash = initQuery["hash"];
	var editKey = "";
	var lastTimeout = null;

	editor.setTheme("ace/theme/twilight");
	editor.getSession().setMode("ace/mode/gml");
	editor.setShowPrintMargin(false);
	
	$.ajax({
		dataType: 'json',
		type: 'post',
		url: './core.php',
		data: {
			hash: editHash,
		},
		success: function (result) {
			parseResult(result);

			editor.getSession().on('change', function(e) {
				if (lastTimeout) {
					clearTimeout(lastTimeout);
					lastTimeout = null;
				}
				
				lastTimeout = setTimeout(postContents, 1500);
			});
		}
	});
	
	function postContents() {
		$.ajax({
			dataType: 'json',
			type: 'post',
			url: './core.php',
			data: {
				hash: editHash,
				key: editKey,
				contents: editor.getSession().getValue().trunc(8192)
			},
			success: function (result) {
				parseResult(result);
			}
		});
	}
	
	function parseResult(result) {
		if (result && result.success) {
			if (result.hash) {
				editHash = result.hash;
				history.replaceState(null, null, "?hash=" + result.hash);
			}
			
			if (result.key) {
				editKey = result.key;
			}
			
			if (result.contents) {
				editor.getSession().setValue(result.contents);
			}
		}
	}
});