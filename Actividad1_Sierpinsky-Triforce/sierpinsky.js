/*
* Author: Daniel Elias Becerra 
* Year: 2020
* Title: Javascript 2D - Sierpinsky - Triforce
*/

//Function calculates the top and right corner coordinates based on the triangles side lenght and left corner coordinates
function coordinates_calc(length, left_c) {
    //Pythagoras to calculate the height -> used for the y coordinate
    let height = Math.sqrt(Math.pow(length, 2) - Math.pow(length/2, 2))
    //This obtained formulas for the coordinates will never change when we use height and a reference initial left coordinate
    return coordinates = {
        top_c: [left_c[0] + length/2, left_c[1] - height], 
        left_c: left_c, 
        right_c: [left_c[0] + length, left_c[1]]
    };
}

function sierpinsky(ctx, coordinates, length, n) {
    //stops recursive calls
    if(n == 0){
        ctx.beginPath();
        ctx.moveTo(coordinates["top_c"][0], coordinates["top_c"][1]); // Moves the pen to the coordinates specified by x and y.
        ctx.lineTo(coordinates["left_c"][0], coordinates["left_c"][1]);
        ctx.lineTo(coordinates["right_c"][0], coordinates["right_c"][1]);
        ctx.lineTo(coordinates["top_c"][0], coordinates["top_c"][1]);
        ctx.fill();
    } else {
        //recalculates coordinates for each corner
        //always subdivided into 3 triangles: left, top, right -> 3 calls to the same function with different coordinates
        length = length/2;
        let coordinates_left = coordinates_calc(length, coordinates["left_c"]);
        let coordinates_top = coordinates_calc(length, coordinates_left["top_c"]);
        let coordinates_right = coordinates_calc(length, coordinates_left["right_c"]);
        sierpinsky(ctx, coordinates_top, length, n-1);
        sierpinsky(ctx, coordinates_left, length, n-1);
        sierpinsky(ctx, coordinates_right, length, n-1);
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

    //Color
    ctx.fillStyle = 'rgba(255, 161, 0, 1.0)';

    //Harcoded initial values for the triangle
    let length = 300;
    let initial_coordinates = coordinates_calc(length, [225,325]);

    //Slider setup
    let slider = document.getElementById("myRange");
    let output = document.getElementById("demo");
    output.innerHTML = slider.value;

    //Initial drawing
    sierpinsky(ctx, initial_coordinates, length, slider.value);

    //Update when slider is moved
    slider.oninput = function() {
        output.innerHTML = this.value;
        //Clear screen
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //Recursive call
        sierpinsky(ctx, initial_coordinates, length, this.value);
    }
}

