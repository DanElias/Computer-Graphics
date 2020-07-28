/*
* Class Orbit to define the orbits followed by Planets, Asteroid Belts or Moons
*/

class Orbit{
    constructor(orbit_radius, center, rotation){
        //Groups
        this.orbit_group = new THREE.Object3D;
        //Basics
        this.orbit_radius = orbit_radius
        this.rotation = rotation
        //inner radius
        this.startPoint = new THREE.Vector3(center.x,center.y,center.z);
        //outer radius
        this.endPoint = new THREE.Vector3(0,0, this.orbit_radius);
        //Circle geometry
        this.geometry = new THREE.CircleGeometry(this.startPoint.distanceTo(this.endPoint), 128, 0, 6.3);
        //horizontal orientation
        this.geometry.vertices.shift();
        this.geometry.rotateX(-Math.PI / 2);
        //Material and mesh
        this.material = new THREE.LineBasicMaterial( { color: 0x1a1a1a } );
        this.mesh = new THREE.Line( this.geometry, this.material );
        //Groups
        this.orbit_group.add(this.mesh)
        Game.scene.add(this.orbit_group);
    }
}