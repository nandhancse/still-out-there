import * as THREE from 'three';

const material = (color, metalness = .12, roughness = .46) =>
  new THREE.MeshStandardMaterial({ color, metalness, roughness });

function mesh(parent, geometry, finish, x, y, z) {
  const part = new THREE.Mesh(geometry, finish);
  part.position.set(x, y, z);
  parent.add(part);
  return part;
}

function box(parent, finish, size, center) {
  return mesh(parent, new THREE.BoxGeometry(...size), finish, ...center);
}

function rod(parent, finish, from, to, radius = .018) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const middle = start.clone().lerp(end, .5);
  const part = mesh(parent, new THREE.CylinderGeometry(radius, radius, start.distanceTo(end), 8), finish, ...middle);
  part.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize());
  return part;
}

export function buildReflector() {
  const model = new THREE.Group();
  const aluminum = material('#c7ccd1', .48);
  const face = material('#252a30', .28);
  const rim = material('#a7b8c2', .43);
  const glass = material('#8dabc2', .46, .21);
  box(model, aluminum, [1.04, .055, .93], [0, .032, .025]);
  const frame = new THREE.Group();
  frame.position.set(0, .34, 0);
  frame.rotation.x = -.60;
  model.add(frame);
  box(frame, aluminum, [.96, .115, .94], [0, 0, 0]);
  box(frame, face, [.919, .02, .895], [0, .06, 0]);
  const aperture = new THREE.CylinderGeometry(.034, .038, .012, 14);
  const cornerCube = new THREE.ConeGeometry(.028, .014, 3);
  const apertures = new THREE.InstancedMesh(aperture, rim, 100);
  const corners = new THREE.InstancedMesh(cornerCube, glass, 100);
  const transform = new THREE.Object3D();
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const index = row * 10 + col;
      const x = (col - 4.5) * .087;
      const z = (row - 4.5) * .086;
      transform.position.set(x, .077, z);
      transform.rotation.y = 0;
      transform.updateMatrix();
      apertures.setMatrixAt(index, transform.matrix);
      transform.position.y = .088;
      transform.rotation.y = (row + col) % 2 * Math.PI / 3;
      transform.updateMatrix();
      corners.setMatrixAt(index, transform.matrix);
    }
  }
  frame.add(apertures, corners);
  for (const x of [-.45, .45]) {
    rod(model, aluminum, [x, .06, -.33], [x, .52, -.27], .026);
    rod(model, aluminum, [x, .06, .38], [x, .45, -.15], .023);
    rod(model, aluminum, [x, .52, -.27], [x, .64, -.40], .018);
  }
  rod(model, aluminum, [-.45,.64,-.40],[.45,.64,-.40],.018);
  return model;
}

export function buildLunarRover() {
  const model = new THREE.Group();
  const chassis = material('#b4b4ad', .43);
  const wire = material('#7c858d', .45);
  const rubber = material('#38393a', .22, .82);
  const gold = material('#b88c4c', .53);
  const canvas = material('#d9d8c9', .04, .92);
  const fender = material('#a7745d', .14);
  const panel = material('#616f72');
  box(model, chassis, [1.48,.10,2.72],[0,.47,0]);
  box(model, gold, [1.36,.25,.59],[0,.63,1.00]);
  box(model, panel, [1.20,.21,.62],[0,.62,-1.05]);
  box(model, chassis, [.29,.20,.64],[0,.66,.23]);
  rod(model, chassis, [0,.77,.48],[0,.96,.58],.016);
  box(model, rubber, [.16,.045,.045],[0,.96,.58]);

  for (const x of [-.39,.39]) {
    box(model, canvas, [.58,.09,.60],[x,.72,-.06]);
    const back = box(model, canvas, [.55,.60,.07],[x,.97,-.38]);
    back.rotation.x = -.19;
    for (const side of [-1,1]) {
      const edge = x + side * .27;
      rod(model, chassis, [edge,.48,-.25],[edge,.70,.24]);
      rod(model, chassis, [edge,.70,.20],[edge,1.25,-.43]);
    }
  }
  const wheelGeometry = new THREE.CylinderGeometry(.345,.345,.23,32,1,true);
  const hubGeometry = new THREE.CylinderGeometry(.155,.155,.247,16);
  for (const x of [-.85,.85]) {
    for (const z of [-1.04,1.04]) {
      const wheel = mesh(model,wheelGeometry,rubber,x,.352,z);
      wheel.rotation.z = Math.PI/2;
      wheel.material.side = THREE.DoubleSide;
      mesh(model,hubGeometry,chassis,x,.352,z).rotation.z=Math.PI/2;
      for (const edge of [-.115,.115]) {
        const bead=mesh(model,new THREE.TorusGeometry(.343,.017,7,36),wire,x+edge,.352,z);
        bead.rotation.y=Math.PI/2;
      }
      for (let i=0;i<22;i++) {
        const a=i*Math.PI/11;
        const b=a+.15;
        rod(model,wire,[x-.112,.352+.345*Math.cos(a),z+.345*Math.sin(a)],
          [x+.112,.352+.345*Math.cos(b),z+.345*Math.sin(b)],.008);
      }
      const guard=mesh(model,new THREE.CylinderGeometry(.425,.425,.29,20,1,true,-1.22,2.44),fender,x,.352,z);
      guard.rotation.set(0, 0, -Math.PI / 2);
      guard.rotateY(Math.PI / 2);
      guard.material.side=THREE.DoubleSide;
      rod(model,chassis,[0,.5,z],[x,.35,z],.034);
    }
  }
  rod(model,chassis,[-.52,.62,.88],[-.52,1.59,.88],.027);
  box(model, gold,[.30,.16,.26],[-.52,1.58,.88]);
  box(model, rubber,[.13,.09,.12],[-.52,1.59,1.05]);
  rod(model,chassis,[.45,.65,.76],[.45,1.88,.64],.026);
  const antenna=new THREE.Group();
  antenna.position.set(.45,1.86,.64);
  antenna.rotation.set(.50,.32,-.19);
  model.add(antenna);
  const dish=new THREE.LatheGeometry([
    new THREE.Vector2(0,0),new THREE.Vector2(.18,.014),new THREE.Vector2(.35,.05),
    new THREE.Vector2(.52,.13),new THREE.Vector2(.61,.20)
  ],36);
  const dishMetal=material('#b8ada0',.36);
  dishMetal.side=THREE.DoubleSide;
  mesh(antenna,dish,dishMetal,0,0,0);
  mesh(antenna,new THREE.TorusGeometry(.61,.013,8,36),chassis,0,.20,0).rotation.x=Math.PI/2;
  for(let i=0;i<4;i++) {
    const a=i*Math.PI/2;
    rod(antenna,chassis,[Math.sin(a)*.43,.089,Math.cos(a)*.43],[0,.43,0],.012);
  }
  rod(model, chassis,[.60,.62,-1.15],[.60,2.02,-1.15],.013);
  return model;
}
