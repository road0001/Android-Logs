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

function outputLogs(log,type=`log`,force){
	let filter=$(`#fliterInput`).val();
	let display=true;
	if (!force && filter && !log.includes(filter)){
		display=false;
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

	$(`#logZone`).appendDOM({tag:`p`,class:`log ${type} ${display==false?`hidden`:``}`,html:sp.join(`&nbsp;`)});
	// applyLogFilter();
	if(scrollLogs){
		$(`#logZone`)[0].scrollTop+=999999;
	}
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

function toggleLogcat(){
	if(logcatStatus==false){
		runLogcat();
	}else{
		stopLogcat();
	}
}

function applyLogcatStatus(){
	if(logcatStatus==false){
		$(`.toolBu.run`).attr(`title`,`Run logcat [F5]`);
		$(`.toolBu.run`).html(`▶`);
	}else{
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
}