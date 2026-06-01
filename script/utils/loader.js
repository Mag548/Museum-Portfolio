import World from "../world.js";

export default class Loader {
    constructor(loadOverlay) {
        this.overlay = loadOverlay;
    }

    load = () => {
        console.log("%cLoading Manan's Museum...", "color: #0066ff; font-weight: bold");

        const dots = this.overlay.querySelectorAll(".dot");
        dots.forEach((dot, i) => {
            setTimeout(() => dot.classList.add("loaded"), i * 150);
        });

        setTimeout(() => {
            console.log("%cMuseum ready!", "color: #00a8ff; font-weight: bold");
            this.overlay.classList.add("fade-out");
            setTimeout(() => {
                this.overlay.style.display = "none";
            }, 600);
            window.world = new World();
        }, 800);
    };
}
