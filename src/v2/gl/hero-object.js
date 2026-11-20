import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// A — the hero centrepiece. Five stacked slabs read as a system stack:
// dark chrome, one glass layer, crimson seams, orbital rings and a scan ring.
export function createSystemCore() {
  const group = new THREE.Group();

  const chrome = new THREE.MeshPhysicalMaterial({
    color: 0x2a2a33,
    metalness: 1,
    roughness: 0.2,
    envMapIntensity: 1.4,
    clearcoat: 0.8,
    clearcoatRoughness: 0.18
  });

  const graphite = new THREE.MeshPhysicalMaterial({
    color: 0x101014,
    metalness: 0.95,
    roughness: 0.32,
    envMapIntensity: 1.15
  });

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xa9b0c4,
    metalness: 0.35,
    roughness: 0.06,
    envMapIntensity: 2.1,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    transparent: true,
    opacity: 0.58
  });

  const slabGeometry = new RoundedBoxGeometry(1, 1, 1, 4, 0.055);

  const slabs = new THREE.Group();
  const slabLayout = [
    { w: 2.06, h: 0.17, d: 1.28, y: -0.64, rot: 0.13, x: -0.04, z: 0.03, mat: chrome },
    { w: 1.62, h: 0.15, d: 1.02, y: -0.32, rot: -0.17, x: 0.07, z: -0.04, mat: graphite },
    { w: 1.92, h: 0.16, d: 1.18, y: 0.0, rot: 0.1, x: -0.06, z: 0.05, mat: chrome },
    { w: 1.46, h: 0.14, d: 0.94, y: 0.31, rot: -0.14, x: 0.06, z: -0.02, mat: glass },
    { w: 1.72, h: 0.12, d: 1.06, y: 0.6, rot: 0.19, x: -0.03, z: 0.04, mat: chrome }
  ];

  slabLayout.forEach((slab) => {
    const mesh = new THREE.Mesh(slabGeometry, slab.mat);
    mesh.scale.set(slab.w, slab.h, slab.d);
    mesh.position.set(slab.x, slab.y, slab.z);
    mesh.rotation.y = slab.rot;
    slabs.add(mesh);
  });

  group.add(slabs);

  // Crimson energy seams across each gap.
  const seamMaterial = new THREE.MeshBasicMaterial({
    color: 0xff2438,
    transparent: true,
    opacity: 0.42,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false
  });

  const seamGeometry = new THREE.BoxGeometry(1, 1, 1);
  const seamLayout = [
    { y: -0.48, w: 1.34, z: 0.54 },
    { y: -0.16, w: 1.18, z: 0.5 },
    { y: 0.155, w: 1.06, z: 0.48 },
    { y: 0.455, w: 0.92, z: 0.44 }
  ];

  seamLayout.forEach((seam) => {
    const strip = new THREE.Mesh(seamGeometry, seamMaterial);
    strip.scale.set(seam.w, 0.008, 0.014);
    strip.position.set(0, seam.y, seam.z);
    group.add(strip);
  });

  // Vertical core visible through the gaps.
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0xff2038,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false
  });

  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.64, 10), coreMaterial);
  group.add(core);

  const haloMaterial = new THREE.MeshBasicMaterial({
    color: 0xff2038,
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false
  });

  const halo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 1.64, 16, 1, true),
    haloMaterial
  );
  group.add(halo);

  // Orbital rings — two solid, one dashed.
  const ringA = createRing(2.32, 0.3, [1.18, 0.12, 0.24], false);
  const ringB = createRing(2.82, 0.15, [1.36, -0.32, -0.18], true);
  const ringC = createRing(3.12, 0.07, [1.02, 0.46, 0.1], false);

  group.add(ringA, ringB, ringC);

  // Nodes on the inner orbit.
  const nodeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd9dae2,
    metalness: 1,
    roughness: 0.18,
    envMapIntensity: 1.5
  });

  const nodes = new THREE.Group();
  const nodeGeometry = new THREE.OctahedronGeometry(0.034, 0);

  for (let i = 0; i < 7; i += 1) {
    const angle = (i / 7) * Math.PI * 2;
    const radius = 2.32 + (i % 2 ? 0.28 : 0);
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle * 2) * 0.34,
      Math.sin(angle) * radius
    );
    nodes.add(node);
  }

  nodes.rotation.set(0.18, 0, 0.08);
  group.add(nodes);

  // Drifting interface plates — a quiet echo of the UI work.
  const plateMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x35353f,
    metalness: 0.9,
    roughness: 0.28,
    envMapIntensity: 1.2,
    side: THREE.DoubleSide
  });

  const plateGeometry = new THREE.BoxGeometry(0.4, 0.014, 0.26);
  const fragments = new THREE.Group();

  [
    [-2.15, 0.92, 0.4, 0.32, 0.2],
    [2.2, 1.2, -0.45, -0.25, 0.15],
    [-2.4, -0.82, -0.28, 0.5, -0.1],
    [2.05, -1.12, 0.5, 0.16, 0.36],
    [0.15, 1.82, -1.35, -0.42, 0.1]
  ].forEach(([x, y, z, rot, tilt]) => {
    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    plate.position.set(x, y, z);
    plate.rotation.set(tilt, rot, tilt * 0.5);
    plate.userData.baseY = y;
    fragments.add(plate);
  });

  group.add(fragments);

  // A thin horizontal scan ring travelling through the stack.
  const scanGeometry = new THREE.BufferGeometry().setFromPoints(
    Array.from({ length: 72 }, (_, i) => {
      const angle = (i / 72) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle) * 1.18, 0, Math.sin(angle) * 1.18);
    })
  );

  const scanMaterial = new THREE.LineBasicMaterial({
    color: 0xff3348,
    transparent: true,
    opacity: 0.16,
    depthWrite: false
  });

  const scanRing = new THREE.Line(scanGeometry, scanMaterial);
  scanRing.rotation.x = Math.PI / 2;
  group.add(scanRing);

  return {
    group,
    mesh: group,
    rings: [ringA, ringB, ringC],
    nodes,
    fragments,
    core,
    halo,
    scanRing
  };
}

function createRing(radius, opacity, rotation, dashed) {
  const points = [];

  for (let i = 0; i < 220; i += 1) {
    const angle = (i / 220) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = dashed
    ? new THREE.LineDashedMaterial({
        color: 0xff3348,
        transparent: true,
        opacity,
        dashSize: 0.06,
        gapSize: 0.12,
        depthWrite: false
      })
    : new THREE.LineBasicMaterial({
        color: 0xff3348,
        transparent: true,
        opacity,
        depthWrite: false
      });

  const line = new THREE.Line(geometry, material);
  if (dashed) line.computeLineDistances();
  line.rotation.set(...rotation);
  return line;
}
