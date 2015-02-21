/***** Flappy Leap - 21/02/2015 *****/

//variables declaration
var pipes = []; //array of pipes objects (one pipe object = top + bottom pipes in game)
var flappy = {}; //the bird object
var score = 0; //the current score
var prevScore = 0; //used to display the score when game over
var flappy_sprite; //the bird's sprite
var play = false; //false if in start screen, true while playing
var startButton; //start game
var leapButton; //activate/deactivate leap motion control
var scoreLabel; //display score at the top of the screen
var canvas; //the html5 canvas element
var pipeSpacing = 256; //space between pipes (in pixels)
var pipeSpeed = 5; //pipes translation speed (in pixels/frame)
var gameOver; //display "Game Over" message with final score
var pipeNumber; //number of pipe objects in "pipes" array
var handHeight = 100; //height of user's hand, given by the leap motion
var leapMode = false; //set by leapButton
var leapIcon; //leapButton's look if leap control on
var notLeapIcon; //leapButton's look if leap control off

//loading assets before the rest of the code runs
function preload() {
    flappy_sprite = loadImage("assets/sprites/flappy bird.png"); //bird's sprite
    bip = loadSound("assets/sounds/1up.wav"); //sound when passing a pipe
    dead = loadSound("assets/sounds/dead.wav"); //sound when dead
    jump = loadSound("assets/sounds/jump.wav"); //sound when jumping
}

//setup game environment
function setup() {
    canvas = createCanvas(windowWidth, windowHeight); //create the canvas element, set to fullscreen
    canvas.position((windowWidth - width) / 2, 0); //center the canvas

    pipeNumber = floor(windowWidth / pipeSpacing) + 1; //number of pipe objects is dinamically set according to the screen's width and pipes spacing, to avoid unneccesary objects

    //create the series of pipes
    for (var i = 0; i < pipeNumber; i++) {
        pipes.push(new Pipe(width + i * pipeSpacing, pipeSpeed));
    }

    //p5 drawing settings
    rectMode(CORNERS);
    imageMode(CENTER);
    noSmooth();

    //physical properties, expressed as 2D vectors
    var location = createVector(100, height / 2); //bird's position in pixels
    var velocity = createVector(0, 0); //vertical impulse when clicking
    var gravity = createVector(0, 0.5); //gravity

    //create bird object with given physical properties
    flappy = new Flappy(location, velocity, gravity);

    //invisible fullscreen <div>, parent of other DOM elements
    var screen = createDiv("");
    screen.position(0, 0);
    screen.size(width, height);

    //create <p> element displaying the score
    scoreLabel = createP("0");
    scoreLabel.position(windowWidth / 2 - 50, 50);
    scoreLabel.id("score");

    //create <div> element displaying "Game Over" message with final score
    gameOver = createDiv("");
    gameOver.id("game_over");
    gameOver.parent(screen);

    //create start button, set sprite and map click event to "play" variable
    startButton = createImg("assets/sprites/play-button-big.png", "play");
    startButton.id("play");
    startButton.parent(screen);
    startButton.mousePressed(function () {
        play = true;
    });

    //create leap motion mode button
    leapButton = createDiv("");
    leapButton.id("leap");
    leapButton.parent(screen);
    leapButton.position(windowWidth / 2 - 80, 600);

    //the 2 possible appearances for leap button
    leapIcon = createImg("assets/sprites/leap-icon-big.png", "leap");
    notLeapIcon = createImg("assets/sprites/leap-not-icon-big.png", "leap");
    leapIcon.parent(leapButton);
    notLeapIcon.parent(leapButton);
    leapIcon.hide(); //at start leap mode is off, so the "on" icon is hidden

    //leapButton click event, toggles leapMode's state and leapButton look
    leapButton.mousePressed(function () {
        if (!leapMode) {
            leapMode = true;
            leapIcon.show();
            notLeapIcon.hide();
        } else {
            leapMode = false;
            notLeapIcon.show();
            leapIcon.hide();
        }
    });
}

//loop used to retrieve values sent by the Leap Motion
Leap.loop(function (frame) {
    if (frame.hands.length > 0) { //if there is at least a hand present
        var hand = frame.hands[0]; //only the first visible hand is considered
        handHeight = hand.stabilizedPalmPosition[1]; //return Y position (height) of this hand
    }
});

//loop used to update game interface
function draw() {
    background(color(93, 186, 255)); //background color is set to sky blue

    //while playing
    if (play) {
        //if pipe's position is in the screen it is displayed
        for (var i = 0; i < pipeNumber; i++) {
            if (pipes[i]._x > -pipes[i].pipeWidth) {
                pipes[i].display();
            }
            //else its position is reset to the other side of the screen (this way, the "infinite" number of pipes is actually just a few of them being deleted when they pass the left border of the screen, and then recreated before the right border with a new randomized hole height)
            else {
                pipes[i] = new Pipe(pipeNumber * pipeSpacing - pipes[i].pipeWidth, pipeSpeed);
            }
        }

        flappy.display(); //display bird

        //when playing with the leap motion, the bird's vertical position is set according to the one of the user's hand (300mm is top of screen, 50mm is bottom)
        if (leapMode) {
            flappy._location.y = map(round(handHeight), 50, 300, height, 0);
        }

        //hide buttons and game over panel
        startButton.hide();
        leapButton.hide();
        gameOver.hide();
    }
    //during start screen
    else {
        //show buttons and game over panel
        startButton.show();
        leapButton.show();
        gameOver.show();

        //set game over panel text with last score
        gameOver.html("<span>GAME OVER<br>SCORE : " + prevScore + "</span>");
    }
}

//mouse click event
function mouseClicked() {
    flappy._velocity.y = -10; //give a vertical impulse to the bird
}

//key pressed event
function keyPressed() {
    //when spacebar is pressed
    if (key == ' ') {
        flappy._velocity.y = -10; //give a vertical impulse to the bird
        jump.play(); //play jump sound
    }
}

//function used to reset the game for a new party, called when user lose
function reset() {
    dead.play(); //play dead sound
    play = false; //display start screen
    //reset pipes position
    for (var i = 0; i < pipeNumber; i++) {
        pipes[i] = new Pipe(width + i * pipeSpacing, pipeSpeed);
    }
    prevScore = score; //the score to be displayed in the game over panel
    score = 0; //set the current score to 0
    scoreLabel.html(score); //update score label
    flappy._location.y = height / 2; //reset bird's position
    flappy._velocity.y = 0; //reset bird's velocity
}

//pipe object, consisting of 2 superimposed pipes with a space between them, at a random height
function Pipe(x, speed) {
    this._x = x; //set horizontal position
    this._speed = speed; //set horizontal speed
    this._holeHeight = random(200, height - 200); //random height of the hole, between 200 pixels from top and 200 pixels from bottom of screen
    this.pipeWidth = 48; //width of one pipe (in pixels)
    this.passed = false; //true if the bird has passed the hole

    //update pipe display
    this.display = function () {
        //if pipe is visible
        if (this._x > -this.pipeWidth) {
            this._x -= this._speed; //apply speed
            fill(0, 200, 0); //set color to green
            stroke(64); //set stroke color to grey
            strokeWeight(3); //set stroke width to 3 pixels

            //draw pipe using rectangles
            rect(this._x, 0, this._x + this.pipeWidth, this._holeHeight - 100); //top pipe body
            rect(this._x - 10, this._holeHeight - 110, this._x + this.pipeWidth + 10, this._holeHeight - 100); //top pipe edge
            rect(this._x, this._holeHeight + 100, this._x + this.pipeWidth, height); //bottom pipe body
            rect(this._x - 10, this._holeHeight + 100, this._x + this.pipeWidth + 10, this._holeHeight + 110); //bottom pipe edge
        }

        //check if the bird hit the pipe
        if (((flappy._location.x + flappy_sprite.width) >= this._x) && ((flappy._location.x - flappy_sprite.width) <= this._x + this.pipeWidth) && (((flappy._location.y + flappy_sprite.height) >= this._holeHeight + 100) || ((flappy._location.y - flappy_sprite.height) <= this._holeHeight - 100))) {
            reset(); //if so reset the game (player loses)
        }

        //if the pipe goes past the bird's position
        if ((this._x <= 100) && (this.passed == false)) {
            score++; //increment score
            bip.play(); //play sound
            scoreLabel.html(score); //update score label
            this.passed = true; //update boolean
        }
    };
}

//bird object
function Flappy(location, velocity, gravity) {
    //set physical properties to bird object
    this._location = location;
    this._velocity = velocity;
    this._gravity = gravity;

    //update bird display
    this.display = function () {
        //if bird is above the "ground"
        if (this._location.y < height) {
            //apply a transformation matrix to the bird
            push();
            translate(this._location.x, this._location.y); //set position

            //if not playing using the leap motion
            if (!leapMode) {
                this._location.add(this._velocity); //apply vertical speed to position
                this._velocity.add(this._gravity); //apply gravity to speed
                rotate(constrain(radians(this._velocity.y * 5), -HALF_PI, HALF_PI)); //rotate the bird according to its vertical speed, make it point upward when jumping, and downward when falling
            }
            scale(3); //bird size is 3 times bigger than the original sprite's size
            image(flappy_sprite, 0, 0); //display bird sprite
            pop();
        } else {
            reset(); //if the bird hit the ground, reset the game (player loses)
        }
    };
}