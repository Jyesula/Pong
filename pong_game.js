$(document).ready(function(){

function Player(x,y){
	this.x = x;
	this.y = y;
	this.width = 2;
	this.height = 28;
	this.score = 0;
}
// Draw the players
Player.prototype.draw = function(p){
	p.fillRect(this.x, this.y, this.width, this.height);
}

function Game(){
// set the canvvas to a variable
	var game_canvas = $("#game")[0];
// Set the dimensions of the canvas to the size of the window.
	this.width = game_canvas.width;
	this.height = game_canvas.height;
// Get the 2D context from the canvas	
	this.context = game_canvas.getContext("2d");
// Set the color of the canvas to white
	this.context.fillStyle = "white";
// Create Player 1
	this.p1 = new Player(5,0);
	this.p1.y= this.height/2 - this.p1.height/2;
//Display the score for player 1
	this.display1 = new Display(this.width/4, 25);	
// Create Player 2
	this.p2 = new Player(this.width - 5 - 2, 0);
	this.p2.y = this.height/2 - this.p2.height/2;
// Display the score for Player 2
	this.display2 = new Display(this.width*3/4, 25);
// Create the Ball
	this.ball = new Ball();
	this.ball.x = this.width/2;
	this.ball.y = this.height/2;
	this.ball.vy = Math.floor(Math.random()*12 - 6);
	this.ball.vx = 7 - Math.abs(this.ball.vy);
// Create the KeyListener
	this.keys = new KeyListener();
}

Game.prototype.draw = function(){
	this.context.clearRect(0, 0, this.width, this.height);
	this.context.fillRect(this.width/2, 0, 2, this.height);
// Draw the ball
	this.ball.draw(this.context);
// Draw the players
	this.p1.draw(this.context);
	this.p2.draw(this.context);
// Draw the Scores
	this.display1.draw(this.context);
	this.display2.draw(this.context);
};

Game.prototype.update = function(){
	if (this.paused) {
		return;
	}

// Update the player's score
	this.display1.value = this.p1.score;
	this.display2.value = this.p2.score;
// Control Player 1 
	if (this.keys.isPressed(83)) { // Down
		this.p1.y = Math.min(this.height - this.p1.height, this.p1.y + 6);
	} else if (this.keys.isPressed(87)){ // Up
		this.p1.y = Math.max(0, this.p1.y - 6);
	}
// Control Player 2
	if (this.keys.isPressed(40)) { // Down
		this.p2.y = Math.min(this.height - this.p2.height, this.p2.y + 6);
	} else if (this.keys.isPressed(38)){ // Up
		this.p2.y = Math.max(0, this.p2.y - 6);
	}
// Update the position of the ball.
	this.ball.update();
	if (this.ball.x > this.width || this.ball.x + this.ball.width < 0) {
		this.ball.vx = -this.ball.vx;
	} else if (this.ball.y > this.height || this.ball.y + this.ball.height < 0){
		this.ball.vy = -this.ball.vy
	}
// Checking the ball's collision with the player
	if (this.ball.vx > 0){
		if (this.p2.x <= this.ball.x + this.ball.width && 
			this.p2.x > this.ball.x - this.ball.vx + this.ball.width) {
// Store the collision difference for player 2			
			var collisionDiff = this.ball.x + this.ball.width - this.p2.x;
			var k = collisionDiff/this.ball.vx;
			var y = this.ball.vy*k + (this.ball.y - this.ball.vy);
// If to determine when the ball collides with Player 2
			if (y >= this.p2.y && y + this.ball.height <= this.p2.y + this.p2.height) {
				this.ball.x = this.p2.x - this.ball.width;
				this.ball.y = Math.floor(this.ball.y - this.ball.vy + this.ball.vy*k);
				this.ball.vx = -this.ball.vx;
				this.ball.update;
			}
		}
	} else {
		if (this.p1.x + this.p1.width >= this.ball.x) {
// Store the collision difference for Player 1
			var collisionDiff = this.p1.x + this.p1.width - this.ball.x;
			var k = collisionDiff/-this.ball.vx;
			var y = this.ball.vy*k + (this.ball.y - this.ball.vy);
// If to determine whether the ball collides with Player 1
			if (y >= this.p1.y && y + this.ball.height <= this.p1.y + this.p1.height) {
				this.ball.x = this.p1.x + this.p1.width;
				this.ball.y = Math.floor(this.ball.y - this.ball.vy + this.ball.vy*k);
				this.ball.vx = -this.ball.vx;
				this.ball.update;
			}
		}
	}
// Collision detection for the top and bottom
	if ((this.ball.vy < 0 && this.ball.y < 0) || (this.ball.vy > 0 && this.ball.y + this.ball.height > this.height)) {
		this.ball.vy = -this.ball.vy;
		this.ball.update;
	}
// Check for when a player scores
	if (this.ball.x >= this.width) {
		this.score(this.p1);
	} else if (this.ball.x + this.ball.width <= 0) {
		this.score(this.p2);
	}
};

Game.prototype.score = function(p){
// Increment when a player scores
	p.score++;

	var player = p == this.p1 ? 0 : 1;
// Set the position of the ball after a player scores
	this.ball.x = this.width/2;
	this.ball.y = p.y + p.height/2;
// Set the velocity of the ball after a player scores
	this.ball.vy = Math.floor(Math.random()*12 - 6);
	this.ball.vx = 7 - Math.abs(this.ball.vy);
	if (player == 1) {
		this.ball.vx *= -1;
	}

};

function Display(x, y){
	this.x = x;
	this.y = y;
	this.value = 0;
};

Display.prototype.draw = function(p){
	p.fillText(this.value, this.x, this.y);
};

function Ball(){
	this.x = 0;
	this.y = 0;
	this.vx = 0;
	this.vy = 0;
	this.width = 4;
	this.height = 4;
}

Ball.prototype.update = function(){
// Increase the speed of the ball whenn it updates
	this.x += this.vx;
	this.y += this.vy;
};

Ball.prototype.draw = function(p){
	p.fillRect(this.x, this.y, this.width, this.height);
};

function KeyListener(){
	this.pressedKeys = [];
// Listen for KeyDown
	this.keydown = function(e){
		this.pressedKeys[e.keyCode] = true;
	};
// Listen for KeyUp
	this.keyup = function(e){
		this.pressedKeys[e.keyCode] = false;
	};
// Add event listeners for keydown and keyup
	document.addEventListener("keydown", this.keydown.bind(this));
	document.addEventListener("keyup", this.keyup.bind(this));
};

KeyListener.prototype.isPressed = function(key){
	return this.pressedKeys[key] ? true : false;
};

KeyListener.prototype.addKeyPressListener = function(keycode, callback){
	document.addEventListener("keypress", function(e){
		if (e.keyCode == keyCode) {
			callback(e);
		}
	});
};

var game = new Game();

function MainLoop(){
	game.update();
	game.draw();
// Call the main loop again every 30~ ms
	setTimeout(MainLoop, 33.3333);
}
// Start the game
MainLoop();
});
