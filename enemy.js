// CONSTANTS

var LEFT = false;
var RIGHT = true;

var ENEMY_SPEED = 300;
var ANIM_IDLE_LEFT = 0;
var ANIM_JUMP_LEFT = 1;
var ANIM_WALK_LEFT = 2;
var ANIM_SHOOT_LEFT = 3;
var ANIM_CLIMB = 4;
var ANIM_IDLE_RIGHT = 5;
var ANIM_JUMP_RIGHT = 6;
var ANIM_WALK_RIGHT = 7;
var ANIM_SHOOT_RIGHT = 8;
var ANIM_MAX = 9;

var LEFT = 0;
var RIGHT = 1;
var UP = 2;
var DOWN = 3;

var Enemy = function(px, py) 
{
	this.sprite = new Sprite("enemy.png");
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]); 
	this.sprite.setAnimationOffset(0, -55, -87);

	this.position = new Vector2();
	this.position.set(px, py);
	this.velocity = new Vector2();

	this.moveRight = true;
	this.pause = 0;
};


// ENEMY UPDATE FUNCTION
Enemy.prototype.update = function(deltaTime)
{
	
	this.sprite.update(deltaTime);

	var left = false;
	var right = false;
	var up = false;
	// CHECK KEYPRESS EVENTS
	if (this.pause > 0)
	{
		this.pause -= deltaTime;
	}
	else
	{
			
		var ddx = 0;
			
		var tx = pixelToTile(this.position.x);
		var ty = pixelToTile(this.position.y);
		var nx = (this.position.x)%TILE;
		var ny = (this.position.y)%TILE;
		var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
		var cellright = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty);
		var celldown = cellAtTileCoord(LAYER_PLATFORMS, tx, ty + 1);
		var celldiag = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty + 1);

		if (this.moveRight = true)
		{
			if(celldiag && !cellright)
			{
				ddx = ddx + ENEMY_ACCEL;	
			}
			else
			{
				this.velocity.x = 0;
				this.moveRight = false;
				this.pause = 0.5;
			}
		}
		
		if(!this.moveRight)
		{
			if(celldown && !cell)
			{
				this.velocity.x = 0;
				this.moveRight = true;
				this.pause = 0.5;
			}
		}
		
		this.position.x = Math.floor(this.position.x + (deltaTime * this.velocity.x));
		this.velocity.x = bound(this.velocity.x + (deltaTime * ddx), -ENEMY_MAXDX, ENEMY_MAXDX);
	}

	
	

}

Enemy.prototype.draw = function()
{
	this.sprite.draw(context, this.position.x-worldOffsetX, this.position.y);
}