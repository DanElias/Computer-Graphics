
/*
* Author: Daniel Elias Becerra A01208905
* Year: 2020
* Exam 1 - Computer Graphics Summer 2020 - Sierpinsky Pyramid
*/

let projectionMatrix = null, shaderProgram = null;

let shaderVertexPositionAttribute = null, shaderVertexColorAttribute = null, shaderProjectionMatrixUniform = null, shaderModelViewMatrixUniform = null;

let mat4 = glMatrix.mat4;

let duration = 10000;

let verts_pyramid = [];

let vertexShaderSource = `
attribute vec3 vertexPos;
attribute vec4 vertexColor;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec4 vColor;

void main(void) {
    // Return the transformed and projected vertex value
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPos, 1.0);
    // Output the vertexColor in vColor
    vColor = vertexColor;
}`;

let fragmentShaderSource = `
    precision lowp float;
    varying vec4 vColor;

    void main(void) {
    // Return the pixel color: always output white
    gl_FragColor = vColor;
}
`;

function createShader(gl, str, type)
{
    let shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl)
{
    // load and compile the fragment and vertex shader
    let fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    let vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);
    
    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function initWebGL(canvas) 
{
    let gl = null;
    let msg = "Your browser does not support WebGL, or it is not enabled by default.";

    try 
    {
        gl = canvas.getContext("experimental-webgl");
    } 
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;        
}

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(gl, canvas)
{
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);
}

function draw(gl, objs) 
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for(obj of objs)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function createPyramid(gl, translation, rotationAxis) 
{
    // Verts data --------------------------------------------------------------------------
    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let length = 1;
    let iterations = 3;
    let initial_coordinates1 = coordinates_calc1(length, [-0.5,-0.25,0.5], iterations);
    let initial_coordinates2 = coordinates_calc2(length, [-0.5,-0.25,0.5], iterations);
    let initial_coordinates3 = coordinates_calc3(length, [0.5,-0.25,0.5], iterations);
    let initial_coordinates4 = coordinates_calc4(length, [-0.5,-0.25,0.5], iterations);

    sierpinsky_1(initial_coordinates1, length, iterations);
    sierpinsky_2(initial_coordinates2, length, iterations);
    sierpinsky_3(initial_coordinates3, length, iterations);
    sierpinsky_4(initial_coordinates4, length, iterations);

    let verts = verts_pyramid //a global that saves the vertices generated on each recursive call
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data -------------------------------------------------------------------------
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [];
    //random colors for each face
    for(let face = 0; face < verts_pyramid.length/3; face++){
        faceColors.push([Math.random(), Math.random(), Math.random(), 0.5]); //faces
    }

    let vertexColors = [];
    //They are already triangles so just keep adding 3 by 3 
    faceColors.forEach(color =>{
        for (let j=0; j < 3; j++)
            vertexColors.push(...color);
    });
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data ---------------------------------------------------------------------------
    let pyramidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);

    let pyramidIndices = [];

    //Already triangles so indices are in order
    for(let i = 0; i < verts_pyramid.length/3; i++ ){
        pyramidIndices.push(i);
    }

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);
    
    let pyramid = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:pyramidIndexBuffer,
            vertSize:3, nVerts:verts.length/3, colorSize:4, nColors: vertexColors.length/4, nIndices: pyramidIndices.length,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);
    mat4.rotate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, Math.PI/8, [1, 0, 0]);

    pyramid.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return pyramid;
}

function update(glCtx, objs)
{
    requestAnimationFrame(()=>update(glCtx, objs));

    draw(glCtx, objs);
    objs.forEach(obj => obj.update())
}

function main()
{
    let canvas = document.getElementById("pyramidCanvas");
    let glCtx = initWebGL(canvas);

    initViewport(glCtx, canvas);
    initGL(glCtx, canvas);

    let pyramid = createPyramid(glCtx, [0, 0, -3], [0, 1, 0]);

    initShader(glCtx, vertexShaderSource, fragmentShaderSource);

    update(glCtx, [pyramid]);
}

//Function calculates the top and right corner coordinates based on the triangles side length and left corner coordinates
//This function is repeated 4 times, each for a different face, as the initial coordinates vary and z index changes
//The sierpinsky I did is a perfect tetrahedron that can be subdivided up until 8 iterations 
function coordinates_calc1(length, left_c) {
    //Height of a tetrahedron is side length by sqrt of 6 divided by 3
    let height = length*Math.sqrt(6)/3; 
    //z would be were the center of the tetrahedron is
    let z = Math.sqrt(Math.pow(length, 2) - Math.pow(height, 2)) / 2;
    //there some changes on these coordinate calculations based on the face, that's why I repeat this function
    return coordinates = {
        left_c: [left_c[0] , left_c[1] , left_c[2]], 
        right_c: [left_c[0] + length, left_c[1], left_c[2]],
        top_c: [left_c[0] + length/2 , left_c[1] + height, left_c[2] - z], 
    };
}

function coordinates_calc2(length, left_c) {
    let height = length*Math.sqrt(6)/3; 
    let z = Math.sqrt(Math.pow(length, 2) - Math.pow(height, 2)) / 2;
    let profundidad = Math.sqrt(Math.pow(length, 2) - Math.pow(length/2, 2));
    return coordinates = {
        left_c: [left_c[0] , left_c[1] , left_c[2]], 
        right_c: [left_c[0] + length/2, left_c[1], left_c[2] - profundidad],
        top_c: [left_c[0] + length/2 , left_c[1] + height, left_c[2] - z], 
    };
}

function coordinates_calc3(length, left_c) {
    let height = length*Math.sqrt(6)/3; 
    let z = Math.sqrt(Math.pow(length, 2) - Math.pow(height, 2)) / 2;
    let profundidad = Math.sqrt(Math.pow(length, 2) - Math.pow(length/2, 2));
    return coordinates = {
        left_c: [left_c[0] , left_c[1] , left_c[2]], 
        right_c: [left_c[0] - length/2, left_c[1], left_c[2] - profundidad],
        top_c: [left_c[0] - length/2 , left_c[1] + height, left_c[2] - z], 
    };
}

function coordinates_calc4(length, left_c) {
    let height = length*Math.sqrt(6)/3; 
    let z = Math.sqrt(Math.pow(length, 2) - Math.pow(height, 2)) / 2;
    let profundidad = Math.sqrt(Math.pow(length, 2) - Math.pow(length/2, 2));
    return coordinates = {
        left_c: [left_c[0] , left_c[1] , left_c[2]], 
        right_c: [left_c[0] + length, left_c[1], left_c[2]],
        top_c: [left_c[0] + length/2, left_c[1], left_c[2] - profundidad], 
    };
}

//Calculates sierpinsky with n iterations recursive, repeated this functions 
//cause each face requires a different coordinates calc function
function sierpinsky_1(coordinates, length, n) {
    //stops recursive calls
    if(n == 0){
        //these will save the generated vertices in a global array.
        pushGeneratedVertices(coordinates);
    } else {
        //recalculates coordinates for each corner
        //always subdivided into 3 triangles: left, top, right -> 3 calls to the same function with different coordinates
        length = length/2;
        let coordinates_left = coordinates_calc1(length, coordinates["left_c"]);
        let coordinates_right = coordinates_calc1(length, coordinates_left["right_c"]);
        let coordinates_top = coordinates_calc1(length, coordinates_left["top_c"]);        
        sierpinsky_1(coordinates_left, length, n-1);
        sierpinsky_1(coordinates_right, length, n-1);
        sierpinsky_1(coordinates_top, length, n-1);
    }
}

function sierpinsky_2(coordinates, length, n) {
    //stops recursive calls
    if(n == 0){
        pushGeneratedVertices(coordinates);
    } else {
        //recalculates coordinates for each corner
        //always subdivided into 3 triangles: left, top, right -> 3 calls to the same function with different coordinates
        length = length/2;
        let coordinates_left = coordinates_calc2(length, coordinates["left_c"]);
        let coordinates_right = coordinates_calc2(length, coordinates_left["right_c"]);
        let coordinates_top = coordinates_calc2(length, coordinates_left["top_c"]);        
        sierpinsky_2(coordinates_left, length, n-1);
        sierpinsky_2(coordinates_right, length, n-1);
        sierpinsky_2(coordinates_top, length, n-1);
    }
}

function sierpinsky_3(coordinates, length, n) {
    //stops recursive calls
    if(n == 0){
        pushGeneratedVertices(coordinates);
    } else {
        //recalculates coordinates for each corner
        //always subdivided into 3 triangles: left, top, right -> 3 calls to the same function with different coordinates
        length = length/2;
        let coordinates_left = coordinates_calc3(length, coordinates["left_c"]);
        let coordinates_right = coordinates_calc3(length, coordinates_left["right_c"]);
        let coordinates_top = coordinates_calc3(length, coordinates_left["top_c"]);        

        sierpinsky_3(coordinates_left, length, n-1);
        sierpinsky_3(coordinates_right, length, n-1);
        sierpinsky_3(coordinates_top, length, n-1);
        
    }
}

function sierpinsky_4(coordinates, length, n) {
    //stops recursive calls
    if(n == 0){
        pushGeneratedVertices(coordinates);
    } else {
        //recalculates coordinates for each corner
        //always subdivided into 3 triangles: left, top, right -> 3 calls to the same function with different coordinates
        length = length/2;
        let coordinates_left = coordinates_calc4(length, coordinates["left_c"]);
        let coordinates_right = coordinates_calc4(length, coordinates_left["right_c"]);
        let coordinates_top = coordinates_calc4(length, coordinates_left["top_c"]);        

        sierpinsky_4(coordinates_left, length, n-1);
        sierpinsky_4(coordinates_right, length, n-1);
        sierpinsky_4(coordinates_top, length, n-1);
        
    }
}

//Pushes the generated vertices to the global vertices array of the pyramid
function pushGeneratedVertices(coordinates){
    verts_pyramid.push(
        coordinates["left_c"][0], coordinates["left_c"][1] , coordinates["left_c"][2],
        coordinates["right_c"][0], coordinates["right_c"][1] , coordinates["right_c"][2],
        coordinates["top_c"][0], coordinates["top_c"][1] , coordinates["top_c"][2],
    );
}
