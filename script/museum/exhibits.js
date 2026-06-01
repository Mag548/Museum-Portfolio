import {
    buildAboutExhibit,
    buildExperienceExhibit,
    buildProjectsExhibit,
    buildHobbiesExhibit,
    buildContactExhibit,
    animateAbout,
    animateExperience,
    animateProjects,
    animateHobbies,
    animateContact,
} from "./exhibitModels.js";
import { EXHIBITS } from "./constants.js";

export default class Exhibits {
    constructor(museum, interactionManager) {
        this.museum = museum;
        this.interactionManager = interactionManager;
        this.exhibits = {};
        this.hoverTargets = [];
        this.spotlights = {};
        this.states = {};
        this.subInteractives = [];
        this.hobbyAnimId = null;

        EXHIBITS.forEach(({ id }) => {
            const pedestal = museum.pedestals[id];
            if (!pedestal) return;

            const anchor = pedestal.contentAnchor;
            let state;

            switch (id) {
                case "about":
                    state = buildAboutExhibit(anchor);
                    break;
                case "experience":
                    state = buildExperienceExhibit(anchor);
                    state.rings.forEach(({ hit, id: ringId }) => {
                        this.subInteractives.push({
                            mesh: hit,
                            type: "ring",
                            ringId,
                            exhibitId: id,
                        });
                        interactionManager.add(hit);
                    });
                    break;
                case "projects":
                    state = buildProjectsExhibit(anchor);
                    state.interactives.forEach(({ mesh, projectId }) => {
                        mesh.userData.projectId = projectId;
                        this.subInteractives.push({ mesh, type: "project", projectId, exhibitId: id });
                        interactionManager.add(mesh);
                    });
                    break;
                case "hobbies":
                    state = buildHobbiesExhibit(anchor);
                    state.items.forEach(({ hit, id: hobbyId }) => {
                        this.subInteractives.push({ mesh: hit, type: "hobby", hobbyId, exhibitId: id });
                        interactionManager.add(hit);
                    });
                    break;
                case "contact":
                    state = buildContactExhibit(anchor);
                    state.buttons.forEach(({ disc, id: contactId }) => {
                        this.subInteractives.push({ mesh: disc, type: "contact", contactId, exhibitId: id });
                        interactionManager.add(disc);
                    });
                    break;
            }

            this.states[id] = state;
            this.exhibits[id] = pedestal.group;
            this.hoverTargets.push({ id, mesh: pedestal.hitBox, group: pedestal.group });
        });
    }

    setHover(id, isHovering) {
        const entry = this.hoverTargets.find((t) => t.id === id);
        if (!entry) return;

        entry.group.traverse((node) => {
            if (node.material?.emissive) {
                const base = node.userData.baseEmissive ?? node.material.emissiveIntensity;
                if (node.userData.baseEmissive === undefined) node.userData.baseEmissive = base;
                node.material.emissiveIntensity = isHovering ? base + 0.15 : base;
            }
        });

        if (this.spotlights[id]) {
            this.spotlights[id].intensity = isHovering ? 5 : 3.2;
        }
    }

    animateHobby(hobbyId) {
        this.hobbyAnimId = hobbyId;
        setTimeout(() => { this.hobbyAnimId = null; }, 2200);
    }

    update(time) {
        if (this.states.about) animateAbout(this.states.about, time);
        if (this.states.experience) animateExperience(this.states.experience, time);
        if (this.states.projects) animateProjects(this.states.projects, time);
        if (this.states.hobbies) animateHobbies(this.states.hobbies, time, this.hobbyAnimId);
        if (this.states.contact) animateContact(this.states.contact, time);
    }
}
