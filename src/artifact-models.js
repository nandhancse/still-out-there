import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { buildLunarRover, buildReflector } from './apollo-models.js';

const base = import.meta.env.BASE_URL;
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const configurations = {
  apollo11: { create: buildReflector, yaw: -.33, size: 1.75 },
  apollo17: { create: buildLunarRover, yaw: -.67, size: 3.25 },
  opportunity: { yaw: -.63, size: 3.55 },
  insight: { yaw: 2.64, size: 3.85 },
  voyager: { yaw: -.67, roll: .12, size: 5.2 }
};

async function fetchModel(id) {
  const response = await fetch(`${base}models/${id}.json`);
  if (!response.ok) throw new Error(`Model index unavailable for ${id}`);
  const { parts } = await response.json();
  const pieces = await Promise.all(parts.map(async name => {
    const piece = await fetch(`${base}models/${name}`);
    if (!piece.ok) throw new Error(`Model piece unavailable for ${id}`);
    return new Uint8Array(await piece.arrayBuffer());
  }));
  const model = new Uint8Array(pieces.reduce((sum, piece) => sum + piece.length, 0));
  let offset = 0;
  for (const piece of pieces) {
    model.set(piece, offset);
    offset += piece.length;
  }
  return (await loader.parseAsync(model.buffer, `${base}models/`)).scene;
}

export async function loadArtifact(id) {
  const { create, yaw, roll = 0, size } = configurations[id];
  const object = create ? create() : await fetchModel(id);
  const oriented = new THREE.Group();
  oriented.rotation.set(0, yaw, roll, 'YXZ');
  oriented.add(object);
  const normalized = new THREE.Group();
  normalized.add(oriented);
  const bounds = new THREE.Box3().setFromObject(oriented);
  const dimensions = bounds.getSize(new THREE.Vector3());
  const factor = size / Math.max(dimensions.x, dimensions.z);
  const origin = bounds.getCenter(new THREE.Vector3());
  oriented.position.set(-origin.x, -bounds.min.y, -origin.z);
  normalized.scale.setScalar(factor);
  return { model: normalized, dimensions: dimensions.multiplyScalar(factor) };
}
