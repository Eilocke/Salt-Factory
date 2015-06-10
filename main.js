var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

// This function will return the time in seconds since the function 
// was last called
// You should only call this function once per frame
function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();

		// Find the delta time (dt) - the change in time since the last drawFrame
		// We need to modify the delta time to something we can use.
		// We want 1 to represent 1 second, so if the delta is in milliseconds
		// we divide it by 1000 (or multiply by 0.001). This will make our 
		// animations appear at the right speed, though we may need to use
		// some large values to get objects movement and rotation correct
	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	
		// validate that the delta is within range
	if(deltaTime > 1)
		deltaTime = 1;
		
	return deltaTime;
}

//-------------------- Don't modify anything above here

var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;


// some variables to calculate the Frames Per Second (FPS - this tells use
// how fast our game is running, and allows us to make the game run at a 
// constant speed)
var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

// LOAD AN IMAGE TO DRAW
var chuckNorris = document.createElement("img");
chuckNorris.src = "hero.png";

var player = new Player();
var keyboard = new Keyboard();
var vectorHandler = new Vector2();
var deltaTime = 0;
var musicSwitch = false;
var score = 0;
var BULLET_SPEED = 300;
var MAP = {tw: 60, th: 15};
var TILE = 35;
var TILESET_TILE = TILE*2;
var TILESET_PADDING = 2;
var TILESET_SPACING = 2;
var TILESET_COUNT_X = 14;
var TILESET_COUNT_Y = 14;
var lives = 3;
var METER = TILE;
var GRAVITY = METER * 9.8 * 6;
var CLIMB_SPEED = METER * 3;
var MAXDX = METER * 10;
var MAXDY = METER * 15;
var ACCEL = MAXDX * 2;
var FRICTION = MAXDX * 6;
var JUMP = METER * 3000;
var STATE_SPLASH = 0;
var STATE_MENU = 1;
var STATE_GAME = 2;
var STATE_OVER = 3;
var STATE_SCORE = 4;
var STATE_WIN = 5;
var tileset = document.createElement("img");
var worldOffsetX = 0;
var splashTimer = 3;
tileset.src = "tileset.png";

// Handles Enemies
var ENEMY_MAXDX = METER * 5;
var ENEMY_ACCEL = ENEMY_MAXDX * 2;

var enemies = [];

var LAYER_COUNT = 3;
var LAYER_BACKGOUND = 0;
var LAYER_PLATFORMS = 1;
var LAYER_LADDERS = 2;
var LAYER_OBJECT_ENEMIES = 3;
var LAYER_OBJECT_TRIGGERS = 4; 

var gameState = STATE_SPLASH;

// INITIALIZE FUNCTION W/ COLLISION MAP
var cells = [];

var musicBackground;
var SfxFire;
var SfxJump;
var SfxDeath;

function initialize()
{
	for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++)
	{
		cells[layerIdx] = [];
		var idx = 0;
		for(var y = 0; y < level1.layers[layerIdx].height; y++)
		{
			cells[layerIdx][y] = [];
			for(var x = 0; x < level1.layers[layerIdx].width; x++)
			{
				if(level1.layers[layerIdx].data[idx] != 0)
				{
					// for each tile we find in the layer data, we need to create 4 collisions
					// (because our collision squares are 35x35 but the tile in the
					// level are 70x70)
					cells[layerIdx][y][x] = 1;
					cells[layerIdx][y-1][x] = 1;
					cells[layerIdx][y-1][x+1] = 1;
					cells[layerIdx][y][x+1] = 1;
				}
				else if(cells[layerIdx][y][x] != 1)
				{
					// if we haven't set this cell's value, then set it to 0 now
					cells[layerIdx][y][x] = 0;
				}
				idx++;
			}
		}
	}

	idx = 0;
	for(var y = 0; y < level1.layers[LAYER_OBJECT_ENEMIES].height; y++)
	{
		for(var x = 0; x < level1.layers[LAYER_OBJECT_ENEMIES].width; x++)
		{
			if(level1.layers[LAYER_OBJECT_ENEMIES].data[idx] != 0)
			{
				// Creates enemies at spawn points
				var px = tileToPixel(x);
				var py = tileToPixel(y);
				var e = new Enemy(px, py);
				enemies.push(e);
			}
		idx++;
		}
	}
	cells[LAYER_OBJECT_TRIGGERS] = [];
	idx = 0;
	for(var y = 0; y < level1.layers[LAYER_OBJECT_TRIGGERS].height; y++)
	{
		cells[LAYER_OBJECT_TRIGGERS][y] = [];
		for(var x = 0; x < level1.layers[LAYER_OBJECT_TRIGGERS].width; x++)
		{
			if(level1.layers[LAYER_OBJECT_TRIGGERS].data[idx] != 0)
			{
				cells[LAYER_OBJECT_TRIGGERS][y][x] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y-1][x] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y-1][x+1] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y][x+1] = 1;
			}
			else if(cells[LAYER_OBJECT_TRIGGERS][y][x] != 1)
			{
				// if we haven't set this cell's value, then set it to 0 now
				cells[LAYER_OBJECT_TRIGGERS][y][x] = 0;
			}
		idx++;
		}
	}

	musicBackground = new Howl(
	{
		urls: ["background.ogg"],
		loop: true,
		buffer: true,
		volume: 0.5
	});
	sfxWin = new Howl(
	{
		urls: ["win.wav"],
		buffer: true,
		volume: 1,
		onend: function(){
			isSfxPlaying = false;
		}
	});	
	sfxFire = new Howl(
	{
		urls: ["fireEffect.ogg"],
		buffer: true,
		volume: 1,
		onend: function(){
			isSfxPlaying = false;
		}
	});
	sfxDeath = new Howl(
	{
		urls: ["death.mp3"],
		buffer: true,
		volume: 0.25,
		onend: function(){
			isSfxPlaying = false;
		}
	});
	sfxJump = new Howl(
	{
		urls: ["jumping.wav"],
		buffer: true,
		volume: 0.5,
		onend: function(){
			isSfxPlaying = false;
		}
	});
}

var trackStop = false;

function drawLives()
{

	heartImage = document.createElement("img");
	heartImage.src = "heart.png";	
	context.drawImage(heartImage, 7, 6);

	if(lives == 0)
	{
		gameState = STATE_OVER;
	}
	else if(lives >= 2)
	{
		context.drawImage(heartImage, 80, 5);
		if(lives == 3)
		{
		context.drawImage(heartImage, 153, 5);
		}
	}
}
// DETECTION BY PIXEL
function cellAtPixelCoord(layer, x,y)
{
	if(x<0 || x>SCREEN_WIDTH || y<0)
		return 1;
	// let the player drop of the bottom of the screen (this means death)
	if(y>SCREEN_HEIGHT)
		return 0;
	return cellAtTileCoord(layer, p2t(x), p2t(y));
};

//DETECTION BY TILE
function cellAtTileCoord(layer, tx, ty)
{
	if(tx<0 || tx>=MAP.tw || ty<0)
		return 1;
	// let the player drop of the bottom of the screen (this means death)
	if(ty>=MAP.th)
		return 0;
	return cells[layer][ty][tx];
};

// CONVERT TILES TO PIXELS
function tileToPixel(tile)
{
	return tile * TILE;
};

// CONVERT PIXELS TO TILES
function pixelToTile(pixel)
{
	return Math.floor(pixel/TILE);
};

// LIMITS VALUES TO MINIMUM AND MAXIMUM
function bound(value, min, max)
{
	if(value < min)
		return min;
	if(value > max)
		return max;
	return value;
}

// DRAWS LEVEL
function drawMap()
{
	
	var startX = -1;
	// Calculate the number of tiles that can fit on-screen (+2 for overhang)
	var maxTiles = Math.floor(SCREEN_WIDTH / TILE) + 2;
	// Calculate the player's current tile using its vector.
	var tileX = pixelToTile(player.position.x);
	// Calculate the player's offset from its current tile.
	var offsetX = TILE + Math.floor(player.position.x%TILE);
	// Calculate the starting tile to draw from on the x-axis. Caps off if the camera is too close
	// to the beginning or end of the level.
	 startX = tileX - Math.floor(maxTiles / 2);

	if(startX < -1)
	{
		startX = 0;
		offsetX = 0;
	}
	if(startX > MAP.tw - maxTiles)
	{
		startX = MAP.tw - maxTiles + 1;
		offsetX = TILE;
	}

	// Calculates the amount that the world has been scrolled. Used when drawing the player.
	worldOffsetX = startX * TILE + offsetX;
	
	for(var layerIdx=0; layerIdx<LAYER_COUNT; layerIdx++)
	{

		for (var y = 0; y < level1.layers[layerIdx].height; y++)
		{

			var idx = y * level1.layers[layerIdx].width + startX;

			for (var x = startX; x < startX + maxTiles; x++)
			{
				if (level1.layers[layerIdx].data[idx] != 0 )
				{
					var tileIndex = level1.layers[layerIdx].data[idx] - 1;
					var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) * (TILESET_TILE + TILESET_SPACING);
					var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) * (TILESET_TILE + TILESET_SPACING);
					context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE, (x-startX)*TILE - offsetX, (y-1)*TILE, TILESET_TILE, TILESET_TILE);
				}
				idx++;
			}
		}
	}
}

var bullets = [];

function masterUpdate(deltaTime)
{

	for(var i=0; i<enemies.length; i++)
	{
		enemies[i].update(deltaTime);
		
		if(player.position.intersects(enemies[i].position.x, enemies[i].position.y, TILE, TILE,
										player.position.x, player.position.y, player.width, player.height))
			{
				player.kill();
			}
	}
	for(var b = 0; b < bullets.length; b++)
	{

		bullets[b].update(deltaTime);
		bullets[b].draw();

		for(var e = 0; e < enemies.length; e++)
		{
			
			// I can't splice the bullet here, because it breaks the intersects function. I don't know why, since the splice happens at the end of the function and
			// it should just move on to the next index, but it does. I added the "depleted" variable, which just splices the bullet further down the line. 
					
			if(bullets[b].position.intersects(bullets[b].position.x, bullets[b].position.y, TILE, TILE,
												enemies[e].position.x, enemies[e].position.y,  TILE, TILE))
			{
			
				bullets[b].depleted = true;
				enemies.splice(e, 1);
				sfxDeath.play();
				score += 1;
				
			}
		} 
		if (bullets[b].position.x < worldOffsetX || bullets[b].position.x > worldOffsetX + SCREEN_WIDTH || bullets[b].depleted)
		{
			bullets.splice(b, 1);
		}
	}
	player.update(deltaTime);
	 
}

function masterDraw()
{
	drawMap();
	for(var i = 0; i<enemies.length; i++)
	{
		enemies[i].draw(deltaTime);
	}
	for(var i = 0; i< bullets.length; i++)
	{
		bullets[i].draw();
	}
	player.draw();
}

function gameStateGame(deltaTime)
{

masterUpdate(deltaTime);
masterDraw(deltaTime);

}

function gameStateSplash(deltaTime)
{

splashImage = document.createElement("img");
splashImage.src = "splash.png";	
context.drawImage(splashImage, 0, 0);
splashTimer -= deltaTime;

if(splashTimer < 0)
{
	gameState = STATE_GAME;
	musicBackground.play();
}

}

function gameStateOver()
{

if(trackStop == false)
{
	trackStop = true;
	musicBackground.stop();
}

gameoverImage = document.createElement("img");
gameoverImage.src = "rip.png";	
context.drawImage(gameoverImage, 0, 0);

}
function gameStateWin()
{

if(trackStop == false)
{
	trackStop = true;
	musicBackground.stop();
	sfxWin.play();
}

winImage = document.createElement("img");
winImage.src = "win.png";	
context.drawImage(winImage, 0, 0);

}

function run()
{

	var deltaTime = getDeltaTime();
	context.fillStyle = "#A9F5F2";		
	context.fillRect(0, 0, canvas.width, canvas.height);

	var px = pixelToTile(player.position.x);
	var py = pixelToTile(player.position.y);	
	var trigcell = cellAtTileCoord(LAYER_OBJECT_TRIGGERS, px, py);
	var trigright = cellAtTileCoord(LAYER_OBJECT_TRIGGERS, px + 1, py);
	var trigdown = cellAtTileCoord(LAYER_OBJECT_TRIGGERS, px, py + 1);
	var trigdiag = cellAtTileCoord(LAYER_OBJECT_TRIGGERS, px + 1, py + 1);
	
	if((trigcell || trigdiag || trigright || trigdown) && px > 0 && py > 0)
	{
		
		gameState = STATE_WIN;
			
	}
	
	switch(gameState)
	{
		
		case STATE_SPLASH:
		gameStateSplash(deltaTime);
		break;
				
		case STATE_GAME:
		gameStateGame(deltaTime);
		break;
		
		case STATE_OVER:
		gameStateOver();
		break;
		
		case STATE_WIN:
		gameStateWin();
		break;
				
	}
	
	// update the frame counter 
	fpsTime += deltaTime;
	fpsCount++;
	if(fpsTime >= 1)
	{
		fpsTime -= 1;
		fps = fpsCount;
		fpsCount = 0;
	}
		
	// draw the FPS
	context.fillStyle = "#f00";
	context.font="14px Arial";
	context.fillText("FPS: " + fps, 580, 20, 100);
	if(gameState == STATE_GAME)
	{
		hudImage = document.createElement("img");
		hudImage.src = "hud1.png";	
		context.drawImage(hudImage, 0, 0);
		drawLives();
		context.fillStyle = "#f00";
		context.font="70px Arial";
		context.fillText(score, 190, 470, 610);
	}

	}

initialize();

//-------------------- Don't modify anything below here


// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }
  
  window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);
