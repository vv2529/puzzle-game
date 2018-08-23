function loadScript(src, onload){
	let script = document.createElement('script');
	script.src = src + (~src.indexOf('?') ? '&' : '?') + 'u='+Math.random();
	if(onload) script.onload = onload;
	document.body.appendChild(script);
	return script;
}
loadScript('js/function.js', () => {
	loadScript('js/core.js');
});