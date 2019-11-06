function init(){
    const scene = new THREE.Scene();
    const box = getBox(1,1,1) // defines dimensions of box for the scene
    // box.position.y = 0.5; // this elevates the box above the plane, but it only works when the box is 1 height.
    box.position.y = box.geometry.parameters.height/2; // this works regardless of the height of the box. 
    
    const plane = getPlane(80)
    // plane.rotation.x = 90 // rotate the plane 90 radians around its x-axis
    plane.rotation.x = Math.PI/2 // rotate the plane 90 DEGREES around its x-axis
    scene.add(plane); // adds the plane to the scene
    plane.name = 'plane-1';


    scene.fog = new THREE.FogExp2(0xffffff, 0.02) 
    
    scene.add(box); // adds the box as a child of the plane

    const camera = new THREE.PerspectiveCamera(
        45, //fov
        window.innerWidth/window.innerHeight, //aspect
        1, // near clipping plane
        1000 // far clipping plane
    ); // defines camera for the scene

    
    // by default camera and object are created at 0,0,0
    // view intersects with box created. 
    // adjusting camera's x,y,z and lookat() value consts the 
    // viewer observe the object

    camera.position.x = 12;
    camera.position.y = 11;
    camera.position.z = 45;
    camera.lookAt(new THREE.Vector3(0, 0, 0)); // Vector3 is a coordinate in 3D space.
    
    
    const renderer = new THREE.WebGLRenderer(); // use WebGL instead of SVG or canvas

    renderer.setSize(window.innerWidth, window.innerHeight); // determine width/height of renderer
    renderer.setClearColor('#ffffff')
    document.getElementById('webgl').appendChild(renderer.domElement) // assign placement of renderer.domElement in HTML document

    update(renderer,scene,camera)
};

function getBox(w,h,d) {
    const geometry = new THREE.BoxGeometry(w,h,d); // declare the box dimensions
    
    // default material is "mesh basic material" which is unaffected by lighting in the scene. 
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00
    });  // defines basic material and assigns it a color.

    const mesh = new THREE.Mesh(
        geometry,
        material
    ) // creates a mesh with the properties defines above
 
       return mesh
}

function getPlane(size) {
    const geometry = new THREE.PlaneGeometry(size,size);

    const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide
    });  // defines basic material and assigns it a color.

    const mesh = new THREE.Mesh(
        geometry,
        material
    ) // creates a mesh with the properties defines above
 
       return mesh

}

function update (renderer, scene, camera) {     // update seems to be a special name, like in Phaser.io, where it runs at 60 Hz
                                                // changing the name of this function makes the rotation stop. 
    renderer.render(
        scene,
        camera
        ); // render, obviously.

        requestAnimationFrame(function(){
            update(renderer, scene, camera);
        })  // what we did with the update was set up a function 
            // that gets recursively called by the requestAnimationFrame 
            // function about 60Hz

            var plane = scene.getObjectByName('plane-1')

}

init();

