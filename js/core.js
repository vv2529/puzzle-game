var Canvas = Id('canvas'), C = Canvas.getContext('2d'),
bgCanvas = Id('bg-canvas'), bgC = bgCanvas.getContext('2d'),
enCanvas = Id('entity-canvas'), enC = enCanvas.getContext('2d'),
cSize, K, T = 16, player,
KEYS = [65, 87, 68, 83], keyStack = [], pressedKeys = {},
deltaX = deltaY = 0;

/* Load the test level and process it */
loadScript('level/level-test.js', () => {
	bgCanvas.style.backgroundImage = `url(assets/${level.img.bg}.png)`;
	for(let i in level.img){
		let img = new Image();
		img.src = `assets/${level.img[i]}.png`;
		level.img[i] = img;
	}

	let terrain = level.terrain;
	level.terrain = [];
	for(let i = 0; i < level.size[0]; i++) level.terrain[i] = [];
	/* Parse terrain */
	terrain.forEach(item => {
		item = item.split(':');
		item[1] = item[1].split(',').map(item => +item);
		if(item[2] == '0') item[2] = 0;
		else item[2] = item[2].split(',').map(item => +item);
		switch(item[0]){
			case 'block':
				setBlock(item[1][0], item[1][1], item[2]);
				break
			case 'fill':
				fill(item[1][0], item[1][1], item[1][2], item[1][3], item[2]);
				break
		}
	});
	/* Spawn the player */
	player = new Player(level.img.player, level.spawn);
});

/* Ready to render */
onfullload(() => {
	resize();
	setDelta('player-center');
});

/* Terrain functions */
function render(){
	clearCanvas(bgCanvas, 1);
	bgC.translate(Math.round(-deltaX*K), Math.round(-deltaY*K));
	bgCanvas.style.backgroundPosition = Math.round(-deltaX*K)+'px '+Math.round(-deltaY*K)+'px';
	for(let x = 0; x <= level.size[0]; x++){
		for(let y = 0; y <= level.size[1]; y++){
			drawBlock(x, y);
		}
	}
	player.render();
}
function drawBlock(x, y, block, ctx = bgC){
	if(!isInRange(x,y)) return;
	if(!block) block = getBlock(x,y);
	if(!block) return;
	ctx.drawImage(level.img.terrain, block[0]*T, block[1]*T, T, T, x*K, y*K, K, K);
}
function setBlock(x, y, block){
	if(!isInRange(x,y)) return;
	level.terrain[x][y] = block;
	// drawBlock(x, y, block);
}
function fill(x1, y1, x2, y2, block){
	let temp = Math.max(x1, x2);
	x1 = Math.min(x1, x2);
	x2 = temp;
	temp = Math.max(y1, y2);
	y1 = Math.min(y1, y2);
	y2 = temp;
	for(let x = x1; x <= x2; x++){
		for(let y = y1; y <= y2; y++){
			level.terrain[x][y] = block;
		}
	}
}
function getBlock(x,y){
	if(isInRange(x,y)) return level.terrain[x][y];
	else return [0,0];
}
function isPushable(x,y){
	let id = getBlock(x,y);
	if(!id) return 0;
	id = id[0]+','+id[1];
	if(~level.block.pushable.indexOf(id)) return 1;
	return 0;
}
function isInRange(x, y){
	return (x >= 0 && y >= 0 && x < level.size[0] && y < level.size[1]);
}
function setDelta(dx, dy){
	let oldX = deltaX, oldY = deltaY;
	if(dx == 'player-center'){
		dx = player.x + 0.5 - cSize/K/2;
		dy = player.y + 0.5 - cSize/K/2;
	}
	deltaX = Math.min(Math.max(dx, 0), level.size[0] - cSize/K);
	deltaY = Math.min(Math.max(dy, 0), level.size[1] - cSize/K);
	// deltaX = dx;
	// deltaY = dy;
	if(oldX != deltaX || oldY != deltaY){
		render();
		player.render();
		return 1;
	}
}

/* classes */
class Player {
	constructor(img, pos){
		this.img = img;
		this.x = pos[0];
		this.y = pos[1];
		this.facing = 3;
		this.swingAngle = 0;
		this.swingDir = 1;
		this.swingLength = 1;

		/* const */
		this.speed = 300;
		this.dir = [[-1,0], [0,-1], [1,0], [0,1]];
		this.body_src = {
			head: [[16, 0, 8, 8], [24, 0, 8, 8], [0, 0, 8, 8], [8, 0, 8, 8]],
			torso: [[12, 8, 4, 12], [16, 8, 8, 12], [0, 8, 4, 12], [4, 8, 8, 12]],
			hand: [[24, 8, 4, 12], [28, 8, 4, 12], [32, 8, 4, 12], [36, 8, 4, 12]],
			leg: [[40, 8, 4, 12], [44, 8, 4, 12], [48, 8, 4, 12], [52, 8, 4, 12]]
		}
		this.body_pos = {
			head: [[-4, 0], [-4, 0]],
			torso: [[-2, 8], [-4, 8]],
			hand: [[[-2, 8], [-8, 8]], [[-2, 8], [4, 8]]],
			leg: [[[-2, 20], [-4, 20]], [[-2, 20], [0, 20]]]
		}
	}
	render(){
		clearCanvas(Canvas);
		C.save();
		C.translate(Math.round(-deltaX*K), Math.round(-deltaY*K));
		C.translate((this.x + 0.5) * K, this.y * K);
		let k = K / 32;
		let parts = ['hand', 'torso', 'head', 'hand', 'leg', 'leg'];
		let count = 0;
		parts.forEach(i => {
			C.save();
			let src = this.body_src[i][this.facing];
			let pos = this.body_pos[i][this.facing % 2];
			if(i == 'hand' || i == 'leg'){
				let m = i == 'hand' ? 1 : -1; // opposite arm & leg
				let angm = this.isPushing && i == 'hand' ? 1 : -1;
				let angle = this.isPushing && i == 'hand' ? -(this.facing-1)*Math.PI/2 : deg2rad(this.swingAngle)*m*this.swingDir;
				if(!(count % 2)){
					pos = this.body_pos[i][0][this.facing % 2];
					C.translate(0, Math.trunc(pos[1]*k));
					if(!(this.facing % 2)) C.rotate(angle);
					else C.scale(1, this.swingLength);
				}
				else {
					pos = this.body_pos[i][1][this.facing % 2];
					C.translate(0, Math.trunc(pos[1]*k));
					if(!(this.facing % 2)) C.rotate(angle * angm);
					else C.scale(1, 2 - this.swingLength);
				}
				C.drawImage(this.img, src[0], src[1], src[2], src[3], pos[0]*k, 0, src[2]*k, src[3]*k);
				count++;
			}
			else {
				C.drawImage(this.img, src[0], src[1], src[2], src[3], pos[0]*k, pos[1]*k, src[2]*k, src[3]*k);
			}
			C.restore();
		});
		C.restore();
	}
	move(){
		if(!keyStack.length || this.isMoving) return;
		this.isMoving = 1;
		this.facing = keyStack[keyStack.length-1];
		let prev = [this.x, this.y],
		dir = this.dir[this.facing],
		next = [prev[0]+dir[0], prev[1]+dir[1]],
		rendered = 0, blockEntity,
		canGo = this.canGoThrough(next[0], next[1]) ? 1 : 0;
		if(isPushable(next[0], next[1])){
			this.isPushing = 1;
			if(canGo){
				requestAnimationFrame(() => {
					setBlock(next[0], next[1], 0);
					render();
				});
				blockEntity = new Entity('Block', [next[0], next[1]], {block:[2,0]});
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
				let dx = player.x + 0.5 - cSize/K/2, dy = player.y + 0.5 - cSize/K/2;
				let dx2 = deltaX, dy2 = deltaY;
				if(Math.abs(deltaX - dx) > 1) dx2 = dx - dir[0];
				if(Math.abs(deltaY - dy) > 1) dy2 = dy - dir[1];
				rendered = setDelta(dx2, dy2);

				/* Push the block (if it is) */
				if(blockEntity){
					blockEntity.x = this.x + dir[0];
					blockEntity.y = this.y + dir[1];
					Entity.render = 1;
				}

				/* Motion animation */
				if(!(this.facing % 2)){
					let stamp;
					if(progress < 0.5) stamp = Math.pow(progress*2, 0.5);
					else stamp = Math.pow(2-progress*2, 0.5);
					this.swingAngle = stamp * 60;
				}
				else {
					if(progress < 0.25) this.swingLength = 1 + progress;
					else if(progress < 0.75) this.swingLength = 1.5 - progress;
					else this.swingLength = progress;
				}

				if(progress >= 1){
					this.x = Math.round(this.x);
					this.y = Math.round(this.y);
					this.isMoving = 0;
					this.isPushing = 0;
					this.swingAngle = this.swingLength = 1;
					this.swingDir *= -1;
					if(blockEntity) blockEntity.update();
					this.render();
					this.move();
				}

				if(!rendered) this.render();
			}
		});
	}
	canGoThrough(x,y){
		return !getBlock(x,y) || (isPushable(x,y) && !getBlock(x+this.dir[this.facing][0],y+this.dir[this.facing][1]));
	}
}
class Entity {
	constructor(type, pos, param){
		this.type = type;
		this.x = pos[0];
		this.y = pos[1];
		Entity.entities.push(this);
		if(type == 'Block'){
			this.block = param.block;
			this.speed = 200;
		}
		Entity.render = 1;
	}
	draw(){
		switch(this.type){
			case 'Block':
				drawBlock(this.x, this.y, this.block, enC);
				break
		}
	}
	update(){
		switch(this.type){
			case 'Block':
				let x = Math.round(this.x), y = Math.round(this.y);
				if(!getBlock(x, y+1)){
					this.x = x; this.y = y;
					let prev = [x, y];
					animate({
						duration: this.speed,
						timing: timeFraction => {
							return timeFraction;
						},
						draw: progress => {
							this.y = prev[1] + progress;
							Entity.render = 1;

							if(progress >= 1){
								this.update();
							}
						}
					});
				}
				else {
					this.remove();
					setBlock(x, y, this.block);
					render();
				}
				break
		}
	}
	remove(){
		Entity.entities.splice(Entity.entities.indexOf(this), 1);
		Entity.render = 1;
	}
	static set render(val){
		let list = Entity.entities;
		if(!list.length || Entity.rendering){
			// console.log(list.length, Entity.rendering);
			if(!list.length) clearCanvas(enCanvas, 1);
			return;
		}
		clearCanvas(enCanvas, 1);
		/* Entity.rendering - to prevent redundant redrawing */
		Entity.rendering = 1;
		requestAnimationFrame(() => {
			Entity.rendering = 0;
		});
		enC.translate(Math.round(-deltaX*K), Math.round(-deltaY*K));
		list.forEach(entity => {
			entity.draw();
		});
	}
}
Entity.entities = [];

/* Event listeners */
document.body.onresize = resize;
document.body.onkeydown = function(event){
	let key = event.keyCode;
	// console.log('Key:', key);
	if(~KEYS.indexOf(key)){
		keyStack.push(KEYS.indexOf(key));
		if(!pressedKeys[key]) player.move();
		pressedKeys[key] = 1;
	}
	else if(key >= 37 && key <= 40){
		if(player.isMoving) return;
		player.facing = key - 37;
		player.render();
	}
}
document.body.onkeyup = function(event){
	let key = event.keyCode;
	if(~KEYS.indexOf(key)){
		pressedKeys[key] = 0;
		while(~keyStack.indexOf(KEYS.indexOf(key))) keyStack.splice(keyStack.indexOf(KEYS.indexOf(key)), 1);
	}
}

/* Miscellaneous */
function resize(){
	cSize = Canvas.offsetWidth;
	K = div(cSize, 9)+1;

	bgCanvas.style.backgroundSize = (K+'px ').repeat(2);
	Canvas.width = Canvas.height = bgCanvas.width = bgCanvas.height = enCanvas.width = enCanvas.height = cSize;
	smoothFix();
	render();
}
function animate(options){
	let start = performance.now();
	let anim = function(time){
		let timeFraction = (time - start) / options.duration;
		if(timeFraction > 1) timeFraction = 1;
		progress = options.timing(timeFraction);
		options.draw(progress);
		if(timeFraction < 1) requestAnimationFrame(anim);
	}
	anim(start);
}
function clearCanvas(canvas, alt){
	let ctx = canvas.getContext('2d');
	if(alt){
		canvas.width += 0;
		smoothFixCtx(ctx);
	}
	else ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function smoothFix(){
	['C', 'bgC', 'enC'].forEach(ctx => {
		window[ctx].imageSmoothingEnabled = false;
	});
}
function smoothFixCtx(ctx){
	ctx.imageSmoothingEnabled = false;
}