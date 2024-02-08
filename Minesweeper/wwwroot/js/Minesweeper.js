import * as THREE from '/lib/three/three.module.js';
import { FontLoader } from '/lib/FontLoader.js';
import { TextGeometry } from '/lib/TextGeometry.js';

const light = {
	shadows: true,
	exposure: 0.666,
	bulbPower: 800,
	hemiIrradiance: 0.002,
	lightBulb: null,
	globalLight: null,
	initLightBulb: function() {
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
		bulbLight.power = this.bulbPower;
		this.lightBulb = bulbLight;
	},
	initGlobalLight: function() {
		let globalLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.02);
		globalLight.intensity = this.hemiIrradiance;
		this.globalLight = globalLight;
	}
};

const visualization = {
	renderer: null,
	camera: null,
	container: document.getElementById('container'),
	initRenderer: function () {
		let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, depth: true });
		renderer.toneMappingExposure = Math.pow(light.exposure, 5.0);
		renderer.shadowMap.enabled = true;
		renderer.toneMapping = THREE.ReinhardToneMapping;
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		this.container.appendChild(renderer.domElement);
		window.addEventListener('resize', visualization.onWindowResize);
		this.renderer = renderer;
	},
	initCamera: function() {
		let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.rotation.order = 'YXZ';
		camera.position.x = -2.565230679216003;
		camera.position.y = 1.3418684617564827;
		camera.position.z = 0.04236508469651142;
		camera.rotation.x = 0.02;
		camera.rotation.y = -1.571516649246697;
		camera.rotation.z = 0;
		this.camera = camera;
	},
	render: function () {
		let time = Date.now() * 0.0005;
		let x = 0.2 * Math.sin(time) * 2 - 3;
		let z = Math.cos(time) * 2;

		light.lightBulb.position.set(x, 2, z);
		this.renderer.render(gameScene.scene, this.camera);
	},
	onWindowResize: function () {
		visualization.camera.aspect = window.innerWidth / window.innerHeight;
		visualization.camera.updateProjectionMatrix();
		visualization.renderer.setSize(window.innerWidth, window.innerHeight);
	},
	animate: function() {
		requestAnimationFrame(() => this.animate());
		this.render();
	}
};

const sceneObjects = {
	floor: null,
	wall: null,
	mineField: null,
	timetable: null,
	face: null,
	mineCounter: null,
	timerMesh: null,
	mineCounterMesh: null,
	initFloor: function() {
		let floorMaterial = textureLoader.floorMaterial;
		let floorGeometry = new THREE.PlaneGeometry(20, 20);
		let floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
		floorMesh.receiveShadow = true;
		floorMesh.rotation.x = - Math.PI / 2.0;
		this.floor = floorMesh;
	},
	initWall: function() {
		let boxGeometry = new THREE.BoxGeometry(1.5, 3.5, 4);
		let wallMaterial = textureLoader.wallMaterial;
		let boxMesh = new THREE.Mesh(boxGeometry, wallMaterial);
		boxMesh.position.set(0.76, 1.75, 0.1);
		boxMesh.castShadow = true;
		this.wall = boxMesh;
	},
	initFace: function() {
		let faceGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.1);
		//https://stackoverflow.com/questions/59448382/threejs-transparent-png-textures-black
		faceGeometry.addGroup(0, Infinity, 0);
		faceGeometry.addGroup(0, Infinity, 1);
		let face = textureLoader.faceBoxMaterial;
		let faceMesh = new THREE.Mesh(faceGeometry, face);
		faceMesh.position.set(0.03, 2.8, 0.1);
		faceMesh.rotation.y = -Math.PI / 2
		faceMesh.castShadow = true;
		this.face = faceMesh;
	},
	initTimer: function() {
		let timetableGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.8);
		let timetableMaterial = new THREE.MeshStandardMaterial({
			color: 0x0000ff,
			metalness: 1,
			roughness: 0.5
		});
		let timetableMesh = new THREE.Mesh(timetableGeometry, timetableMaterial);
		timetableMesh.position.set(0.03, 2.8, 0.9);
		timetableMesh.castShadow = true;

		this.timerMesh = textLoader.initTimerMesh();

		let group = new THREE.Group();
		group.add(this.timerMesh);
		group.add(timetableMesh);

		textLoader.changeTextGeometry(this.timerMesh, '000', () => {});

		this.timetable = group;
	},
	initMineCounter: function() {
		let minesCounterGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.8);
		let minesCounterMaterial = new THREE.MeshStandardMaterial({
			color: 0x0000ff,
			metalness: 1, 
			roughness: 0.5 
		});
		let minesCounterMesh = new THREE.Mesh(minesCounterGeometry, minesCounterMaterial);
		minesCounterMesh.position.set(0.03, 2.8, -0.7);
		minesCounterMesh.castShadow = true;

		this.mineCounter = textLoader.initMineCounterMesh();

		let group = new THREE.Group();
		group.add(this.mineCounter);
		group.add(minesCounterMesh);

		textLoader.changeTextGeometry(this.mineCounter, '010', () => {});

		this.mineCounter = group;
	},
	initMineField: function() {
		let size = 2;
		let divisions = 12;
		let cellObjects = [];
		let parentObject = new THREE.Group();
		// Create clickable objects for each cell
		for (let i = 0; i < divisions; i++) {
			for (let j = 0; j < divisions; j++) {
				let geometry = new THREE.BoxGeometry(size / divisions, size / divisions, 0.1);
				/*	let material = new THREE.MeshStandardMaterial({
						color: 0xffffff,
						metalness: 1, 
						roughness: 0.5 
					});*/

				geometry.addGroup(0, Infinity, 0);
				geometry.addGroup(0, Infinity, 1);

				let mat = [
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
					new THREE.MeshStandardMaterial({
						color: 0xffffff,
						metalness: 1,
						roughness: 0.5,
					}),
					//new THREE.MeshBasicMaterial({ map: textureLoader.faceNormalMap, alphaTest: 0.5 }),
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

				let cell = new THREE.Mesh(geometry, mat);
				cell.castShadow = true;
				let offsetY = (size / divisions - 2.2 * size / (divisions)) * i + 2;
				let offsetZ = (size / divisions - 2.2 * size / (divisions)) * j;
				cell.position.set(0, offsetY, offsetZ);
				cell.rotation.y = -Math.PI / 2;
				cell.rotation.z = -Math.PI / 2;



				cell.userData = { x: i, y: j }; // Store row and column information
				//scene.add(cell);
				cellObjects.push(cell);
			}
		}

		cellObjects.forEach(function (object) {
			parentObject.add(object);
		});
		parentObject.position.x = 0.03;
		parentObject.position.y = 2.4;
		parentObject.position.z = 1.0;

		parentObject.rotation.x = -Math.PI / 2;

		this.mineField = parentObject;
	}
};

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
	timer: null,
	_currentTime: null,
	lightBulb: null,
	globalLight: null,
	isAudioActive: false,
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

		light.initLightBulb();
		light.initGlobalLight();

		sceneObjects.initFloor();
		sceneObjects.initWall();
		sceneObjects.initMineField();
		sceneObjects.initTimer();
		sceneObjects.initFace();
		sceneObjects.initMineCounter();

		this.scene.add(light.lightBulb);
		this.scene.add(light.globalLight);
		this.scene.add(sceneObjects.floor);
		this.scene.add(sceneObjects.wall);
		this.scene.add(sceneObjects.mineField);
		this.scene.add(sceneObjects.timetable);
		this.scene.add(sceneObjects.face);
		this.scene.add(sceneObjects.mineCounter);


		document.addEventListener('mousedown', this.onDocumentMouseDown);
		document.addEventListener('mousemove', this.backgroundMusic);
		this.startTimer();

		visualization.initCamera();
		visualization.initRenderer();
		visualization.animate();
	},
	startTimer() {
		this.currentTime = 0;
		this.timer = setInterval(() => {
			this.currentTime = 1;
			let time = this.currentTime;	
			textLoader.changeTextGeometry(sceneObjects.timerMesh, time);
		}, 1000);
	},
	onDocumentMouseDown: function(event) {
		event.preventDefault();

		let mouse = new THREE.Vector2();
		mouse.x = (event.clientX / visualization.renderer.domElement.clientWidth) * 2 - 1;
		mouse.y = - (event.clientY / visualization.renderer.domElement.clientHeight) * 2 + 1;

		if (textureLoader.faceBoxMaterial[4].map === textureLoader.faceDeadMap) {
			textureLoader.faceBoxMaterial[4].map = textureLoader.faceNormalMap;

		} else {
			textureLoader.faceBoxMaterial[4].map = textureLoader.faceDeadMap;
		}

		textureLoader.faceBoxMaterial[4].needsUpdate = true;

		let raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, visualization.camera);

		let intersects = raycaster.intersectObjects([sceneObjects.mineField], true);
		if (intersects.length > 0) {
			let cell = intersects[0].object;

			let tmp = api.checkCell(cell.userData, (result) => {
				console.log(result);

				if (result.isExplosion) {

					result.cells.forEach((cell) => {
						gameScene.ExplosionSound();
						sceneObjects.mineField.children[(cell.Column * 12) + cell.Row].material[4] = new THREE.MeshBasicMaterial({ map: textureLoader.faceNormalMap, alphaTest: 0.5 }); //.color.set();//0xff0000
					});
				}
				else {
					result.cells.forEach((cell) => {
						let color = 0x0000ff;

						switch (cell.MinesAround) {
							case 0:
								color = 0x00333366;
								break;
							case 1:
								color = 0x000099FF;
								break;
							case 2:
								color = 0x0000CC00;
								break;
							case 3:
								color = 0x00FF0000;
								break;
							case 4:
								color = 0x0000ff;
								break;
							case 5:
								color = 0x00990000;
								break;
							case 6:
								color = 0x0066FFFF;
								break;
							case 7:
								color = 0x00000000;
								break;
							case 8:
								color = 0x00FF0066;
								break;
						}

						sceneObjects.mineField.children[(cell.Column * 12) + cell.Row].material[4].color.set(color);
					});
				}

				//MinesAround

			});

	/*		if (result.isGameOver && result.isExplosion) {
				//
			}

			if (result.isGameOver && !result.isExplosion) {
				alert('You win');
			}*/

			//cell.material[1].color.set(0xff0000); // Set the color to red
			/*	cell.material[1] = new THREE.MeshStandardMaterial({
					color: 0x00ffff,
					metalness: 1,
					roughness: 0.5,
				});*/
		}
	},
	backgroundMusic: function() {
		if (!gameScene.isAudioActive) {
			var audio = new Audio();
			audio.src = '/audio/background.mp3';
			audio.autoplay = true;
			audio.loop = true;
			audio.volume = 0.5;
			document.body.appendChild(audio);
			gameScene.isAudioActive = true;
		}
	},
	ExplosionSound: function() {
		var audio = new Audio();
		audio.src = '/audio/explosion.mp3';
		audio.autoplay = true;
		audio.volume = 0.1;
		document.body.appendChild(audio);
	}
}

const textLoader = {
	loader: new FontLoader(), 
	font: '/fonts/droid_sans_regular.typeface.json',
	textMaterials: [ 
		new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }), 
		new THREE.MeshPhongMaterial({ color: 0xffffff }) 
	],
	initTimerMesh: function () {
		let textGeo = new TextGeometry('');
		let textMesh = new THREE.Mesh(textGeo, this.textMaterials);
		textMesh.position.set(0.07, 2.65, 0.55);
		textMesh.rotation.y = -Math.PI / 2;
		textMesh.visible = false;
		return textMesh;
	},
	initMineCounterMesh: function () {
		let textGeo = new TextGeometry('');
		let textMesh = new THREE.Mesh(textGeo, this.textMaterials);
		textMesh.position.set(0.07, 2.65, -1.04);
		textMesh.rotation.y = -Math.PI / 2;
		textMesh.visible = false;
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
			mesh.visible = true;

			if (typeof callback === 'function') {
				callback();
			}
		});
	}
}


gameScene.initScene();
let api = new ApiClient(12, 5);
api.startGame();