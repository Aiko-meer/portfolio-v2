import * as THREE from 'three';

export function createHeroObject() {
  const group = new THREE.Group();

  const geometry = new THREE.IcosahedronGeometry(1.6, 1);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xc4c4cc,
    metalness: 1,
    roughness: 0.14,
    envMapIntensity: 1.15,
    clearcoat: 1,
    clearcoatRoughness: 0.15
  });

  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry, 18),
    new THREE.LineBasicMaterial({
      color: 0xff3046,
      transparent: true,
      opacity: 0.14
    })
  );
  mesh.add(edges);

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xff3046,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.006, 8, 220), ringMaterial);
  ring1.rotation.set(1.2, 0.15, 0.3);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.9, 0.004, 6, 220),
    ringMaterial.clone()
  );
  ring2.material.opacity = 0.22;
  ring2.rotation.set(1.35, -0.4, -0.2);

  group.add(ring1, ring2);

  const shardMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x8a8a95,
    metalness: 1,
    roughness: 0.25,
    envMapIntensity: 1
  });

  const shards = new THREE.Group();
  [
    [2.6, 0.9, -0.6],
    [-2.2, -1.1, 0.8],
    [1.4, -2.2, -1.2]
  ].forEach((position, index) => {
    const shard = new THREE.Mesh(new THREE.TetrahedronGeometry(0.11 + index * 0.02, 0), shardMaterial);
    shard.position.set(...position);
    shards.add(shard);
  });

  group.add(shards);

  return { group, mesh, rings: [ring1, ring2], shards };
}
