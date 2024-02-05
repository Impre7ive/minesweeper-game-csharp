import * as THREE from '/lib/three/three.module.js';
import { FontLoader } from '/lib/FontLoader.js';
import { TextGeometry } from '/lib/TextGeometry.js';

const lightSettings = {
	shadows: true,
	exposure: 0.666,
	bulbPower: 800,
	hemiIrradiance: 0.002
};

function initLightBulb() {
	let bulbGeometry = new THREE.SphereGeometry(0.02, 16, 8);
	let bulbLight = new THREE.PointLight(0xffee88, 1, 100, 2);
	let bulbMat = new THREE.MeshStandardMaterial({
		emissive: 0xffffee,
		emissiveIntensity: 1,
		color: 0x000000
	});

	bulbLight.add(new THREE.Mesh(bulbGeometry, bulbMat));
	bulbLight.position.set(0, 2, 0);
	bulbLight.castShadow = true;
	bulbLight.power = lightSettings.bulbPower;
	return bulbLight;
}

function initGlobalLight() {
	let globalLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.02);
	globalLight.intensity = lightSettings.hemiIrradiance;
	return globalLight;
}

function initCamera() {
	let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.rotation.order = 'YXZ';
	camera.position.x = -2.565230679216003;
	camera.position.y = 1.3418684617564827;
	camera.position.z = 0.04236508469651142;
	camera.rotation.x = 0.02;
	camera.rotation.y = -1.571516649246697;
	camera.rotation.z = 0;
	return camera;
}

function initFloor() {
	let floorMaterial = textureLoader.floorMaterial;
	let floorGeometry = new THREE.PlaneGeometry(20, 20);
	let floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
	floorMesh.receiveShadow = true;
	floorMesh.rotation.x = - Math.PI / 2.0;

	return floorMesh;
}

function initWall() {
	let boxGeometry = new THREE.BoxGeometry(1.5, 3.5, 4);
	let wallMaterial = textureLoader.wallMaterial;
	let boxMesh = new THREE.Mesh(boxGeometry, wallMaterial);
	boxMesh.position.set(0.76, 1.75, 0.1);
	boxMesh.castShadow = true;
	return boxMesh;
}

function initFace() {

	let faceGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.1);
	//https://stackoverflow.com/questions/59448382/threejs-transparent-png-textures-black
	faceGeometry.addGroup(0, Infinity, 0);
	faceGeometry.addGroup(0, Infinity, 1);
	let face = textureLoader.faceBoxMaterial;
	let faceMesh = new THREE.Mesh(faceGeometry, face);
	faceMesh.position.set(0.03, 2.8, 0.1);
	faceMesh.rotation.y = -Math.PI / 2
	faceMesh.castShadow = true;
	return faceMesh;
}
function initTimer() {
	let timetableGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.8);
	let timetableMaterial = new THREE.MeshStandardMaterial({
		color: 0x0000ff,
		metalness: 1, 
		roughness: 0.5
	});
	let timetableMesh = new THREE.Mesh(timetableGeometry, timetableMaterial);
	timetableMesh.position.set(0.03, 2.8, 0.9);
	timetableMesh.castShadow = true;

	let timerTextMesh = textLoader.initTimerMesh();
	textLoader.changeTextGeometry(timerTextMesh, '001', () => {
		gameScene.scene.add(timerTextMesh);
	});

	return timetableMesh;
}

function initMineCounter() {
	let minesCounterGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.8);
	let minesCounterMaterial = new THREE.MeshStandardMaterial({
		color: 0x0000ff,
		metalness: 1, // Set metalness to 1 for a metal appearance
		roughness: 0.5 // Adjust roughness to control the smoothness of the metal surface
	});
	let minesCounterMesh = new THREE.Mesh(minesCounterGeometry, minesCounterMaterial);
	minesCounterMesh.position.set(0.03, 2.8, -0.7);
	minesCounterMesh.castShadow = true;
	//Replace
	let mineCounterMesh = textLoader.initMineCounterMesh();
	textLoader.changeTextGeometry(mineCounterMesh, '015', () => {
		gameScene.scene.add(mineCounterMesh);
	});


	return minesCounterMesh;
} 

function initMineField() {
	let size = 2;
	let divisions = 12;
	let cellObjects = [];
	let parentObject = new THREE.Group();
	// Create clickable objects for each cell
	for (var i = 0; i < divisions; i++) {
		for (var j = 0; j < divisions; j++) {
			let geometry = new THREE.BoxGeometry(size / divisions, size / divisions, 0.1);	
			let material = new THREE.MeshStandardMaterial({
				color: 0xffffff,
				metalness: 1, 
				roughness: 0.5 
			});

			let cell = new THREE.Mesh(geometry, material);
			cell.castShadow = true;
			let offsetY = (size / divisions - 2.2 * size / (divisions)) * i + 2;
			let offsetZ = (size / divisions - 2.2 * size / (divisions)) * j;
			cell.position.set(0, offsetY, offsetZ);
			cell.rotation.y = Math.PI / 2;
			cell.userData = { row: i, column: j }; // Store row and column information
			//scene.add(cell);
			cellObjects.push(cell);
		}
	}

	cellObjects.forEach(function (object) {
		parentObject.add(object);
	});
	parentObject.position.x = 0.03;
	parentObject.position.y = 0.4;
	parentObject.position.z = 1.2;

	return parentObject;
}

function initRenderer() {
	let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, depth: true });
	renderer.toneMappingExposure = Math.pow(lightSettings.exposure, 5.0);
	renderer.shadowMap.enabled = true;
	renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	return renderer;
}


const textureLoader = {
	loader: new THREE.TextureLoader(),
	floorMaterial: null,
	wallMaterial: null,
	faceNormalMap: null,
	faceDeadMap: null,
	faceBoxMaterial: null,
	initStaticTextures: function () {
		this.floorMaterial = new THREE.MeshStandardMaterial({
			roughness: 0.8,
			color: 0xffffff,
			metalness: 0.2,
			bumpScale: 1
		});
		this.loader.load('textures/hardwood2_diffuse.jpg', (map) => {
			map.wrapS = THREE.RepeatWrapping;
			map.wrapT = THREE.RepeatWrapping;
			map.anisotropy = 4;
			map.repeat.set(10, 24);
			map.colorSpace = THREE.SRGBColorSpace;
			this.floorMaterial.map = map;
			this.floorMaterial.needsUpdate = true;
		});
		this.loader.load('textures/hardwood2_bump.jpg', (map) => {
			map.wrapS = THREE.RepeatWrapping;
			map.wrapT = THREE.RepeatWrapping;
			map.anisotropy = 4;
			map.repeat.set(10, 24);
			this.floorMaterial.bumpMap = map;
			this.floorMaterial.needsUpdate = true;
		});
		this.loader.load('textures/hardwood2_roughness.jpg', (map) => {
			map.wrapS = THREE.RepeatWrapping;
			map.wrapT = THREE.RepeatWrapping;
			map.anisotropy = 4;
			map.repeat.set(10, 24);
			this.floorMaterial.roughnessMap = map;
			this.floorMaterial.needsUpdate = true;
		});

		this.wallMaterial = new THREE.MeshStandardMaterial({
			roughness: 0.7,
			color: 0xffffff,
			bumpScale: 1,
			metalness: 0.2
		});
		this.loader.load('textures/brick_diffuse.jpg', (map) => {
			map.wrapS = THREE.RepeatWrapping;
			map.wrapT = THREE.RepeatWrapping;
			map.anisotropy = 4;
			map.repeat.set(1, 1);
			map.colorSpace = THREE.SRGBColorSpace;
			this.wallMaterial.map = map;
			this.wallMaterial.needsUpdate = true;
		});
		this.loader.load('textures/brick_bump.jpg', (map) => {
			map.wrapS = THREE.RepeatWrapping;
			map.wrapT = THREE.RepeatWrapping;
			map.anisotropy = 4;
			map.repeat.set(1, 1);
			this.wallMaterial.bumpMap = map;
			this.wallMaterial.bumpScale = 4.225;
			this.wallMaterial.needsUpdate = true;
		});

		this.faceNormalMap = this.loader.load('textures/smile.png', (map) => {
			map.anisotropy = 4;
			map.minFilter = THREE.LinearMipMapLinearFilter;
			map.magFilter = THREE.NearestFilter;
			map.needsUpdate = true;
		});

		this.faceDeadMap = this.loader.load('textures/smile-dead.png', (map) => {
			map.anisotropy = 4;
			map.minFilter = THREE.LinearMipMapLinearFilter;
			map.magFilter = THREE.NearestFilter;
			map.needsUpdate = true;
		});

		this.faceBoxMaterial = [
			new THREE.MeshStandardMaterial({
				color: 0xffffff,
				metalness: 1,
				roughness: 0.5,
			}),
			new THREE.MeshStandardMaterial({
				color: 0xffffff,
				metalness: 1,
				roughness: 0.5,
			}),
			new THREE.MeshStandardMaterial({
				color: 0xffffff,
				metalness: 1,
				roughness: 0.5,
			}),
			new THREE.MeshStandardMaterial({
				color: 0xffffff,
				metalness: 1,
				roughness: 0.5,
			}),
			new THREE.MeshBasicMaterial({ map: this.faceNormalMap, alphaTest: 0.5 }),
			new THREE.MeshStandardMaterial({
				color: 0xffffff,
				metalness: 1,
				roughness: 0.5,
			}),
			new THREE.MeshStandardMaterial({
				color: 0xffffff,
				metalness: 1,
				roughness: 0.5,
			})
		];
	}
}

const gameScene = {
	scene: new THREE.Scene(),
	container: document.getElementById('container'),
	timer: null,
	_currentTime: null,
	renderer: null,
	camera: null,
	lightBulb: null,
	globalLight: null,
	floor: null,
	wall: null,
	mineField: null,
	timetable: null,
	face: null,
	mineCounter: null,
	set currentTime(val) {
		this._currentTime += val;
	},
	get currentTime() {
		return String(this._currentTime).padStart(3, '0');
	},
	initScene: function () {
		this.scene = new THREE.Scene();
		this.scene.fog = new THREE.Fog(0x000000, 250, 1400);
		textureLoader.initStaticTextures();
		this.camera = initCamera();
		this.lightBulb = initLightBulb();
		this.globalLight = initGlobalLight();
		this.floor = initFloor();
		this.wall = initWall();
		this.mineField = initMineField();
		this.timetable = initTimer();
		this.face = initFace();
		this.mineCounter = initMineCounter();
		this.renderer = initRenderer();

		this.scene.add(this.lightBulb);
		this.scene.add(this.globalLight);
		this.scene.add(this.floor);
		this.scene.add(this.wall);
		this.scene.add(this.mineField);
		this.scene.add(this.timetable);
		this.scene.add(this.face);
		this.scene.add(this.mineCounter);

		this.container.appendChild(this.renderer.domElement);
		window.addEventListener('resize', onWindowResize);
		document.addEventListener('mousedown', onDocumentMouseDown, false);
		this.startTimer();
	},
	startTimer() {
		this.currentTime = 0;
		this.timer = setInterval(() => {
			this.currentTime = 1;
			let time = this.currentTime;	
			textLoader.changeTextGeometry(textLoader.timerMesh, time);
		}, 1000);
	}
}

const textLoader = {
	loader: new FontLoader(),
	timerMesh: null,
	mineCounterMesh: null,
	textMaterials: [ // text
		new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
		new THREE.MeshPhongMaterial({ color: 0xffffff }) // side
	],
	font: '/fonts/droid_sans_regular.typeface.json',
	initTimerMesh: function () {
		let textGeo = new TextGeometry('000');
		let textMesh = new THREE.Mesh(textGeo, this.textMaterials);
		textMesh.position.set(0.07, 2.65, 0.55);
		textMesh.rotation.y = -Math.PI / 2;
		this.timerMesh = textMesh;
		return textMesh;

	},
	initMineCounterMesh: function () {
		let textGeo = new TextGeometry('000');
		let textMesh = new THREE.Mesh(textGeo, this.textMaterials);
		textMesh.position.set(0.07, 2.65, -1.04);
		textMesh.rotation.y = -Math.PI / 2;
		this.mineCounterMesh = textMesh;
		return textMesh;

	},
	changeTextGeometry: function (mesh, text, callback) {
		this.loader.load(this.font, function (loadedFont) {
			let textGeo = new TextGeometry(text, {
				font: loadedFont,
				size: 0.3,
				height: 0.1,
				curveSegments: 4,
				bevelThickness: 0.001,
				bevelSize: 0.005,
				bevelEnabled: true
			});

			textGeo.computeBoundingBox();

			mesh.geometry.dispose();
			mesh.geometry = textGeo;
			mesh.geometry.needsUpdate = true;

			if (typeof callback === 'function') {
				callback();
			}
		});
	}
}

gameScene.initScene();
animate();

function onDocumentMouseDown(event) {
	event.preventDefault();
	var mouse = new THREE.Vector2();
	mouse.x = (event.clientX / gameScene.renderer.domElement.clientWidth) * 2 - 1;
	mouse.y = - (event.clientY / gameScene.renderer.domElement.clientHeight) * 2 + 1;

	if (textureLoader.faceBoxMaterial[4].map === textureLoader.faceDeadMap) {
		textureLoader.faceBoxMaterial[4].map = textureLoader.faceNormalMap;

	} else {
		textureLoader.faceBoxMaterial[4].map = textureLoader.faceDeadMap;
	}

	textureLoader.faceBoxMaterial[4].needsUpdate = true;

	var raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(mouse, gameScene.camera);

	var intersects = raycaster.intersectObjects([gameScene.mineField], true);
	if (intersects.length > 0) {
		var cell = intersects[0].object;
		console.log(cell.userData);
		// Change the color of the clicked cell
		cell.material.color.set(0xff0000); // Set the color to red
	}
}


function onWindowResize() {
	gameScene.camera.aspect = window.innerWidth / window.innerHeight;
	gameScene.camera.updateProjectionMatrix();
	gameScene.renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	requestAnimationFrame(animate);
	render();
}

function render() {
	let time = Date.now() * 0.0005;
	let x = 0.2 * Math.sin(time) * 2 - 3;
	let z = Math.cos(time) * 2;

	gameScene.lightBulb.position.set(x, 2, z);
	gameScene.renderer.render(gameScene.scene, gameScene.camera);
}