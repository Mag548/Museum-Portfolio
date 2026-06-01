import { InteractionManager } from "./three.interactive/build/three.interactive.js";
import MuseumEnvironment from "./utils/environment.js";
import Resizer from "./utils/resize.js";
import MuseumBuilder from "./museum/museumBuilder.js";
import Exhibits from "./museum/exhibits.js";
import CameraController from "./museum/cameraController.js";
import Particles from "./museum/particles.js";
import { EXHIBITS, exhibitPosition } from "./museum/constants.js";
import { beginExhibitFocus } from "./dom.js";

const interactions = [];
let interacted = false;
let secretClickCount = 0;
let secretClickTimer = null;

export default class MuseumWorld {
    constructor() {
        this.interactionManager = new InteractionManager(renderer, camera, renderer.domElement);
        this.environment = new MuseumEnvironment();
        this.museum = new MuseumBuilder(scene);
        this.exhibits = new Exhibits(this.museum, this.interactionManager);
        this.particles = new Particles(scene);
        this.cameraController = new CameraController(camera, window.controls);

        this.setupSpotlights();
        this.setupInteractions();
        this.setupSubInteractions();
        this.setupSecretTrigger();

        this.timer = new THREE.Clock();
        this.elapsed = 0;
        this.frameRequest = null;
        this.hoveredExhibit = null;

        new Resizer(renderer, camera);
        this.update();

        setTimeout(() => {
            if (!interacted) this.hint();
        }, 10000);
    }

    setupSpotlights() {
        EXHIBITS.forEach(({ id, angle }) => {
            const pos = exhibitPosition(angle);
            const light = new THREE.SpotLight(0xfff8f0, 3.5, 22, toRadian(40), 0.5, 1.4);
            light.position.set(pos.x * 0.25 + Math.sin(angle) * 2, 9.5, pos.z * 0.25 - Math.cos(angle) * 2);
            light.castShadow = true;
            light.shadow.mapSize.set(512, 512);

            const target = new THREE.Object3D();
            target.position.set(pos.x, 2, pos.z);
            scene.add(target);
            light.target = target;

            scene.add(light);
            this.exhibits.spotlights[id] = light;
        });

        const centerLight = new THREE.PointLight(0xfff4e0, 1.5, 22, 1.4);
        centerLight.position.set(0, 8, 0);
        scene.add(centerLight);
    }

    setupInteractions() {
        EXHIBITS.forEach(({ id, angle }) => {
            const pedestal = this.museum.pedestals[id];
            const hitBox = pedestal?.hitBox;
            if (!hitBox) return;

            this.interactionManager.add(hitBox);
            const pos = exhibitPosition(angle);

            hitBox.addEventListener("mouseover", () => {
                document.body.style.cursor = "pointer";
                this.hoveredExhibit = id;
                this.exhibits.setHover(id, true);
            });

            hitBox.addEventListener("mouseout", () => {
                if (activePanel === "") document.body.style.cursor = "initial";
                this.hoveredExhibit = null;
                this.exhibits.setHover(id, false);
            });

            hitBox.addEventListener("click", (e) => {
                e.stopPropagation?.();
                interacted = true;
                this.startExhibitFocus(id, pos);
            });

            interactions.push({ id, mesh: hitBox });
        });
    }

    startExhibitFocus(id, pos, options = {}) {
        if (activePanel) closePanel();
        beginExhibitFocus(id, pos, options);
    }

    openExhibitDetail(id, options = {}) {
        const pedestal = this.museum.pedestals[id];
        const exhibit = EXHIBITS.find((e) => e.id === id);
        if (!pedestal || !exhibit) return;

        const pos = exhibitPosition(exhibit.angle);
        const frontShot = this.cameraController.computeFrontShot(pos);
        this.cameraController.frontCam.position.copy(frontShot.position);
        this.cameraController.frontCam.target.copy(frontShot.target);
        this.cameraController.currentFocus = id;

        this.cameraController.focusExhibitPlaque(id, pedestal, () => {
            openPanel(id, options);
        });
    }

    zoomExhibitIn() {
        const id = this.cameraController.currentFocus;
        const pedestal = id ? this.museum.pedestals[id] : null;
        if (!id || !pedestal) return;
        this.cameraController.focusExhibitPlaque(id, pedestal);
    }

    zoomExhibitOut() {
        if (!this.cameraController.currentFocus) return;
        this.cameraController.returnToExhibitFront();
    }

    focusExhibit(id, pos, options = {}) {
        this.startExhibitFocus(id, pos, options);
    }

    setupSubInteractions() {
        this.exhibits.subInteractives.forEach(({ mesh, type, exhibitId, ringId, projectId, hobbyId, contactId }) => {
            mesh.addEventListener("mouseover", (e) => {
                e.stopPropagation?.();
                document.body.style.cursor = "pointer";
            });
            mesh.addEventListener("mouseout", () => {
                if (activePanel === "") document.body.style.cursor = "initial";
            });
            mesh.addEventListener("click", (e) => {
                e.stopPropagation?.();
                interacted = true;
                const angle = EXHIBITS.find((ex) => ex.id === exhibitId)?.angle;
                if (angle === undefined) return;
                const pos = exhibitPosition(angle);

                switch (type) {
                    case "ring":
                        this.openExhibitDetail(exhibitId, { ringId });
                        break;
                    case "project":
                        this.openExhibitDetail(exhibitId, { projectId });
                        break;
                    case "hobby":
                        this.exhibits.animateHobby(hobbyId);
                        this.openExhibitDetail(exhibitId, { hobbyId });
                        break;
                    case "contact":
                        if (contactId === "email") {
                            this.openExhibitDetail("contact");
                        } else if (contactId === "resume") {
                            window.openContactLink("resume");
                        } else {
                            window.openContactLink(contactId);
                        }
                        break;
                }
            });
        });
    }

    setupSecretTrigger() {
        const trigger = this.museum.secretTrigger;
        if (!trigger) return;

        this.interactionManager.add(trigger);

        trigger.addEventListener("mouseover", () => {
            document.body.style.cursor = "pointer";
        });

        trigger.addEventListener("mouseout", () => {
            if (activePanel === "") document.body.style.cursor = "initial";
        });

        trigger.addEventListener("click", () => {
            secretClickCount++;
            clearTimeout(secretClickTimer);
            secretClickTimer = setTimeout(() => {
                secretClickCount = 0;
            }, 1500);

            if (secretClickCount >= 3) {
                secretClickCount = 0;
                this.revealSecret();
            }
        });
    }

    revealSecret() {
        this.museum.secretRoom.visible = true;
        this.cameraController.revealSecretRoom(() => {
            openPanel("secret");
        });
    }

    hint = () => {
        interactions.forEach(({ mesh }) => {
            mesh.parent?.traverse((node) => {
                if (node.material?.emissive) {
                    node.userData.originalEmissive = node.material.emissiveIntensity;
                    node.material.emissiveIntensity = (node.material.emissiveIntensity || 0) + 0.25;
                }
            });
        });

        setTimeout(() => {
            interactions.forEach(({ mesh }) => {
                mesh.parent?.traverse((node) => {
                    if (node.material?.emissive && node.userData.originalEmissive !== undefined) {
                        node.material.emissiveIntensity = node.userData.originalEmissive;
                    }
                });
            });
        }, 2500);
    };

    update = () => {
        const delta = this.timer.getDelta();
        this.elapsed += delta;

        this.interactionManager.update();
        this.cameraController.update(delta);
        this.museum.update(this.elapsed);
        this.exhibits.update(this.elapsed);
        this.particles.update(this.elapsed);

        renderer.render(scene, camera);
        this.frameRequest = requestAnimationFrame(this.update);
    };
}
