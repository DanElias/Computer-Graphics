Game.init = function () {

    //radius, position, rotation, rotation_speed, translation_speed, color, number of moons, hasRing, orbit_radius, parent group, isStar, isAsteroid, name
    this.vertex = new Vertex(0.1, {x: -5, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 3, 0.55, 0xffffff,  Game.materials.emissive_yellow, 0, false, 400, this.root, false, false, "earth");//149);
    this.vertex2 = new Vertex(0.1, {x: -4, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 3, 0.55, 0xffffff,  Game.materials.emissive_yellow, 0, false, 400, this.root, false, false, "earth");//149);
    this.vertex3 = new Vertex(0.1, {x: -3, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 3, 0.55, 0xffffff,  Game.materials.emissive_yellow, 0, false, 400, this.root, false, false, "earth");//149);
    this.vertex4 = new Vertex(0.1, {x: -2, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 3, 0.55, 0xffffff,  Game.materials.emissive_yellow, 0, false, 400, this.root, false, false, "earth");//149);
    this.vertex5 = new Vertex(0.1, {x: -1, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 3, 0.55, 0xffffff,  Game.materials.emissive_yellow, 0, false, 400, this.root, false, false, "earth");//149);
    this.vertex6 = new Vertex(0.1, {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 3, 0.55, 0xffffff,  Game.materials.emissive_yellow, 0, false, 400, this.root, false, false, "earth");//149);
    this.vertex7 = new Vertex(0.1, {x: 1, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 3, 0.55, 0xffffff,  Game.materials.emissive_yellow, 0, false, 400, this.root, false, false, "earth");//149);
    this.vertex8 = new Vertex(0.1, {x: 2, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 3, 0.55, 0xffffff,  Game.materials.emissive_yellow, 0, false, 400, this.root, false, false, "earth");//149);
    this.vertex9 = new Vertex(0.1, {x: 3, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 3, 0.55, 0xffffff,  Game.materials.emissive_yellow, 0, false, 400, this.root, false, false, "earth");//149);
    this.vertex10 = new Vertex(0.1, {x: 4, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 3, 0.55, 0xffffff,  Game.materials.emissive_yellow, 0, false, 400, this.root, false, false, "earth");//149);
    this.vertex11 = new Vertex(0.1, {x: 5, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 3, 0.55, 0xffffff,  Game.materials.emissive_yellow, 0, false, 400, this.root, false, false, "earth");//149);
    //this.vertex.geometry.computeBoundingSphere();


    let icosa = new THREE.IcosahedronGeometry(10, 1);
    this.icosahedron = new THREE.Mesh(icosa, this.materials.emissive_blue);
    this.icosahedron.position.set(0,0,0);
    this.root.add(this.icosahedron);

    console.log(icosa.vertices)

    var planegeometry = new THREE.PlaneGeometry( 50, 50, 5);
    var planematerial = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    this.plane = new THREE.Mesh(planegeometry, this.materials.saturn_ring );
    this.plane.position.set(0,-5,0);
    this.plane.rotation.set(-Math.PI/2,0,0)
    //this.root.add(this.plane);

    this.timestamp = 0;

    // setup physic world
    this.initPhysicalWorld();
};

let ticks = 0

Game.update = function (delta) {
    this.timestamp += delta;
    ticks+=1
    if(ticks == 60){
        this.world.gravity.y *= -1
        ticks = 0;
    }

    this.vertex.mesh.position.copy(this.vertexBody.position)
    this.vertex.mesh.quaternion.copy(this.vertexBody.quaternion)

    this.vertex2.mesh.position.copy(this.vertexBody2.position)
    this.vertex2.mesh.quaternion.copy(this.vertexBody2.quaternion)

    this.vertex3.mesh.position.copy(this.vertexBody3.position)
    this.vertex3.mesh.quaternion.copy(this.vertexBody3.quaternion)

    this.vertex4.mesh.position.copy(this.vertexBody4.position)
    this.vertex4.mesh.quaternion.copy(this.vertexBody4.quaternion)

    this.vertex5.mesh.position.copy(this.vertexBody5.position)
    this.vertex5.mesh.quaternion.copy(this.vertexBody5.quaternion)

    this.vertex6.mesh.position.copy(this.vertexBody6.position)
    this.vertex6.mesh.quaternion.copy(this.vertexBody6.quaternion)

    this.vertex7.mesh.position.copy(this.vertexBody7.position)
    this.vertex7.mesh.quaternion.copy(this.vertexBody7.quaternion)

    this.vertex8.mesh.position.copy(this.vertexBody8.position)
    this.vertex8.mesh.quaternion.copy(this.vertexBody8.quaternion)

    this.vertex9.mesh.position.copy(this.vertexBody9.position)
    this.vertex9.mesh.quaternion.copy(this.vertexBody9.quaternion)

    this.vertex10.mesh.position.copy(this.vertexBody10.position)
    this.vertex10.mesh.quaternion.copy(this.vertexBody10.quaternion)

    this.vertex11.mesh.position.copy(this.vertexBody11.position)
    this.vertex11.mesh.quaternion.copy(this.vertexBody11.quaternion)

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
    this.damping = 0.8;
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.defaultContactMaterial.contactEquationStiffness = 1e7;
    this.world.defaultContactMaterial.contactEquationRelaxation = 4;
    this.world.gravity.set(0, -9, 0);
    this.world.solver.iterations = 1;

    // Create a plane
    var groundShape = new CANNON.Plane();
    this.groundBody = new CANNON.Body({mass: 0});
    this.groundBody.addShape(groundShape);
    this.world.addBody(this.groundBody);
    this.groundBody.position.copy(this.plane.position);
    this.groundBody.quaternion.copy(this.plane.quaternion);

    this.vertexBody = this.addPhysicalBody(this.vertex.mesh, {mass: 0}, this.vertex.radius);
    this.vertexBody2 = this.addPhysicalBody(this.vertex2.mesh, {mass: 1}, this.vertex2.radius);
    this.vertexBody3 = this.addPhysicalBody(this.vertex3.mesh, {mass: 2}, this.vertex3.radius);
    this.vertexBody4 = this.addPhysicalBody(this.vertex4.mesh, {mass: 5}, this.vertex4.radius);
    this.vertexBody5 = this.addPhysicalBody(this.vertex5.mesh, {mass: 5}, this.vertex5.radius);
    this.vertexBody6 = this.addPhysicalBody(this.vertex6.mesh, {mass: 5}, this.vertex6.radius);
    this.vertexBody7 = this.addPhysicalBody(this.vertex7.mesh, {mass: 5}, this.vertex7.radius);
    this.vertexBody8 = this.addPhysicalBody(this.vertex8.mesh, {mass: 5}, this.vertex8.radius);
    this.vertexBody9 = this.addPhysicalBody(this.vertex9.mesh, {mass: 5}, this.vertex9.radius);
    this.vertexBody10 = this.addPhysicalBody(this.vertex10.mesh, {mass: 1}, this.vertex10.radius);
    this.vertexBody11 = this.addPhysicalBody(this.vertex11.mesh, {mass: 0}, this.vertex11.radius);

    var size = 2;
    var space = 0*size

    this.union = new CANNON.DistanceConstraint(this.vertexBody5, this.vertexBody6, 1);
    this.union2 = new CANNON.DistanceConstraint(this.vertexBody7, this.vertexBody6, 1);
    this.union3 = new CANNON.DistanceConstraint(this.vertexBody4, this.vertexBody5, 1);
    this.union4 = new CANNON.DistanceConstraint(this.vertexBody8, this.vertexBody7, 1);
    this.union5 = new CANNON.DistanceConstraint(this.vertexBody3, this.vertexBody4, 1);
    this.union6 = new CANNON.DistanceConstraint(this.vertexBody9, this.vertexBody8, 1);
    this.union7 = new CANNON.DistanceConstraint(this.vertexBody2, this.vertexBody3, 1);
    this.union8 = new CANNON.DistanceConstraint(this.vertexBody10, this.vertexBody9, 1);
    
    
    this.union9 = new CANNON.LockConstraint(this.vertexBody, this.vertexBody2);
    this.union10 = new CANNON.LockConstraint(this.vertexBody11, this.vertexBody10);

    this.world.addConstraint(this.union);
    this.world.addConstraint(this.union2);
    this.world.addConstraint(this.union3);
    this.world.addConstraint(this.union4);
    this.world.addConstraint(this.union5);
    this.world.addConstraint(this.union6);
    this.world.addConstraint(this.union7);
    this.world.addConstraint(this.union8);
    this.world.addConstraint(this.union9);
    this.world.addConstraint(this.union10);
    
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
