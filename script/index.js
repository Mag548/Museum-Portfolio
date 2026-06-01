import "./utils/utilities.js";
import init3D from "./utils/init3D.js";
import { MuseumPanel, initPanelClose, initExhibitFlow, openContactLink, beginExhibitFocus } from "./dom.js";
import { EXHIBITS, exhibitPosition } from "./museum/constants.js";

window.colors = {
    museum: {
        environment: {
            ambient: [0xfff8f0, 0.75],
            fog: 0xf5f0e6,
        },
        css: {
            black: "28, 24, 20",
            navy: "61, 40, 23",
            graphite: "42, 38, 34",
            white: "255, 254, 248",
            blue: "184, 134, 11",
            blueBright: "201, 162, 39",
            cream: "245, 240, 230",
            wood: "92, 64, 51",
            marble: "42, 38, 34",
        },
    },
};

window.activePanel = "";
const museumPanel = new MuseumPanel();
window.museumPanel = museumPanel;

window.openContactLink = openContactLink;

window.openPanel = (id, options = {}) => {
    document.body.style.cursor = "initial";
    activePanel = id;
    museumPanel.open(id, options);
};

window.closePanel = () => {
    if (!activePanel && !museumPanel.activeId) return;
    museumPanel.close();
    activePanel = "";
    document.getElementById("read-more-prompt")?.classList.remove("prompt-visible");
    if (world?.cameraController) {
        world.cameraController.returnToOverview();
    }
};

initPanelClose();
initExhibitFlow();

window.openModal = (targetId) => {
    const modal = document.getElementById(targetId);
    if (!modal) return;
    modal.classList.add("modal-active");
};

window.closeModal = () => {
    const modal = document.getElementById("mobile-alert");
    if (modal) modal.classList.remove("modal-active");
};

export const controls = init3D();

setColors("museum");

document.querySelectorAll(".exhibit-nav button").forEach((btn) => {
    btn.addEventListener("click", () => {
        const id = btn.dataset.exhibit;
        const exhibit = EXHIBITS.find((e) => e.id === id);
        if (!exhibit || !world?.cameraController) return;
        if (activePanel) closePanel();
        const pos = exhibitPosition(exhibit.angle);
        beginExhibitFocus(id, pos);
    });
});

document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const prompt = document.getElementById("read-more-prompt");
    if (prompt?.classList.contains("prompt-visible")) {
        prompt.classList.remove("prompt-visible");
        world?.cameraController?.returnToOverview();
        return;
    }
    if (activePanel) closePanel();
});
