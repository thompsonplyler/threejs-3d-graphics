function init() {
    const gui = new dat.GUI()
    const scene = new THREE.Scene();
    const boxGrid = getBoxGrid(10, 1.5) // defines dimensions of box for the scene
    // box.position.y = 0.5; // this elevates the box above the plane, but it only works when the box is 1 height.
    // box.position.y = box.geometry.parameters.height / 2; // this works regardless of the height of the box. 
    const sphere = getSphere(.05)
    const plane = getPlane(80)

    const loader = new THREE.OBJLoader();
    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load('./model/rab-obj/textures/rabadon_diffuse.tga.png')
    console.log("Logging variable: map", map)
    const material = new THREE.MeshPhongMaterial({ map: map });
    console.log(loader)



    loader.load('model/rab-obj/source/rabadonhatfinished.obj', function (object) {

        console.log(object)
        object.traverse(function (node) {
            if (node.isMesh) node.material = material
        })
        scene.add(object)
    });

    plane.rotation.x = 90 // rotate the plane 90 radians around its x-axis
    plane.rotation.x = Math.PI / 2 // rotate the plane 90 DEGREES around its x-axis
    plane.name = 'plane-1';

    enableFog = false
    if (enableFog) { scene.fog = new THREE.FogExp2(0xffffff, 0.02) }

    const directionalLight = getDirectionalLight(1)
    directionalLight.add(sphere)
    directionalLight.position.x = 13
    directionalLight.position.y = 10
    directionalLight.position.z = 10

    const ambientLight = getAmbientLight(1)
    scene.add(ambientLight)

    scene.add(plane); // adds the plane to the scene
    scene.add(boxGrid); // adds the box as a child of the plane
    scene.add(directionalLight)

    const helper = new THREE.CameraHelper(directionalLight.shadow.camera)
    const camera = new THREE.PerspectiveCamera(
        45, //fov
        window.innerWidth / window.innerHeight, //aspect
        1, // near clipping plane
        1000 // far clipping plane
    ); // defines camera for the scene

    scene.add(helper)

    directionalLight.position.y = 2
    gui.add(directionalLight, 'intensity', 0, 10)
    gui.add(directionalLight.position, 'y', 0, 20)
    gui.add(directionalLight.position, 'x', 0, 20)
    gui.add(directionalLight.position, 'z', 0, 20)
    // gui.add(directionalLight, 'penumbra', 0, 1)

    // by default camera and object are created at 0,0,0
    // view intersects with box created. 
    // adjusting camera's x,y,z and lookat() value consts the 
    // viewer observe the object

    camera.position.x = 2;
    camera.position.y = 3;
    camera.position.z = 8;
    camera.lookAt(new THREE.Vector3(0, 0, 0)); // Vector3 is a coordinate in 3D space.



    const renderer = new THREE.WebGLRenderer(); // use WebGL instead of SVG or canvas

    renderer.setSize(window.innerWidth, window.innerHeight); // determine width/height of renderer
    // renderer.setClearColor('#ffffff')
    document.getElementById('webgl').appendChild(renderer.domElement) // assign placement of renderer.domElement in HTML document

    const controls = new THREE.OrbitControls(camera, renderer.domElement)
    renderer.shadowMap.enabled = true
    update(renderer, scene, camera, controls)
};

function getBox(w, h, d) {
    const geometry = new THREE.BoxGeometry(w, h, d); // declare the box dimensions


    const material = new THREE.MeshPhongMaterial({
        color: 0x535353
    });  // defines basic material and assigns it a color.

    const mesh = new THREE.Mesh(
        geometry,
        material
    ) // creates a mesh with the properties defines above
    mesh.castShadow = true
    return mesh
}

function getPlane(size) {
    const geometry = new THREE.PlaneGeometry(size, size);

    const material = new THREE.MeshPhongMaterial({
        color: 0xA3A3A3,
        side: THREE.DoubleSide
    });  // defines basic material and assigns it a color.

    const mesh = new THREE.Mesh(
        geometry,
        material
    ) // creates a mesh with the properties defines above
    mesh.receiveShadow = true
    return mesh

}

function update(renderer, scene, camera, controls) {     // update seems to be a special name, like in Phaser.io, where it runs at 60 Hz
    // changing the name of this function makes the rotation stop. 
    renderer.render(
        scene,
        camera
    ); // render, obviously.

    requestAnimationFrame(function () {
        update(renderer, scene, camera, controls);
    })  // what we did with the update was set up a function 
    // that gets recursively called by the requestAnimationFrame 
    // function about 60Hz

    controls.update()
    var plane = scene.getObjectByName('plane-1')

}

function getPointLight(intensity) {
    const light = new THREE.PointLight(0xffffff, intensity)
    light.castShadow = true

    return light
}

function getSpotLight(intensity) {
    const light = new THREE.SpotLight(0xffffff, intensity)
    light.castShadow = true
    light.shadow.bias = 0.01
    light.shadow.mapSize.width = 2048
    light.shadow.mapSize.height = 2048

    return light
}

function getDirectionalLight(intensity) {
    const light = new THREE.DirectionalLight(0xffffff, intensity)
    light.castShadow = true
    light.shadow.bias = 0.01
    light.shadow.mapSize.width = 2048
    light.shadow.mapSize.height = 2048
    light.shadow.camera.left = -10;
    light.shadow.camera.bottom = -10;
    light.shadow.camera.right = 10;
    light.shadow.camera.top = 10;

    return light
}

function getRectAreaLight(intensity) {
    const light = new THREE.RectAreaLight(0xffffff, intensity)
    light.castShadow = true
    light.shadow.bias = 0.01
    light.shadow.mapSize.width = 2048
    light.shadow.mapSize.height = 2048
    light.shadow.camera.left = -10;
    light.shadow.camera.bottom = -10;
    light.shadow.camera.right = 10;
    light.shadow.camera.top = 10;

    return light
}

function getAmbientLight(intensity) {
    const light = new THREE.DirectionalLight('rgb(10,30,50)', intensity)

    return light
}

function getBoxGrid(amount, separationMultiplier) {
    let group = new THREE.Group()

    for (let i = 0; i < amount; i++) {
        let obj = getBox(1, 1, 1)
        obj.position.x = i * separationMultiplier
        obj.position.y = obj.geometry.parameters.height / 2
        group.add(obj)
        for (let j = 1; j < amount; j++) {
            let obj = getBox(1, 1, 1)
            obj.position.x = i * separationMultiplier
            obj.position.y = obj.geometry.parameters.height / 2
            obj.position.z = j * separationMultiplier;
            group.add(obj)

        }
    }
    group.position.x = -(separationMultiplier * (amount - 1)) / 2;
    group.position.z = -(separationMultiplier * (amount - 1)) / 2;

    return group;
}

function getSphere(size) {
    const geometry = new THREE.SphereGeometry(size, 24, 24);     // second arguments are 
    // the width and segment 
    // values-- segment values 
    // determine smoothness


    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff
    });  // defines basic material and assigns it a color.

    const mesh = new THREE.Mesh(
        geometry,
        material
    ) // creates a mesh with the properties defines above

    return mesh
}

init();

