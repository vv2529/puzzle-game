import Game from './js/class/Game.js';

function loadScript(src, onload) {
	let script = document.createElement('script');
	script.src = src + (src.includes('?') ? '&' : '?') + 'u=' + Math.random();
	if (onload) script.onload = onload;
	document.body.appendChild(script);
	return script;
}

const game = new Game(
	document.getElementById('canvas'),
	document.getElementById('bg-canvas'),
	document.getElementById('entity-canvas')
);

loadScript('js/function.js', () => {
	onFullLoad(() => {
		game.start('/level/level-test.json');
	});
});
