export default class Level {
	constructor(game) {
		this.game = game;
		this.ctx = game.ctx.bg;
	}

	async load(url) {
		const response = await fetch(url);
		Object.assign(this, await response.json());
	}

	async start() {
		await this.loadImages();

		let terrain = this.terrain;
		this.terrain = [];
		for (let i = 0; i < this.size[0]; i++) this.terrain[i] = [];
		this.parseTerrain(terrain);
	}

	render() {
		for (let x = 0; x <= this.size[0]; x++) {
			for (let y = 0; y <= this.size[1]; y++) {
				this.drawBlock(x, y);
			}
		}
	}

	drawBlock(x, y, block, ctx = this.ctx) {
		if (!block) {
			if (!this.isInRange(x, y)) return;
			block = this.getBlock(x, y);
			if (!block) return;
		}
		ctx.drawImage(
			this.img.terrain,
			block[0] * this.game.tSize,
			block[1] * this.game.tSize,
			this.game.tSize,
			this.game.tSize,
			x * this.game.bSize,
			y * this.game.bSize,
			this.game.bSize,
			this.game.bSize
		);
	}

	setBlock(x, y, block) {
		if (!this.isInRange(x, y)) return;
		this.terrain[x][y] = block;
	}

	fill(x1, y1, x2, y2, block) {
		if (x1 > x2) [x1, x2] = [x2, x1];
		if (y1 > y2) [y1, y2] = [y2, y1];

		for (let x = x1; x <= x2; x++) {
			for (let y = y1; y <= y2; y++) {
				this.setBlock(x, y, block);
			}
		}
	}

	getBlock(x, y) {
		return this.isInRange(x, y) ? this.terrain[x][y] : [0, 0];
	}

	isPushable(x, y) {
		const id = this.getBlock(x, y);
		if (!id) return false;
		return this.block.pushable.includes(this.getIdString(id));
	}

	isInRange(x, y) {
		return x >= 0 && y >= 0 && x < this.size[0] && y < this.size[1];
	}

	getIdString(id) {
		return id[0] + ',' + id[1];
	}

	parseTerrain(terrain) {
		terrain.forEach(item => {
			item = item.split(':');
			item[1] = item[1].split(',').map(item => +item);
			if (item[2] == '0') item[2] = 0;
			else item[2] = item[2].split(',').map(item => +item);
			switch (item[0]) {
				case 'block':
					this.setBlock(item[1][0], item[1][1], item[2]);
					break;
				case 'fill':
					this.fill(item[1][0], item[1][1], item[1][2], item[1][3], item[2]);
					break;
			}
		});
	}

	async loadImages() {
		let imgload = [];
		for (let i in this.img) {
			let img = new Image();
			img.src = `assets/${this.img[i]}.png`;
			this.img[i] = img;
			imgload.push(
				new Promise((resolve, reject) => {
					img.onload = resolve;
					img.onerror = reject;
				})
			);
		}
		await Promise.all(imgload);
	}
}
