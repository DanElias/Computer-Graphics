//
// Game singleton
//

let Game = {};

Game.setLightColor = function (light, r, g, b) {
    //Changes the Light colors (point and ambient)
    r /= 255;
    g /= 255;
    b /= 255;
    light.color.setRGB(r, g, b);
}

Game.run = function () {

    this._previousElapsed = 0;

    /*************************************Renderer************************************* */
    // Create the Three.js renderer and attach it to our canvas
    let canvas = document.getElementById('webglcanvas');
    this.canvas = canvas; 
    this.canvas_div = document.getElementById('canvas_col');

    canvas.width = this.canvas_div.offsetWidth;
    canvas.height = this.canvas_div.offsetHeight;

    this.renderer = new THREE.WebGLRenderer({canvas: canvas});

    // Set the viewport size
    this.renderer.setSize(canvas.width, canvas.height);
    this.renderer.alpha = true
    this.renderer.antialias = true
    this.renderer.setClearAlpha(0.0) 
    this.renderer.setViewport(0, 0, canvas.width, canvas.height);

    
    /************************************Shadows*************************************** */
    // Turn on shadows
    this.renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    let SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

    /*************************************Scene************************************* */
    // Create a new Three.js scene
    this.scene = new THREE.Scene();

    /*************************************Camera************************************* */
    /*
    // create an isometric camera
    this.camera = new THREE.OrthographicCamera(-5, 5, 5, -5, -1, 100);
    this.camera.position.z = 5;
    this.camera.position.y = 5;
    this.camera.position.x = 5;
    this.camera.lookAt(this.scene.position); // point at origin
    */
   
    // Add  a camera so we can view the scene
    this.camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 40000 );
    this.camera.position.set(0, 10, 20);
    this.camera.far = 100000;
    this.scene.add(this.camera);
   
    this.onWindowResize();
    window.addEventListener( 'resize', this.onWindowResize);

    /*********************************Orbit Controls********************************* */
    this.orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

    /***********************************Root Group*********************************** */
    // Create a group to hold all the objects
    this.root = new THREE.Object3D;
    this.scene.add(this.root);

    /***********************************Sun Light*********************************** */
    //color, intensity, distance, decay, correct
    this.pointLight = new THREE.PointLight( 0xffffff, 1.2, 0, 2);
    this.pointLight.position.set( 0, 10, 0 );
    this.root.add( this.pointLight );
    this.pointLight.castShadow = true;
    this.pointLight.shadow.camera.near = 1;
    this.pointLight.shadow. camera.far = 10000;
    this.pointLight.shadow.camera.fov = 45;
    this.pointLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    this.pointLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
    let sphereSize = 1;
    let pointLightHelper = new THREE.PointLightHelper( this.pointLight, sphereSize );
    this.root.add( pointLightHelper );

    /*********************************Ambient Light********************************* */
    this.ambientLight = new THREE.AmbientLight ( 0x2b2b2b, 0.8);
    this.root.add(this.ambientLight);

    // create ground and axis / grid helpers
    /*
    var ground = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshPhongMaterial({color: 0xcccccc}));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01; // to avoid z-fighting with axis and shadows
    this.root.add(ground);
    */
    //this.scene.add((new THREE.AxesHelper(5)));

    document.addEventListener('keyup', function (event) {
        if (event.keyCode === 27) { // listen for Esc Key
            event.preventDefault();
            this.toggleDebug();
        }
    }.bind(this));

    // start up game
    this.init();
    window.requestAnimationFrame(this.tick);
};

Game.tick = function (elapsed) {
    window.requestAnimationFrame(this.tick);

    // compute delta time in seconds -- also cap it
    var delta = (elapsed - this._previousElapsed) / 1000.0;
    delta = Math.min(delta, 0.25); // maximum delta of 250 ms
    this._previousElapsed = elapsed;

    this.update(delta);
    this.renderer.render(this.scene, this.camera);
}.bind(Game);

//Textures
Game.textures = {
     //Color - texture maps
     texture_url_sun: "../images/sunmap2.jpg",
     texture_url_mercury: "../images/mercurymap.jpg",
     texture_url_venus: "../images/venusmap.jpg",
     texture_url_earth: "../images/earth_atmos_2048.jpg",
     texture_url_moon: "../images/moonmap.jpg",
     texture_url_mars: "../images/marsmap.jpg",
     texture_url_jupiter: "../images/jupitermap.jpg",
     texture_url_saturn: "../images/saturnmap.jpg",
     texture_url_uranus: "../images/uranusmap.jpg",
     texture_url_neptune: "../images/neptunemap.jpg",
     texture_url_pluto: "../images/plutomap.jpg",
     texture_url_saturn_ring: "../images/saturnringcolor2.jpg",
     texture_url_uranus_ring: "../images/uranusringcolour.jpg",
     texture_url_nebula: "../images/nebula-2.jpg",
     //Bump maps
     bump_url_mercury: "../images/mercurybump.jpg",
     bump_url_venus: "../images/venusbump.jpg",
     bump_url_earth: "../images/earthbump1k.jpg",
     bump_url_moon: "../images/moonbump1k.jpg",
     bump_url_phobos: "../images/phobosbump.jpg",
     bump_url_deimos: "../images/deimosbump.jpg",
     bump_url_pluto: "../images/plutobump1k.jpg",
     //Normal maps
     normal_url_earth: "../images/earth_normal_2048.jpg",
     normal_url_mars: "../images/mars_1k_normal.jpg",
     //Specular maps
     specular_url_earth: "../images/earthspec1k.jpg",
     //Cloud maps
     cloud_url_earth: "../images/earthcloudmap.jpg",
     //Transparency maps
     transparency_url_earth: "../images/earthcloudmap.jpg",
     transparency_url_saturn_ring: "../images/saturnringpattern2.jpg",
     //Shader Material
     glow_texture: "../images/sunmap2.jpg",
     noise_texture: "../images/noisy-texture.png"
};

// collection of materials used in the demos
Game.materials = {

    shadow: new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.5
    }),

    solid: new THREE.MeshNormalMaterial({}),

    colliding: new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.5
    }),

    dot: new THREE.MeshBasicMaterial({
        color: 0x0000ff
    }),

    
    mercury: new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(Game.textures.texture_url_mercury), 
        bumpMap: new THREE.TextureLoader().load(Game.textures.bump_url_mercury), 
        bumpScale: 0.06 
    }),
    

    venus: new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(Game.textures.texture_url_venus), 
        bumpMap: new THREE.TextureLoader().load(Game.textures.bump_url_venus), 
        bumpScale: 0.06 
    }),

    earth: new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(Game.textures.texture_url_earth), 
        normalMap: new THREE.TextureLoader().load(Game.textures.normal_url_earth), 
        specularMap: new THREE.TextureLoader().load(Game.textures.specular_url_earth), 
    }),

    moon: new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(Game.textures.texture_url_moon), 
        bumpMap: new THREE.TextureLoader().load(Game.textures.bump_url_moon), 
        bumpScale: 0.06 
    }),

    mars: new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(Game.textures.texture_url_mars), 
        normalMap: new THREE.TextureLoader().load(Game.textures.normal_url_mars), 
   }),

    phobos: new THREE.MeshPhongMaterial({
         map: new THREE.TextureLoader().load(Game.textures.bump_url_phobos), 
        bumpMap: new THREE.TextureLoader().load(Game.textures.bump_url_phobos), 
        bumpScale: 0.06 
    }),

    deimos: new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(Game.textures.bump_url_deimos), 
        bumpMap: new THREE.TextureLoader().load(Game.textures.bump_url_deimos), 
        bumpScale: 0.06 
    }),

    jupiter: new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(Game.textures.texture_url_jupiter)
    }),

    saturn: new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(Game.textures.texture_url_saturn)
    }),

    saturn_ring: new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(Game.textures.texture_url_saturn_ring),
        alphaMap: new THREE.TextureLoader().load(Game.textures.transparency_url_saturn_ring),
        transparent: true,
        side: THREE.DoubleSide,
    }),

    uranus: new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(Game.textures.texture_url_uranus)
    }),

    uranus_ring: new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(Game.textures.texture_url_uranus_ring),
        alphaMap: new THREE.TextureLoader().load(Game.textures.transparency_url_saturn_ring),
        transparent: true,
        side: THREE.DoubleSide,
    }),

    neptune: new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(Game.textures.texture_url_neptune)
    }),

    pluto: new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(Game.textures.texture_url_pluto),
        bumpMap: new THREE.TextureLoader().load(Game.textures.bump_url_pluto), 
        bumpScale: 0.06 
    }),

    asteroid: new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(Game.textures.texture_url_mercury), 
    })

};

//Resizes the window when size changes
Game.onWindowResize =  function() {
    this.canvas.width = this.canvas_div.clientWidth;
    this.canvas.height = this.canvas_div.clientHeight;
    this.camera.aspect = this.canvas.width / this.canvas.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( this.canvas.width, this.canvas.height );
}

// override these methods to create the demo
Game.init = function () {};
Game.update = function (delta) {};
Game.toggleDebug = function () {};

//
// Utils
//

var Utils =  {};

Utils.createShadow = function (mesh, material) {
    var params = mesh.geometry.parameters;
    mesh.geometry.computeBoundingSphere();
    var geo = mesh.geometry.type === 'BoxGeometry'
        ? new THREE.PlaneGeometry(params.width, params.depth)
        : new THREE.CircleGeometry(mesh.geometry.boundingSphere.radius, 24);

    var shadow = new THREE.Mesh(geo, material);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.x = mesh.position.x;
    shadow.position.z = mesh.position.z;

    return shadow;
};

Utils.updateShadow = function (shadow, target) {
    shadow.position.x = target.position.x;
    shadow.position.z = target.position.z;
    shadow.visible = target.position.y >= 0;

    shadow.scale.x = target.scale.x;
    shadow.scale.y = target.scale.z;
};

