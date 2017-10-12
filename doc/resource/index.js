'use strict';

INIT_OBJECTS();

RUN(() => {
	
	let dom = DIV({
		style : {
			onDisplayResize : (width, height) => {
				return {
					height : height
				};
			}
		}
	}).appendTo(BODY);
	
	let aceEditor = ace.edit(dom.getEl());
	aceEditor.setTheme('ace/theme/twilight');
	aceEditor.setFontSize(14);
	aceEditor.getSession().setMode('ace/mode/gml');
	aceEditor.getSession().setUseSoftTabs(false);
	aceEditor.renderer.setScrollMargin(0, 300);
	aceEditor.setShowPrintMargin(false);
	aceEditor.commands.addCommand({
		name : 'replace2',
		bindKey : {
			win : 'Ctrl-R',
			mac : 'Command-Option-F'
		},
		exec : (editor) => {
			
			ace.config.loadModule('ace/ext/searchbox', (e) => {
				
				e.Search(editor, true);
				
				let kb = editor.searchBox.$searchBarKb;
				
				let command = kb.commands['Ctrl-f|Commasnd-f|Ctrl-H|Command-Option-F'];
				
				if (command !== undefined && command.bindKey.indexOf('Ctrl-R') === -1) {
					command.bindKey += '|Ctrl-R';
					kb.addCommand(command);
				}
			});
		}
	});
	aceEditor.$blockScrolling = Infinity;
	
	let key;
	let password;
	
	MATCH_VIEW({
		uri : '',
		target : CLASS({
			preset : () => {
				return VIEW;
			},
			init : () => {
				GET('__NEW', (resultStr) => {
					
					let result = PARSE_STR(resultStr);
					
					key = result.key;
					password = result.password;
					
					GO(key);
				});
			}
		})
	});
	
	MATCH_VIEW({
		uri : '{key}',
		target : CLASS({
			preset : () => {
				return VIEW;
			},
			init : (inner) => {
				inner.on('paramsChange', (params) => {
					
					if (key !== params.key) {
						key = params.key;
						
						GET('__GET?key=' + key, (code) => {
							aceEditor.setValue(code, -1);
							aceEditor.getSession().setUndoManager(new ace.UndoManager());
						});
					}
				});
			}
		})
	});
	
	let changeTimeout;
	let beforeCode;
	
	let code;
	
	aceEditor.getSession().on('change', () => {
		
		if (key !== undefined) {
			
			if (code === undefined) {
				code = aceEditor.getValue();
			}
			
			else {
				
				code = aceEditor.getValue();
				
				if (changeTimeout !== undefined) {
					clearTimeout(changeTimeout);
				}
				
				changeTimeout = setTimeout(() => {
					
					if (beforeCode !== code) {
						
						POST({
							uri : '__SAVE',
							params : {
								key : key,
								password : password,
								code : code
							}
						}, (resultStr) => {
							
							let result = PARSE_STR(resultStr);
							
							if (key !== result.key) {
								
								key = result.key;
								password = result.password;
								
								GO(result.key);
							}
						});
						
						beforeCode = code;
					}
					
					changeTimeout = undefined;
					
				}, 500);
			}
		}
	});
});