import * as THREE from 'three';

// Builds the target position + rotation of every card, for each arrangement.
export function buildTargets(count) {
  const targets = { table: [], sphere: [], helix: [], grid: [] };
  const vector = new THREE.Vector3();
  const cylindrical = new THREE.Cylindrical();

  for (let i = 0; i < count; i++) {
    // TABLE Layout: 20 per row
    const tableObj = new THREE.Object3D();
    const col = (i % 20) + 1;
    const row = Math.floor(i / 20) + 1;
    tableObj.position.x = (col * 140) - 1470;
    tableObj.position.y = - (row * 180) + 990;
    targets.table.push(tableObj);

    // SPHERE Layout
    const sphereObj = new THREE.Object3D();
    const phi = Math.acos(-1 + (2 * i) / count);
    const thetaSphere = Math.sqrt(count * Math.PI) * phi;
    sphereObj.position.setFromSphericalCoords(800, phi, thetaSphere);
    vector.copy(sphereObj.position).multiplyScalar(2);
    sphereObj.lookAt(vector);
    targets.sphere.push(sphereObj);

    // DOUBLE HELIX Layout: even indices form strand A, odd indices form strand B.
    // strandIndex is each card's own position along its strand (0, 1, 2, ...),
    // independent of the other strand, so both wind at the same steady rate.
    const helixObj = new THREE.Object3D();
    const strand = i % 2;
    const strandIndex = Math.floor(i / 2);
    const strandRadius = strand === 0 ? 450 : 500; // slightly different radii per strand
    const phase = strand === 0 ? 0 : Math.PI; // strand B is offset 180 degrees: anti-phase
    const thetaHelix = (strandIndex * 0.35) + phase;
    const y = - (strandIndex * 40) + 850;
    cylindrical.set(strandRadius, thetaHelix, y);
    helixObj.position.setFromCylindrical(cylindrical);
    vector.x = helixObj.position.x * 2;
    vector.y = helixObj.position.y;
    vector.z = helixObj.position.z * 2;
    helixObj.lookAt(vector);
    targets.helix.push(helixObj);

    // GRID Layout: 5x4x10 arrangement
    const gridObj = new THREE.Object3D();
    gridObj.position.x = ((i % 5) * 400) - 800;
    gridObj.position.y = (-(Math.floor(i / 5) % 4) * 400) + 800;
    gridObj.position.z = (Math.floor(i / 20) * 1000) - 2000;
    targets.grid.push(gridObj);
  }

  // Keep every arrangement centered on the origin regardless of data length
  Object.values(targets).forEach((group) => {
    if (!group.length) return;
    const centroid = new THREE.Vector3();
    group.forEach((o) => centroid.add(o.position));
    centroid.divideScalar(group.length);
    group.forEach((o) => o.position.sub(centroid));
  });

  return targets;
}
