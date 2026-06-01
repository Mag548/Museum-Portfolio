import { controls } from "../index.js";

export default class Resizer {
    constructor(renderer, camera) {
        this.renderer = renderer;
        this.camera = camera;
        this.controlsMaxDistance = controls.maxDistance;
        window.addEventListener("resize", this.resize);
        window.addEventListener("orientationchange", this.resize);
        this.resize();
    }

    resize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const pixelRatio = Math.min(window.devicePixelRatio, 2);

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(pixelRatio);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        const mobileAgents = [/android/i, /webos/i, /iphone/i, /ipad/i, /ipod/i, /blackberry/i, /windows phone/i];
        const aspect = width / height;
        const isMobile = mobileAgents.some((agent) => navigator.userAgent.match(agent));

        if (aspect < 1 || isMobile) {
            controls.maxDistance = 26;
            if (isMobile && aspect < 1) {
                openModal("mobile-alert");
            }
        } else {
            controls.maxDistance = this.controlsMaxDistance || 22;
        }
    };
}
