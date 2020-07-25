/*
* Author: Daniel Elias
* Year: 2020
* Title: Solar System - Three js
*/

//Information from:
//Distances https://www.nasa.gov/sites/default/files/files/YOSS_Act1.pdf
//Sizes: https://solarsystem.nasa.gov/resources/686/solar-system-sizes/#:~:text=Outward%20from%20the%20Sun%2C%20the,than%20one%2Dfifth%20of%20Earth's.
//Pluto: https://www.nasa.gov/audience/forstudents/5-8/features/nasa-knows/what-is-pluto-58.html
//Periods: https://www.exploratorium.edu/ronh/age/
//Moons: https://solarsystem.nasa.gov/moons/overview/

let renderer = null, 
scene = null, 
camera = null,
root = null,
group = null,
bodiesList = [],
orbitControls = null;

//all planets
let bodies_dictionary = {};
//all materials
let materials = {};

let objLoader = null, jsonLoader = null;

let duration = 20000; // ms
let currentTime = Date.now();

//lights
let ambientLight = null;
let pointLight = null;

let SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;
// let objModelUrl = {obj:'../models/obj/Penguin_obj/penguin.obj', map:'../models/obj/Penguin_obj/peng_texture.jpg'};
// let objModelUrl = {obj:'../models/obj/cerberus/Cerberus.obj', map:'../models/obj/cerberus/Cerberus_A.jpg', normalMap:'../models/obj/cerberus/Cerberus_N.jpg', specularMap: '../models/obj/cerberus/Cerberus_M.jpg'};
// let jsonModelUrl = { url:'../models/json/teapot-claraio.json' };

//For the post-processing
let params = {
    exposure: 0.1,
    bloomStrength: 1,
    bloomRadius: 0.4
};

function promisifyLoader ( loader, onProgress ) 
{
    function promiseLoader ( url ) {
  
      return new Promise( ( resolve, reject ) => {
  
        loader.load( url, resolve, onProgress, reject );
  
      } );
    }
  
    return {
      originalLoader: loader,
      load: promiseLoader,
    };
}

const onError = ( ( err ) => { console.error( err ); } );

async function loadJson(url, objectList)
{
    const jsonPromiseLoader = promisifyLoader(new THREE.ObjectLoader());
    
    try {
        const object = await jsonPromiseLoader.load(url);

        object.castShadow = true;
        object.receiveShadow = true;
        object.position.y = -1;
        object.position.x = 1.5;
        object.name = "jsonObject";
        objectList.push(object);
        scene.add(object);

    }
    catch (err) {
        return onError(err);
    }
}

async function loadObj(objModelUrl, objectList)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        const object = await objPromiseLoader.load(objModelUrl.obj);
        
        let texture = objModelUrl.hasOwnProperty('map') ? new THREE.TextureLoader().load(objModelUrl.map) : null;
        let normalMap = objModelUrl.hasOwnProperty('normalMap') ? new THREE.TextureLoader().load(objModelUrl.normalMap) : null;
        let specularMap = objModelUrl.hasOwnProperty('specularMap') ? new THREE.TextureLoader().load(objModelUrl.specularMap) : null;

        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
                child.material.normalMap = normalMap;
                child.material.specularMap = specularMap;
            }
        });

        object.scale.set(3, 3, 3);
        object.position.z = -3;
        object.position.x = -1.5;
        object.rotation.y = -3;
        object.name = "objObject";
        objectList.push(object);
        scene.add(object);

    }
    catch (err) {
        return onError(err);
    }
}

function animate() 
{
    let now = Date.now();
    let deltat = now - currentTime;
    
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

    for(object of bodiesList){
        if(object){
            //Don't try to rotate the asteroid belt
            if(object.name != "belt")
                //rotation
                object.mesh.rotation.y += angle * object.rotation_speed;
            //translation
            object.orbit_group.rotation.y += angle * object.translation_speed;
        }
    }
    
    currentTime = now;
    uniforms.time.value += fract;
}

function run() 
{
    requestAnimationFrame(function() { run(); });
    
    // Render the scene
    renderer.render( scene, camera );
    composer.render();

    // Spin the cube for next frame
    animate();

    // Update the camera controller
    orbitControls.update();
}

//Changes the Light colors (point and ambient)
function setLightColor(light, r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;
    
    light.color.setRGB(r, g, b);
}

//Post-processing effects
function addEffects()
{
    // First, we need to create an effect composer: instead of rendering to the WebGLRenderer, we render using the composer.
    composer = new THREE.EffectComposer(renderer);

    // The effect composer works as a chain of post-processing passes. These are responsible for applying all the visual effects to a scene. They are processed in order of their addition. The first pass is usually a Render pass, so that the first element of the chain is the rendered scene.
    const renderPass = new THREE.RenderPass(scene, camera);

    // There are several passes available. Here we are using the UnrealBloomPass.
    bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 0.5, 0.2, 1 );
    bloomPass.threshold = 0;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;

    renderer.toneMappingExposure = Math.pow( params.exposure, 1.0 );
    
    // After the passes are configured, we add them in the order we want them.
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    composer.render();
}

//Creates the materials to be used by all objects in the scene
function createMaterials()
{
    // Create a texture map
    //let map = new THREE.TextureLoader().load(mapUrl);
    //map.wrapS = map.wrapT = THREE.RepeatWrapping;
    //map.repeat.set(8, 8);

    //Color - texture maps
    let texture_url_sun = "../images/sunmap2.jpg";
    let texture_url_mercury = "../images/mercurymap.jpg";
    let texture_url_venus = "../images/venusmap.jpg";
    let texture_url_earth = "../images/earth_atmos_2048.jpg";
    let texture_url_moon = "../images/moonmap.jpg";
    let texture_url_mars = "../images/marsmap.jpg";
    let texture_url_jupiter = "../images/jupitermap.jpg";
    let texture_url_saturn = "../images/saturnmap.jpg";
    let texture_url_uranus = "../images/uranusmap.jpg";
    let texture_url_neptune = "../images/neptunemap.jpg";
    let texture_url_pluto = "../images/plutomap.jpg";
    let texture_url_saturn_ring = "../images/saturnringcolor2.jpg";
    let texture_url_uranus_ring = "../images/uranusringcolour.jpg";
    let texture_url_nebula = "../images/nebula-2.jpg";
    //Bump maps
    let bump_url_mercury = "../images/mercurybump.jpg";
    let bump_url_venus = "../images/venusbump.jpg";
    let bump_url_earth = "../images/earthbump1k.jpg";
    let bump_url_moon = "../images/moonbump1k.jpg";
    let bump_url_phobos = "../images/phobosbump.jpg";
    let bump_url_deimos = "../images/deimosbump.jpg";
    let bump_url_pluto = "../images/plutobump1k.jpg";
    //Normal maps
    let normal_url_earth = "../images/earth_normal_2048.jpg";
    let normal_url_mars = "../images/mars_1k_normal.jpg";
    //Specular maps
    let specular_url_earth = "../images/earthspec1k.jpg";
    //Cloud maps
    let cloud_url_earth = "../images/earthcloudmap.jpg";
    //Transparency maps
    let transparency_url_earth = "../images/earthcloudmap.jpg";
    let transparency_url_saturn_ring = "../images/saturnringpattern2.jpg";

    //Shader Material
    let GLOWMAP = new THREE.TextureLoader().load("../images/sunmap2.jpg");
    // let NOISEMAP = new THREE.TextureLoader().load("../images/cloud.png");
    let NOISEMAP = new THREE.TextureLoader().load("../images/noisy-texture.png");

    uniforms = 
    {
        time: { type: "f", value: 0.2 },
        noiseTexture: { type: "t", value: NOISEMAP },
        glowTexture: { type: "t", value: GLOWMAP }
    };

    uniforms.noiseTexture.value.wrapS = uniforms.noiseTexture.value.wrapT = THREE.RepeatWrapping;
    uniforms.glowTexture.value.wrapS = uniforms.glowTexture.value.wrapT = THREE.RepeatWrapping;

    materials["sunshader"] = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
        transparent: true,
    } );
    
    // Create a material with the textures, for each body
    materials["sun"] = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(texture_url_sun), 
        emissive: new THREE.TextureLoader().load(texture_url_sun),
        emissiveIntensity: 10
    });

    materials["mercury"] = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(texture_url_mercury), 
        bumpMap: new THREE.TextureLoader().load(bump_url_mercury), 
        bumpScale: 0.06 
    });

    materials["venus"] = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(texture_url_venus), 
        bumpMap: new THREE.TextureLoader().load(bump_url_venus), 
        bumpScale: 0.06 
    });
    
    materials["earth"] = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(texture_url_earth), 
        normalMap: new THREE.TextureLoader().load(normal_url_earth), 
        specularMap: new THREE.TextureLoader().load(specular_url_earth), 
    });

    materials["moon"] = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(texture_url_moon), 
        bumpMap: new THREE.TextureLoader().load(bump_url_moon), 
        bumpScale: 0.06 
    });

    materials["mars"] = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(texture_url_mars), 
        normalMap: new THREE.TextureLoader().load(normal_url_mars), 
   });

    materials["phobos"] = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(bump_url_phobos), 
        bumpMap: new THREE.TextureLoader().load(bump_url_phobos), 
        bumpScale: 0.06 
    });

    materials["deimos"] = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(bump_url_deimos), 
        bumpMap: new THREE.TextureLoader().load(bump_url_deimos), 
        bumpScale: 0.06 
    });

    materials["jupiter"] = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(texture_url_jupiter)
    });

    materials["saturn"] = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(texture_url_saturn)
    });

    materials["saturn_ring"] = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(texture_url_saturn_ring),
        alphaMap: new THREE.TextureLoader().load(transparency_url_saturn_ring),
        transparent: true,
        side: THREE.DoubleSide,
    });

    materials["uranus"] = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(texture_url_uranus)
    });

    materials["uranus_ring"] = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(texture_url_uranus_ring),
        alphaMap: new THREE.TextureLoader().load(transparency_url_saturn_ring),
        transparent: true,
        side: THREE.DoubleSide,
    });

    materials["neptune"] = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(texture_url_neptune)
    });

    materials["pluto"] = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(texture_url_pluto),
        bumpMap: new THREE.TextureLoader().load(bump_url_pluto), 
        bumpScale: 0.06 
    });

    materials["asteroid"] = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(texture_url_mercury), 
    });

    scene.background = new THREE.TextureLoader().load(texture_url_nebula)
    
}

//Illuminates the sun's material to give the emissive effect
//This is needed as I'm using a phong material, with "sunshader" material it is not needed
function sunIlumination()
{
    let spotLight1 = new THREE.SpotLight( 0xffca7a, 1, 300, Math.PI/6,0, 0.1);
    let spotLightHelper = new THREE.SpotLightHelper( spotLight1);
    //scene.add( spotLightHelper );
    let spotLight2 = new THREE.SpotLight( 0xffba7d, 1, 300, Math.PI/6, 0, 0.1);
    let spotLightHelper2 = new THREE.SpotLightHelper( spotLight2);
    //scene.add( spotLightHelper2 );
    let spotLight3 = new THREE.SpotLight(0xffba7d, 1, 300, Math.PI/6, 0, 0.1);
    let spotLightHelper3 = new THREE.SpotLightHelper( spotLight3);
    //scene.add( spotLightHelper3 );
    let spotLight4 = new THREE.SpotLight( 0xffba7d, 1, 300, Math.PI/6, 0, 0.1);
    let spotLightHelper4 = new THREE.SpotLightHelper( spotLight4);
    //scene.add( spotLightHelper4 );
    let spotLight5 = new THREE.SpotLight( 0xffba7d, 1, 300, Math.PI/6, 0, 0.1);
    let spotLightHelper5 = new THREE.SpotLightHelper( spotLight5);
    //scene.add( spotLightHelper5 );
    let spotLight6 = new THREE.SpotLight( 0xffba7d, 1, 300, Math.PI/6, 0, 0.1);
    let spotLightHelper6 = new THREE.SpotLightHelper( spotLight6);
    //scene.add( spotLightHelper6 );
    spotLight1.position.set( 0, 300, 0 );
    spotLight2.position.set( 0, -300, 0 );
    spotLight2.rotation.set( Math.PI, 0, 0 );
    spotLight3.position.set( 300, 0, 0 );
    spotLight3.rotation.set( 0, 0, -Math.PI/2);
    spotLight4.position.set( -300, 0, 0 );
    spotLight4.rotation.set( 0, 0, Math.PI/2);
    spotLight5.position.set( 0, 0, 300);
    spotLight5.rotation.set( 0, Math.PI/2, Math.PI/2);
    spotLight6.position.set( 0, 0, -300);
    spotLight6.rotation.set( 0, Math.PI/2, -Math.PI/2);
    root.add(spotLight1)
    root.add(spotLight2)
    root.add(spotLight3)
    root.add(spotLight4)
    root.add(spotLight5)
    root.add(spotLight6)
}

function createScene(canvas) 
{
    /*************************************Renderer************************************* */
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);
    renderer.alpha = true
    renderer.antialias = true
    renderer.setClearAlpha(0.0) 
    //renderer.setClearColor(0x000000, 0.0)

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.BasicShadowMap;
    
    /*************************************Scene************************************* */
    // Create a new Three.js scene
    scene = new THREE.Scene();
    
    /*************************************Camera************************************* */
    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(0, 300, 600);
    camera.far = 100000
    scene.add(camera);

    /*********************************Orbit Controls********************************* */
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    
    /***********************************Root Group*********************************** */
    // Create a group to hold all the objects
    root = new THREE.Object3D;

    /***********************************Sun Light*********************************** */
    //color, intensity, distance, decay, correct
    pointLight = new THREE.PointLight( 0xffffff, 0.8, 0, 2);
    pointLight.position.set( 0, 0, 0 );
    root.add( pointLight );
    pointLight.castShadow = true;
    pointLight.shadow.camera.near = 1;
    pointLight.shadow. camera.far = 10000;
    pointLight.shadow.camera.fov = 45;
    pointLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    pointLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
    //sunIllumination is not needed if the sun material is "sunshader"
    sunIlumination();
    var sphereSize = 1;
    var pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
    root.add( pointLightHelper );

    /*********************************Ambient Light********************************* */
    ambientLight = new THREE.AmbientLight ( 0x2b2b2b, 0.8);
    root.add(ambientLight);
    
    /************************************Materials*********************************** */
    createMaterials();

    /**********************************Post-Processing******************************* */
    addEffects();

    /*************************************Objects*********************************** */
    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);
    //radius, position, rotation, rotation_speed, translation_speed, color, number of moons, hasRing, orbit_radius, parent group, isStar, isAsteroid, name
    let sun = new Body(100, {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 0, 0, 0xffffff, materials["sunshader"], 0, false, 100, group, true, false, "sun");
    bodies_dictionary["mercury"] = new Body(3, {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 1, 0.75, 0xffffff, materials["mercury"], 0, false, 300, group, false, false, "mercury");//57);
    bodies_dictionary["venus"] = new Body(4, {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 2, 0.65, 0xffffff,  materials["venus"], 0, false, 350, group, false, false, "venus");//108);
    bodies_dictionary["earth"] = new Body(5, {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 3, 0.55, 0xffffff,  materials["earth"], 1, false, 400, group, false, false, "earth");//149);
    bodies_dictionary["mars"] = new Body(4, {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 4, 0.45, 0xffffff,  materials["mars"], 2, false, 450, group, false, false, "mars");//228);
    bodies_dictionary["jupyter"] = new Body(20, {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 8, 0.55, 0xffffff,  materials["jupiter"], 13, false, 800, group, false, false, "jupiter");//780);
    bodies_dictionary["saturn"] = new Body(15, {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 5, 0.45, 0xffffff,  materials["saturn"], 12, true, 950, group, false, false, "saturn");//1437);
    bodies_dictionary["uranus"] = new Body(12, {x: 0, y: 0, z: 0}, {x: Math.PI/2, y: 0, z: 0}, 3, 0.35, 0xffffff,  materials["uranus"], 11, true, 1100, group, false, false,"uranus");//2871);
    bodies_dictionary["neptune"] = new Body(12, {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 2, 0.25, 0xffffff,  materials["neptune"], 10, false, 1200, group, false, false, "neptune");//4530);
    bodies_dictionary["pluto"] = new Body(3, {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 5, 0.15, 0xffffff,  materials["pluto"], 5, false, 1300, group, false, false, "pluto");//8000);
    //position, rotation, orbit_radius, rotation_speed, translation_speed, name
    let asteroid_belt = new Belt({x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 600, group, 0, 0.25, "belt");

    //Place planets at diferent positions in their orbits, get x,z position using unit circle
    let angle_fraction = (2*Math.PI) / (Object.keys(bodies_dictionary).length);
    let angle_origin = Math.PI/2;
    let x = 0;
    let z = 0;
    let i = 0;
    for(let body of Object.keys(bodies_dictionary)){
        let angle = angle_fraction * i + angle_origin;
        x = Math.cos(angle) * bodies_dictionary[body].orbit_radius
        z = Math.sin(angle) * bodies_dictionary[body].orbit_radius 
        bodies_dictionary[body].body_group.position.x = x;
        bodies_dictionary[body].position.x = x;
        bodies_dictionary[body].body_group.position.z = z;
        bodies_dictionary[body].position.z = z;
        bodies_dictionary[body].orbit.mesh.position.x = group.position.x;
        bodies_dictionary[body].orbit.mesh.position.y = group.position.y;
        bodies_dictionary[body].orbit.mesh.position.z = group.position.z;
        i += 1;
    }
    
    scene.add(root);
}
