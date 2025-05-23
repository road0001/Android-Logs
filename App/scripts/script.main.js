window.onload=async function(){
	await mkdirs(`Logs`);
	$(`#toolBar`).appendDOM([
		{tag:`button`,class:`toolBu ontop`,title:`Keep on top [F4]`,html:`☸`,bind:{
			click(){
				toggleOnTop();
			}
		}},
		{tag:`button`,class:`toolBu sperate`,html:`&nbsp;`},
		{tag:`button`,class:`toolBu run`,title:`Run logcat [F5]`,html:`▶`,bind:{
			click(){
				toggleLogcat();
			}
		}},
		{tag:`button`,class:`toolBu scroll`,title:`Enable scroll logs [S]`,html:`¶`,bind:{
			click(){
				toggleScrollLogs();
			}
		}},
		{tag:`button`,class:`toolBu bottom`,title:`Scroll to bottom [D]`,style:`text-decoration: underline;`,html:`↓`,bind:{
			click(){
				$(`#logZone`)[0].scrollTop+=999999;
				toggleScrollLogs(true);
			}
		}},
		{tag:`button`,class:`toolBu clear`,title:`Clear logs [C]`,html:`×`,bind:{
			click(){
				clearLogs();
			}
		}},
	]);
	
	toggleScrollLogs(true);
	toggleLogcat();

	$(`#searchInput`).bind(`keypress`,function(e){
		if(e.which==13){
			searchRecords(`text`,$(`#searchInput`).val());
		}
	});
	$(`#searchBu`).bind(`click`,function(e){
		searchRecords(`text`,$(`#searchInput`).val());
	});
	$(`#searchPrevBu`).bind(`click`,function(e){
		searchRecords(`prev`,$(`#searchInput`).val());
	});
	$(`#searchNextBu`).bind(`click`,function(e){
		searchRecords(`next`,$(`#searchInput`).val());
	});
	$(`#searchClearBu`).bind(`click`,function(e){
		$(`#searchInput`).val(``);
		searchRecords(`clear`,$(`#searchInput`).val());
	});

	$(`#fliterInput`).bind(`keypress`,function(e){
		if(e.which==13){
			applyLogFilter();
		}
	});
	$(`#filterBu`).bind(`click`,function(){
		applyLogFilter();
	});
	$(`#filterClearBu`).bind(`click`,function(){
		$(`#fliterInput`).val(``);
		applyLogFilter();
	});

	$(`#logZone`).bind(`scroll`,function(){
		let div=$(this)[0];
		let maxScrollTop = div.scrollHeight - div.clientHeight;
		if(div.scrollTop>=maxScrollTop){
			toggleScrollLogs(true);
		}else{
			toggleScrollLogs(false);
		}
	});

	document.addEventListener(`keyup`,function(e){
		console.log(e);
		const tag = e.target.tagName.toLowerCase();
		if (tag === 'input' || tag === 'textarea') return;

		if (e.key === `F4`) {
			$(`.toolBu.ontop`).click();
		}
		if (e.key === `F5`) {
			$(`.toolBu.run`).click();
		}
		
		if (e.key.toLowerCase() === `s` && !e.ctrlKey) {
			$(`.toolBu.scroll`).click();
		}
		if (e.key.toLowerCase() === `d` && !e.ctrlKey) {
			$(`.toolBu.bottom`).click();
		}
		if (e.key.toLowerCase() === `c` && !e.ctrlKey) {
			$(`#toolBar .toolBu.clear`).click();
		}
	})
	// runLogcat();
}

let isOnTop=false;
function toggleOnTop(){
	isOnTop=!isOnTop;
	win.setAlwaysOnTop(isOnTop);
	if(isOnTop==true){
		$(`.toolBu.ontop`).addClass(`selected`);
	}else{
		$(`.toolBu.ontop`).removeClass(`selected`);
	}
}