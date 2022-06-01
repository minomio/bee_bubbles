const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 800; //same as in css
canvas.height = 500; //same as in css

let score = 0;
let gameFrame = 0;
ctx.font = "50px Georgia";

let canvasPosition = canvas.getBoundingClientRect();
// Mouse object holds data, can be overwritten with eventlisterners:
const mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  click: false,
};

canvas.addEventListener("mousedown", function (event) {
  mouse.click = true;
  //overriding const mouse x and y coordinates with event of mouse click:
  //   mouse.x = event.x;
  //   mouse.y = event.y;
  mouse.x = event.x - canvasPosition.left;
  mouse.y = event.y - canvasPosition.top;
});

canvas.addEventListener("mouseup", function () {
  mouse.click = false;
});
//******************** PLAYER ******************** */
//place SpriteSheet into project:
const playerLeft = new Image();
playerLeft.src = "bee/SPRITESHEET.png";
const playerRight = new Image();
playerRight.src = "bee/SPRITESHEET.png";

class Player {
  constructor() {
    // Starting coordiantes:
    this.x = canvas.width;
    this.y = canvas.height / 2;
    // character is circle:
    this.radius = 50;
    // Orient character facing direction:
    this.angle = 0;
    // FrameX and FrameY are coordinates of character spriteSheet:
    this.frameX = 0;
    this.frameY = 0;
    this.frame = 0; //keeps track of overall frame
    // frame width on spriteSheet:
    this.spriteWidth = 512;
    this.spriteHeight = 512;
  }

  update() {
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    if (mouse.x != this.x) {
      this.x -= dx / 30; //divide by 30 to slow down move of character speed
    }
    if (mouse.y != this.x) {
      this.y -= dy / 30;
    }
  }

  draw() {
    if (mouse.click) {
      ctx.lineWidth = 0.2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
    }
    //create circle to represent Player character:
    ctx.fillStyle = "red";
    ctx.beginPath();
    //arc (start coordiante x, y, size, start angle, end angle )
    // start angle = 0 and end angle is Math.PI * 2 = full circle
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    // ctx.fill(); //this draws the circle
    ctx.closePath();
    //so that character rotates towards arrow:
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    //drawImage 3. 5. or 9 arguemnts depending on how much control:
    //1. image we want to draw. 2-5 area we want to crop out. 5-9 where on desitination image i want to place my cropped image onto
    //to make it face different directions:
    if (this.x >= mouse.x) {
      ctx.drawImage(
        playerLeft,
        0,
        512,
        this.spriteWidth,
        this.spriteHeight,
        // this.x - 60, //adjust here to align with red circle
        // this.y - 65,
        0 - 60,
        0 - 65,
        this.spriteWidth / 4,
        this.spriteHeight / 4
      ); //dividing by 4 scales image down
    } else {
      ctx.drawImage(
        playerRight,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        0 - 60, //adjust here to align with red circle
        0 - 65,
        this.spriteWidth / 4,
        this.spriteHeight / 4
      ); //dividing by 4 scales image down
    }
    ctx.restore();
  }
}
const player = new Player();

//******************** Bubbles ******************** */
const bubblesArray = [];
class Bubble {
  constructor() {
    this.x = Math.random() * canvas.width; //whole canvas

    //add canvas.height bellow to make bubbles appear from bottom:
    this.y = canvas.height + 100; //100 ensures bubble fully animates from bellow screen
    this.radius = 50;
    this.speed = Math.random() * 5 + 1; //random number between 1 -6
    this.distance; //keep track between bubble and player
    this.counted = false; //use this so only 1 score per collision
    //sound for bubbles, this randomly chooses sound:
    //this.sound = Math.random() > 0.5 ? true : false;
    this.sound = true;
  }
  update() {
    //move bubble up in negative directino on y axis depending on their speed
    this.y -= this.speed;

    //keep track of distance:
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    this.distance = Math.sqrt(dx * dx + dy * dy);
  }
  draw() {
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}

const pop1 = document.createElement("audio");
pop1.src = "sounds/outofammo.wav";
const pop2 = document.createElement("audio");
pop1.src = "sounds/shotgun.wav";
//******************** handle Bubbles ******************** */
function handleBubbles() {
  //Every 50 frames make new bubble:
  if (gameFrame % 50 == 0) {
    bubblesArray.push(new Bubble());
  }
  for (let i = 0; i < bubblesArray.length; i++) {
    bubblesArray[i].update();
    bubblesArray[i].draw();
  }
  //call update and draw functions for each bubble i in array to actaully make bubbles:
  for (let i = 0; i < bubblesArray.length; i++) {
    //take bubbles out of array after hits top of canvas so array not infinite in size:
    //this.radius* 2 ensures bubbles totaly aniamte offscreen before disappearing.
    if (bubblesArray[i].y < 0 - this.radius * 2) {
      //splice cut outs element from certain index (index of element want to remove, 1 is to specify only want to remove one element from array after specified index i)
      bubblesArray.splice(i, 1);
    }
    if (bubblesArray[i].distance < bubblesArray[i].radius + player.radius) {
      if (!bubblesArray[i].counted) {
        // if (bubblesArray[i].sound == true) {
        //   pop1.play();
        // } else {
        //   pop1.play();
        //   console.log("2");
        // }
        score++;
        bubblesArray[i].counted = true;
        //remove bubble once popped:
        bubblesArray.splice(i, 1);
      }
    }
  }
}
//******************** ANIMATE ******************** */
function animate() {
  //Clear frame at each frame to get rid of trails:
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  handleBubbles();
  // Calculate player position:
  player.update();
  //draw a line between circle and mouse
  player.draw();
  //text color of score:
  ctx.fillStyle = "black";
  //Tesxt (text, x coordinate, y coordinate):
  ctx.fillText("score: " + score, 10, 50);
  //increase gameframe each frame and can add things to it
  gameFrame++;
  //to create loop through recursion:
  requestAnimationFrame(animate);
}
animate();
//JS is case sensitive
