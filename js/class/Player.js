export default class Player {
	constructor(game, img = game.level.img.player, pos = game.level.spawn) {
		this.game = game;
		this.canvas = game.canvas.player;
		this.ctx = this.canvas.getContext('2d');
		this.level = game.level;
		this.img = img;
		this.x = pos[0];
		this.y = pos[1];
		this.facing = 3;
		this.swingAngle = 0;
		this.swingDir = 1;
		this.swingLength = 1;
		this.deltaX = 0;
		this.deltaY = 0;

		/* const */
		this.speed = 300;
		this.dir = [[-1, 0], [0, -1], [1, 0], [0, 1]];
		this.body_src = {
			head: [[16, 0, 8, 8], [24, 0, 8, 8], [0, 0, 8, 8], [8, 0, 8, 8]],
			torso: [[12, 8, 4, 12], [16, 8, 8, 12], [0, 8, 4, 12], [4, 8, 8, 12]],
			hand: [[24, 8, 4, 12], [28, 8, 4, 12], [32, 8, 4, 12], [36, 8, 4, 12]],
			leg: [[40, 8, 4, 12], [44, 8, 4, 12], [48, 8, 4, 12], [52, 8, 4, 12]]
		};
		this.body_pos = {
			head: [[-4, 0], [-4, 0]],
			torso: [[-2, 8], [-4, 8]],
			hand: [[[-2, 8], [-8, 8]], [[-2, 8], [4, 8]]],
			leg: [[[-2, 20], [-4, 20]], [[-2, 20], [0, 20]]]
		};
	}

	render() {
		clearCanvas(this.canvas);
		this.ctx.save();
		this.ctx.translate(
			Math.round(-this.deltaX * this.game.bSize),
			Math.round(-this.deltaY * this.game.bSize)
		);
		this.ctx.translate(
			(this.x + 0.5) * this.game.bSize,
			this.y * this.game.bSize
		);
		let k = this.game.bSize / 32;
		let parts = ['hand', 'torso', 'head', 'hand', 'leg', 'leg'];
		let count = 0;
		parts.forEach(i => {
			this.ctx.save();
			let src = this.body_src[i][this.facing];
			let pos = this.body_pos[i][this.facing % 2];
			if (i == 'hand' || i == 'leg') {
				let m = i == 'hand' ? 1 : -1; // opposite arm & leg
				let angm = this.isPushing && i == 'hand' ? 1 : -1;
				let angle =
					this.isPushing && i == 'hand'
						? (-(this.facing - 1) * Math.PI) / 2
						: deg2rad(this.swingAngle) * m * this.swingDir;
				if (!(count % 2)) {
					pos = this.body_pos[i][0][this.facing % 2];
					this.ctx.translate(0, Math.trunc(pos[1] * k));
					if (!(this.facing % 2)) this.ctx.rotate(angle);
					else this.ctx.scale(1, this.swingLength);
				} else {
					pos = this.body_pos[i][1][this.facing % 2];
					this.ctx.translate(0, Math.trunc(pos[1] * k));
					if (!(this.facing % 2)) this.ctx.rotate(angle * angm);
					else this.ctx.scale(1, 2 - this.swingLength);
				}
				this.ctx.drawImage(
					this.img,
					src[0],
					src[1],
					src[2],
					src[3],
					pos[0] * k,
					0,
					src[2] * k,
					src[3] * k
				);
				count++;
			} else {
				this.ctx.drawImage(
					this.img,
					src[0],
					src[1],
					src[2],
					src[3],
					pos[0] * k,
					pos[1] * k,
					src[2] * k,
					src[3] * k
				);
			}
			this.ctx.restore();
		});
		this.ctx.restore();
	}

	move() {
		if (!WASDStack.length || this.isMoving) return;
		this.isMoving = true;
		this.facing = WASDStack[WASDStack.length - 1];
		let prev = [this.x, this.y],
			dir = this.dir[this.facing],
			next = [prev[0] + dir[0], prev[1] + dir[1]],
			rendered = 0,
			blockEntity,
			canGo = this.canGoThrough(next[0], next[1]) ? 1 : 0;
		if (this.level.isPushable(next[0], next[1])) {
			this.isPushing = 1;
			if (canGo) {
				requestAnimationFrame(() => {
					this.level.setBlock(next[0], next[1], 0);
					this.game.render();
				});
				blockEntity = this.game.newEntity('Block', [2, 0], [next[0], next[1]]);
			}
		}
		animate({
			duration: this.speed,
			timing: timeFraction => {
				return timeFraction;
			},
			draw: progress => {
				this.x = prev[0] + dir[0] * progress * canGo;
				this.y = prev[1] + dir[1] * progress * canGo;

				/* Move the screen with the player */
				let dx = this.x + 0.5 - this.game.cSize / this.game.bSize / 2,
					dy = this.y + 0.5 - this.game.cSize / this.game.bSize / 2;
				let dx2 = this.deltaX,
					dy2 = this.deltaY;
				if (Math.abs(this.deltaX - dx) > 1) dx2 = dx - dir[0];
				if (Math.abs(this.deltaY - dy) > 1) dy2 = dy - dir[1];
				rendered = this.setDelta(dx2, dy2);

				/* Push the block (if it is) */
				if (blockEntity) {
					blockEntity.x = this.x + dir[0];
					blockEntity.y = this.y + dir[1];
					this.game.renderEntity();
				}

				/* Motion animation */
				if (!(this.facing % 2)) {
					let stamp;
					if (progress < 0.5) stamp = Math.pow(progress * 2, 0.5);
					else stamp = Math.pow(2 - progress * 2, 0.5);
					this.swingAngle = stamp * 60;
				} else {
					if (progress < 0.25) this.swingLength = 1 + progress;
					else if (progress < 0.75) this.swingLength = 1.5 - progress;
					else this.swingLength = progress;
				}

				if (progress >= 1) {
					this.x = Math.round(this.x);
					this.y = Math.round(this.y);
					this.isMoving = 0;
					this.isPushing = 0;
					this.swingAngle = this.swingLength = 1;
					this.swingDir *= -1;
					if (blockEntity) blockEntity.update();
					this.render();
					this.move();
				}

				if (!rendered) this.render();
			}
		});
	}

	//setDelta('player-center') - center the scene around the player
	setDelta(dx, dy) {
		let oldX = this.deltaX,
			oldY = this.deltaY;

		if (dx == 'player-center') {
			const k = 0.5 - (this.game.cSize / this.game.bSize) * 0.5;
			dx = this.player.x + k;
			dy = this.player.y + k;
		}

		this.deltaX = Math.min(
			Math.max(dx, 0),
			this.level.size[0] - this.game.cSize / this.game.bSize
		);
		this.deltaY = Math.min(
			Math.max(dy, 0),
			this.level.size[1] - this.game.cSize / this.game.bSize
		);
		// this.deltaX = dx;
		// this.deltaY = dy;
		if (oldX != this.deltaX || oldY != this.deltaY) {
			this.game.render();
		}
	}

	getDelta() {
		return [this.deltaX, this.deltaY];
	}

	canGoThrough(x, y) {
		return (
			!this.level.getBlock(x, y) ||
			(this.level.isPushable(x, y) &&
				!this.level.getBlock(
					x + this.dir[this.facing][0],
					y + this.dir[this.facing][1]
				))
		);
	}
}
