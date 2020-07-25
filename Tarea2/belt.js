/*
* Class Belt to create Asteroid Belts with substantial asteroids
*/

class Belt{
    constructor(position, rotation, orbit_radius, parent_group, rotation_speed, translation_speed, name){
        //Group Hierarchy
        this.orbit_group = new THREE.Object3D;
        this.parent_group = parent_group;
        //Basics
        this.orbit_radius = orbit_radius;
        this.position = position;
        this.rotation = rotation;
        this.translation_speed = translation_speed;
        this.rotation_speed = rotation_speed;
        this.name = name;
        //Orbit
        this.orbit = new Orbit(this.orbit_radius, this.parent_group.position, this.rotation);
        this.orbit_group.add(this.orbit.mesh);
        bodiesList.push(this);

        //Created a small group of 9 asteroids, and replicated it 200 times along the orbit
        let asteroid_groupsList = [];
        for(let i=0; i < 200; i++){
            let asteroid_group = new THREE.Object3D;
            let a1 = new Body(1, {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 1,1, 0xffffff, materials["asteroid"], 0, false, 550, group, false, true);
            let a2 = new Body(1, {x: 10, y: 0, z: 10}, {x: 0, y: 0, z: 0}, 1,1, 0xffffff, materials["asteroid"], 0, false, 550, group, false, true);
            let a3 = new Body(1, {x: 20, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 1,1, 0xffffff, materials["asteroid"], 0, false, 550, group, false, true);
            let a4 = new Body(1, {x: -10, y: 0, z: -10}, {x: 0, y: 0, z: 0}, 1,1, 0xffffff, materials["asteroid"], 0, false, 550, group, false, true);
            let a5 = new Body(1, {x: -20, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 1,1, 0xffffff, materials["asteroid"], 0, false, 550, group, false, true);
            let a6 = new Body(1, {x: 0, y: 0, z: 20}, {x: 0, y: 0, z: 0}, 1,1, 0xffffff, materials["asteroid"], 0, false, 550, group, false, true);
            let a7 = new Body(1, {x: 0, y: 0, z: -20}, {x: 0, y: 0, z: 0}, 1,1, 0xffffff, materials["asteroid"], 0, false, 550, group, false, true);
            let a8 = new Body(1, {x: 0, y: 20, z: 0}, {x: 0, y: 0, z: 0}, 1,1, 0xffffff, materials["asteroid"], 0, false, 550, group, false, true);
            let a9 = new Body(1, {x: 0, y: -20, z: 0}, {x: 0, y: 0, z: 0}, 1,1, 0xffffff, materials["asteroid"], 0, false, 550, group, false, true);        
            asteroid_group.add(a1.mesh);
            asteroid_group.add(a2.mesh);
            asteroid_group.add(a3.mesh);
            asteroid_group.add(a4.mesh);
            asteroid_group.add(a5.mesh);
            asteroid_group.add(a6.mesh);
            asteroid_group.add(a7.mesh);
            asteroid_group.add(a8.mesh);
            asteroid_group.add(a9.mesh);
            this.orbit_group.add(asteroid_group);
            asteroid_groupsList.push(asteroid_group);
        }

        //Positioned the 200 groups of 9 asteroids along the orbit, also with a certain rotation to look different
        let angle_fraction = (2*Math.PI) / asteroid_groupsList.length;
        let angle_origin = Math.PI/2;
        let x = 0;
        let z = 0;
        let i = 0
        for(let asteroid_group of asteroid_groupsList){
            let angle = angle_fraction * i + angle_origin;
            x = Math.cos(angle) * this.orbit_radius
            z = Math.sin(angle) * this.orbit_radius 
            asteroid_group.position.x = x;
            asteroid_group.position.z = z;
            asteroid_group.rotation.x = x;
            asteroid_group.rotation.z = z;
            i += 1;
        }
        //Add all the belt to the parent group
        scene.add(this.orbit_group)
    }
}
