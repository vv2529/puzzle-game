import Entity from '../Entity.js';

export default class Block extends Entity {
	constructor(block, pos) {
		super('Block', pos);
		this.block = block;
		this.speed = 200;
	}

	draw() {
		Entity.game.level.drawBlock(
			this.x,
			this.y,
			this.block,
			Entity.game.ctx.entity
		);
	}

	update() {
		let x = Math.round(this.x),
			y = Math.round(this.y);
		if (!Entity.game.level.getBlock(x, y + 1)) {
			this.x = x;
			this.y = y;
			let prev = [x, y];
			animate({
				duration: this.speed,
				timing: timeFraction => {
					return timeFraction;
				},
				draw: progress => {
					this.y = prev[1] + progress;
					Entity.render();

					if (progress >= 1) {
						this.update();
					}
				}
			});
		} else {
			this.remove();
			Entity.game.level.setBlock(x, y, this.block);
			Entity.game.level.render();
		}
	}
}
