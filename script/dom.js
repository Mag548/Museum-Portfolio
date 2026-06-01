import { EXHIBIT_CONTENT } from "./museum/content.js";

const panel = document.getElementById("exhibit-panel");
const panelTitle = document.getElementById("panel-title");
const panelBody = document.getElementById("panel-body");
const readMorePrompt = document.getElementById("read-more-prompt");
const panelToggle = document.getElementById("panel-toggle");

let pendingExhibitId = null;
let pendingExhibitPos = null;
let pendingExhibitOptions = null;

export class MuseumPanel {
    constructor() {
        this.activeId = null;
        this.depth = "out";
    }

    open(id, options = {}) {
        const content = EXHIBIT_CONTENT[id];
        if (!content || !panel) return;

        this.activeId = id;
        panelTitle.textContent = content.title;
        panelBody.innerHTML = this.renderContent(id, content);
        panel.classList.add("panel-active");
        panel.setAttribute("aria-hidden", "false");
        this.setDepth("in");
        this.bindInteractions(id);

        if (options.ringId) this.expandExperienceRing(options.ringId);
        if (options.projectId) this.selectProject(options.projectId);
        if (options.hobbyId) {
            this.selectHobby(options.hobbyId);
            window.world?.exhibits?.animateHobby(options.hobbyId);
        }
    }

    setDepth(depth) {
        this.depth = depth;
        if (!panel) return;
        panel.classList.toggle("panel-expanded", depth === "in");
        panel.classList.toggle("panel-collapsed", depth === "out");
        panelToggle?.classList.toggle("is-in", depth === "in");
        panelToggle?.classList.toggle("is-out", depth === "out");
    }

    toggleDepth() {
        if (this.depth === "in") {
            this.setDepth("out");
            window.world?.zoomExhibitOut?.();
        } else {
            this.setDepth("in");
            window.world?.zoomExhibitIn?.();
        }
    }

    openExperienceRing(ringId) {
        this.open("experience", { ringId });
    }

    expandExperienceRing(ringId) {
        requestAnimationFrame(() => {
            const card = panelBody.querySelector(`.timeline-card[data-id="${ringId}"]`);
            if (!card) return;
            const btn = card.querySelector(".timeline-header");
            const body = card.querySelector(".timeline-body");
            card.classList.add("expanded");
            btn?.setAttribute("aria-expanded", "true");
            if (body) body.style.maxHeight = `${body.scrollHeight}px`;
            card.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
    }

    selectProject(projectId) {
        requestAnimationFrame(() => {
            const card = panelBody.querySelector(`.project-card[data-id="${projectId}"]`);
            card?.classList.add("selected");
            card?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
    }

    selectHobby(hobbyId) {
        requestAnimationFrame(() => {
            const card = panelBody.querySelector(`.hobby-card[data-hobby="${hobbyId}"]`);
            card?.classList.add("selected");
            card?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
    }

    close() {
        if (!panel) return;
        panel.classList.remove("panel-active", "panel-expanded", "panel-collapsed");
        panel.setAttribute("aria-hidden", "true");
        this.activeId = null;
        this.depth = "out";
        panelToggle?.classList.remove("is-in", "is-out");
    }

    renderContent(id, content) {
        switch (id) {
            case "about":
                return content.sections
                    .map(
                        (s) => `
                    <div class="glass-card">
                        <h3>${s.heading}</h3>
                        <p>${s.body}</p>
                    </div>`
                    )
                    .join("");

            case "experience":
                return `<p class="panel-hint">Click rings in the 3D sculpture or expand sections below.</p>
                <div class="timeline">${content.timeline
                    .map(
                        (item) => `
                    <div class="timeline-card" data-id="${item.id}">
                        <button class="timeline-header" aria-expanded="false">
                            <span>${item.title}</span>
                            <span class="timeline-chevron">›</span>
                        </button>
                        <div class="timeline-body">
                            ${this.renderEntries(item.entries)}
                        </div>
                    </div>`
                    )
                    .join("")}</div>`;

            case "projects":
                return `<div class="project-grid">${content.items
                    .map(
                        (item) => `
                    <article class="glass-card project-card" data-id="${item.id}">
                        <div class="project-thumb">${item.image ? `<img src="${item.image}" alt="" loading="lazy">` : "<div class='project-placeholder'></div>"}</div>
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        ${item.link && item.link !== "#" ? `<a href="${item.link}" class="btn btn-glow" target="_blank" rel="noopener">Learn More</a>` : ""}
                    </article>`
                    )
                    .join("")}</div>`;

            case "hobbies":
                return `<div class="hobby-grid">${content.items
                    .map(
                        (item) => `
                    <button class="glass-card hobby-card" data-hobby="${item.id}">
                        <span class="hobby-icon">${this.hobbyIcon(item.id)}</span>
                        <h3>${item.label}</h3>
                        <p class="hobby-desc">${item.description}</p>
                    </button>`
                    )
                    .join("")}</div>`;

            case "contact":
                return `
                    <p class="contact-note">${content.note}</p>
                    <div class="contact-detail">
                        <p><strong>Manan Goswami</strong></p>
                        <p>Grade 12 · Abbey Park High School</p>
                        <p>Oakville, Ontario</p>
                    </div>
                    <div class="contact-grid">
                        ${content.links
                            .map(
                                (link) =>
                                    link.url === "#"
                                        ? `<span class="glass-card contact-link contact-static" data-id="${link.id}">
                                <span class="contact-icon">${link.icon}</span>
                                <span>${link.label}</span>
                            </span>`
                                        : `<a href="${link.url}" class="glass-card contact-link" target="_blank" rel="noopener" data-id="${link.id}">
                                <span class="contact-icon">${link.icon}</span>
                                <span>${link.label}</span>
                            </a>`
                            )
                            .join("")}
                    </div>`;

            case "secret":
                return content.sections
                    .map(
                        (s) => `
                    <div class="glass-card secret-card">
                        <h3>${s.heading}</h3>
                        <p>${s.body}</p>
                    </div>`
                    )
                    .join("");

            default:
                return "<p>Exhibit content unavailable.</p>";
        }
    }

    hobbyIcon(id) {
        const icons = {
            badminton: "🏸",
            camera: "📷",
            vr: "🥽",
            laptop: "💻",
            car: "🏎",
        };
        return icons[id] || "✦";
    }

    renderEntries(entries = []) {
        return entries
            .map(
                (entry) => `
            <div class="timeline-entry">
                <p class="entry-role"><strong>${entry.role}</strong>${entry.org ? ` — ${entry.org}` : ""}</p>
                ${entry.dates ? `<p class="entry-dates">${entry.dates}</p>` : ""}
                ${entry.details?.length ? `<ul class="entry-details">${entry.details.map((d) => `<li>${d}</li>`).join("")}</ul>` : ""}
            </div>`
            )
            .join("");
    }

    bindInteractions(id) {
        if (id === "experience") {
            panelBody.querySelectorAll(".timeline-header").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const card = btn.closest(".timeline-card");
                    const body = card.querySelector(".timeline-body");
                    const isOpen = card.classList.toggle("expanded");
                    btn.setAttribute("aria-expanded", isOpen);
                    body.style.maxHeight = isOpen ? `${body.scrollHeight}px` : "0";
                });
            });
        }

        if (id === "hobbies") {
            panelBody.querySelectorAll(".hobby-card").forEach((card) => {
                card.addEventListener("click", () => {
                    panelBody.querySelectorAll(".hobby-card").forEach((c) => c.classList.remove("selected"));
                    card.classList.add("selected");
                    window.world?.exhibits?.animateHobby(card.dataset.hobby);
                });
            });
        }

        if (id === "projects") {
            panelBody.querySelectorAll(".project-card").forEach((card) => {
                card.addEventListener("click", (e) => {
                    if (e.target.closest("a")) return;
                    panelBody.querySelectorAll(".project-card").forEach((c) => c.classList.remove("selected"));
                    card.classList.add("selected");
                });
            });
        }
    }
}

function hideReadMorePrompt() {
    readMorePrompt?.classList.remove("prompt-visible");
    readMorePrompt?.setAttribute("aria-hidden", "true");
    pendingExhibitId = null;
    pendingExhibitPos = null;
    pendingExhibitOptions = null;
}

function showReadMorePrompt(id, pos, options = {}) {
    pendingExhibitId = id;
    pendingExhibitPos = pos;
    pendingExhibitOptions = options;
    readMorePrompt?.classList.add("prompt-visible");
    readMorePrompt?.setAttribute("aria-hidden", "false");
}

function confirmReadMore() {
    const id = pendingExhibitId;
    const options = pendingExhibitOptions || {};
    hideReadMorePrompt();
    if (!id || !window.world) return;

    window.world.openExhibitDetail(id, options);
}

function dismissReadMore() {
    hideReadMorePrompt();
    window.world?.cameraController?.returnToOverview();
}

export function initExhibitFlow() {
    document.getElementById("read-more-yes")?.addEventListener("click", confirmReadMore);
    document.getElementById("read-more-no")?.addEventListener("click", dismissReadMore);

    panelToggle?.addEventListener("click", () => {
        window.museumPanel?.toggleDepth();
    });
}

export function initPanelClose() {
    document.querySelectorAll(".close-panel").forEach((btn) => {
        btn.addEventListener("click", closePanel);
    });
}

export function beginExhibitFocus(id, pos, options = {}) {
    hideReadMorePrompt();
    window.world?.cameraController?.focusExhibitFront(id, pos, () => {
        if (options.skipPrompt) {
            window.world.openExhibitDetail(id, options);
            return;
        }
        showReadMorePrompt(id, pos, options);
    });
}

export function openContactLink(contactId) {
    const link = EXHIBIT_CONTENT.contact.links.find((l) => l.id === contactId);
    if (link?.url && link.url !== "#") window.open(link.url, "_blank", "noopener");
    else openPanel("contact");
}
