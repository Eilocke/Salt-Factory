var vector2 = function() {
}
var vX = 0;
var vY = 0;

function getMagnitude(x1, y1, x2, y2)
{
	// Set velocity initially
	var x = 0;
	var x2 = 0;
	var y = 0;
	var y2 = 0;
	
	x -= x2;
	y -= y2;
	
	var vector = Math.sqrt((x * x) + (y * y));
		
	return vector;
}

function getNormalize(x1, y1, x2, y2)
{

	var vector = getMagnitude(x1,y1,x2,y2);
	
	vector /= vector;
	
	return vector;
}
//function set(x,y);
//function normalize();
//function add(v2);
//function subtract(v2);
//function multiplyScalar(num);
