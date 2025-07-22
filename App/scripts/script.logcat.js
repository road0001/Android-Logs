const cp = require(`child_process`);
const readline = require(`readline`);

let logcat=null, logcatLine=null, logcatStatus=false;
function runLogcat(){
	console.log(111);
	// cp.spawn(`adb.exe`, [`logcat`,`-c`]); //清空之前的日志，只输出最新的
	cp.exec(`adb.exe logcat -c`, ()=>{
		logcat = cp.spawn(`adb.exe`, [`logcat`]);
		logcatLine = readline.createInterface({
			input: logcat.stdout,
		});
		logcatLine.on(`line`, (line) => {
			outputLogs(line);
		});
		logcatLine.on(`close`, ()=>{
			
		});

		logcat.on(`close`, async function (code) {
			outputLogs(`Logcat disconnected, press [F5] to reset!`,`warn`,true);
			logcatLine.close();
			logcat=null;
			logcatLine=null;
			logcatStatus=false;
			applyLogcatStatus();
		});

		logcatStatus=true;
		applyLogcatStatus();
		return logcatStatus;
	});
}

function stopLogcat(){
	if (logcat) {
		logcat.kill(); // 杀死子进程
	}
	if (logcatLine) {
		logcatLine.close();
	}
	logcatStatus=false;
	applyLogcatStatus();
	return logcatStatus;
}

let index=0;
let filterIndex=0;
let clipCount=0;
let maxLogCount=1000;
let filterText=``;
function outputLogs(log,type=`log`,force){
	// let filter=$(`#fliterInput`).val();
	let display=true;
	if (!force && filterText && !log.includes(filterText)){
		display=false;
		index++;
		updateStatus();
		return; // 对于未filter的log，默认是不输出，这样可以避免其他log太多被删除
	}

	let colorList=[
		[`cyan`,`black`],[`cyan`,`black`],
		[`yellow`,`black`],[`yellow`,`black`],[`yellow`,`black`],
		[`white`,`black`],[`white`,`black`],[`white`,`black`],
	];
	let replaceList=[
		{origin:`  `,target:` &nbsp;`},
	]
	
	let line=log.replaceAll(`  `,` &nbsp;`);
	let sp=line.split(` `);
	for(let i=0; i<sp.length; i++){
		for(let r of replaceList){
			sp[i]=sp[i].replaceAll(r.origin, r.target);
		}
		sp[i]=sp[i].replaceJsonString(`white`,`purple`);
		if(colorList[i]!=undefined){
			sp[i]=sp[i].color(colorList[i]);
		}else{
			// sp[i]=`<span>${sp[i]}</span>`;
		}
	}

	let logZone=document.getElementById(`logZone`);
	let logP=document.createElement(`p`);
	logP.className=`log logs ${type}`;

	let logBu=document.createElement(`button`);
	logBu.className=`logBu`;
	logBu.innerHTML=filterIndex || index;
	logBu.addEventListener(`click`,function(e){
		copyLogs($(this).next().text(), $(this).text());
	});

	let logSpan=document.createElement(`span`);
	logSpan.className=`logspan`;
	logSpan.innerHTML=sp.join(`&nbsp;`);

	logP.appendChild(logBu);
	logP.appendChild(logSpan);
	// logZone.appendChild(logP);
	
	enqueueLog(logP);
	index++;
	filterIndex = filterText ? filterIndex + 1 : 0;

	// $(`#logTable`).appendDOM({
	// 	tag:`tr`,id:`logTr_${index}`,class:`logsTr ${type} ${display==false?`hidden`:``}`,
	// 	children:[
	// 		{tag:`td`,class:`logTd count`,children:{tag:`button`,class:`logBu`,html:filterIndex || index,bind:{click(){
	// 			copyLogs($(this).parent().next().text(), $(this).text());
	// 		}}}},
	// 		{tag:`td`,class:`logTd log`,children:{tag:`p`,class:`logsTr logs ${type}`,html:sp.join(`&nbsp;`)}},
	// 	]
	// });
	// applyLogFilter();
	// if(scrollLogs){
	// 	$(`#logZone`)[0].scrollTop+=9999;
	// }
	// index++;
	// if(filterText){
	// 	filterIndex++;
	// }else{
	// 	filterIndex=0;
	// }
	// if((filterIndex>0 && filterIndex >= maxLogCount) || (filterIndex==0 && index >= maxLogCount)){
	// 	// $(`#logTable`).children().eq(0).remove();
	// 	// $(`.logsTr`).eq(0).remove();
	// 	// document.getElementById(`logZone`).children[0].remove();
	// 	let logZone = document.getElementById(`logZone`);
	// 	logZone.removeChild(logZone.firstChild);
	// 	clipCount++;
	// }
	// updateStatus();
}

let logQueue = [];
let pendingFlush = false;
function enqueueLog(logElement) {
	if (!logElement) return;
	logQueue.push(logElement);
	if (!pendingFlush) {
		pendingFlush = true;
		requestAnimationFrame(flushLogs);
	}
}
function flushLogs() {
	const logZone = document.getElementById(`logZone`);
	const fragment = document.createDocumentFragment();
	while (logQueue.length > 0) {
		fragment.appendChild(logQueue.shift());
	}
	logZone.appendChild(fragment);

	// 控制最大日志条数，移除多余项
	while (logZone.children.length > maxLogCount) {
		logZone.removeChild(logZone.firstChild);
		clipCount++;
	}

	if (scrollLogs) {
		logZone.scrollTop = logZone.scrollHeight;
	}

	pendingFlush = false;
	updateStatus();
}


function copyLogs(logs,index){
	copyText(logs)
	.then(() => {
		toast(`Log ${index} copy success!`,`success`);
	})
	.catch(err => {
		toast(`Log ${index} copy error!`,`error`);
		console.error(err);
	});
}

function updateStatus(){
	// let filter=$(`#fliterInput`).val();
	let clipText=``;
	let endText=`.`;

	let totalText=`Total ${index} logs`;
	if(filterIndex>0){
		totalText+=`, Filtered ${filterIndex} logs`;
	}
	if(clipCount>0){
		clipText=`, cliped ${clipCount} logs`;
	}
	
	$(`#statusBar`).html(`${totalText}${clipText}${endText}`);
}

function applyLogFilter(){
	filterText=$(`#fliterInput`).val();
	let logEl=$(`.log`);
	logEl.removeClass(`hidden`);
	for(let i=0; i<logEl.length; i++){
		let l=logEl.eq(i);
		if(!l.html().includes(filterText)){
			l.addClass(`hidden`);
		}
	}
}

function toggleLogcat(bool){
	if(bool!=undefined) logcatStatus=bool;
	if(logcatStatus==false){
		runLogcat();
	}else{
		stopLogcat();
	}
}

function applyLogcatStatus(){
	if(logcatStatus==false){
		$(`.toolBu.run`).removeClass(`stop`);
		$(`.toolBu.run`).attr(`title`,`Run logcat [F5]`);
		$(`.toolBu.run`).html(`▶`);
	}else{
		$(`.toolBu.run`).addClass(`stop`);
		$(`.toolBu.run`).attr(`title`,`Stop logcat [F5]`);
		$(`.toolBu.run`).html(`■`);
	}
}

let scrollLogs=true;
function toggleScrollLogs(bool){
	if(bool==undefined){
		scrollLogs=!scrollLogs;
	}else{
		scrollLogs=bool;
	}
	if(!scrollLogs){
		$(`.toolBu.scroll`).removeClass(`selected`);
	}else{
		$(`.toolBu.scroll`).addClass(`selected`);
	}
}

function clearLogs(){
	// $(`#logTable`).html(``);
	$(`#logZone`).html(``);
	index=0;
	filterIndex=0;
	clipCount=0;
	logQueue=[];
	flushLogs();
	updateStatus();
}