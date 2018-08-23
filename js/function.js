function R(a,b){if(!b)b=0;return Math.floor(Math.random()*a)+b}
function Id(id){return document.getElementById(id)}
function onfullload(onload){
	document.addEventListener('readystatechange', () => {
		if(document.readyState == 'complete') onload();
	});
}
function div(a,b){return Math.trunc(a/b)}
function deg2rad(deg){return deg*Math.PI/180}