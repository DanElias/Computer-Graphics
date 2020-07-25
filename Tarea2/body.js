/*
* Class Body to create Planets, Stars, Asteroids, Moons
*/

class Body{
    constructor(radius, position, rotation, rotation_speed, translation_speed, color, material, num_moons, hasRing, orbit_radius, parent_group, isStar, isAsteroid, name){
        //Basics
        this.radius = radius;
        this.rotation_speed = rotation_speed;
        this.translation_speed = translation_speed;
        this.orbit_radius = orbit_radius;
        this.color = color;
        this.material = material;
        this.name = name;

        //Groups
        this.orbit_group = new THREE.Object3D; //for the orbit
        this.body_group = new THREE.Object3D; //for the planet/star/moon/ring
        this.parent_group = parent_group;
        this.orbit_group.add(this.body_group);//orbit controls the body
       
        //Geometry
        this.isAsteroid = isAsteroid;
        if(this.isAsteroid){
            this.geometry =  new THREE.SphereGeometry(this.radius, 3, 3);
            //low poly sphere for asteroids
        } else {
            this.geometry =  new THREE.SphereGeometry(this.radius, 40, 40);
        }
        
        //Mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.body_group.add(this.mesh);
        this.orbit_group.add(this.body_group);

        //Position / Rotation
        this.position = position;
        this.mesh.position.x = this.position.x;
        this.mesh.position.y = this.position.y;
        this.mesh.position.z = this.position.z;
        this.rotation = rotation;
        this.mesh.rotation.x = this.rotation.x;
        this.mesh.rotation.y = this.rotation.y;
        this.mesh.rotation.z = this.rotation.z;

        //Is the body is a star, let light pass through
        this.isStar = isStar;
        this.mesh.castShadow = (this.isStar) ? false : true;
        this.mesh.receiveShadow = (this.isStar) ? false : true;

        //If body has ring - addRing
        this.hasRing = hasRing;
        if(this.hasRing) this.addRing();

        //If body is a planet - add orbit
        if(!this.isAsteroid && !this.isStar){
            this.orbit = new Orbit(this.orbit_radius, this.parent_group.position, this.rotation);
            this.orbit_group.add(this.orbit.mesh);
            bodiesList.push(this);
        }

        this.moonsList = []; //keep track of the generated moons
        this.num_moons = num_moons;
        //If body is a planet - addMoons
        if(!this.isStar && !this.isAsteroid) this.addMoons();

        scene.add(this.orbit_group) //add to scene and not to parent
    }

    addRing(){
        let segments = 96;
        //inner radius
        let start = this.radius * 1.200;
        //outer radius
        let end = this.radius * 2.3;

        if(this.name == "uranus"){
            start = this.radius * 1.600;
            end = this.radius * 1.950;
        } 
        
        //Ring Geometry
        this.ring_geometry = new THREE.RingBufferGeometry(start, end, segments);
       
        /****This part is to change the ring geometry UV mapping fot the texture****/
        var uvs = this.ring_geometry.attributes.uv.array;
        var phiSegments = this.ring_geometry.parameters.phiSegments || 0;
        var thetaSegments = this.ring_geometry.parameters.thetaSegments || 0;
        phiSegments = phiSegments !== undefined ? Math.max( 1, phiSegments ) : 1;
        thetaSegments = thetaSegments !== undefined ? Math.max( 3, thetaSegments ) : 8;
        for ( var c = 0, j = 0; j <= phiSegments; j ++ ) {
            for ( var i = 0; i <= thetaSegments; i ++ ) {
                uvs[c++] = i / thetaSegments,
                uvs[c++] = j / phiSegments;
            }
        }
        /*****************************************************************************/

        //materials
        this.ring_material = materials["saturn_ring"]; 
        if(this.name == "saturn"){
            this.ring_geometry.rotateX(1.7);
        } else if(this.name == "uranus"){
            this.ring_material = materials["uranus_ring"]; 
        }

        //Ring Mesh
        this.ring_mesh = new THREE.Mesh(this.ring_geometry, this.ring_material);
        this.body_group.add(this.ring_mesh);
    }

    addMoons(){
        //New group for the moons
        this.moons = new THREE.Object3D; //moons group for the body
        this.body_group.add(this.moons)
    
        //Create a moon for the specified number of moons
        for(let i = 1; i <= this.num_moons; i++){
            //set material
            let material_moon = materials["moon"];
            //special moons for mars
            if(this.name == "mars"){
                if(i-1 == 0) material_moon = materials["phobos"];
                else material_moon = materials["deimos"];
            }
            //Create a mesh and body (without moons) for the currentmoon
            let moon = new Body(
                this.radius/(this.radius), 
                {
                    x: this.position.x + (i/3) * this.radius + (this.radius*2.5), //offset from body
                    y: this.position.y, 
                    z: this.position.z
                },
                {
                    x: this.rotation.x, 
                    y: this.rotation.y, 
                    z: this.rotation.z
                }, 
                getRandomFloat(1,5), //random rotation speed
                getRandomFloat(1,3), //random translation speed
                0xffffff,
                material_moon,
                0,
                false, 
                (i/3) * this.radius + (this.radius*2.5), //orbit
                this.orbit_group, //parent group
                false,
                false,
                "moon"
            );
            //Add moons to group
            this.moons.add(moon.orbit_group);
            this.moonsList.push(moon);
            bodiesList.push(moon); //bodiesList will animate moons
        }
        
        //Position the moons of the planets at different locations within a circunference
        let angle_fraction = (2*Math.PI) / this.moonsList.length;
        let angle_origin = Math.PI/2;
        let x = 0;
        let z = 0;
        let i = 0
        for(let moon_body of this.moonsList){
            this.moons.add(moon_body.orbit_group);
            let angle = angle_fraction * i + angle_origin;
            x = Math.cos(angle) * moon_body.orbit_radius
            z = Math.sin(angle) * moon_body.orbit_radius 
            moon_body.mesh.position.x = x;
            moon_body.mesh.position.z = z;
            i += 1;
        }
    }
}