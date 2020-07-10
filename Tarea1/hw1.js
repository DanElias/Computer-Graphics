let mat4 = glMatrix.mat4;
let mat3 = glMatrix.mat3;

let projectionMatrix;

let shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute, shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

let duration = 5000; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
let vertexShaderSource =    
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
let fragmentShaderSource = 
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas)
{
    let gl = null;
    let msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
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

function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -5]);
}

// Create the vertex, color and index data for a multi-colored cube
function createCube(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
       // Front face
       -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,
       -1.0,  1.0,  1.0,

       // Back face
       -1.0, -1.0, -1.0,
       -1.0,  1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0, -1.0, -1.0,

       // Top face
       -1.0,  1.0, -1.0,
       -1.0,  1.0,  1.0,
        1.0,  1.0,  1.0,
        1.0,  1.0, -1.0,

       // Bottom face
       -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
       -1.0, -1.0,  1.0,

       // Right face
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,

       // Left face
       -1.0, -1.0, -1.0,
       -1.0, -1.0,  1.0,
       -1.0,  1.0,  1.0,
       -1.0,  1.0, -1.0
       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Front face
        [0.0, 1.0, 0.0, 1.0], // Back face
        [0.0, 0.0, 1.0, 1.0], // Top face
        [1.0, 1.0, 0.0, 1.0], // Bottom face
        [1.0, 0.0, 1.0, 1.0], // Right face
        [0.0, 1.0, 1.0, 1.0]  // Left face
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    faceColors.forEach(color =>{
        for (let j=0; j < 4; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let cubeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);

    let cubeIndices = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
    
    let cube = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:cubeIndexBuffer,
            vertSize:3, nVerts:24, colorSize:4, nColors: 24, nIndices:36,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(cube.modelViewMatrix, cube.modelViewMatrix, translation);

    cube.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return cube;
}

// Create the vertex, color and index data for a multi-colored cube
function createPyramid(gl, sides, radius, height, translation, rotationAxis)
{    
    //********************** VERTEX DATA ************************* */
    //Define and bind the vertex buffer
    let vertexBuffer =  gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // 3 * sides as the side faces are triangles + each side of the base which is just sides
    total_verts = 4 * sides 

    //Get the vertices
    let verts = calculatePyramidVertices(sides, radius, height);

    //Save the verts in buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    //********************** COLOR DATA ************************* */
    //Define and bind the color buffer
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    /*
    let baseColors = [
        [1.0, 0.0, 0.0, 1.0], // base
    ];*/

    /*
    let faceColors = [
        [0.0, 1.0, 0.0, 1.0], // env face 1
        [0.0, 0.0, 1.0, 1.0], // env face 2
        [1.0, 1.0, 0.0, 1.0], // env face 3
        [1.0, 0.0, 1.0, 1.0], // env face 4
        [0.0, 1.0, 1.0, 1.0]  // env face 5
    ];*/

    //Separated the colors into the ones of the triangles of the base
    //which share the same color
    let baseColors = [
        [Math.random(), Math.random(), Math.random(), 1.0], // base
    ];
    //And the colors of the sides, a different color for each face
    let faceColors = []
    for(let face = 0; face < sides; face++){
        faceColors.push([Math.random(), Math.random(), Math.random(), 1.0]); //faces
    }

    
    let vertexColors = [];
    //concatenated "sides" times for each vertex of the polygon at the base
    //baseColors has only one color, so it will be repeated so all the base has the same color
    baseColors.forEach(color =>{
        for (let j=0; j < sides; j++)
            vertexColors.push(...color);
    });
    //concatenated 3 times as each side is a triangle, the same color is shared with each vertex of each face
    faceColors.forEach(color =>{
        for (let j=0; j < 3; j++)
            vertexColors.push(...color);
    });

    //save into the color buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    //********************** INDEX DATA ************************* */

    // Index data (defines the triangles to be drawn)
    // Define and bind the index buffer
    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // The number of triangles inside a polygon is equal to the sides of the polygon - 2
    // So 3 * sides as each side is a triangle already + 3 * (sides -2) for each triangle at the base
    let total_indices = 3 * (2 * sides - 2);
    let i = 0
    let indices = []
    for(i; i < sides-2; i++){
        //The PI/2 vertex [0] of the polygon is always a vertex of a triangle at the base
        //This follow the pattern:      0, 1, 2,      0, 2, 3,      0, 3, 4, etc...
        indices.push(0, i+1, i+2);
    }
    //This offset is done as now we will use other vertices for the sides triangles
    //Therefore we break the pattern of 0, i+1, i+2, and just push the remaining sides
    i += 2
    for(i; i < total_indices; i++){
        indices.push(i);
    }

    /* nindices = 24 ncolors = 24  nverts = 20
    let pyramidIndices = [
        0, 1, 2,      0, 2, 3,      0, 3, 4,   // base
        5, 6, 7,    // env face 1
        8, 9, 10,   // env face 2   
        11, 12, 13,  // env face 3   
        14, 15, 16,   // env face 4   
        17, 18, 19,  // env face 5    
    ];*/

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    //********************** CREATE OBJECT WITH DATA ************************* */
    
    let pyramid = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:indexBuffer,
            vertSize:3, nVerts: total_verts, colorSize:4, nColors: total_indices, nIndices: total_indices,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);

    pyramid.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return pyramid;
}

// Create the vertex, color and index data for a multi-colored cube
function createOctahedron(gl, sides, radius, height, translation, rotationAxis)
{    
    //********************** VERTEX DATA ************************* */
    //Define and bind the vertex buffer
    let vertexBuffer =  gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // 3 * sides as the side faces are triangles + each side of the base which is just sides
    total_verts = 3 * sides * 2

    //Get the vertices
    let verts = calculateOctahedronVertices(sides, radius, height);

    //Save the verts in buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    //********************** COLOR DATA ************************* */
    //Define and bind the color buffer
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    /*
    let baseColors = [
        [1.0, 0.0, 0.0, 1.0], // base
    ];*/

    /*
    let faceColors = [
        [0.0, 1.0, 0.0, 1.0], // env face 1
        [0.0, 0.0, 1.0, 1.0], // env face 2
        [1.0, 1.0, 0.0, 1.0], // env face 3
        [1.0, 0.0, 1.0, 1.0], // env face 4
        [0.0, 1.0, 1.0, 1.0]  // env face 5
    ];*/

    //Separated the colors into the ones of the triangles of the base
    //which share the same color
    let baseColors = [ ];

    //And the colors of the sides, a different color for each face
    let faceColors = []
    for(let face = 0; face < sides*2; face++){
        faceColors.push([Math.random(), Math.random(), Math.random(), 1.0]); //faces
    }

    let vertexColors = [];
    
    //concatenated 3 times as each side is a triangle, the same color is shared with each vertex of each face
    faceColors.forEach(color =>{
        for (let j=0; j < 3; j++)
            vertexColors.push(...color);
    });

    //save into the color buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    //********************** INDEX DATA ************************* */

    // Index data (defines the triangles to be drawn)
    // Define and bind the index buffer
    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // 3 * sides as each side is a triangle already
    let total_indices = 3 * sides * 2
    let indices = []
    for(let i = 0; i < total_indices; i++){
        indices.push(i);
    }

    console.log(total_indices)

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    //********************** CREATE OBJECT WITH DATA ************************* */
    
    let pyramid = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:indexBuffer,
            vertSize:3, nVerts: total_verts, colorSize:4, nColors: total_indices, nIndices: total_indices,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);

    pyramid.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return pyramid;
}

// Create the vertex, color and index data for a multi-colored octahedron
function createDodecahedron(gl, sides, radius, translation, rotationAxis)
{    
    //********************** VERTEX DATA ************************* */
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    total_verts = 20 * sides
    let verts= calculateDodecahedronVertices(radius);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    //********************** COLOR DATA ************************* */
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    /*
    let baseColors = [
        [1.0, 0.0, 0.0, 1.0], // base
    ];*/

    let baseColors = [];

     /*
    let faceColors = [
        [0.0, 1.0, 0.0, 1.0], // env face 1
        [0.0, 0.0, 1.0, 1.0], // env face 2
        [1.0, 1.0, 0.0, 1.0], // env face 3
        [1.0, 0.0, 1.0, 1.0], // env face 4
        [0.0, 1.0, 1.0, 1.0]  // env face 5
    ];*/

    let faceColors = []
    for(let face = 0; face < 12; face++){
        faceColors.push([Math.random(), Math.random(), Math.random(), 1.0]); //faces
    }

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];

    faceColors.forEach(color =>{
        for (let j=0; j < 5; j++)
            vertexColors.push(...color);
    });
        
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    //********************** INDEX DATA ************************* */

    // Index data (defines the triangles to be drawn).
    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    let total_indices = 9 * 12
    
    let dodeIndices = []

    //El número de triángulos internos va a ser igual a número de lados del polígono - 2
    for(let i = 0; i < total_indices; i+=5){
        dodeIndices.push(i, i+1, i+2);
        dodeIndices.push(i, i+2, i+3);
        dodeIndices.push(i, i+3, i+4);
    }

    /* 
    let pyramidIndices = [
        0, 1, 2,      0, 2, 3,      0, 3, 4,    
        0, 1, 2,      0, 2, 3,      0, 3, 4,   
    ];*/

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dodeIndices), gl.STATIC_DRAW);

    //********************** CREATE OBJECT WITH DATA ************************* */
    
    let dode = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:indexBuffer,
            vertSize:3, nVerts: 60, colorSize:4, nColors: total_indices, nIndices: total_indices,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(dode.modelViewMatrix, dode.modelViewMatrix, translation);

    dode.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return dode;
}

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

function draw(gl, objs) 
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for(i = 0; i< objs.length; i++)
    {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function run(gl, objs) 
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });

    draw(gl, objs);

    for(i = 0; i<objs.length; i++)
        objs[i].update();
}

//****************************Util functions*********************************** */

/*
*This function creates a 2D polygon on the XZ axis using a circle
*
*INPUTS:
*sides -  the number of sides of the polygon 
*radius - the radius of the circle from which the polygon is calculated
*
*OUTPUTS:
*verts -  the array of vertices of the polygon
*/
function createPolygonSurface(sides, radius) {
    let verts = [];
    let angle_per_side = (2*Math.PI) / sides;
    let initial_angle = Math.PI/2;
    //(x,y,z) = ( r * cos(theta), r * sin(theta), 0)
    for (let i = 0; i < sides; i++){
        let angle = angle_per_side * i + initial_angle;
        let x = Math.cos(angle) * radius ;
        let y = Math.sin(angle) * radius ;
        //Draw base in x-z
        verts.push(x);
        verts.push(0);
        verts.push(y);
    }
    return verts
} 

/*
*This function calls createPolygonSurface to create the base of the pyramid,
*With that information you already know the coordinates for two vertices of each 
*of the enveloping faces of the pyramid, which are triangles
*this triangles share a single point which is the top of the pyramid, which is just 
*the center moved in the y axis by the height
*
*INPUTS:
*sides -  the number of sides of the polygon at the base of the pyramid
*radius - the radius of the circle from which the polygon at the base is calculated
*hieght -  the height of the pyramid
*
*OUTPUTS:
*verts -  the array of vertices of all the faces of the pyramid
*/
function calculatePyramidVertices(sides, radius, height){
    let verts = createPolygonSurface(sides, radius);
    //each side has 3 vertices (triangle) and each vertex has 3 coordinates
    total_coordinates = 9 * sides
    //The 1st and 2nd vertices are the base of the triangle, which corresponds to a side of the polygon base
    //The 3rd vertex is equal for all faces, it is the cusp of the pyramid
    for(let i = 0; i < total_coordinates; i += 3){
        verts.push(
            verts[i], verts[i+1], verts[i+2], 
            verts[i+3], verts[i+4], verts[i+5], 
            0, height, 0
        );
    }
    return verts;
}

/*
*This function calls createPolygonSurface to create the base of the pyramid,
*With that information you already know the coordinates for two vertices of each 
*of the enveloping faces of the pyramid, which are triangles
*this triangles share a single point which is the top of the pyramid, which is just 
*the center moved in the y axis by the height
*
*INPUTS:
*sides -  the number of sides of the polygon at the base of the pyramid
*radius - the radius of the circle from which the polygon at the base is calculated
*hieght -  the height of the pyramid
*
*OUTPUTS:
*verts -  the array of vertices of all the faces of the pyramid
*/
function calculateOctahedronVertices(sides, radius, height){
    let verts = createPolygonSurface(sides, radius);
    total_coordinates = 9 * sides 
    for(let i = 0; i < total_coordinates; i += 3){
        verts.push(
            verts[i], verts[i+1], verts[i+2], 
            verts[i+3], verts[i+4], verts[i+5], 
            0, height, 0,
            verts[i], verts[i+1], verts[i+2], 
            verts[i+3], verts[i+4], verts[i+5], 
            0, -1*height, 0
        );
    }
    return verts.slice(3*sides, verts.length);
}


/*
*This function defines the 20 geometric vertices of a dodecahedron in a dictionary
*Each face has vertices which repeat, so the dictionary is used to easily access
*the geometric vertices coordinates and add them to the vertices of a face.
*
*INPUTS:
*radius - a escalar used to change the original proportions of the dodecahedron
* this input can ve eliminated and just use the scale transformation of mat4
*
*OUTPUTS:
*verts -  the array of vertices of all the faces of the dodecahedron
*/
function calculateDodecahedronVertices(radius){
    let verts_dic = {
        'A': [0, 0.618 *  radius , 1.618 *  radius],
        'B': [0, 0.618 *  radius, -1.618 *  radius],
        'C': [0, -0.618 *  radius, 1.618 *  radius],
        'D': [0, -0.618 *  radius, -1.618 *  radius],
        'E': [0.618 *  radius, 1.618 *  radius, 0],
        'F': [0.618 *  radius, -1.618 *  radius, 0],
        'G': [-0.618 *  radius, 1.618 *  radius, 0],
        'H': [-0.618 *  radius, -1.618 *  radius, 0],
        'I': [1*  radius, 1*  radius, 1*  radius],
        'J': [1*  radius, 1*  radius, -1*  radius],
        'K': [1*  radius, -1*  radius, 1*  radius],
        'L': [1*  radius, -1*  radius, -1*  radius],
        'M': [-1*  radius, 1*  radius, 1*  radius],
        'N': [-1*  radius, 1*  radius, -1*  radius],
        'O': [-1*  radius, -1*  radius, 1*  radius],
        'P': [-1*  radius, -1*  radius, -1*  radius],
        'Q': [1.62*  radius, 0, 0.62*  radius],
        'R': [1.62*  radius, 0, -0.62*  radius],
        'S': [-1.62*  radius, 0, 0.62*  radius],
        'T': [-1.62*  radius, 0, -0.62*  radius],
    };

    let verts = []

    //face 1
    verts.push(...verts_dic['A']);
    verts.push(...verts_dic['I']);
    verts.push(...verts_dic['E']);
    verts.push(...verts_dic['G']);
    verts.push(...verts_dic['M']);
    //face 2
    verts.push(...verts_dic['C']);
    verts.push(...verts_dic['O']);
    verts.push(...verts_dic['H']);
    verts.push(...verts_dic['F']);
    verts.push(...verts_dic['K']);
    //face 3
    verts.push(...verts_dic['Q']);
    verts.push(...verts_dic['I']);
    verts.push(...verts_dic['A']);
    verts.push(...verts_dic['C']);
    verts.push(...verts_dic['K']);
    //face 4
    verts.push(...verts_dic['S']);
    verts.push(...verts_dic['O']);
    verts.push(...verts_dic['C']);
    verts.push(...verts_dic['A']);
    verts.push(...verts_dic['M']);
    //face 5
    verts.push(...verts_dic['M']);
    verts.push(...verts_dic['G']);
    verts.push(...verts_dic['N']);
    verts.push(...verts_dic['T']);
    verts.push(...verts_dic['S']);
    //face 6
    verts.push(...verts_dic['I']);
    verts.push(...verts_dic['Q']);
    verts.push(...verts_dic['R']);
    verts.push(...verts_dic['J']);
    verts.push(...verts_dic['E']);
    //face 7
    verts.push(...verts_dic['K']);
    verts.push(...verts_dic['F']);
    verts.push(...verts_dic['L']);
    verts.push(...verts_dic['R']);
    verts.push(...verts_dic['Q']);
    //face 8
    verts.push(...verts_dic['O']);
    verts.push(...verts_dic['S']);
    verts.push(...verts_dic['T']);
    verts.push(...verts_dic['P']);
    verts.push(...verts_dic['H']);
    //face 9
    verts.push(...verts_dic['D']);
    verts.push(...verts_dic['L']);
    verts.push(...verts_dic['F']);
    verts.push(...verts_dic['H']);
    verts.push(...verts_dic['P']);
    //face 10
    verts.push(...verts_dic['D']);
    verts.push(...verts_dic['P']);
    verts.push(...verts_dic['T']);
    verts.push(...verts_dic['N']);
    verts.push(...verts_dic['B']);
    //face 11
    verts.push(...verts_dic['B']);
    verts.push(...verts_dic['N']);
    verts.push(...verts_dic['G']);
    verts.push(...verts_dic['E']);
    verts.push(...verts_dic['J']);
    //face 12
    verts.push(...verts_dic['B']);
    verts.push(...verts_dic['J']);
    verts.push(...verts_dic['R']);
    verts.push(...verts_dic['L']);
    verts.push(...verts_dic['D']);

    return verts;
}