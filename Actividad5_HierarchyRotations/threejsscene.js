let renderer = null;
let scene = null;
let camera = null;

let duration = 5000; // ms
let currentTime = Date.now();
//saves the groups that have been created after each click on Body
let body_groups = [];
//saves the meshes to be animated, be them a body or a satellite
let objects_bodies = [];
let objects_satellites = [];
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

    //rotation
    for(let object of objects_bodies){
        //Rotate object about its Y axis
        object.rotation.y += angle/2;
    }
    
    for(let object of objects_satellites){
        //Rotate object about its Y axis
        object.rotation.y += angle*4;
    } 

    //translation
    for(let object of body_groups){
        //Rotate object about its Y axis
        object.rotation.y += angle/4;
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

    /****************************************Textures********************************************/
    let textureUrl = "../images/ash_uvgrid01.jpg";
    let texture = new THREE.TextureLoader().load(textureUrl);

    /****************************************Materials********************************************/
    let material = new THREE.MeshPhongMaterial({ map: texture });

    /****************************************Objects********************************************/
    // Create a group to hold all the objects
    let mainGroup = new THREE.Object3D;
    mainGroup.position.set(0, 0, 0);

    scene.add(mainGroup);
    body_groups.push(mainGroup);

    // add mouse handling so we can rotate the scene
    addMouseHandler(canvas, mainGroup);
}



function createBody(){
    let new_group = new THREE.Object3D;
    let texture = textures[getRandomInt(0,6)]
    let material = new THREE.MeshPhongMaterial({ map: texture });
    let geometry = body_geometries[getRandomInt(0,3)]
    let body = new THREE.Mesh(geometry, material);

    body_groups.push(new_group);

    let position_x = 0;
    let position_z = 0;
    for(let group of body_groups){
        position_x += Math.abs(group.position.x)
        position_z += Math.abs(group.position.z)
    }
    for(let sat of satellites){
        position_x += Math.abs(sat.position.x)
        position_z += Math.abs(sat.position.z)
    }
    position_x = position_x/3
    position_z = position_z/3

    /*
    position_x += Math.abs(body_groups[body_groups.length - 1].position.x)
    position_z += Math.abs(body_groups[body_groups.length - 1].position.z)
    */

    let negative_x = -1
    if(Math.random() > 0.5) negative_x = 1;
    let negative_z = -1
    if(Math.random() > 0.5) negative_z = 1;

    position_x = (position_x + getRandomFloat(1, 3)) * negative_x
    position_z = (position_z + getRandomFloat(1, 3)) * negative_z

    new_group.position.set(
        position_x,
        0, 
        position_z
    );

    satellites = []
    new_group.add(body);
    objects_bodies.push(body);
    body_groups[0].add(new_group)
}

function createSatellite(){
    let texture = textures[getRandomInt(0,6)]
    let material = new THREE.MeshPhongMaterial({ map: texture });
    let geometry = satellite_geometries[getRandomInt(0,3)]
    let satellite = new THREE.Mesh(geometry, material);

    let position_x = 0;
    let position_z = 0;
    for(let sat of satellites){
        position_x += Math.abs(sat.position.x)
        position_z += Math.abs(sat.position.z)
    }
    position_x = position_x/4
    position_z = position_z/4

    let negative_x = -1
    if(Math.random() > 0.5) negative_x = 1;
    let negative_z = -1
    if(Math.random() > 0.5) negative_z = 1;

    position_x = (position_x + getRandomFloat(1, 1.5)) * negative_x
    position_z = (position_z + getRandomFloat(1, 1.5)) * negative_z

    satellite.position.set(
        position_x,
        0, 
        position_z
    );

    body_groups[body_groups.length - 1].add(satellite);
    objects_satellites.push(satellite);
    satellites.push(satellite)
}