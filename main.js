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
var LAYER_COUNT = 3;
var deltaTime = 0;
var MAP = {tw: 60, th: 15};
var TILE = 35;
var TILESET_TILE = TILE*2;
var TILESET_PADDING = 2;
var TILESET_SPACING = 2;
var TILESET_COUNT_X = 14;
var TILESET_COUNT_Y = 14;
var LAYER_COUNT = 3;
var LAYER_BACKGOUND = 0;
var LAYER_PLATFORMS = 1;
var LAYER_LADDERS = 2;
var METER = TILE;
var GRAVITY = METER * 9.8 * 6;
var MAXDX = METER * 10;
var MAXDY = METER * 15;
var ACCEL = MAXDX * 2;
var FRICTION = MAXDX * 6;
var JUMP = METER * 1500;
var STATE_SPLASH = 0;
var STATE_MENU = 1;
var STATE_GAME = 2;
var STATE_OVER = 3;
var STATE_SCORE = 4;
var tileset = document.createElement("img");
var worldOffsetX = 0;
tileset.src = "tileset.png";

var gameState = STATE_SPLASH;

// INITIALIZE FUNCTION AND COLLISION MAP
var cells = []; 					// the array that holds our simplified collision data
function initialize() {
	for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) { 	// initialize the collision map
		cells[layerIdx] = [];
		var idx = 0;
		for(var y = 0; y < level1.layers[layerIdx].height; y++) {
			cells[layerIdx][y] = [];
			for(var x = 0; x < level1.layers[layerIdx].width; x++) {
				if(level1.layers[layerIdx].data[idx] != 0) {
					// for each tile we find in the layer data, we need to create 4 collisions
					// (because our collision squares are 35x35 but the tile in the
					// level are 70x70)
					cells[layerIdx][y][x] = 1;
					cells[layerIdx][y-1][x] = 1;
					cells[layerIdx][y-1][x+1] = 1;
					cells[layerIdx][y][x+1] = 1;
				}
				else if(cells[layerIdx][y][x] != 1) {
					cells[layerIdx][y][x] = 0;						// if we haven't set this cell's value, then set it to 0 now
				}
			idx++;
			}
		}
	}
}

// DETECTION BY PIXEL
function cellAtPixelCoord(layer, x,y)
{
	if(x<0 || x>SCREEN_WIDTH || y<0)
		return 1;
	if(y>SCREEN_HEIGHT)			// let the player drop of the bottom of the screen (this means death)
		return 0;
	return cellAtTileCoord(layer, p2t(x), p2t(y));
};

//DETECTION BY TILE
function cellAtTileCoord(layer, tx, ty)
{
	if(tx<0 || tx>=MAP.tw || ty<0)
		return 1;
	if(ty>=MAP.th)				// let the player drop of the bottom of the screen (this means death)
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
	// Calculate the number of tiles that can fit on-screen (+2 for overhang)
	var maxTiles = Math.floor(SCREEN_WIDTH / TILE) + 2;
	// Calculate the player's current tile using its vector.
	var tileX = pixelToTile(player.position.x);
	// Calculate the player's offset from its current tile.
	var offsetX = TILE + Math.floor(player.position.x%TILE);
	// Calculate the starting tile to draw from on the x-axis. Caps off if the camera is too close
	// to the beginning or end of the level.
	var startX = tileX - Math.floor(maxTiles / 2);

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
	var worldOffsetX = startX * TILE + offsetX;
	
	for(var layerIdx=0; layerIdx<LAYER_COUNT; layerIdx++)
	{
		var idx = 0;
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
					context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE, (x-startX)*TILE, (y-1)*TILE, TILESET_TILE, TILESET_TILE);
				}
				idx++;
			}
		}
	}
}

function gameStateGame(deltaTime)
{
	player.update(deltaTime);
	drawMap();
	player.draw();
}

function run()
{

	var deltaTime = getDeltaTime();
	context.fillStyle = "#ccc";		
	context.fillRect(0, 0, canvas.width, canvas.height);
	
//	switch(gameState)
//	{
		
//		case STATE_SPLASH:
//		gameStateSplash();
//		break;
		
//		case STATE_MENU:
//		gameStateMenu();
//		break;
		
//		case STATE_GAME:
		gameStateGame(deltaTime);
//		break;
		
//		case STATE_OVER:
//		gameStateOver();
//		break;
		
//		case STATE_SCORE:
//		gameStateScore();
//		break;
		
//	}
	
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
	context.fillText("FPS: " + fps, 5, 20, 100);
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
