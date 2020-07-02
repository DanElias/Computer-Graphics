/*
* Author: Daniel Elias Becerra
* Year: 2020
* Title: Activity 2 - Pong
*/

//globals
let ctx = null;
let canvas = null;
let keyPressed = {};
let bgFrames = [];
let frameCounter = 0;
let maxBallSpeed = 5;
let score = document.getElementById("score");
let score_p1 = 0;
let score_p2 = 0;


class sphere {
    constructor(color, x, y, radius, speed) {
        this.color = color;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.right = false;
        this.up = true;
        this.speed = speed;
        this.tag = "sphere";
        this.collisionObjects = [];
        this.width = this.x + 2 * this.radius;
        this.height = this.width;
        this.speed_increment = 1;
    }

    draw() { 
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.fill();
    }

    update(xLimit, yLimit) {
        this.movement(xLimit, yLimit);
        this.checkCollisions();
    }

    getPosition(){
        return {x: this.x, y: this.y};
    }

    getTag(){
        return this.tag;
    }

    getDirection(){
        if(this.up) return "up";
        else return "down";
    }

    movement(xLimit, yLimit){
        //Rebota derecha e izquierda
        if(this.x + this.radius > xLimit){
            this.right = false;
            this.speed_increment += 1;
            score_p1 += 1
            score.innerHTML = "Score : " + score_p1 + " | " + score_p2;
        }
        if(this.x < this.radius){
            this.right = true;
            this.speed_increment += 1;
            score_p2 += 1
            score.innerHTML = "Score : " + score_p1 + " | " + score_p2;
        }

        if(this.right){
            this.x += 1 * this.speed_increment;
        } else {
            this.x -= 1 * this.speed_increment;
        }

        //Rebota arriba y abajo
        if(this.y + this.radius > yLimit){this.up = true;}
        if(this.y < this.radius){this.up = false;}

        if(this.up){
            this.y -= this.speed;
        } else {
            this.y += this.speed;
        }
    }

    addCollisionObject(collisionObject){
        this.collisionObjects.push(collisionObject);
    }

    checkCollisions(){
        for(let collisionObject of this.collisionObjects) {
            let collider = collisionObject.getCollider();

            let xMin = collider.top_left.x;
            let xMax = collider.bottom_right.x;
            let yMin = collider.top_left.y;
            let yMax = collider.bottom_right.y;
            
            if(((this.x + this.radius) > xMin && (this.x + this.radius) < xMax ) ||
            ((this.x + this.radius) > xMin && (this.x - this.radius) < xMax)) {
                if((this.y + this.radius) > yMin && (this.y + this.radius) < yMax ){
                    this.right = !this.right;
                    this.up = !this.up;
                    this.speed_increment += 1;
                }
            }
        }
    }
}

class bar {
    constructor(color, x, y, width, height, up, down, speed, yLimit, ai) {
        this.color = color;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.up = up;
        this.down = down;
        this.movement = true;
        this.yLimit = yLimit;
        this.speed = speed;
        this.ai = ai
        this.aiTargets = [];
        this.tag = "bar";
        keyPressed[this.up] = false;
        keyPressed[this.down] = false;
        if(!this.ai){
            this.keyEvents();
        }
    }

    draw() { 
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fill();
    }

    //Para movimiento que no vas a controlar tu
    update(xLimit, yLimit){
        if(this.ai){
            for(let aiTarget of this.aiTargets) {
                if(aiTarget.getTag() == "sphere"){
                    if(aiTarget.getDirection() == "up"){
                        this.moveUp();
                    } else {
                        this.moveDown();
                    }
                }
            }
        }
    }

    keyEvents() {
        //if (event.defaultPrevented) { return; }
        document.addEventListener('keydown', event =>{
            console.log(keyPressed);
            if(event.key in keyPressed){
                keyPressed[event.key] = true;
            }

            if(keyPressed[this.up])
                this.moveUp();

            if(keyPressed[this.down])
                this.moveDown();

        });

        document.addEventListener('keyup', event => {
            if(event.key in keyPressed){
                keyPressed[event.key] = false;
            }
        });
        //event.preventDefault();
    }

    getPosition(){
        return {x: this.x, y: this.y};
    }

    getDimensions(){
        return {width: this.x, height: this.y};
    }

    getCollider(){
        return {
            top_left: {x: this.x, y: this.y},
            top_right: {x: this.x + this.width, y: this.y},
            bottom_left: {x: this.x, y: this.y + this.height},
            bottom_right: {x: this.x + this.width, y: this.y + this.height},
        }
    }

    getTag(){
        return this.tag;
    }

    moveUp(){
        if(this.y - this.speed > 0){
            this.y -= this.speed;
        }
    }

    moveDown(){
        if(this.y + this.speed + this.height < this.yLimit){
            this.y += this.speed;
        }
    }

    addAiTarget(aiTarget){
        this.aiTargets.push(aiTarget);
    }

}

//Animation
//Es mejor pensarlo como una máquina de estados finita al estar usando ciclos infinitos
function update(objects) {
    //Esta función utiliza el refresh rate de tu pantalla, no se necesita calcular tu refresh rate
    //This makes it smooth
    //Como un double buffer
    requestAnimationFrame(() => update(objects)); //es como un while(true) => draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //Background gif animation by frames
    if(frameCounter >= bgFrames.length) 
        frameCounter = 0;
    ctx.drawImage(bgFrames[frameCounter], 0, 0, canvas.width, canvas.height);
    frameCounter += 1;

    if(objects["sphere"].speed_increment > maxBallSpeed){
        objects["sphere"].speed_increment -= 1;
    }
    for (let key in objects) {
        objects[key].draw();
        objects[key].update(canvas.width, canvas.height);
    }
    //setInterval crea un callback que se ejecuta cada n milisegundos, cambia de acuerdo a la pantalla
}

function main(){
    score = document.getElementById("score");
    canvas = document.getElementById("ballCanvas");
    ctx = canvas.getContext("2d");

    for(let i = 1; i <= 15; i++){
        bgFrames.push(document.getElementById("img"+i));
    }

    keyPressed = {'w': false, 's': false, "ArrowUp": false,  "ArrowDown": false}
    let objects = { 
        sphere: new sphere('white', canvas.width / 2, canvas.height / 2, 20, 3),
        player1: new bar('white', canvas.width - 30, canvas.height / 2, 20, 100, "o", "l", 5, canvas.height, false),
        player2: new bar('white', 10 , canvas.height / 2, 20, 100, "w", "s", 5, canvas.height, false)
    }
    objects["sphere"].addCollisionObject(objects["player1"]);
    objects["sphere"].addCollisionObject(objects["player2"]);
    objects["player1"].addAiTarget(objects["sphere"]);
    update(objects);
}