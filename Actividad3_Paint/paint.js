/*
* Author: Daniel Elias Becerra 
* Year: 2020
* Title: Javascript 2D - Paint
*/

class Brush {
    constructor(ctx, color, width, canvas){
        this.states = {drawing: false, waiting: false};
        this.x = 0;
        this.y = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.color = color;
        this.ctx = ctx;
        this.canvas = canvas;
        this.ctx.strokeStyle = this.color;
        this.width = width;
        this.ctx.lineWidth = this.width;
        this.texture = null;
        this.keyEvents();
    }

    keyEvents(){
        //mousedown and mouseup are caught anywhere to keep track of these user inputs
        //so it doesn't matter if the mouse is on the canvas area
        document.addEventListener('mousedown', event =>{
            this.states.drawing = true;
            this.states.waiting = false;
        });

        //Only add the mouse move event to the canvas so any mouse moves outside
        //the canvas doesn't cause the canvas to draw something on its area
        this.canvas.addEventListener('mousemove', event =>{
            this.lastX = this.x;
            this.lastY = this.y;
            this.x = event.offsetX;
            this.y = event.offsetY;
            if(this.states.drawing){ 
                this.ctx.strokeStyle = this.color;
                this.ctx.lineWidth = this.width;      
                this.ctx.beginPath();
                this.ctx.moveTo(this.lastX, this.lastY);
                this.ctx.lineTo(this.x, this.y);
                this.ctx.stroke();
            }
        });

        document.addEventListener('mouseup', event => {
            this.states.drawing = false;
            this.states.waiting = true;
        });


    }
}


function main() {
    //Canvas setup
    let canvas = document.getElementById("htmlCanvas");
    if(!canvas) {
        console.log("Failed to load the canvas element.");
        return;
    }
    let ctx = canvas.getContext("2d");

    //sidenav setup
    document.addEventListener('DOMContentLoaded', function() {
        var elems = document.querySelectorAll('.sidenav');
        var instances = M.Sidenav.init(elems, options);
    });

    //Slider setup
    let slider = document.getElementById("myRange");
    let output = document.getElementById("demo");
    output.innerHTML = slider.value;
    let colorPicker = document.getElementById("colorPicker");
    let color = document.getElementById("html5colorpicker");
    let eraser = document.getElementById("erase");

    let myBrush = new Brush(ctx, color.value, slider.value, canvas);

    //Update when slider is moved - change width
    slider.oninput = function() {
        output.innerHTML = this.value;
        myBrush.width = this.value;
    }

    //Update when hex color picker changes - change brush color
    colorPicker.oninput = function() {
        myBrush.color = color.value;
    }

    //Erases the canvas completely
    eraser.onclick = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

