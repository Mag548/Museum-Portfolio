import { EXHIBIT_CONTENT } from "./content.js";

function wrapText(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let line = "";

    words.forEach((word) => {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = test;
        }
    });
    if (line) lines.push(line);
    return lines;
}

export function createPlaqueTexture(title, lines) {
    const width = 512;
    const height = 640;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#2a2724";
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 8; i++) {
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, Math.random() * height);
        ctx.lineTo(width, Math.random() * height);
        ctx.stroke();
    }

    ctx.strokeStyle = "#b8860b";
    ctx.lineWidth = 5;
    ctx.strokeRect(14, 14, width - 28, height - 28);
    ctx.strokeStyle = "rgba(201, 162, 39, 0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, width - 48, height - 48);

    ctx.fillStyle = "rgba(92, 64, 51, 0.35)";
    ctx.fillRect(32, 32, width - 64, 68);

    ctx.font = '600 32px Georgia, "Times New Roman", serif';
    ctx.fillStyle = "#f5f0e6";
    ctx.textAlign = "center";
    ctx.fillText(title.toUpperCase(), width / 2, 76);

    ctx.strokeStyle = "rgba(201, 162, 39, 0.45)";
    ctx.beginPath();
    ctx.moveTo(50, 108);
    ctx.lineTo(width - 50, 108);
    ctx.stroke();

    ctx.font = '400 24px Inter, Georgia, serif';
    ctx.fillStyle = "#e8e0d4";
    ctx.textAlign = "left";

    let y = 145;
    const lineHeight = 32;
    const maxWidth = width - 80;

    lines.forEach((line) => {
        wrapText(ctx, line, maxWidth).forEach((textLine) => {
            ctx.fillText(textLine, 40, y);
            y += lineHeight;
        });
        y += 6;
    });

    ctx.font = 'italic 17px Georgia, serif';
    ctx.fillStyle = "rgba(201, 162, 39, 0.75)";
    ctx.textAlign = "center";
    ctx.fillText("Click to explore", width / 2, height - 34);

    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    return texture;
}

export function createPlaqueMesh(id) {
    const content = EXHIBIT_CONTENT[id];
    if (!content?.plaque) return null;

    const group = new THREE.Group();
    group.name = `plaque-${id}`;

    const backing = new THREE.Mesh(
        new THREE.BoxGeometry(1.05, 1.35, 0.06),
        new THREE.MeshStandardMaterial({
            color: 0x3d2817,
            metalness: 0.1,
            roughness: 0.8,
        })
    );
    group.add(backing);

    const texture = createPlaqueTexture(content.plaque.title, content.plaque.lines);
    const face = new THREE.Mesh(
        new THREE.PlaneGeometry(0.95, 1.25),
        new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.85,
        })
    );
    face.position.z = 0.04;
    group.add(face);

    const frameMat = new THREE.MeshStandardMaterial({
        color: 0xb8860b,
        metalness: 0.9,
        roughness: 0.25,
    });

    [
        [0, 0.66, 0.04, 1.0, 0.04, 0.02],
        [0, -0.66, 0.04, 1.0, 0.04, 0.02],
        [-0.51, 0, 0.04, 0.04, 1.28, 0.02],
        [0.51, 0, 0.04, 0.04, 1.28, 0.02],
    ].forEach(([x, y, z, w, h, d]) => {
        const edge = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), frameMat);
        edge.position.set(x, y, z);
        group.add(edge);
    });

    return group;
}
