import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';

const PIXELS_PER_METER = 100;

export function createCssGallery(scene) {
  const adapter = new CSS3DRenderer();
  adapter.domElement.className = 'css-gallery';
  function plane(parent, width, height, className, content) {
    const element = document.createElement('div');
    element.className = 'room-plane ' + className;
    element.style.width = width * PIXELS_PER_METER + 'px';
    element.style.height = height * PIXELS_PER_METER + 'px';
    if (content) element.append(content);
    const object = new CSS3DObject(element);
    element.style.pointerEvents = 'none';
    object.scale.setScalar(1 / PIXELS_PER_METER);
    parent.add(object);
    return object;
  }

  const floor = plane(scene, 25, 33, 'room-floor');
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -2.5;
  const ceiling = plane(scene, 25, 33, 'room-ceiling');
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 6, -2.5);
  const farWall = plane(scene, 25, 6, 'room-wall far-wall');
  farWall.position.set(0, 3, -18.9);
  const nearWall = plane(scene, 25, 6, 'room-wall');
  nearWall.rotation.y = Math.PI;
  nearWall.position.set(0, 3, 13.8);
  for (const side of [-1, 1]) {
    const wall = plane(scene, 33, 6, 'room-wall side-wall');
    wall.position.set(side * 12.3, 3, -2.5);
    wall.rotation.y = -side * Math.PI / 2;
  }
  for (const z of [9, 1.5, -6, -13.5]) {
    const strip = plane(scene, 10.6, .085, 'room-ceiling-light');
    strip.rotation.x = Math.PI / 2;
    strip.position.set(0, 5.68, z);
  }

  function exitDoor(group, leaves, exitSign) {
    const door = plane(group, 2.65, 3.12, 'room-exit-door');
    door.position.y = 1.56;
    for (const { side, hinge } of leaves) {
      const handle = document.createElement('span');
      handle.className = 'room-exit-handle';
      handle.style[side < 0 ? 'right' : 'left'] = '14px';
      const panel = plane(hinge, 1.16, 2.86, 'room-exit-panel', handle);
      panel.position.set(-side * .58, 1.44, .003);
    }
    const title = document.createElement('span');
    title.textContent = 'EXIT';
    const { width, height } = exitSign.geometry.parameters;
    const sign = plane(group, width, height, 'room-exit-sign', title);
    sign.position.copy(exitSign.position);
  }

  function station(group, exhibit) {
    const image = new Image();
    image.alt = '';
    const art = plane(group, exhibit.width, 1, 'room-exhibit', image);
    const header = document.createElement('div');
    header.className = 'room-art-label';
    const identity = document.createElement('small');
    identity.textContent = `${exhibit.place} · ${exhibit.year}`;
    const name = document.createElement('p');
    name.textContent = exhibit.name;
    header.append(identity, name);
    const label = plane(group, 5.15, 1, 'room-plaque', header);
    label.position.set(0, 2.6, .025);
    header.style.setProperty('--exhibit-color', exhibit.color);
    const patch = plane(group, Math.max(exhibit.width * 1.5, 5.2), 5.2, 'room-pool');
    patch.rotation.x = -Math.PI / 2;
    patch.position.y = .013;
    patch.element.style.setProperty('--exhibit-color', exhibit.color);
    const marker = plane(group, 3.68, 3.68, 'room-range');
    marker.rotation.x = -Math.PI / 2;
    marker.position.y = .022;
    marker.element.style.setProperty('--exhibit-color', exhibit.color);
    image.addEventListener('load', () => {
      const height = exhibit.width * image.naturalHeight / image.naturalWidth;
      art.element.style.height = height * PIXELS_PER_METER + 'px';
      art.position.y = height / 2 + .035;
      label.position.y = height + .5;
    });
    image.src = `${import.meta.env.BASE_URL}exhibits/${exhibit.id}.webp`;
    return { focus: value => { marker.element.classList.toggle('lit', value); } };
  }
  return { adapter, station, exitDoor };
}
