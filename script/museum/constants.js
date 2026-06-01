export const PALETTE = {
    marbleDark: 0x1c1a18,
    marbleMid: 0x2a2724,
    marbleLight: 0x3a3632,
    woodDark: 0x3d2817,
    woodMid: 0x5c4033,
    woodLight: 0x7a5c44,
    stoneWall: 0xd8d2c8,
    stoneTrim: 0xbdb5a8,
    cream: 0xf5f0e6,
    brass: 0xb8860b,
    gold: 0xc9a227,
    bronze: 0x8b6914,
    white: 0xfffef8,
    warmLight: 0xffeedd,
    // legacy aliases used across files
    black: 0x1c1a18,
    navy: 0x3d2817,
    graphite: 0x2a2724,
    blue: 0xb8860b,
    blueBright: 0xc9a227,
    blueGlow: 0xd4af37,
};

export const EXHIBITS = [
    { id: "about", label: "About Me", angle: -Math.PI / 2 },
    { id: "experience", label: "Experience", angle: -Math.PI / 2 + (Math.PI * 2) / 5 },
    { id: "projects", label: "Projects & Accolades", angle: -Math.PI / 2 + ((Math.PI * 2) / 5) * 2 },
    { id: "hobbies", label: "Hobbies", angle: -Math.PI / 2 + ((Math.PI * 2) / 5) * 3 },
    { id: "contact", label: "Contact", angle: -Math.PI / 2 + ((Math.PI * 2) / 5) * 4 },
];

export const EXHIBIT_RADIUS = 9;
export const HALL_SIZE = 36;
export const HALL_HEIGHT = 11;

export function exhibitPosition(angle) {
    const x = Math.cos(angle) * EXHIBIT_RADIUS;
    const z = Math.sin(angle) * EXHIBIT_RADIUS;
    return {
        x,
        y: 0,
        z,
        facing: Math.atan2(-x, -z),
    };
}
