import { PALETTE } from "./constants.js";

export default class Particles {
    constructor(scene, count = 80) {
        this.count = window.innerWidth < 768 ? Math.floor(count * 0.4) : count;
        this.group = new THREE.Group();
        this.group.name = "ambient-particles";

        const positions = new Float32Array(this.count * 3);
        const speeds = [];

        for (let i = 0; i < this.count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 28;
            positions[i * 3 + 1] = Math.random() * 9 + 1;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 28;
            speeds.push(0.001 + Math.random() * 0.002);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: PALETTE.warmLight,
            size: 0.025,
            transparent: true,
            opacity: 0.2,
            depthWrite: false,
        });

        this.points = new THREE.Points(geometry, material);
        this.speeds = speeds;
        this.group.add(this.points);
        scene.add(this.group);
    }

    update(time) {
        const positions = this.points.geometry.attributes.position.array;
        for (let i = 0; i < this.count; i++) {
            positions[i * 3 + 1] += this.speeds[i];
            if (positions[i * 3 + 1] > 10) {
                positions[i * 3 + 1] = 1;
            }
            positions[i * 3] += Math.sin(time + i) * 0.0004;
        }
        this.points.geometry.attributes.position.needsUpdate = true;
    }
}
