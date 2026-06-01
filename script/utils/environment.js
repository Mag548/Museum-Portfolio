import { PALETTE } from "../museum/constants.js";

export default class MuseumEnvironment {
    constructor() {
        scene.background = new THREE.Color(PALETTE.cream);
        scene.fog = new THREE.Fog(PALETTE.cream, 45, 95);

        this.ambient = new THREE.AmbientLight(0xfff8f0, 0.75);
        scene.add(this.ambient);

        this.hemi = new THREE.HemisphereLight(0xfff5e8, 0x8b7355, 0.45);
        scene.add(this.hemi);

        this.keyLight = new THREE.DirectionalLight(0xfff0dc, 1.1);
        this.keyLight.position.set(8, 18, 12);
        this.keyLight.castShadow = true;
        this.keyLight.shadow.camera.near = 1;
        this.keyLight.shadow.camera.far = 55;
        this.keyLight.shadow.camera.left = -22;
        this.keyLight.shadow.camera.right = 22;
        this.keyLight.shadow.camera.top = 22;
        this.keyLight.shadow.camera.bottom = -22;
        this.keyLight.shadow.mapSize.set(1024, 1024);
        this.keyLight.shadow.bias = -0.0002;
        scene.add(this.keyLight);

        this.fillLight = new THREE.DirectionalLight(0xffe8cc, 0.35);
        this.fillLight.position.set(-10, 8, -8);
        scene.add(this.fillLight);

        this.entranceLight = new THREE.SpotLight(0xfff4e0, 4, 35, toRadian(45), 0.6, 1.2);
        this.entranceLight.position.set(0, 10, 16);
        this.entranceLight.target.position.set(0, 1, 22);
        scene.add(this.entranceLight);
        scene.add(this.entranceLight.target);

        const hallLight = new THREE.PointLight(0xfff8f0, 1.8, 40, 1.2);
        hallLight.position.set(0, 9, 0);
        scene.add(hallLight);
    }
}
