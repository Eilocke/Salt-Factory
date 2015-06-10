var Bullet = function(bulletX, bulletY, moveRight)
{
	this.position = new Vector2;
	this.velocity = new Vector2
	this.width = 15;
	this.height = 7;
	this.position.x = bulletX;
	this.position.y = bulletY;
	this.image = document.createElement("img");
	this.depleted = false;
	
	if (moveRight)
	{

		this.image.src = "bulletright.png";	
		this.velocity.set(BULLET_SPEED, 0);
		
	}
	else
	{

		this.image.src = "bulletleft.png";			
		this.velocity.set(-BULLET_SPEED, 0);
		
	}
}
Bullet.prototype.update = function(deltaTime)
{
	
	this.position.x = Math.floor(this.position.x + (deltaTime * this.velocity.x));

}

Bullet.prototype.draw = function()
{

	var screenX = this.position.x - worldOffsetX;
		context.drawImage(this.image, screenX, this.position.y);
}