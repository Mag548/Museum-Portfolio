# Manan's Museum

An interactive 3D portfolio built with Three.js. Explore a British Museum–inspired hall with five glass-cased exhibits, cinematic camera transitions, and a hidden **Future Vision** room.

All 3D content is built **procedurally in the browser** — no external model files or export step required.

## Run locally

```bash
cd 3D-room-portofolio
python3 -m http.server 8080
```

Open **http://localhost:8080**

Compile SCSS after style changes:

```bash
npx sass stylesheets/style.scss stylesheets/style.css
```

## Exhibits

| Exhibit | 3D Content |
|---|---|
| **About Me** | Rotating holographic statue, orbiting keywords |
| **Experience** | Interconnected metallic rings — click a ring for details |
| **Projects & Accolades** | Trophy case, miniature laptop, project showcases |
| **Hobbies** | Badminton racket, camera, VR headset, laptop, car model |
| **Contact** | Holographic LinkedIn, GitHub, Email, and Resume buttons |
| **Future Vision** *(secret)* | Glowing briefcase — triple-click the **M** centerpiece |

## Controls

- **Click exhibit** — zoom camera + open panel
- **Click sub-items** — rings, trophies, hobbies, contact discs
- **Nav buttons** — jump to any exhibit
- **Esc** — close panel and return to overview
- **Triple-click M** — Future Vision secret room

## Customization

Edit `script/museum/content.js` for panel text, plaques, timeline, projects, and contact links.

Place your resume at `assets/resume.pdf` for the 3D Resume button.
