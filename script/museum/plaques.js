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

function measureCanvasHeight(title, lines) {
    const cw = 512;
    const temp = document.createElement("canvas");
    temp.width = cw;
    temp.height = 10;
    const ctx = temp.getContext("2d");
    ctx.font = "400 22px Inter, sans-serif";
    const maxWidth = cw - 80;

    let totalWrapped = 0;
    lines.forEach((line) => {
        totalWrapped += wrapText(ctx, line, maxWidth).length;
    });

    const lineH = 34;
    const paraGap = 8;
    const bodyH = totalWrapped * lineH + Math.max(0, lines.length - 1) * paraGap;

    return Math.max(260, 120 + bodyH + 50 + 36);
}

export function createPlaqueTexture(title, lines, canvasHeight) {
    const width = 512;
    const height = canvasHeight;
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

    ctx.font = "700 28px Inter, sans-serif";
    ctx.fillStyle = "#f5f0e6";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(title.toUpperCase(), width / 2, 66);
    ctx.textBaseline = "alphabetic";

    ctx.strokeStyle = "rgba(201, 162, 39, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(50, 110);
    ctx.lineTo(width - 50, 110);
    ctx.stroke();

    ctx.font = "400 22px Inter, sans-serif";
    ctx.fillStyle = "#e8e0d4";
    ctx.textAlign = "center";

    const lineH = 34;
    const paraGap = 8;
    const maxWidth = width - 80;
    let y = 148;

    lines.forEach((line) => {
        wrapText(ctx, line, maxWidth).forEach((textLine) => {
            ctx.fillText(textLine, width / 2, y);
            y += lineH;
        });
        y += paraGap;
    });

    ctx.font = "italic 500 15px Inter, sans-serif";
    ctx.fillStyle = "rgba(201, 162, 39, 0.80)";
    ctx.textAlign = "center";
    ctx.fillText("Click to explore →", width / 2, height - 28);

    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    return texture;
}

export function createPlaqueMesh(id) {
    const content = EXHIBIT_CONTENT[id];
    if (!content?.plaque) return null;

    const { title, lines } = content.plaque;
    const canvasH = measureCanvasHeight(title, lines);
    const canvasW = 512;

    const w3d = 1.05;
    const h3d = w3d * (canvasH / canvasW);
    const faceW = w3d - 0.10;
    const faceH = h3d - 0.10;
    const hh = h3d / 2;
    const hw = w3d / 2;

    const group = new THREE.Group();
    group.name = `plaque-${id}`;
    group.userData.plaqueHeight = h3d;

    const backing = new THREE.Mesh(
        new THREE.BoxGeometry(w3d, h3d, 0.06),
        new THREE.MeshStandardMaterial({
            color: 0x3d2817,
            metalness: 0.1,
            roughness: 0.8,
        })
    );
    group.add(backing);

    const texture = createPlaqueTexture(title, lines, canvasH);
    const face = new THREE.Mesh(
        new THREE.PlaneGeometry(faceW, faceH),
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
        [0,   hh, 0.04, w3d + 0.04, 0.04, 0.02],
        [0,  -hh, 0.04, w3d + 0.04, 0.04, 0.02],
        [-hw,  0, 0.04, 0.04, h3d + 0.04, 0.02],
        [ hw,  0, 0.04, 0.04, h3d + 0.04, 0.02],
    ].forEach(([x, y, z, fw, fh, fd]) => {
        const edge = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, fd), frameMat);
        edge.position.set(x, y, z);
        group.add(edge);
    });

    return group;
}
