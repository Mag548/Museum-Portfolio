import { PALETTE, EXHIBITS, HALL_SIZE, HALL_HEIGHT, exhibitPosition } from "./constants.js";
import { createPlaqueMesh } from "./plaques.js";
import { createBoldMGeometry, createBrassPost } from "./geometries.js";
import { buildSecretBriefcase, animateSecret } from "./exhibitModels.js";

function createMarbleTexture(baseColor = "#1c1a18", veinColor = "#3a3632") {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 14; i++) {
        ctx.strokeStyle = veinColor;
        ctx.globalAlpha = 0.12 + Math.random() * 0.15;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(Math.random() * size, Math.random() * size);
        ctx.bezierCurveTo(
            Math.random() * size, Math.random() * size,
            Math.random() * size, Math.random() * size,
            Math.random() * size, Math.random() * size
        );
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.encoding = THREE.sRGBEncoding;
    return texture;
}

function createWoodTexture() {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#5c4033";
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y++) {
        const n = Math.sin(y * 0.04) * 8 + Math.random() * 4;
        ctx.strokeStyle = `rgba(${90 + n}, ${64 + n * 0.6}, ${51 + n * 0.4}, 0.35)`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y + Math.sin(y * 0.02) * 3);
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 1);
    texture.encoding = THREE.sRGBEncoding;
    return texture;
}

function createTextTexture(text, options = {}) {
    const {
        width = 1024,
        height = 256,
        fontSize = 72,
        fontFamily = "Georgia, 'Times New Roman', serif",
        color = "#2c2416",
        subtext = "",
    } = options;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#f5f0e6";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#b8860b";
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    ctx.font = `600 ${fontSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.fillText(text, width / 2, subtext ? height * 0.42 : height / 2);

    if (subtext) {
        ctx.font = `400 ${fontSize * 0.4}px Inter, sans-serif`;
        ctx.fillStyle = "#8b6914";
        ctx.fillText(subtext, width / 2, height * 0.68);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    return texture;
}

function glassMaterial() {
    return new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.04,
        transmission: 0.92,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
        depthWrite: false,
    });
}

function marbleMat(map) {
    return new THREE.MeshStandardMaterial({
        map,
        color: PALETTE.marbleDark,
        metalness: 0.1,
        roughness: 0.32,
    });
}

function woodMat(map) {
    return new THREE.MeshStandardMaterial({
        map,
        color: PALETTE.woodMid,
        metalness: 0.04,
        roughness: 0.68,
    });
}

function brassMat() {
    return new THREE.MeshStandardMaterial({
        color: PALETTE.brass,
        metalness: 0.9,
        roughness: 0.22,
    });
}

export default class MuseumBuilder {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.group.name = "museum";
        this.marbleMap = createMarbleTexture();
        this.woodMap = createWoodTexture();
        this.pedestals = {};
        this.secretTrigger = null;
        this.entranceSign = null;

        this.buildExterior();
        this.buildInterior();
        this.buildCenterpiece();
        this.buildSignage();
        this.buildSecretRoom();
        this.buildCeilingLights();

        scene.add(this.group);
    }

    buildCeilingLights() {
        const positions = [
            [0, 0], [-8, -8], [8, -8], [-8, 8], [8, 8], [0, -10], [0, 10],
        ];
        positions.forEach(([x, z]) => {
            const fixture = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4, 0.48, 0.14, 24),
                new THREE.MeshStandardMaterial({
                    color: 0xfff8f0,
                    emissive: 0xffeedd,
                    emissiveIntensity: 0.4,
                    metalness: 0.08,
                    roughness: 0.45,
                })
            );
            fixture.position.set(x, HALL_HEIGHT - 0.12, z);
            this.group.add(fixture);
        });
    }

    buildExterior() {
        const exterior = new THREE.Group();
        exterior.name = "exterior";

        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(80, 60),
            marbleMat(this.marbleMap)
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(0, -0.01, 18);
        ground.receiveShadow = true;
        exterior.add(ground);

        const plaza = new THREE.Mesh(
            new THREE.PlaneGeometry(22, 14),
            marbleMat(this.marbleMap)
        );
        plaza.rotation.x = -Math.PI / 2;
        plaza.position.set(0, 0.002, 20);
        plaza.receiveShadow = true;
        exterior.add(plaza);

        const stoneMat = new THREE.MeshStandardMaterial({
            color: PALETTE.stoneWall,
            metalness: 0.02,
            roughness: 0.88,
        });

        [[-11, 7, 24], [11, 7, 24]].forEach(([x, y, z]) => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(4, 14, 1.2), stoneMat);
            wall.position.set(x, y, z);
            wall.castShadow = true;
            exterior.add(wall);
        });

        const header = new THREE.Mesh(new THREE.BoxGeometry(22, 3, 1.2), stoneMat);
        header.position.set(0, 13.5, 24);
        exterior.add(header);

        [-5.5, 5.5].forEach((x) => {
            const pillar = new THREE.Mesh(
                new THREE.CylinderGeometry(0.28, 0.32, 11, 24),
                woodMat(this.woodMap)
            );
            pillar.position.set(x, 5.5, 23.2);
            pillar.castShadow = true;
            exterior.add(pillar);
        });

        const lintel = new THREE.Mesh(
            new THREE.BoxGeometry(12, 0.45, 0.45),
            woodMat(this.woodMap)
        );
        lintel.position.set(0, 11, 23.2);
        exterior.add(lintel);

        const signTexture = createTextTexture("Enter Manan's Portfolio", {
            subtext: "Manan's Museum",
            fontSize: 52,
        });
        this.entranceSign = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 2.5),
            new THREE.MeshStandardMaterial({ map: signTexture, roughness: 0.9 })
        );
        this.entranceSign.position.set(0, 9.2, 23.55);
        exterior.add(this.entranceSign);

        this.group.add(exterior);
    }

    /** Single wall panel — wainscot is a thin inset strip, never coplanar with the wall. */
    addWall(interior, wallMat, wainscotMat, width, height, depth, x, y, z, insetX, insetZ) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat);
        wall.position.set(x, y, z);
        wall.receiveShadow = true;
        interior.add(wall);

        const trim = new THREE.Mesh(
            new THREE.BoxGeometry(width - 0.08, 2.15, 0.1),
            wainscotMat
        );
        trim.position.set(x + insetX, 1.08, z + insetZ);
        trim.receiveShadow = true;
        interior.add(trim);

        const cap = new THREE.Mesh(
            new THREE.BoxGeometry(width - 0.04, 0.08, 0.12),
            brassMat()
        );
        cap.position.set(x + insetX, 2.18, z + insetZ);
        interior.add(cap);
    }

    buildInterior() {
        const interior = new THREE.Group();
        interior.name = "interior";

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(HALL_SIZE, HALL_SIZE),
            marbleMat(this.marbleMap)
        );
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        interior.add(floor);

        const wallMat = new THREE.MeshStandardMaterial({
            color: PALETTE.stoneWall,
            metalness: 0.02,
            roughness: 0.9,
        });
        const wainscotMat = woodMat(this.woodMap);
        const half = HALL_SIZE / 2;
        const t = 0.4;

        this.addWall(interior, wallMat, wainscotMat, HALL_SIZE, HALL_HEIGHT, t, 0, HALL_HEIGHT / 2, -half, 0, 0.22);
        this.addWall(interior, wallMat, wainscotMat, HALL_SIZE, HALL_HEIGHT, t, 0, HALL_HEIGHT / 2, half, 0, -0.22);
        this.addWall(interior, wallMat, wainscotMat, t, HALL_HEIGHT, HALL_SIZE, -half, HALL_HEIGHT / 2, 0, 0.22, 0);
        this.addWall(interior, wallMat, wainscotMat, t, HALL_HEIGHT, HALL_SIZE, half, HALL_HEIGHT / 2, 0, -0.22, 0);

        const ceiling = new THREE.Mesh(
            new THREE.PlaneGeometry(HALL_SIZE, HALL_SIZE),
            new THREE.MeshStandardMaterial({ color: 0xf0ebe3, roughness: 0.95 })
        );
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = HALL_HEIGHT;
        interior.add(ceiling);

        for (let i = -14; i <= 14; i += 7) {
            const beam = new THREE.Mesh(
                new THREE.BoxGeometry(HALL_SIZE - 1, 0.22, 0.38),
                woodMat(this.woodMap)
            );
            beam.position.set(0, HALL_HEIGHT - 0.18, i);
            interior.add(beam);
        }

        EXHIBITS.forEach(({ id, label, angle }) => {
            const pos = exhibitPosition(angle);
            const pedestal = this.createDisplayCase(pos, label, id);
            interior.add(pedestal.group);
            this.pedestals[id] = pedestal;
        });

        this.group.add(interior);
    }

    createGlassCase(caseGroup, w, h, d) {
        const glass = glassMaterial();
        const hw = w / 2;
        const hh = h / 2;

        const panels = [
            { size: [w, h], pos: [0, hh, d / 2], rot: [0, 0, 0] },
            { size: [w, h], pos: [0, hh, -d / 2], rot: [0, Math.PI, 0] },
            { size: [d, h], pos: [hw, hh, 0], rot: [0, Math.PI / 2, 0] },
            { size: [d, h], pos: [-hw, hh, 0], rot: [0, -Math.PI / 2, 0] },
        ];

        panels.forEach(({ size, pos, rot }) => {
            const panel = new THREE.Mesh(new THREE.PlaneGeometry(...size), glass);
            panel.position.set(...pos);
            panel.rotation.set(...rot);
            caseGroup.add(panel);
        });

        const top = new THREE.Mesh(new THREE.PlaneGeometry(w, d), glass);
        top.rotation.x = -Math.PI / 2;
        top.position.y = h;
        caseGroup.add(top);

        const corners = [
            [-hw, 0, d / 2], [hw, 0, d / 2], [-hw, 0, -d / 2], [hw, 0, -d / 2],
        ];
        corners.forEach(([x, , z]) => {
            const post = new THREE.Mesh(createBrassPost(h, 0.05), brassMat());
            post.position.set(x, h / 2, z);
            caseGroup.add(post);
        });

        const rails = [
            { geo: [w + 0.1, 0.05, 0.05], pos: [0, h, d / 2] },
            { geo: [w + 0.1, 0.05, 0.05], pos: [0, h, -d / 2] },
            { geo: [0.05, 0.05, d + 0.1], pos: [hw, h, 0] },
            { geo: [0.05, 0.05, d + 0.1], pos: [-hw, h, 0] },
        ];
        rails.forEach(({ geo, pos }) => {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(...geo), brassMat());
            rail.position.set(...pos);
            caseGroup.add(rail);
        });
    }

    createDisplayCase(pos, label, id) {
        const group = new THREE.Group();
        group.name = `exhibit-pedestal-${id}`;
        group.position.set(pos.x, 0, pos.z);
        group.rotation.y = pos.facing;

        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(1.55, 1.75, 0.38, 48),
            marbleMat(this.marbleMap)
        );
        base.position.y = 0.19;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        const woodCap = new THREE.Mesh(
            new THREE.CylinderGeometry(1.58, 1.58, 0.07, 48),
            woodMat(this.woodMap)
        );
        woodCap.position.y = 0.41;
        group.add(woodCap);

        const caseH = 2.55;
        const caseW = 2.65;
        const caseD = 2.65;
        const caseGroup = new THREE.Group();
        caseGroup.position.y = 0.42;
        this.createGlassCase(caseGroup, caseW, caseH, caseD);
        group.add(caseGroup);

        const innerFloor = new THREE.Mesh(
            new THREE.BoxGeometry(caseW * 0.9, 0.03, caseD * 0.9),
            woodMat(this.woodMap)
        );
        innerFloor.position.y = 0.015;
        innerFloor.receiveShadow = true;
        caseGroup.add(innerFloor);

        const contentAnchor = new THREE.Group();
        contentAnchor.name = `exhibit-content-${id}`;
        contentAnchor.position.set(0, 0, 0);
        caseGroup.add(contentAnchor);

        const labelTexture = createTextTexture(label, { width: 512, height: 128, fontSize: 36 });
        const labelMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2.1, 0.52),
            new THREE.MeshStandardMaterial({ map: labelTexture, roughness: 0.88 })
        );
        labelMesh.position.set(0, 0.42 + caseH + 0.55, caseD / 2 + 0.06);
        group.add(labelMesh);

        const plaque = this.createPlaquePedestal(group, id, caseD);

        const hitBox = new THREE.Mesh(
            new THREE.BoxGeometry(caseW, caseH + 0.5, caseD + 2.0),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        hitBox.position.set(0, 0.42 + caseH / 2, 1.0);
        hitBox.name = `exhibit-hit-${id}`;
        hitBox.userData.exhibitId = id;
        group.add(hitBox);

        return { group, contentAnchor, hitBox, label: labelMesh, caseGroup, plaque: plaque || null };
    }

    createPlaquePedestal(group, id, caseD) {
        const plaque = createPlaqueMesh(id);
        if (!plaque) return null;

        const pedestalGroup = new THREE.Group();
        pedestalGroup.name = `plaque-pedestal-${id}`;
        pedestalGroup.position.set(0, 0, caseD / 2 + 0.92);

        const foot = new THREE.Mesh(
            new THREE.BoxGeometry(0.80, 0.07, 0.48),
            marbleMat(this.marbleMap)
        );
        foot.position.y = 0.035;
        pedestalGroup.add(foot);

        const step = new THREE.Mesh(
            new THREE.BoxGeometry(0.64, 0.06, 0.37),
            marbleMat(this.marbleMap)
        );
        step.position.y = 0.10;
        pedestalGroup.add(step);

        const column = new THREE.Mesh(
            new THREE.BoxGeometry(0.47, 0.82, 0.27),
            marbleMat(this.marbleMap)
        );
        column.position.y = 0.54;
        pedestalGroup.add(column);

        const cap = new THREE.Mesh(
            new THREE.BoxGeometry(0.64, 0.05, 0.38),
            new THREE.MeshStandardMaterial({
                color: PALETTE.brass,
                metalness: 0.88,
                roughness: 0.22,
            })
        );
        cap.position.y = 0.975;
        pedestalGroup.add(cap);

        const capTopY = 1.0;
        const plaqueH = plaque.userData.plaqueHeight || 1.2;
        plaque.position.set(0, capTopY + plaqueH / 2, 0);
        plaque.rotation.x = -0.30;
        pedestalGroup.add(plaque);

        group.add(pedestalGroup);
        return plaque;
    }

    buildCenterpiece() {
        const centerpiece = new THREE.Group();
        centerpiece.name = "centerpiece";
        centerpiece.position.set(0, 3.1, 0);

        const mGeo = createBoldMGeometry(1.15);
        const mMesh = new THREE.Mesh(
            mGeo,
            new THREE.MeshStandardMaterial({
                color: 0xd4af37,
                metalness: 0.95,
                roughness: 0.18,
                envMapIntensity: 1,
            })
        );
        mMesh.castShadow = true;
        centerpiece.add(mMesh);

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.55, 0.045, 20, 80),
            brassMat()
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -0.15;
        centerpiece.add(ring);

        const platform = new THREE.Mesh(
            new THREE.CylinderGeometry(2.15, 2.45, 0.28, 64),
            marbleMat(this.marbleMap)
        );
        platform.position.y = -1.75;
        platform.castShadow = true;
        platform.receiveShadow = true;
        platform.name = "secret-trigger";
        centerpiece.add(platform);

        const platformRim = new THREE.Mesh(
            new THREE.TorusGeometry(2.35, 0.07, 16, 64),
            brassMat()
        );
        platformRim.rotation.x = Math.PI / 2;
        platformRim.position.y = -1.6;
        centerpiece.add(platformRim);

        const column = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.45, 1.2, 32),
            marbleMat(this.marbleMap)
        );
        column.position.y = -1.1;
        centerpiece.add(column);

        this.secretTrigger = platform;
        this.centerpiece = centerpiece;
        this.group.add(centerpiece);
    }

    buildSignage() {
        const texture = createTextTexture("Manan's Museum", { fontSize: 44, subtext: "Interactive Portfolio" });
        const sign = new THREE.Mesh(
            new THREE.PlaneGeometry(5, 1.4),
            new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9 })
        );
        sign.position.set(0, 8.5, -HALL_SIZE / 2 + 0.3);
        this.group.add(sign);
    }

    buildSecretRoom() {
        const secret = new THREE.Group();
        secret.name = "secret-room";
        secret.visible = false;
        secret.position.set(0, 0, -HALL_SIZE / 2 - 8);

        const roomFloor = new THREE.Mesh(
            new THREE.PlaneGeometry(12, 10),
            marbleMat(this.marbleMap)
        );
        roomFloor.rotation.x = -Math.PI / 2;
        roomFloor.receiveShadow = true;
        secret.add(roomFloor);

        const roomWallMat = new THREE.MeshStandardMaterial({
            color: PALETTE.stoneWall,
            roughness: 0.88,
        });

        const backWall = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 0.3), roomWallMat);
        backWall.position.set(0, 3, -5);
        secret.add(backWall);

        [[-6, 3, 0, 0.3, 6, 10], [6, 3, 0, 0.3, 6, 10]].forEach(([x, y, z, w, h, d]) => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), roomWallMat);
            wall.position.set(x, y, z);
            secret.add(wall);
        });

        const visionTexture = createTextTexture("Future Vision", {
            subtext: "Goals · Dreams · Ambitions",
            fontSize: 40,
        });
        const visionSign = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 1.6),
            new THREE.MeshStandardMaterial({ map: visionTexture, roughness: 0.9 })
        );
        visionSign.position.set(0, 4.5, -4.7);
        secret.add(visionSign);

        const briefcaseResult = buildSecretBriefcase();
        briefcaseResult.root.position.set(0, 0, 0.5);
        secret.add(briefcaseResult.root);
        this.secretBriefcase = briefcaseResult.root;

        this.secretRoom = secret;
        this.group.add(secret);
    }

    update(time) {
        if (this.centerpiece) {
            this.centerpiece.rotation.y = time * 0.1;
            this.centerpiece.position.y = 3.1 + Math.sin(time * 0.7) * 0.04;
        }
        if (this.secretRoom?.visible && this.secretBriefcase) {
            animateSecret(this.secretBriefcase, time);
        }
    }
}
