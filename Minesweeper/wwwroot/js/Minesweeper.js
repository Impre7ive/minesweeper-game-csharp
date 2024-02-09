import * as THREE from '/lib/three/three.module.js';
import { FontLoader } from '/lib/FontLoader.js';
import { TextGeometry } from '/lib/TextGeometry.js';

let api;
let gameInitialParameters = {
	mines: 15,
	fieldSize: 10
};

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
	},
	getCursorCollisionsWithGameField: function (event, object) {
		let mouse = new THREE.Vector2();
		mouse.x = (event.clientX / visualization.renderer.domElement.clientWidth) * 2 - 1;
		mouse.y = - (event.clientY / visualization.renderer.domElement.clientHeight) * 2 + 1;

		let raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, this.camera);

		return raycaster.intersectObjects([object], true);	
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
	exitButton: null,
	exitButtonTextMesh: null,
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

		textLoader.changeTextGeometry(this.timerMesh, '000', () => { });

		this.timetable = group;
	},
	initExitButton: function() {
		let minesCounterGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.7);
		let minesCounterMaterial = new THREE.MeshStandardMaterial({
			color: 0x0000ff,
			metalness: 1, 
			roughness: 0.5 
		});

		let exitButtonMesh = new THREE.Mesh(minesCounterGeometry, minesCounterMaterial);
		exitButtonMesh.position.set(0.03, 0.34, -1.5);
		exitButtonMesh.castShadow = true;
		this.exitButtonTextMesh = textLoader.initExitMesh();

		let group = new THREE.Group();
		group.add(this.exitButtonTextMesh);
		group.add(exitButtonMesh);

		textLoader.changeTextGeometry(this.exitButtonTextMesh, 'Exit', () => {});

		this.exitButton = group;
	},
	initMineCounter: function () {
		let minesCounterGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.8);
		let minesCounterMaterial = new THREE.MeshStandardMaterial({
			color: 0x0000ff,
			metalness: 1,
			roughness: 0.5
		});

		let minesCounterMesh = new THREE.Mesh(minesCounterGeometry, minesCounterMaterial);
		minesCounterMesh.position.set(0.03, 2.8, -0.7);
		minesCounterMesh.castShadow = true;
		this.mineCounterMesh = textLoader.initMineCounterMesh();

		let group = new THREE.Group();
		group.add(this.mineCounterMesh);
		group.add(minesCounterMesh);

		textLoader.changeTextGeometry(this.mineCounterMesh, '010', () => { });

		this.mineCounter = group;
	},
	initMineField: function() {
		let divisions = gameInitialParameters.fieldSize;
		let size = 2.36 / divisions;
		let cellObjects = [];
		let parentObject = new THREE.Group();

		for (let i = 0; i < divisions; i++) {
			for (let j = 0; j < divisions; j++) {
				let geometry = new THREE.BoxGeometry(size, size, 0.1);
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

				let offsetY = size * i; 
				let offsetZ = size * j;

				cell.position.set(0, offsetY, offsetZ);
				cell.rotation.y = -Math.PI / 2;
				cell.rotation.z = -Math.PI / 2;

				cell.userData = { x: i, y: j }; 
				cellObjects.push(cell);
			}
		}

		cellObjects.forEach(function (object) {
			parentObject.add(object);
		});

		parentObject.position.x = 0;
		parentObject.position.y = 0.28;
		parentObject.position.z = 1.16;
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
	faceScaredMap: null,
	mineMap: null,
	defaultCellMesh: null,
	flagMap: null,
	pickColor: function (cell) {
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

		return color;
	},
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

		this.faceNormalMap = this.loader.load('textures/normal.png', (map) => {
			map.anisotropy = 4;
			map.minFilter = THREE.LinearMipMapLinearFilter;
			map.magFilter = THREE.NearestFilter;
			map.needsUpdate = true;
		});

		this.faceDeadMap = this.loader.load('textures/dead.png', (map) => {
			map.anisotropy = 4;
			map.minFilter = THREE.LinearMipMapLinearFilter;
			map.magFilter = THREE.NearestFilter;
			map.needsUpdate = true;
		});

		this.faceScaredMap = this.loader.load('textures/scared.png', (map) => {
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

		this.mineMap = this.loader.load('textures/mine.png');

		this.defaultCellMesh = new THREE.MeshStandardMaterial({
			color: 0xffffff,
			metalness: 1,
			roughness: 0.5,
		});

		this.flagMap = this.loader.load('textures/flag.png');
	}
}

const gameScene = {
	scene: new THREE.Scene(),
	timer: null,
	minesLeft: 0,
	currentTime: null,
	lightBulb: null,
	globalLight: null,
	isAudioActive: false,
	isGameOver: false,
	getTabloNumber: function(number) {
		return String(number).padStart(3, '0');
	},
	initScene: function () {
		this.scene = new THREE.Scene();
		this.scene.fog = new THREE.Fog(0x000000, 250, 1400);

		light.initLightBulb();
		light.initGlobalLight();

		textureLoader.initStaticTextures();

		sceneObjects.initFloor();
		sceneObjects.initWall();
		sceneObjects.initMineField();
		sceneObjects.initTimer();
		sceneObjects.initFace();
		sceneObjects.initMineCounter();
		sceneObjects.initExitButton();

		this.scene.add(light.lightBulb);
		this.scene.add(light.globalLight);
		this.scene.add(sceneObjects.floor);
		this.scene.add(sceneObjects.wall);
		this.scene.add(sceneObjects.mineField);
		this.scene.add(sceneObjects.timetable);
		this.scene.add(sceneObjects.face);
		this.scene.add(sceneObjects.mineCounter);
		this.scene.add(sceneObjects.exitButton);

		document.addEventListener('mouseup', this.onDocumentMouseUp);
		document.addEventListener('mouseup', this.exitApp);
		document.addEventListener('mousedown', this.setScaredFace);

		this.setNormalFace();
		this.startTimer();
		this.adjustMineCounter(gameInitialParameters.mines);
		this.backgroundMusic();

		visualization.initCamera();
		visualization.initRenderer();
		visualization.animate();
	},
	exitApp: function (event) {
		let collisions = visualization.getCursorCollisionsWithGameField(event, sceneObjects.exitButton);

		if (collisions.length > 0) {
			var audio = new Audio();
			audio.src = '/audio/exit.mp3';
			audio.autoplay = true;
			audio.volume = 0.5;
			document.body.appendChild(audio);

			setTimeout(() => {
				window.location.reload();
			}, 1500);
		}
	},
	adjustMineCounter: function (mines) {
		let mineCounter = this.getTabloNumber(mines);
		this.minesLeft = mines;
		textLoader.changeTextGeometry(sceneObjects.mineCounterMesh, mineCounter);
	},
	startTimer: function() {
		this.currentTime = 0;

		this.timer = setInterval(() => {
			this.currentTime++;
			let time = this.getTabloNumber(this.currentTime);	
			textLoader.changeTextGeometry(sceneObjects.timerMesh, time);
		}, 1000);
	},
	stopTimer: function () {
		clearInterval(this.timer);
	},
	setScaredFace: function (event) {
		event.preventDefault();

		if (event.button === 0) {
			let collisions = visualization.getCursorCollisionsWithGameField(event, sceneObjects.mineField);

			if (textureLoader.faceBoxMaterial[4].map !== textureLoader.faceScaredMap && !gameScene.isGameOver && collisions.length > 0) {
				textureLoader.faceBoxMaterial[4].map = textureLoader.faceScaredMap;
				textureLoader.faceBoxMaterial[4].needsUpdate = true;
			}
		}
	},
	setNormalFace: function () {
		if (textureLoader.faceBoxMaterial[4].map !== textureLoader.faceNormalMap) {
			textureLoader.faceBoxMaterial[4].map = textureLoader.faceNormalMap;
		}

		textureLoader.faceBoxMaterial[4].needsUpdate = true;
	},
	setDeadFace: function () {
		if (textureLoader.faceBoxMaterial[4].map !== textureLoader.faceDeadMap) {
			textureLoader.faceBoxMaterial[4].map = textureLoader.faceDeadMap;
		}

		textureLoader.faceBoxMaterial[4].needsUpdate = true;
	},
	onDocumentMouseUp: function(event) {
		event.preventDefault();
		
		let collisions = visualization.getCursorCollisionsWithGameField(event, sceneObjects.mineField);

		if (collisions.length > 0) {
			let cell = collisions[0].object;

			if (event.button === 0) {
				api.checkCell(cell.userData, (result) => {
					if (result.isGameOver && result.isExplosion) {
						gameScene.defeatActions(result);
					} else if (result.isGameOver && !result.isExplosion) {
						gameScene.victoryActions();
					} else {
						gameScene.revealCells(result);
					}
				});
			} else if (event.button === 2 && !gameScene.isGameOver) {
				gameScene.swapFlag(cell);
			}
		} else {
			if (!gameScene.isGameOver) {
				gameScene.setNormalFace();
			}
		}
	},
	swapFlag: function (cell) {
		if (!cell.userData.isFlagged && !cell.userData.isOpen) {
			cell.userData.isFlagged = true;
			cell.material[4] = new THREE.MeshBasicMaterial({ map: textureLoader.flagMap, alphaTest: 0.5 });
			gameScene.minesLeft -= 1;
			gameScene.adjustMineCounter(gameScene.minesLeft);
		} else if (cell.userData.isFlagged && !cell.userData.isOpen) {
			cell.userData.isFlagged = false;
			cell.material[4] = textureLoader.defaultCellMesh;
			gameScene.minesLeft += 1;
			gameScene.adjustMineCounter(gameScene.minesLeft);
		}
	},
	defeatActions: function (resultCells) {
		gameScene.isGameOver = true;

		resultCells.cells.forEach((cell, i) => {
			gameScene.setDeadFace();
			gameScene.stopTimer();

			setTimeout(() => {
				gameScene.ExplosionSound();
				sceneObjects.mineField.children[(cell.Column * gameInitialParameters.fieldSize) + cell.Row].material[4] = new THREE.MeshBasicMaterial({ map: textureLoader.mineMap, alphaTest: 0.5 });
			}, i * 500);
		});
	},
	victoryActions: function () {
		gameScene.isGameOver = true;
		gameScene.setNormalFace();
		gameScene.stopTimer();
		alert('You win:)');
	},
	revealCells: function (resultCells) {
		gameScene.setNormalFace();

		resultCells.cells.forEach((cell) => {
			let index = (cell.Column * gameInitialParameters.fieldSize) + cell.Row;

			if (sceneObjects.mineField.children[index].userData.isFlagged) {
				sceneObjects.mineField.children[index].userData.isFlagged = false;
				sceneObjects.mineField.children[index].material[4] = new THREE.MeshStandardMaterial({
					color: 0xffffff,
					metalness: 1,
					roughness: 0.5,
				});

				gameScene.minesLeft += 1;
				gameScene.adjustMineCounter(gameScene.minesLeft);
			}

			let color = textureLoader.pickColor(cell);
			sceneObjects.mineField.children[index].userData.isOpen = true;
			sceneObjects.mineField.children[index].material[4].color.set(color);
		});
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
		audio.volume = 0.5;
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
	initExitMesh: function () {
		let textGeo = new TextGeometry('');
		let textMesh = new THREE.Mesh(textGeo, this.textMaterials);
		textMesh.position.set(0.07, 0.2, -1.85);
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


document.getElementById('minesweeper-form').addEventListener('submit', function (event) {
	event.preventDefault();

	let selectedOption = document.querySelector('input[name="option"]:checked').value;

	this.classList.add('hidden');
	document.getElementById('container').classList.remove('hidden');

	gameInitialParameters.mines = selectedOption;
	gameScene.initScene();
	api = new ApiClient(gameInitialParameters.fieldSize, gameInitialParameters.mines);
	api.startGame();
});

document.addEventListener("contextmenu", function (event) {
	event.preventDefault(); 
});