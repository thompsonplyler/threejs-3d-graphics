function init() {
    // const gui = new dat.GUI()
    const scene = new THREE.Scene();
    const boxGrid = getBoxGrid(10, 1.5) // defines dimensions of box for the scene
    // box.position.y = 0.5; // this elevates the box above the plane, but it only works when the box is 1 height.
    // box.position.y = box.geometry.parameters.height / 2; // this works regardless of the height of the box. 
    const sphere = getSphere(.05)
    const plane = getPlane(80)
    const loader = new THREE.OBJLoader(); // used to ingest a model later.
    const textureLoader = new THREE.TextureLoader(); // used to apply textures to a model
    const map = textureLoader.load('./model/rab-obj/textures/rabadon_diffuse.tga.png') // defines texture in variable for later
    const emissive = textureLoader.load('./model/rab-obj/textures/rabadon_emissive.tga.png') // defines texture in variable for later

    // defines material to be used in loaded object. Property names
    // correspond to names variables, but variables could be x, y, or squirrel.
    const material = new THREE.MeshPhongMaterial({ map: map, emissive: emissive });
    material.name = "material"


    // loader calls OBJ file. Errors with OBJLoader2 and GLTFLoader, but
    // principle is the same. 
    loader.load('model/rab-obj/source/rabadonhatfinished.obj', object => {

        // looks for .isMesh property in the array of nodes in the object
        // if true, assigns it the material defined above.
        object.traverse(function (node) {
            if (node.isMesh) node.material = material
        })

        // scaling/rotation tools for presentation | different for any project
        let scaleVal = 0.1
        object.scale.x = scaleVal
        object.scale.y = scaleVal
        object.scale.z = scaleVal
        object.rotation.y = 10

        scene.add(object)
    });

    // currently irrelevant as plane is not being called, but this defines flat plane
    plane.rotation.x = 90 // rotate the plane 90 radians around its x-axis
    plane.rotation.x = Math.PI / 2 // rotate the plane 90 DEGREES around its x-axis
    plane.name = 'plane-1';
    //

    enableFog = false
    if (enableFog) { scene.fog = new THREE.FogExp2(0xffffff, 0.02) }

    const directionalLight = getDirectionalLight(1)
    directionalLight.add(sphere)
    directionalLight.position.x = 13
    directionalLight.position.y = 10
    directionalLight.position.z = 10


    const ambientLight = getAmbientLight(1)
    scene.add(ambientLight)

    // scene.add(plane); // adds the plane to the scene
    // scene.add(boxGrid); // adds the box as a child of the plane
    scene.add(directionalLight)

    // helper shows where the light is aiming, but shouldn't be used in production
    // const helper = new THREE.CameraHelper(directionalLight.shadow.camera)

    const camera = new THREE.PerspectiveCamera(
        45, //fov
        window.innerWidth / window.innerHeight, //aspect
        1, // near clipping plane
        1000 // far clipping plane
    ); // defines camera for the scene

    // scene.add(helper)

    directionalLight.position.y = 2

    // gui.add(directionalLight, 'intensity', 0, 10)
    // gui.add(directionalLight.position, 'y', 0, 20)
    // gui.add(directionalLight.position, 'x', 0, 20)
    // gui.add(directionalLight.position, 'z', 0, 20)
    // gui.add(directionalLight, 'penumbra', 0, 1)
    // gui.add(material, "opacity", 0, 1)


    // below sets up camera rig for precision control
    // incidentally, breaks OrbitControls.

    const cameraZPosition = new THREE.Group();
    const cameraYPosition = new THREE.Group();
    const cameraYRotation = new THREE.Group();
    const cameraXRotation = new THREE.Group();
    const cameraZRotation = new THREE.Group();
    cameraXRotation.name = "cameraXRotation";
    cameraYRotation.name = "cameraYRotation";
    cameraYPosition.name = "cameraZPosition";
    cameraZPosition.name = "cameraZPosition";
    cameraZRotation.name = "cameraZRotation";

    cameraZPosition.position.z = 100
    cameraZPosition.position.y = 1

    cameraZRotation.add(camera)
    cameraYPosition.add(cameraZRotation)
    cameraZPosition.add(cameraYPosition)
    cameraXRotation.add(cameraZPosition)
    cameraYRotation.add(cameraXRotation)
    scene.add(cameraYRotation)

    new TWEEN.Tween({ val: 100 })
        .to({ val: 15 }, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function () {
            cameraZPosition.position.z = this.val
        })
        .start()

    new TWEEN.Tween({ val: 0 })
        .to({ val: 1 }, 400)
        .onUpdate(function () {
            material.opacity = this.val
        })
        .start()

    new TWEEN.Tween({ val: 1.3 })
        .to({ val: -.05 }, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function () {
            cameraYRotation.rotation.y = this.val
        })
        .start()

    // gui.add(cameraZPosition.position, "z", 0, 100)
    // gui.add(cameraYRotation.rotation, "y", -Math.PI, Math.PI)
    // gui.add(cameraXRotation.rotation, "x", -Math.PI, Math.PI)

    // end precision control 




    const renderer = new THREE.WebGLRenderer({ alpha: true }); // use WebGL instead of SVG or canvas

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

    let cameraZPosition = scene.getObjectByName("cameraZPosition")
    TWEEN.update();

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

