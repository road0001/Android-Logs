const fs=require(`fs`);

const defaultLocalData={
};
let localData={};
function loadStorage(){
	localData=JSON.parse(localStorage.getItem(`localData`));
	if(!localData){
		localData={...defaultLocalData};
	}
	localData={
		...defaultLocalData,
		...localData,
	}
	saveStorage();
}

function saveStorage(){
	localStorage.setItem(`localData`,JSON.stringify(localData));
}

function setData(key,val){
	localData[key]=val;
	saveStorage();
	return localData[key];
}

function getData(key){
	if(!key){
		return localData;
	}else{
		return localData[key];
	}
}

async function loadLDB(key){
	return new Promise(resolve=>{
		const dbRequest = indexedDB.open(`localDB`, 1);
		dbRequest.onupgradeneeded = (event) => {
			let db = event.target.result;
			if (!db.objectStoreNames.contains(`content`)) {
				db.createObjectStore(`content`, { keyPath: `key`});
			}
		};
		dbRequest.onsuccess = (event) => {
			let db = event.target.result;
			let tx = db.transaction(`content`, `readonly`);
			let store = tx.objectStore(`content`);

			let getRequest = store.get(key);
			getRequest.onsuccess = async (event) => {
				if (event.target.result) {
					resolve(event.target.result.data);
				}else{
					resolve();
				}
			};
		};
	});
}

async function saveLDB(key,data){
	return new Promise((resolve,reject)=>{
		const dbRequest = indexedDB.open(`localDB`, 1);
		dbRequest.onupgradeneeded = (event) => {
			let db = event.target.result;
			if (!db.objectStoreNames.contains(`content`)) {
				db.createObjectStore(`content`, { keyPath: `key` });
			}
		};
		dbRequest.onsuccess = (event) => {
			let db = event.target.result;
			let tx = db.transaction(`content`, `readwrite`);
			let store = tx.objectStore(`content`);
			store.put({key:key,data});

			tx.oncomplete = () => resolve(data);
			tx.onerror = (e) => reject(e);
		};
	});
}

async function delLDB(key){
	return new Promise((resolve,reject)=>{
		const dbRequest = indexedDB.open(`localDB`, 1);
		dbRequest.onupgradeneeded = (event) => {
			let db = event.target.result;
			if (!db.objectStoreNames.contains(`content`)) {
				db.createObjectStore(`content`, { keyPath: `key` });
			}
		};
		dbRequest.onsuccess = (event) => {
			let db = event.target.result;
			let tx = db.transaction(`content`, `readwrite`);
			let store = tx.objectStore(`content`);
			store.delete(key);
			tx.oncomplete = () => resolve();
			tx.onerror = (e) => reject(e);
		};
	});
}

function outLog(l,t=`log`){
	try{
		console[t](l);
	}catch(e){
		console.log(l);
		console.error(e);
	}
	$(`#logDiv`).appendDOM({tag:`p`,class:t,html:l || `&nbsp;`});
	$(`#logDiv`)[0].scrollTop=9999;
	let date=new Date().format(`yyyy-MM-dd`);
	let dateTime=new Date().format(`yyyy-MM-dd hh-mm-ss`);
	let outputFile=`Logs/${date}.log`;
	fs.writeFileSync(outputFile, `[${dateTime}] ${t.toUpperCase()} ${l}\n`,{flag:`a`});
}

function clearLog(){
	$(`#logDiv`).html(``);
	let date=new Date().format(`yyyy-MM-dd`);
	let outputFile=`Logs/${date}.log`;
	fs.writeFileSync(outputFile, `\n`,{flag:`a`});
}

String.prototype.replaceAll = function(org,tgt){
	return this.split(org).join(tgt);
}
String.prototype.insert = function(start, newStr) {
	return this.slice(0, start) + newStr + this.slice(start);
};

Date.prototype.format = function(fmt) {
	function getYearWeek(date) {
		var date1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		var date2 = new Date(date.getFullYear(), 0, 1);
	
		//获取1月1号星期（以周一为第一天，0周一~6周日）
		var dateWeekNum = date2.getDay() - 1;
		if (dateWeekNum < 0) {
			dateWeekNum = 6;
		}
		if (dateWeekNum < 4) {
			//前移日期
			date2.setDate(date2.getDate() - dateWeekNum);
		} else {
			//后移日期
			date2.setDate(date2.getDate() + 7 - dateWeekNum);
		}
		var d = Math.round((date1.valueOf() - date2.valueOf()) / 86400000);
		if (d < 0) {
			var date3 = new Date(date1.getFullYear() - 1, 11, 31);
			return getYearWeek(date3);
		} else {
			//得到年数周数
			var year = date1.getFullYear();
			var week = Math.ceil((d + 1) / 7);
			return week;
		}
	}
	
	var o = {
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"h+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		S: this.getMilliseconds(), //毫秒
		"W+": getYearWeek(this), //周数
	};
	if (/(y+)/.test(fmt))
	fmt = fmt.replace(
		RegExp.$1,
		(this.getFullYear() + "").substr(4 - RegExp.$1.length)
	);
	for (var k in o)
	if (new RegExp("(" + k + ")").test(fmt)) {
		fmt = fmt.replace(
		RegExp.$1,
		RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
		);
	}
	return fmt;
};
String.prototype.color=function(keys) {
    let colors = [];
    if(typeof keys === `string`){ // green purple
        colors.push(keys.split(` `));
    }
    else if(typeof keys==`object`){ // [`green`, `purple`]
        keys.forEach(key => {
            colors.push(key);
        });
    }
    return `<span style="color:${colors[0]};background-color:${colors[1]}">${this}</span>`;
}

String.prototype.replaceJsonString=function(fore,back){
	// let text=this;
	// const blocks = extractJsonBlocks(text);
	// if (blocks.length === 0) return text;

	// let result = ``;
	// let lastIndex = 0;

	// for (const block of blocks) {
	// 	result += text.slice(lastIndex, block.start);
	// 	result += `<span class="json" style="color:${fore};background-color:${back}">${block.json}</span>`;
	// 	lastIndex = block.end;
	// }

	// result += text.slice(lastIndex);
	// return result;
	let sa=this.split(``);
	//从头开始查找第一个{，将其替换为begin
	for(let i=0; i<sa.length; i++){
		if(sa[i]==`{`){
			sa[i]=`<br><span style="color:${fore};background-color:${back}">{`;
			break;
		}
	}
	// 替换末尾最后一位
	sa.push(`</span>`);
	// //从尾查找第一个}，将其替换为end
	// for(let i=sa.length-1; i>=0; i--){
	// 	if(sa[i]==`}`){
	// 		sa[i]=`}${end}`;
	// 		break;
	// 	}
	// }
	return sa.join(``);
}

function extractJsonBlocks(text) {
	const results = [];
	const stack = [];
	let jsonStart = -1;

	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		if ((char === '{' || char === '[')) {
			if (stack.length === 0) jsonStart = i;
			stack.push(char);
		}

		if ((char === '}' && stack[stack.length - 1] === '{') ||
			(char === ']' && stack[stack.length - 1] === '[')) {
			stack.pop();

			// JSON 结束
			if (stack.length === 0 && jsonStart !== -1) {
			const jsonStr = text.slice(jsonStart, i + 1);

			try {
				JSON.parse(jsonStr); // 验证合法 JSON
				results.push({ start: jsonStart, end: i + 1, json: jsonStr });
			} catch (e) {
				// 非合法 JSON，忽略
			}

			jsonStart = -1;
			}
		}
	}
	return results;
}

async function wait(n){
	return new Promise(resolve=>{
		setTimeout(()=>{resolve()},n);
	});
}

async function mkdirs(dirpath){
	let mkdirs_child = function(dirpath_child, callback_child){
		try{
			let fs=require(`fs`);
			let path=require(`path`);
			fs.exists(dirpath_child, function(exists) {
				if(exists) {
					callback_child(dirpath_child);
				} else {
					//尝试创建父目录，然后再创建当前目录
					mkdirs_child(path.dirname(dirpath_child), function(){
						fs.mkdir(dirpath_child, callback_child);
					});
				}
			});
		}catch(e){
			callback_child(e);
		}
	};

	return new Promise((success, error)=>{
		if(global.client==`browser`){
			success(null);
		}else{
			try{
				mkdirs_child(dirpath,(final_path)=>{
					success(final_path);
				});
			}catch(e){
				success(e);
			}
		}
	})
}

async function readdir(dirpath){
	return new Promise((resolve, reject)=>{
		fs.readdir(dirpath,(err,files)=>{
			if(err){
				reject(err);
			}else{
				resolve(files);
			}
		})
	});
}

async function readfile(filepath){
	return new Promise((resolve, reject)=>{
		fs.readFile(filepath, `utf8`, (err, data) => {
			if (err) {
				reject(err);
			}else{
				resolve(data);
			}
		});
	});
}

async function savefile(filepath,data){
	return new Promise((resolve, reject)=>{
		fs.writeFile(filepath, data, (err) => {
			if (err) {
				reject(err);
			}else{
				resolve();
			}
		});
	})
}

async function copyfile(filepath,targetpath){
	return new Promise((resolve, reject)=>{
		fs.copyFile(filepath, targetpath, (err) => {
			if (err) {
				reject(err);
			}else{
				resolve();
			}
		});
	})
}

async function stat(filepath){
	return new Promise((resolve, reject)=>{
		fs.stat(filepath, (err, data)=>{
			if(err){
				reject(err);
			}else{
				resolve(data);
			}
		})
	})
}

async function readbyte(filepath, size){
	console.log(filepath);
	return new Promise((resolve, reject)=>{
		const fd = fs.openSync(filepath, `r`);
		const byteLength = size; // 需要读取的字节数
		const buffer = Buffer.alloc(byteLength);
		fs.read(fd, buffer, 0, byteLength, 0, (err, bytesRead) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(buffer.slice(0, bytesRead).toString());
			fs.closeSync(fd); // 关闭文件描述符
		});
	})
}

function getExecName(){
	return process.execPath.replaceAll(`\\`,`/`).split(`/`).at(-1);
}

function cwd(){
	return process.cwd().replaceAll(`\\`,`/`);
}

function formatBytes(bytes) {
	if (bytes === 0) return `0 B`;
	const units = [`B`, `KB`, `MB`, `GB`, `TB`];
	const k = 1024;
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	const size = bytes / Math.pow(k, i);
	return size.toFixed(2) + ' ' + units[i];
}

function searchRecords(type, text){
	text=text.trim();
	$(`#logZone`).unhighlight();
	$(`#searchCount`).html(`&nbsp;`);
	let textHightEl;
	if(text){
		$(`#logZone`).highlight(text);
		textHightEl=$(`span.highlight`);
		$(`#searchCount`).html(`${textHightEl.length==0?`0`:`1`}/${textHightEl.length}`);
	}

	switch(type){
		case `prev`:
			textHightEl.removeClass(`highlight2`);
			for(let i=textHightEl.length-1; i>=0; i--){
				// if(textHightEl.eq(i)[0].getBoundingClientRect().y < 32 || i==0){
				if(i==0 || textHightEl.eq(i)[0].getBoundingClientRect().y < window.innerHeight / 2 - 32){
					textHightEl.eq(i)[0].scrollIntoView({behavior:`smooth`,block:`center`,inline:`center`});
					textHightEl.eq(i).addClass(`highlight2`);
					$(`#searchCount`).html(`${i+1}/${textHightEl.length}`);
					break;
				}
			}
		break;
		case `next`:
			textHightEl.removeClass(`highlight2`);
			for(let i=0; i<textHightEl.length; i++){
				if(i==textHightEl.length-1 || textHightEl.eq(i)[0].getBoundingClientRect().y > window.innerHeight / 2 + 32){
					textHightEl.eq(i)[0].scrollIntoView({behavior:`smooth`,block:`center`,inline:`center`});
					textHightEl.eq(i).addClass(`highlight2`);
					$(`#searchCount`).html(`${i+1}/${textHightEl.length}`);
					break;
				}
			}
		break;
	}
}