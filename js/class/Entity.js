export default class Entity {
	constructor(type, pos) {
		this.type = type;
		this.x = pos[0];
		this.y = pos[1];
		Entity.entities.push(this);
		Entity.render();
	}

	draw() {}

	update() {}

	remove() {
		Entity.entities.splice(Entity.entities.indexOf(this), 1);
		Entity.render();
	}
}

Entity.entities = [];
Entity.render = () => {
	let list = Entity.entities; //alias
	if (!list.length || Entity.rendering) {
		if (!list.length) clearCanvas(Entity.game.canvas.entity);
		return;
	}
	clearCanvas(Entity.game.canvas.entity);
	/* Entity.rendering - to prevent redundant redrawing */
	Entity.rendering = 1;
	requestAnimationFrame(() => {
		Entity.rendering = 0;
	});
	Entity.game.ctx.entity.translate(
		Math.round(-Entity.game.player.deltaX * Entity.game.bSize),
		Math.round(-Entity.game.player.deltaY * Entity.game.bSize)
	);
	list.forEach(entity => {
		entity.draw();
	});
};
