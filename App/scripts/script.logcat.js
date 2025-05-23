const cp = require(`child_process`);
const readline = require(`readline`);
const win = nw.Window.get();

let logcat=null, logcatLine=null, logcatStatus=false;
function runLogcat(){
	cp.execSync(`title ADB Logcat`);
	cp.spawn(`adb.exe`, [`logcat`,`-c`]); //清空之前的日志，只输出最新的
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
let maxLogCount=5000;
function outputLogs(log,type=`log`,force){
	let filter=$(`#fliterInput`).val();
	let display=true;
	if (!force && filter && !log.includes(filter)){
		display=false;
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
		}
	}

	$(`#logZone`).appendDOM({tag:`p`,id:`log_${index}`,class:`logs ${type} ${display==false?`hidden`:``}`,html:sp.join(`&nbsp;`)});
	// applyLogFilter();
	if(scrollLogs){
		$(`#logZone`)[0].scrollTop+=999999;
	}
	index++;
	if(filter){
		filterIndex=$(`.logs:not(.hidden)`).length;
	}
	if(index >= maxLogCount){
		$(`#logZone`).children().eq(0).remove();
		clipCount++;
	}
	updateStatus();
}

function updateStatus(){
	let filter=$(`#fliterInput`).val();
	let clipText=``;
	let filterText=`.`;

	let totalText=`Total ${index} logs`;
	if(clipCount>0){
		clipText=`, cliped ${clipCount} logs`;
	}
	if(filter!=``){
		totalText=`Filtered ${filterIndex} logs`;
		filterText=``;
	}
	$(`#statusBar`).html(`${totalText}${clipText}${filterText}`);
}

function applyLogFilter(){
	let filter=$(`#fliterInput`).val();
	let logEl=$(`.log`);
	logEl.removeClass(`hidden`);
	for(let i=0; i<logEl.length; i++){
		let l=logEl.eq(i);
		if(!l.html().includes(filter)){
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
	$(`#logZone`).html(``);
	index=0;
	filterIndex=0;
	clipCount=0;
	updateStatus();
}