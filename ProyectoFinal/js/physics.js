Game.init = function () {

    //radius, position, rotation, rotation_speed, translation_speed, color, number of moons, hasRing, orbit_radius, parent group, isStar, isAsteroid, name
    this.vertex = new Vertex(1, {x: 5.1, y: 5, z: 5}, {x: 0, y: 0, z: 0}, 3, 0.55, 0xffffff,  Game.materials.jupiter, 0, false, 400, this.root, false, false, "earth");//149);
    this.vertex2 = new Vertex(1, {x: 5, y: 0, z: 5}, {x: 0, y: 0, z: 0}, 3, 0.55, 0xffffff,  Game.materials.jupiter, 0, false, 400, this.root, false, false, "earth");//149);
    //this.vertex.geometry.computeBoundingSphere();

    var planegeometry = new THREE.PlaneGeometry( 50, 50, 5);
    var planematerial = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    this.plane = new THREE.Mesh(planegeometry, this.materials.saturn_ring );
    this.plane.position.set(0,-5,0);
    this.plane.rotation.set(-Math.PI/2,0,0)
    this.root.add(this.plane);

    this.timestamp = 0;

    // setup physic world
    this.initPhysicalWorld();
};

Game.update = function (delta) {
    this.timestamp += delta;

    this.vertex.mesh.position.copy(this.vertexBody.position)
    this.vertex.mesh.quaternion.copy(this.vertexBody.quaternion)

    this.vertex2.mesh.position.copy(this.vertexBody2.position)
    this.vertex2.mesh.quaternion.copy(this.vertexBody2.quaternion)

    this.updatePhysics(delta);
};

var lastTime;
var fixedTimeStep = 1.0 / 60.0; // seconds
var maxSubSteps = 3;

Game.updatePhysics = function (delta) {
    this.world.step(fixedTimeStep, delta, maxSubSteps);
    this.renderer.render(this.scene, this.camera);
};

Game.initPhysicalWorld = function () {
    this.world = new CANNON.World();
    this.damping = 0;
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.defaultContactMaterial.contactEquationStiffness = 1e7;
    this.world.defaultContactMaterial.contactEquationRelaxation = 4;
    this.world.gravity.set(0, -10, 0);
    this.world.solver.iterations = 100;

    // Create a plane
    var groundShape = new CANNON.Plane();
    this.groundBody = new CANNON.Body({mass: 0});
    this.groundBody.addShape(groundShape);
    this.world.addBody(this.groundBody);
    this.groundBody.position.copy(this.plane.position);
    this.groundBody.quaternion.copy(this.plane.quaternion);
    

    this.vertexBody = this.addPhysicalBody(this.vertex.mesh, {mass: 5}, this.vertex.radius);
    this.vertexBody2 = this.addPhysicalBody(this.vertex2.mesh, {mass: 5}, this.vertex.radius);

};

Game.addPhysicalBody = function (mesh, bodyOptions, radius) {
    var shape = new CANNON.Sphere(radius);
    var material = new CANNON.Material();
    var body = new CANNON.Body(bodyOptions);
    body.position.copy(mesh.position)
    body.addShape(shape);
    body.linearDamping = this.damping;
    body.computeAABB();
    body.collisionResponse = true;
    this.world.add(body);
    return body;
};
