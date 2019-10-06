import Level from './Level.js';
import Player from './Player.js';
import Entity from './Entity.js';
import Block from './entity/Block.js';

export default class Game {
	constructor(cPlayer, cBg, cEntity) {
		this.canvas = {
			player: cPlayer,
			bg: cBg,
			entity: cEntity
		};
		this.ctx = {
			player: cPlayer.getContext('2d'),
			bg: cBg.getContext('2d'),
			entity: cEntity.getContext('2d')
		};
		this.cSize = 0; //size of canvas, px
		this.bSize = 0; //size of a block on a canvas, px
		this.tSize = 16; //size of a block on a texture, px
		this.cSizeInBlocks = 9;

		Entity.game = this;

		this.setEventListeners();
	}

	async start(url) {
		await this.startLevel(url);
	}

	async startLevel(url) {
		this.level = new Level(this);
		await this.level.load(url);
		this.canvas.bg.style.backgroundImage = `url(assets/${this.level.img.bg}.png)`;
		await this.level.start();
		this.player = new Player(this);
		this.resize();
	}

	render() {
		this.renderBG();
		this.level.render();
		this.player.render();
	}

	renderBG() {
		let [deltaX, deltaY] = this.player.getDelta();
		const dx = Math.round(-deltaX * this.bSize),
			dy = Math.round(-deltaY * this.bSize);

		clearCanvas(this.canvas.bg);
		this.ctx.bg.translate(dx, dy);
		this.canvas.bg.style.backgroundPosition = dx + 'px ' + dy + 'px';
	}

	newEntity(type, ...args) {
		switch (type) {
			case 'Block':
				return new Block(...args);
		}
	}

	renderEntity() {
		Entity.render();
	}

	recalculate() {
		this.cSize = this.canvas.bg.offsetWidth;
		this.bSize = div(this.cSize, this.cSizeInBlocks) + 1;

		this.canvas.bg.style.backgroundSize = (this.bSize + 'px ').repeat(2);
		for (let key in this.canvas) {
			let canvas = this.canvas[key];
			canvas.width = canvas.height = this.cSize;
		}
		this.smoothFix();
	}

	resize() {
		this.recalculate();
		this.render();
	}

	smoothFix() {
		for (let key in this.ctx) smoothFixCtx(this.ctx[key]);
	}

	setEventListeners() {
		document.body.onresize = this.resize.bind(this);

		document.body.addEventListener(
			'keydown',
			(event => {
				event.preventDefault();
				const key = event.keyCode;
				if (WASD.includes(key)) {
					WASDStack.push(WASD.indexOf(key));
					WASDPressed[key] = true;
				}
				if (key >= 37 && key <= 40) {
					//arrow keys
					if (this.player.isMoving) return;
					this.player.facing = key - 37;
					this.player.render();
				} else if (WASDStack.length) {
					this.player.move();
				}
			}).bind(this)
		);

		document.body.addEventListener(
			'keyup',
			(event => {
				event.preventDefault();
				const key = event.keyCode;
				if (WASD.includes(key)) {
					WASDPressed[key] = false;
					while (WASDStack.includes(WASD.indexOf(key)))
						WASDStack.splice(WASDStack.indexOf(WASD.indexOf(key)), 1);
				}
			}).bind(this)
		);
	}
}
