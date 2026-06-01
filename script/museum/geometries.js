/**
 * Procedural geometry helpers — high-segment, beveled shapes for museum assets.
 */

export function createBoldMGeometry(scale = 1) {
    const w = 0.75;
    const h = 1.0;
    const t = 0.22;

    const shape = new THREE.Shape();
    shape.moveTo(-w, -h);
    shape.lineTo(-w + t, -h);
    shape.lineTo(-w + t, 0.08);
    shape.lineTo(-0.08, -0.38);
    shape.lineTo(0.08, -0.38);
    shape.lineTo(w - t, 0.08);
    shape.lineTo(w - t, -h);
    shape.lineTo(w, -h);
    shape.lineTo(w, h);
    shape.lineTo(w - t, h);
    shape.lineTo(w - t, 0.38);
    shape.lineTo(0.08, 0.02);
    shape.lineTo(-0.08, 0.02);
    shape.lineTo(-w + t, 0.38);
    shape.lineTo(-w + t, h);
    shape.lineTo(-w, h);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.32 * scale,
        bevelEnabled: true,
        bevelThickness: 0.05 * scale,
        bevelSize: 0.04 * scale,
        bevelOffset: 0,
        bevelSegments: 8,
        curveSegments: 20,
    });
    geometry.center();
    return geometry;
}

export function createRoundedBoxGeometry(width, height, depth, radius = 0.06, segments = 6) {
    const shape = new THREE.Shape();
    const hw = width / 2 - radius;
    const hh = height / 2 - radius;
    const hd = depth;

    shape.moveTo(-hw, -height / 2);
    shape.lineTo(hw, -height / 2);
    shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius);
    shape.lineTo(width / 2, hh);
    shape.quadraticCurveTo(width / 2, height / 2, hw, height / 2);
    shape.lineTo(-hw, height / 2);
    shape.quadraticCurveTo(-width / 2, height / 2, -width / 2, hh);
    shape.lineTo(-width / 2, -height / 2 + radius);
    shape.quadraticCurveTo(-width / 2, -height / 2, -hw, -height / 2);

    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: hd,
        bevelEnabled: true,
        bevelThickness: radius * 0.45,
        bevelSize: radius * 0.4,
        bevelSegments: segments,
        curveSegments: 12,
    });
    geometry.center();
    return geometry;
}

export function createBrassPost(height, radius = 0.045) {
    return new THREE.CylinderGeometry(radius, radius, height, 24, 1);
}
