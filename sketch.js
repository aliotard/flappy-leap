var pipes = [];
var flappy = {};
var score = 0;
var prevScore = 0;
var flappy_sprite;
var play = false;
var startButton;
var leapButton;
var title = true;
var scoreLabel;
var canvas;
var pipeSpacing = 256;
var pipeSpeed = 5;
var gameOver;
var pipeNumber;
var handHeight = 100;
var leapMode = false;


Leap.loop(function (frame) {
    if (frame.hands.length > 0) {
        var hand = frame.hands[0];
        //var position = hand.palmPosition[1];
        handHeight = hand.stabilizedPalmPosition[1];
    }
});

function preload() {
    flappy_sprite = loadImage("flappy bird.png");
}

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position((windowWidth - width) / 2, 0);
    background(0);

    pipeNumber = floor(windowWidth / pipeSpacing) + 1;
    //print(pipeNumber);

    for (var i = 0; i < pipeNumber; i++) {
        pipes.push(new Pipe(width + i * pipeSpacing, pipeSpeed));
    }

    rectMode(CORNERS);

    var location = createVector(100, height / 2);
    var velocity = createVector(0, 0);
    var gravity = createVector(0, 0.5);

    imageMode(CENTER);
    flappy = new Flappy(location, velocity, gravity);

    var screen = createDiv("");
    screen.position(0, 0);
    screen.size(width, height);

    startButton = createImg("play-button-big.png", "play");
    startButton.id("play");
    startButton.parent(screen);
    startButton.mousePressed(function () {
        play = true;
    });

    leapButton = createImg("leap-icon-big.png", "leap");
    leapButton.id("leap");
    leapButton.parent(screen);
    leapButton.mousePressed(function () {
        leapMode = true;
    });

    scoreLabel = createP("0");
    scoreLabel.position(windowWidth / 2 - 50, 50);
    scoreLabel.id("score");

    gameOver = createDiv("");
    gameOver.id("game_over");
    gameOver.parent(screen);

    noSmooth();
}

function draw() {
    background(color(93, 186, 255));

    if (play) {
        for (var i = 0; i < pipeNumber; i++) {
            if (pipes[i]._x > -pipes[i].pipeWidth) {
                pipes[i].display();
            } else {
                pipes[i] = new Pipe(pipeNumber * pipeSpacing - pipes[i].pipeWidth, pipeSpeed);
            }
        }

        flappy.display();

        if (leapMode) {
            flappy._location.y = map(round(handHeight), 50, 300, height, 0);
        }

        fill(0);

        startButton.hide();
        leapButton.hide();
        gameOver.hide();
    } else {
        startButton.show();
        leapButton.show();
        gameOver.show();
        fill(0);
        if (title) {
            gameOver.html("<span>GAME OVER<br>SCORE : " + prevScore + "</span>");
            title = false;
        }
    }

    //text(round(handHeight), 50, 50);
}

function mouseClicked() {
    flappy._velocity.y = -10;
}

function keyPressed() {
    if (key == ' ') {
        flappy._velocity.y = -10;
    }
}

function reset() {
    play = false;
    title = true;
    for (var i = 0; i < pipeNumber; i++) {
        pipes[i] = new Pipe(width + i * pipeSpacing, 5);
    }
    prevScore = score;
    score = 0;
    scoreLabel.html(score);
    flappy._location.y = height / 2;
    flappy._velocity.y = 0;
}

function Pipe(x, speed) {
    this._x = x;
    this._speed = speed;
    this._holeHeight = random(200, height - 200);
    this.pipeWidth = 48;
    this.passed = false;

    this.display = function () {
        if (this._x > -100) {
            this._x -= this._speed;
            fill(0, 200, 0);
            stroke(64);
            strokeWeight(3);
            rect(this._x, 0, this._x + this.pipeWidth, this._holeHeight - 100);
            rect(this._x - 10, this._holeHeight - 110, this._x + this.pipeWidth + 10, this._holeHeight - 100);
            rect(this._x, this._holeHeight + 100, this._x + this.pipeWidth, height);
            rect(this._x - 10, this._holeHeight + 100, this._x + this.pipeWidth + 10, this._holeHeight + 110);
        }

        if (((flappy._location.x + flappy_sprite.width) >= this._x) && ((flappy._location.x - flappy_sprite.width) <= this._x + this.pipeWidth) && (((flappy._location.y + flappy_sprite.height) >= this._holeHeight + 100) || ((flappy._location.y - flappy_sprite.height) <= this._holeHeight - 100))) {
            reset();
        }

        if ((this._x <= 100) && (this.passed == false)) {
            score++;
            scoreLabel.html(score);
            this.passed = true;
        }
    };
}

function Flappy(location, velocity, gravity) {
    this._location = location;
    this._velocity = velocity;
    this._gravity = gravity;

    this.display = function () {
        if (!leapMode) {
            this._location.add(this._velocity);
            this._velocity.add(this._gravity);
        }

        if (this._location.y < height) {
            push();
            translate(this._location.x, this._location.y);
            rotate(constrain(radians(this._velocity.y * 5), -HALF_PI, HALF_PI));
            scale(3);
            image(flappy_sprite, 0, 0);
            pop();
        } else {
            reset();
        }
    };
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}