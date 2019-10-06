function random(a, b = 0) {
	return Math.floor(Math.random() * a) + b;
}
function onFullLoad(onload) {
	document.addEventListener('readystatechange', () => {
		if (document.readyState == 'complete') onload();
	});
}
function deg2rad(deg) {
	return (deg * Math.PI) / 180;
}
function div(a, b) {
	return Math.trunc(a / b);
}

function animate(options) {
	let start = performance.now();
	let anim = function(time) {
		let timeFraction = (time - start) / options.duration;
		if (timeFraction > 1) timeFraction = 1;
		progress = options.timing(timeFraction);
		options.draw(progress);
		if (timeFraction < 1) requestAnimationFrame(anim);
	};
	anim(start);
}

function smoothFixCtx(ctx) {
	ctx.imageSmoothingEnabled = false;
}

function clearCanvas(canvas) {
	const ctx = canvas.getContext('2d');
	canvas.width += 0;
	smoothFixCtx(ctx);
}

var WASD = [65, 87, 68, 83],
	WASDStack = [],
	WASDPressed = {};
