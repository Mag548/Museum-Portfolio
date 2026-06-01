import { EXHIBIT_CONTENT } from "./content.js";
import {
    marbleMat, brassMat, goldMat, hologramMat, holoWireMat,
    screenMat, createLabelTexture, createScreenCanvas,
} from "./materials.js";
import { createBoldMGeometry } from "./geometries.js";

const KEYWORDS = ["Finance", "Technology", "Leadership", "Innovation", "Creativity"];
const RING_IDS = ["education", "leadership", "clubs", "volunteer", "skills"];

/** About Me — holographic statue + orbiting keyword labels */
export function buildAboutExhibit(anchor) {
    const root = new THREE.Group();
    root.name = "exhibit-about";

    const plinth = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.46, 0.14, 32),
        marbleMat(0x2a2724)
    );
    plinth.position.y = 0.52;
    root.add(plinth);

    const statue = new THREE.Group();
    statue.name = "hologram-statue";

    const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.26, 0.9, 12, 24),
        hologramMat(0.5)
    );
    body.position.y = 1.25;
    statue.add(body);

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 24, 24),
        hologramMat(0.6)
    );
    head.position.y = 1.95;
    statue.add(head);

    const wireShell = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.75, 2),
        holoWireMat()
    );
    wireShell.position.y = 1.35;
    statue.add(wireShell);

    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.025, 12, 48),
        brassMat(0.08)
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.72;
    statue.add(ring);

    root.add(statue);

    const keywords = new THREE.Group();
    keywords.name = "keywords";
    KEYWORDS.forEach((word, i) => {
        const angle = (i / KEYWORDS.length) * Math.PI * 2;
        const radius = 0.95 + (i % 2) * 0.15;
        const label = new THREE.Mesh(
            new THREE.PlaneGeometry(0.72, 0.18),
            new THREE.MeshStandardMaterial({
                map: createLabelTexture(word, 320, 72),
                transparent: true,
                emissive: 0x0066ff,
                emissiveIntensity: 0.15,
                side: THREE.DoubleSide,
            })
        );
        label.position.set(Math.cos(angle) * radius, 1.1 + (i % 3) * 0.25, Math.sin(angle) * radius);
        label.lookAt(0, label.position.y, 0);
        label.userData.orbitAngle = angle;
        label.userData.orbitRadius = radius;
        label.userData.orbitY = label.position.y;
        keywords.add(label);
    });
    root.add(keywords);

    anchor.add(root);
    return { root, statue, keywords, wireShell };
}

/** Experience — interconnected metallic ring sculpture */
export function buildExperienceExhibit(anchor) {
    const root = new THREE.Group();
    root.name = "exhibit-experience";
    const rings = [];
    const n = RING_IDS.length;
    const content = EXHIBIT_CONTENT.experience;

    RING_IDS.forEach((id, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        const y = 0.75 + i * 0.22;
        const radius = 0.55 + (i % 2) * 0.12;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const ringGroup = new THREE.Group();
        ringGroup.name = `ring-${id}`;
        ringGroup.userData.ringId = id;
        ringGroup.userData.ringTitle = content.timeline.find((t) => t.id === id)?.title || id;

        const torus = new THREE.Mesh(
            new THREE.TorusGeometry(0.28 + i * 0.02, 0.035, 16, 40),
            brassMat(0.06 + i * 0.01)
        );
        torus.rotation.x = Math.PI / 2;
        torus.rotation.y = angle * 0.5;
        ringGroup.add(torus);

        const hit = new THREE.Mesh(
            new THREE.TorusGeometry(0.32 + i * 0.02, 0.08, 8, 24),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        hit.rotation.x = Math.PI / 2;
        hit.name = `ring-hit-${id}`;
        hit.userData.ringId = id;
        ringGroup.add(hit);

        ringGroup.position.set(x, y, z);
        ringGroup.userData.baseY = y;
        root.add(ringGroup);
        rings.push({ group: ringGroup, hit, id });

        if (i > 0) {
            const prev = rings[i - 1].group.position;
            const cur = ringGroup.position;
            const mid = new THREE.Vector3().addVectors(prev, cur).multiplyScalar(0.5);
            const len = prev.distanceTo(cur);
            const tube = new THREE.Mesh(
                new THREE.CylinderGeometry(0.025, 0.025, len, 8),
                brassMat(0.04)
            );
            tube.position.copy(mid);
            tube.lookAt(cur);
            tube.rotateX(Math.PI / 2);
            root.add(tube);
        }
    });

    const spine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.6, 12),
        marbleMat(0x3a3632)
    );
    spine.position.set(0, 1.1, 0);
    root.add(spine);

    anchor.add(root);
    return { root, rings };
}

/** Projects & Accolades — trophy case contents */
export function buildProjectsExhibit(anchor) {
    const root = new THREE.Group();
    root.name = "exhibit-projects";
    const interactives = [];

    const base = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.08, 1.0),
        marbleMat(0x2a2724)
    );
    base.position.y = 0.52;
    root.add(base);

    const trophy = new THREE.Mesh(
        new THREE.LatheGeometry(
            [
                new THREE.Vector2(0, 0), new THREE.Vector2(0.28, 0),
                new THREE.Vector2(0.38, 0.4), new THREE.Vector2(0.2, 0.85),
                new THREE.Vector2(0.3, 1.05), new THREE.Vector2(0.12, 1.25), new THREE.Vector2(0, 1.25),
            ],
            40
        ),
        goldMat()
    );
    trophy.position.set(-0.55, 0.58, 0.1);
    root.add(trophy);

    const laptopGroup = new THREE.Group();
    laptopGroup.name = "project-laptop";
    laptopGroup.userData.projectId = "ja-website";
    const laptopBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.04, 0.38),
        new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.8, roughness: 0.3 })
    );
    laptopBase.position.y = 0.62;
    laptopGroup.add(laptopBase);
    const laptopScreen = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.34, 0.02),
        screenMat(createScreenCanvas("JA Company Site"))
    );
    laptopScreen.position.set(0, 0.88, -0.16);
    laptopScreen.rotation.x = -0.35;
    laptopGroup.add(laptopScreen);
    laptopGroup.position.set(0.35, 0, 0);
    root.add(laptopGroup);
    interactives.push({ mesh: laptopBase, projectId: "ja-website" });

    [[-0.2, 1.35, -0.25], [0.65, 1.2, -0.15]].forEach(([x, y, z], i) => {
        const cert = new THREE.Mesh(
            new THREE.PlaneGeometry(0.28, 0.36),
            new THREE.MeshStandardMaterial({
                color: 0xf5f0e6,
                roughness: 0.85,
                emissive: 0x332200,
                emissiveIntensity: 0.05,
            })
        );
        cert.position.set(x, y, z);
        cert.rotation.y = i === 0 ? 0.25 : -0.3;
        root.add(cert);
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.38, 0.015),
            goldMat()
        );
        frame.position.set(x, y, z - 0.01);
        frame.rotation.y = cert.rotation.y;
        root.add(frame);
    });

    const medals = [
        { pos: [0, 1.55, 0.15], id: "honours" },
        { pos: [-0.75, 1.0, -0.2], id: "inspired-indian" },
    ];
    medals.forEach(({ pos, id }) => {
        const medal = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 0.025, 24),
            goldMat()
        );
        medal.rotation.x = Math.PI / 2;
        medal.position.set(...pos);
        medal.name = `project-medal-${id}`;
        medal.userData.projectId = id;
        root.add(medal);
        interactives.push({ mesh: medal, projectId: id });
    });

    anchor.add(root);
    return { root, laptopGroup, interactives };
}

/** Hobbies — recognizable item models */
export function buildHobbiesExhibit(anchor) {
    const root = new THREE.Group();
    root.name = "exhibit-hobbies";
    const items = [];

    const defs = [
        { id: "badminton", build: buildBadmintonRacket, pos: [-0.6, 1.15, 0.1], rot: [0, 0.4, 0.6] },
        { id: "camera", build: buildCamera, pos: [0.55, 1.25, 0.05], rot: [0, -0.35, 0] },
        { id: "vr", build: buildVRHeadset, pos: [0, 1.65, -0.1], rot: [0.1, 0, 0] },
        { id: "laptop", build: buildMiniLaptop, pos: [-0.35, 0.78, -0.2], rot: [0, 0.2, 0] },
        { id: "car", build: buildCarModel, pos: [0.45, 0.72, -0.15], rot: [0, -0.5, 0] },
    ];

    defs.forEach(({ id, build, pos, rot }) => {
        const g = build();
        g.name = `hobby-${id}`;
        g.userData.hobbyId = id;
        g.position.set(...pos);
        g.rotation.set(...rot);
        g.traverse((c) => { if (c.isMesh) c.castShadow = true; });
        const hit = new THREE.Mesh(
            new THREE.SphereGeometry(0.22, 8, 8),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        hit.name = `hobby-hit-${id}`;
        hit.userData.hobbyId = id;
        g.add(hit);
        root.add(g);
        items.push({ group: g, hit, id });
    });

    anchor.add(root);
    return { root, items };
}

function buildBadmintonRacket() {
    const g = new THREE.Group();
    const head = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 12, 32), brassMat());
    head.rotation.x = Math.PI / 2;
    head.position.y = 0.35;
    g.add(head);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.4, 12), marbleMat(0x3a3632));
    handle.position.y = 0.05;
    g.add(handle);
    return g;
}

function buildCamera() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.14), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 }));
    g.add(body);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.12, 20), brassMat());
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 0.12;
    g.add(lens);
    return g;
}

function buildVRHeadset() {
    const g = new THREE.Group();
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.22), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 }));
    g.add(visor);
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02, 8, 24), hologramMat(0.4));
    strap.rotation.x = Math.PI / 2;
    strap.position.z = -0.05;
    g.add(strap);
    return g;
}

function buildMiniLaptop() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.3), new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7 }));
    g.add(base);
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.26, 0.015), screenMat(createScreenCanvas("Code")));
    screen.position.set(0, 0.16, -0.12);
    screen.rotation.x = -0.4;
    g.add(screen);
    return g;
}

function buildCarModel() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.12, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x8b0000, metalness: 0.6, roughness: 0.35 })
    );
    body.position.y = 0.08;
    g.add(body);
    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.1, 0.17),
        new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 })
    );
    cabin.position.set(-0.02, 0.18, 0);
    g.add(cabin);
    [[-0.14, 0.04, 0.1], [0.14, 0.04, 0.1], [-0.14, 0.04, -0.1], [0.14, 0.04, -0.1]].forEach(([x, y, z]) => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16), marbleMat());
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, y, z);
        g.add(wheel);
    });
    return g;
}

/** Contact — futuristic hub with holographic link buttons */
export function buildContactExhibit(anchor) {
    const root = new THREE.Group();
    root.name = "exhibit-contact";
    const buttons = [];

    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 0.5, 24), marbleMat(0x2a2724));
    pillar.position.y = 0.28;
    root.add(pillar);

    const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.65, 0.04, 16, 48),
        hologramMat(0.35)
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 1.05;
    root.add(halo);

    const links = [
        { id: "linkedin", label: "LinkedIn", angle: 0 },
        { id: "github", label: "GitHub", angle: Math.PI / 2 },
        { id: "email", label: "Email", angle: Math.PI },
        { id: "resume", label: "Resume", angle: -Math.PI / 2 },
    ];

    links.forEach(({ id, label, angle }) => {
        const btn = new THREE.Group();
        btn.name = `contact-btn-${id}`;
        btn.userData.contactId = id;

        const disc = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.14, 0.025, 24),
            hologramMat(0.65)
        );
        btn.add(disc);

        const lbl = new THREE.Mesh(
            new THREE.PlaneGeometry(0.38, 0.1),
            new THREE.MeshStandardMaterial({
                map: createLabelTexture(label, 200, 48),
                transparent: true,
                emissive: 0x0066ff,
                emissiveIntensity: 0.2,
                side: THREE.DoubleSide,
            })
        );
        lbl.position.y = 0.12;
        lbl.rotation.x = -0.2;
        btn.add(lbl);

        btn.position.set(Math.cos(angle) * 0.55, 1.15, Math.sin(angle) * 0.55);
        btn.userData.baseY = 1.15;
        btn.userData.phase = angle;
        root.add(btn);
        buttons.push({ group: btn, id, disc });
    });

    anchor.add(root);
    return { root, buttons, halo };
}

/** Future Vision secret room — glowing briefcase on pedestal */
export function buildSecretBriefcase() {
    const root = new THREE.Group();
    root.name = "future-vision-briefcase";

    const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.65, 0.35, 32),
        marbleMat(0x2a2724)
    );
    pedestal.position.y = 0.175;
    root.add(pedestal);

    const caseBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.45, 0.25),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.85,
            roughness: 0.25,
            emissive: 0x224488,
            emissiveIntensity: 0.25,
        })
    );
    caseBody.position.y = 0.65;
    root.add(caseBody);

    const lid = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 0.08, 0.27),
        goldMat()
    );
    lid.position.y = 0.92;
    root.add(lid);

    const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.025, 8, 20),
        brassMat(0.15)
    );
    handle.rotation.x = Math.PI / 2;
    handle.position.set(0, 1.02, 0);
    root.add(handle);

    const glow = new THREE.PointLight(0x88ccff, 0.8, 3, 2);
    glow.position.y = 0.8;
    root.add(glow);

    return { root, caseBody, glow };
}

/** Centerpiece M (re-export for export tool) */
export function buildCenterpieceM() {
    const g = new THREE.Group();
    g.name = "centerpiece-m";
    const mesh = new THREE.Mesh(createBoldMGeometry(1.15), goldMat());
    g.add(mesh);
    return g;
}

/** Build detached exhibit roots for GLB export */
export function buildAllExhibitRoots() {
    const detach = (buildFn) => {
        const anchor = new THREE.Group();
        const result = buildFn(anchor);
        anchor.remove(result.root);
        return result.root;
    };

    return {
        about: detach(buildAboutExhibit),
        experience: detach(buildExperienceExhibit),
        projects: detach(buildProjectsExhibit),
        hobbies: detach(buildHobbiesExhibit),
        contact: detach(buildContactExhibit),
        secret: buildSecretBriefcase().root,
        centerpiece: buildCenterpieceM(),
    };
}

export function animateAbout(state, t) {
    if (state.statue) state.statue.rotation.y = t * 0.35;
    if (state.wireShell) state.wireShell.rotation.y = -t * 0.5;
    state.keywords?.children.forEach((label, i) => {
        const a = label.userData.orbitAngle + t * 0.25;
        const r = label.userData.orbitRadius;
        label.position.set(Math.cos(a) * r, label.userData.orbitY + Math.sin(t + i) * 0.04, Math.sin(a) * r);
        label.lookAt(0, label.position.y, 0);
    });
}

export function animateExperience(state, t) {
    state.rings?.forEach(({ group }, i) => {
        group.rotation.z = Math.sin(t * 0.6 + i) * 0.06;
        group.position.y = group.userData.baseY + Math.sin(t * 1.2 + i * 0.5) * 0.03;
    });
}

export function animateProjects(state, t) {
    if (state.root) state.root.rotation.y = Math.sin(t * 0.15) * 0.08;
}

export function animateHobbies(state, t, animatingId) {
    state.items?.forEach(({ group, id }) => {
        group.rotation.y += 0.004;
        if (id === animatingId) {
            group.position.y += Math.sin(t * 6) * 0.001;
            group.scale.setScalar(1 + Math.sin(t * 5) * 0.06);
        }
    });
}

export function animateContact(state, t) {
    if (state.halo) state.halo.rotation.z = t * 0.2;
    state.buttons?.forEach(({ group }) => {
        group.position.y = group.userData.baseY + Math.sin(t * 2 + group.userData.phase) * 0.04;
        group.rotation.y = t * 0.3;
    });
}

export function animateSecret(briefcase, t) {
    if (!briefcase) return;
    briefcase.rotation.y = Math.sin(t * 0.2) * 0.15;
    briefcase.position.y = Math.sin(t * 0.8) * 0.03;
}
