require('uppercase-core');

const PORT = 8112;
const HASH_KEY = 'jDcSckY91E';

INIT_OBJECTS();

CONFIG.isDevMode = true;

WEB_SERVER({
	port : PORT,
	rootPath : __dirname + '/doc'
}, (requestInfo, response, replaceRootPath, next) => {

	let uri = requestInfo.uri;
	let params = requestInfo.params;
	
	let responseNewKey = (callback) => {
		
		RUN((f) => {
			
			let key = RANDOM_STR(6);
			
			CHECK_FILE_EXISTS(__dirname + '/code/' + key + '.txt', (exists) => {
				if (exists === true) {
					f();
				} else {
					response(STRINGIFY({
						key : key,
						password : SHA256({
							password : key,
							key : HASH_KEY
						})
					}));
					
					if (callback !== undefined) {
						callback(key);
					}
				}
			});
		});
	};
	
	if (uri === '__NEW') {
		responseNewKey();
		return false;
	}
	
	else if (uri === '__GET') {
		
		let path = __dirname + '/code/' + params.key + '.txt'
		
		CHECK_FILE_EXISTS(path, (exists) => {
			
			if (exists === true) {
			
				READ_FILE(path, (buffer) => {
					
					response(buffer.toString());
					
					// 오래된 문서 삭제
					FIND_FILE_NAMES(__dirname + '/code', EACH((fileName) => {
						
						let path = __dirname + '/code/' + fileName;
						
						GET_FILE_INFO(path, (fileInfo) => {
							
							// 일주일 지나면 삭제
							if (Date.now() - fileInfo.lastUpdateTime.getTime() > 7 * 24 * 60 * 60 * 1000) {
								REMOVE_FILE(path);
							}
						});
					}));
				});
			}
			
			else {
				response('');
			}
		});
		
		return false;
	}
	
	else if (uri === '__SAVE') {
		
		let key = params.key;
		let password = params.password;
		let code = params.code;
		
		if (key !== undefined && code !== undefined) {
			
			if (password === SHA256({
				password : key,
				key : HASH_KEY
			})) {
				
				WRITE_FILE({
					path : __dirname + '/code/' + key + '.txt',
					content : code
				});
				
				response(STRINGIFY({
					key : key,
					password : password
				}));
			}
			
			else {
				
				responseNewKey((key) => {
					
					WRITE_FILE({
						path : __dirname + '/code/' + key + '.txt',
						content : code
					});
				});
			}
		}
		
		return false;
	}
	
	else if (uri.substring(0, 9) !== 'resource/') {
		requestInfo.uri = 'index.html';
	}
});