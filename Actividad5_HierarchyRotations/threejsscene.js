/*
* Author: Daniel Elias Becerra 
* Year: 2020
* Three.js Introduction and Groups Hierarchy - System
*/

let renderer = null;
let scene = null;
let camera = null;

let mainGroup = null;

let duration = 5000; // ms
let currentTime = Date.now();

//saves the groups that have been created after each click on Body
//for hierarchy and translation movement around the center of the canvas
let body_groups = [];

//saves groups for the satellites
//for hierarchy and translation movement around a body
let satellite_groups = [];

//saves the meshes to be animated, for bodies
//to change their rotation on the animation
let objects_bodies = [];

//saves the meshes to be animated, for satellites
//to change their rotation on the animation at a different speed of the bodies
let objects_satellites = [];

//array that will be reset everytime a new body is added
//has the satellites of the current body
//used for distance calculation
let satellites = [];

let body_geometries = [
    new THREE.CubeGeometry(1.5, 1.5, 1.5), 
    new THREE.SphereGeometry(1, 20, 20), 
    new THREE.IcosahedronGeometry(1, 0),
]

let satellite_geometries = [
    new THREE.SphereGeometry(0.2, 20, 20),
    new THREE.TorusGeometry(0.3, 0.1, 30, 3),
    new THREE.TorusKnotGeometry(0.1,0.1,15,10),
]

let textures = [
    new THREE.TextureLoader().load("../images/trippy1.jpg"),
    new THREE.TextureLoader().load("../images/trippy2.jpg"),
    new THREE.TextureLoader().load("../images/trippy3.jpg"),
    new THREE.TextureLoader().load("../images/trippy4.jpg"),
    new THREE.TextureLoader().load("../images/trippy5.jpg"),
    new THREE.TextureLoader().load("../images/trippy6.jpg"),
]

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function run() {
    requestAnimationFrame(function() { run(); });
    renderer.render( scene, camera );

    let now = Date.now();
    let deltat = now - currentTime;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

    //I separated meshes into different arrays so satellites have a different speed

    //rotation bodies
    for(let object of objects_bodies){
        //Rotate object about its Y axis
        object.rotation.y += angle/3;
    }
    //rotation satellites
    for(let object of objects_satellites){
        //Rotate object about its Y axis
        object.rotation.y += angle*4;
    } 
    //translation bodies
    for(let object of body_groups){
        //Rotate object about its Y axis
        object.rotation.y += angle/8;
    }
    //translation satellites
    for(let object of satellite_groups){
        //Rotate object about its Y axis
        object.rotation.y += angle*3;
    } 

    currentTime = now
}

function createScene(canvas)
{    
    /****************************************Renderer********************************************/
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true, alpha: true } );
    renderer.setClearColor( 0x000000, 0 );
    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    /****************************************Scene********************************************/
    // Create a new Three.js scene
    scene = new THREE.Scene();
    // Set the background color 
    scene.background = new THREE.Color(0x05070a);
    // scene.background = new THREE.Color( "rgb(100, 100, 100)" );

    /****************************************Camera********************************************/
    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.z = 10;
    scene.add(camera);
   
    /****************************************Lights********************************************/
    // Add a directional light to show off the objects
    let light = new THREE.DirectionalLight( 0xe7baff, 1.0);
    // let light = new THREE.DirectionalLight( "rgb(255, 255, 100)", 1.5);

    // Position the light out from the scene, pointing at the origin
    light.position.set(-.5, .2, 1);
    light.target.position.set(0,-2,0);
    scene.add(light);

    // This light globally illuminates all objects in the scene equally.
    // Cannot cast shadows
    let ambientLight = new THREE.AmbientLight(0xffccaa, 0.2);
    scene.add(ambientLight);

    /****************************************Objects********************************************/
    // Create a group to hold all the objects
    mainGroup = new THREE.Object3D;
    mainGroup.position.set(0, 0, 0);
    mainGroup.name = "MainGroup";

    scene.add(mainGroup);
    body_groups.push(mainGroup);

    addMouseHandler(canvas, mainGroup);
    addButtonsHandler();
        
}

function createBody(){
    let new_group = new THREE.Object3D;
    let new_sat_group = new THREE.Object3D;
    let texture = textures[getRandomInt(0,6)]
    let material = new THREE.MeshPhongMaterial({ map: texture });
    let geometry = body_geometries[getRandomInt(0,3)]
    let body = new THREE.Mesh(geometry, material);

    let position_x = 0;
    let position_z = 0;
    let r = 0;
    let a = 0;
    let x = 0;
    let z = 0;

    //Save the new subgroup in the global array
    satellite_groups.push(new_sat_group);

    if(body_groups.length == 1){
        //Add new group to global body groups array
        body_groups.push(new_group);
    } else {
        //Add new group to global body groups array
        body_groups.push(new_group);

        //Calculations for the position of the new object, 
        //trying to avoid collitions between satellites and bodies:
        //move ftaher awayf from the center and don't collide with the satellites
        //of other bodies
        for(let group of body_groups){
            position_x += Math.abs(group.position.x)
            position_z += Math.abs(group.position.z)
        }
        for(let sat of satellites){
            position_x += Math.abs(sat.position.x)
            position_z += Math.abs(sat.position.z)
        }
        
        //random point in the orbit or circle
        r = position_x * 0.001 + 5
        a = 2 * Math.PI * Math.random();
        x = Math.round(r * Math.cos(a) + 1);
        z = Math.round(r * Math.sin(a) + 1);

        //Randomize if they are located negative or positive x and z axis
        let negative_x = -1
        if(Math.random() > 0.5) negative_x = 1;
        let negative_z = -1
        if(Math.random() > 0.5) negative_z = 1;

        //don't have collisions between objects (move farther away from the center(0,0,0))
        x = (x + position_x/3) * negative_x
        z = (z + position_z/3) * negative_z
    }

    //set the new object position
    new_group.position.set(
        x,
        0, 
        z
    );
    
    //The satellites for the new body are set to zero
    satellites = []
    //Add the mesh to the body group
    new_group.add(body);
    //Add a sub group for the satellites to the new group
    new_group.add(new_sat_group);
    //Add the new body group to the main scene group
    body_groups[0].add(new_group)
    //Save the mesh to the array of body meshes to be animated
    objects_bodies.push(body);
}

function createSatellite(){

    if(satellite_groups.length == 0){
        alert("First add a celestial body!")
        return;
    }

    let texture = textures[getRandomInt(0,6)]
    let material = new THREE.MeshPhongMaterial({ map: texture });
    let geometry = satellite_geometries[getRandomInt(0,3)]
    let satellite = new THREE.Mesh(geometry, material);

    let position_x = 0;
    let position_z = 0;
    let r = 0;
    let a = 0;
    let x = 0;
    let z = 0;

    //Calculations for the position of the new object, 
    for(let sat of satellites){
        position_x += Math.abs(sat.position.x)
        position_z += Math.abs(sat.position.z)
    }
    
    //random point in the orbit or circle
    r = position_x/3 
    a = 2 * Math.PI * Math.random();
    x = Math.round(r * Math.cos(a) + 1);
    z = Math.round(r * Math.sin(a) + 1);

    //reduce the distance by a factor of 3 (works well)
    position_x = position_x/2
    position_z = position_z/2

    //Randomize if they are located negative or positive x and z axis
    let negative_x = -1
    if(Math.random() > 0.5) negative_x = 1;
    let negative_z = -1
    if(Math.random() > 0.5) negative_z = 1;

    //don't have collisions between objects (move farther away from the center(0,0,0))
    x = (x + position_x) * negative_x
    z = (z + position_z) * negative_z

    satellite.position.set(
        x,
        0, 
        z
    );
    
    satellite_groups[satellite_groups.length - 1].add(satellite)
    objects_satellites.push(satellite);
    satellites.push(satellite)
}

function clearScene(){
    body_groups = [];
    satellite_groups = [];
    objects_bodies = [];
    objects_satellites = [];
    satellites = [];

    for (let i = scene.children[3].children.length - 1; i >= 0; i--) {
        scene.children[3].remove(scene.children[3].children[i]);
    }

    body_groups.push(mainGroup);

}