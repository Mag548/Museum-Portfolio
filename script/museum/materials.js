import { PALETTE } from "./constants.js";

export function marbleMat(color = PALETTE.marbleDark) {
    return new THREE.MeshStandardMaterial({
        color,
        metalness: 0.1,
        roughness: 0.34,
    });
}

export function brassMat(emissiveIntensity = 0.05) {
    return new THREE.MeshStandardMaterial({
        color: PALETTE.brass,
        metalness: 0.92,
        roughness: 0.22,
        emissive: 0x2a2000,
        emissiveIntensity,
    });
}

export function goldMat() {
    return new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.96,
        roughness: 0.14,
    });
}

export function hologramMat(opacity = 0.55) {
    return new THREE.MeshPhysicalMaterial({
        color: 0x66ccff,
        emissive: 0x2288ff,
        emissiveIntensity: 0.45,
        metalness: 0.2,
        roughness: 0.15,
        transparent: true,
        opacity,
        transmission: 0.6,
        thickness: 0.5,
        side: THREE.DoubleSide,
    });
}

export function holoWireMat() {
    return new THREE.MeshBasicMaterial({
        color: 0x88ddff,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
    });
}

export function screenMat(canvas) {
    const tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    return new THREE.MeshStandardMaterial({
        map: tex,
        emissive: 0x224466,
        emissiveMap: tex,
        emissiveIntensity: 0.35,
        roughness: 0.4,
    });
}

export function createLabelTexture(text, w = 256, h = 64) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(13, 27, 42, 0.85)";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, w - 4, h - 4);
    ctx.font = '600 22px Inter, sans-serif';
    ctx.fillStyle = "#00a8ff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
}

export function createScreenCanvas(title = "Project Demo") {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, 512, 320);
    ctx.fillStyle = "#161b22";
    ctx.fillRect(0, 0, 512, 28);
    ctx.fillStyle = "#58a6ff";
    ctx.font = "14px monospace";
    ctx.fillText(title, 12, 18);
    ctx.fillStyle = "#3fb950";
    ctx.fillText("> npm run dev", 20, 60);
    ctx.fillStyle = "#8b949e";
    ctx.fillText("Server running at localhost:3000", 20, 88);
    ctx.strokeStyle = "#30363d";
    ctx.strokeRect(16, 110, 480, 180);
    ctx.fillStyle = "#c9d1d9";
    ctx.font = "12px monospace";
    ctx.fillText("const museum = new Portfolio();", 24, 135);
    ctx.fillText("museum.launch();", 24, 158);
    return canvas;
}
