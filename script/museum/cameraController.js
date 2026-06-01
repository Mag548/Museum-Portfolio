export default class CameraController {
    constructor(camera, controls) {
        this.camera = camera;
        this.controls = controls;
        this.isAnimating = false;
        this.introComplete = false;
        this.overviewPosition = new THREE.Vector3(0, 4, 14);
        this.overviewTarget = new THREE.Vector3(0, 2, 0);
        this.secretPosition = new THREE.Vector3(0, 3, -28);
        this.secretTarget = new THREE.Vector3(0, 2, -34);
        this.currentFocus = null;
        this.focusStage = null;

        this.frontCam = { position: new THREE.Vector3(), target: new THREE.Vector3() };
        this.plaqueCam = { position: new THREE.Vector3(), target: new THREE.Vector3() };

        this.fromPos = new THREE.Vector3();
        this.toPos = new THREE.Vector3();
        this.fromTarget = new THREE.Vector3();
        this.toTarget = new THREE.Vector3();
        this.progress = 1;
        this.duration = 0;
        this.elapsed = 0;
        this.onComplete = null;

        this.controls.enabled = true;
        this.setFreeRoamLimits();
        this.controls.addEventListener("start", () => this.cancelAnimation());

        this.startIntro();
    }

    setFreeRoamLimits() {
        this.controls.minDistance = 1.2;
        this.controls.maxDistance = 42;
        this.controls.minPolarAngle = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
        this.controls.minAzimuthAngle = -Infinity;
        this.controls.maxAzimuthAngle = Infinity;
    }

    cancelAnimation() {
        if (!this.isAnimating) return;
        this.isAnimating = false;
        this.onComplete = null;
        this.controls.update();
    }

    startIntro() {
        this.camera.position.set(0, 3.5, 32);
        this.controls.target.set(0, 4, 24);

        this.animateTo(
            { position: new THREE.Vector3(0, 3.2, 26), target: new THREE.Vector3(0, 5, 23.5) },
            2.5,
            () => {
                this.animateTo(
                    { position: new THREE.Vector3(0, 2.8, 12), target: new THREE.Vector3(0, 2.5, 0) },
                    3.5,
                    () => {
                        this.introComplete = true;
                        this.setFreeRoamLimits();
                    }
                );
            }
        );
    }

    inwardVector(position) {
        const len = Math.hypot(position.x, position.z) || 1;
        return new THREE.Vector3(-position.x / len, 0, -position.z / len);
    }

    computeFrontShot(position) {
        const inward = this.inwardVector(position);
        const target = new THREE.Vector3(position.x, 1.85, position.z);
        const camPos = target.clone().add(inward.multiplyScalar(2.35));
        camPos.y = 2.05;
        return { position: camPos, target };
    }

    computePlaqueShot(pedestal) {
        const plaque = pedestal?.plaque;
        const target = new THREE.Vector3();
        if (plaque) {
            plaque.getWorldPosition(target);
        } else {
            const pos = pedestal.group.position;
            target.set(pos.x, 1.85, pos.z);
        }

        const inward = this.inwardVector(pedestal.group.position);
        const camPos = target.clone().add(inward.multiplyScalar(0.72));
        camPos.y = target.y + 0.02;
        return { position: camPos, target };
    }

    focusExhibitFront(exhibitId, position, onComplete) {
        if (!this.introComplete) return;

        const shot = this.computeFrontShot(position);
        this.frontCam.position.copy(shot.position);
        this.frontCam.target.copy(shot.target);

        this.currentFocus = exhibitId;
        this.focusStage = "front";

        this.animateTo(shot, 1.8, () => {
            this.isAnimating = false;
            if (onComplete) onComplete();
        });
    }

    focusExhibitPlaque(exhibitId, pedestal, onComplete) {
        if (!this.introComplete) return;

        const shot = this.computePlaqueShot(pedestal);
        this.plaqueCam.position.copy(shot.position);
        this.plaqueCam.target.copy(shot.target);

        this.currentFocus = exhibitId;
        this.focusStage = "plaque";

        this.animateTo(shot, 1.5, () => {
            this.isAnimating = false;
            if (onComplete) onComplete();
        });
    }

    returnToExhibitFront(onComplete) {
        if (!this.introComplete || !this.currentFocus) return;

        this.focusStage = "front";

        this.animateTo(
            {
                position: this.frontCam.position.clone(),
                target: this.frontCam.target.clone(),
            },
            1.3,
            () => {
                this.isAnimating = false;
                if (onComplete) onComplete();
            }
        );
    }

    returnToOverview(onComplete) {
        if (!this.introComplete) return;

        this.currentFocus = null;
        this.focusStage = null;

        this.animateTo(
            { position: this.overviewPosition.clone(), target: this.overviewTarget.clone() },
            1.4,
            () => {
                this.setFreeRoamLimits();
                if (onComplete) onComplete();
            }
        );
    }

    revealSecretRoom(onComplete) {
        if (!this.introComplete) return;

        this.currentFocus = "secret";
        this.focusStage = "plaque";
        this.animateTo(
            { position: this.secretPosition.clone(), target: this.secretTarget.clone() },
            2,
            () => {
                if (onComplete) onComplete();
            }
        );
    }

    animateTo({ position, target }, duration, onComplete) {
        this.fromPos.copy(this.camera.position);
        this.toPos.copy(position);
        this.fromTarget.copy(this.controls.target);
        this.toTarget.copy(target);
        this.duration = duration;
        this.elapsed = 0;
        this.progress = 0;
        this.isAnimating = true;
        this.onComplete = onComplete;
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    update(delta) {
        if (this.isAnimating) {
            this.elapsed += delta;
            this.progress = Math.min(this.elapsed / this.duration, 1);
            const eased = this.easeInOutCubic(this.progress);

            this.camera.position.lerpVectors(this.fromPos, this.toPos, eased);
            this.controls.target.lerpVectors(this.fromTarget, this.toTarget, eased);

            if (this.progress >= 1) {
                this.isAnimating = false;
                if (this.onComplete) {
                    const cb = this.onComplete;
                    this.onComplete = null;
                    cb();
                }
            }
        }

        this.controls.update();
    }
}
