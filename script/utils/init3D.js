import * as THREE from "../three/build/three.module.js";
window.THREE = THREE;
import { OrbitControls } from "../three/examples/jsm/controls/OrbitControls.js";
import Loader from "./loader.js";

const canvas = document.querySelector(".render-container > canvas");
const loadingOverlay = document.querySelector(".loader");

export default () => {
    window.scene = new THREE.Scene();
    window.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 120);
    window.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance",
    });

    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.55;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    new Loader(loadingOverlay).load();

    const orbitControls = new OrbitControls(camera, canvas);
    orbitControls.enablePan = false;
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.06;
    orbitControls.rotateSpeed = 0.35;
    orbitControls.enableZoom = true;
    orbitControls.zoomSpeed = 0.85;
    orbitControls.enabled = true;

    orbitControls.target.set(0, 4, 24);
    camera.position.set(0, 3.5, 32);
    orbitControls.update();

    window.controls = orbitControls;
    return orbitControls;
};
