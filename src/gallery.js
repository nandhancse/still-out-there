import * as THREE from 'three';
import { createCssGallery } from './css-gallery.js';
import { loadArtifact } from './artifact-models.js';

const START = new THREE.Vector3(-4.6, 1.62, 7.6);
const EXIT = new THREE.Vector3(START.x, 0, 13.72);
const EXIT_RANGE = 3.45;
const STORY_CLEARANCE = 1.10;
const FALLBACK_TRIGGER = 1.85;
const MAX_PITCH = Math.PI * 0.39;
const WALK_SPEED = 4.1;
const horizontalDistance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

export function createGallery(container, exhibits, onFrame) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#111824');
  scene.fog = new THREE.FogExp2('#131b29', 0.018);
  const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 90);
  camera.rotation.order = 'YXZ';
  const probe = document.createElement('canvas');
  let renderer;
  try {
    const context = probe.getContext('webgl2', { antialias: true });
    if (context) renderer = new THREE.WebGLRenderer({ canvas: probe, context, antialias: true });
  } catch {
    // The same room and controls are available with CSS 3D.
  }
  const css = renderer ? null : createCssGallery(scene);
  if (css) renderer = css.adapter;
  if (!css) {
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.55));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.23;
  }
  container.append(renderer.domElement);

  const imageLoader = new THREE.TextureLoader();
  const materials = {
    wall: new THREE.MeshStandardMaterial({ color: '#343b49', roughness: .96 }),
    column: new THREE.MeshStandardMaterial({ color: '#1c222d', roughness: .85 }),
    trim: new THREE.MeshStandardMaterial({ color: '#625744', roughness: .68, metalness: .25 }),
    ceiling: new THREE.MeshStandardMaterial({ color: '#202530', roughness: .9 })
  };
  const makeBox = (w, h, d, x, y, z, mat, parent = scene) => {
    const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    box.position.set(x, y, z);
    parent.add(box);
    return box;
  };
  const warm = new THREE.MeshBasicMaterial({ color: '#ffd39a' });
  const dim = new THREE.MeshBasicMaterial({ color: '#746348' });

  const tile = document.createElement('canvas');
  tile.width = tile.height = 256;
  const ctx = tile.getContext('2d');
  ctx.fillStyle = '#4a4b49';
  ctx.fillRect(0, 0, 256, 256);
  let seed = 192;
  for (let i = 0; i < 4500; i++) {
    seed = (seed * 16807) % 2147483647;
    const x = seed % 256;
    const y = (seed >> 8) % 256;
    ctx.fillStyle = i % 2 ? '#96948c13' : '#0e0e1515';
    ctx.fillRect(x, y, 1 + seed % 4, 1 + seed % 3);
  }
  ctx.strokeStyle = '#222833';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 256, 256);
  const tileTexture = new THREE.CanvasTexture(tile);
  tileTexture.colorSpace = THREE.SRGBColorSpace;
  tileTexture.wrapS = tileTexture.wrapT = THREE.RepeatWrapping;
  tileTexture.repeat.set(14, 17);
  if (!css) tileTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(25, 33), new THREE.MeshStandardMaterial({ map: tileTexture, roughness: .84 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -2.5;
  scene.add(floor);
  makeBox(25.4, .3, 33.4, 0, 6.1, -2.5, materials.ceiling);
  for (const side of [-1, 1]) {
    makeBox(.35, 6, 33, side * 12.5, 3, -2.5, materials.wall);
    makeBox(.08, .07, 32.4, side * 12.25, .11, -2.5, dim);
    for (let z = -16; z <= 12; z += 7) {
      makeBox(.58, 6, .56, side * 12.1, 3, z, materials.column);
      makeBox(.042, 4.9, .032, side * 11.8, 2.7, z + .2, dim);
    }
    makeBox(.025, .023, 30.5, side * 2.15, .018, -2.3, dim);
  }
  makeBox(25, 6, .32, 0, 3, -19, materials.wall);
  makeBox(25, 6, .32, 0, 3, 14, materials.wall);
  for (const z of [9, 1.5, -6, -13.5]) {
    makeBox(24, .32, .45, 0, 5.65, z, materials.column);
    makeBox(10.8, .028, .07, 0, 5.47, z + .15, warm);
  }
  makeBox(11.5, .045, .075, 0, 5.3, -18.7, dim);
  makeBox(11.5, .045, .075, 0, .25, -18.7, dim);

  const plaque = (title, caption, tint) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 290;
    const paint = canvas.getContext('2d');
    paint.textAlign = 'center';
    paint.fillStyle = tint;
    paint.font = '600 30px "Instrument Sans", Arial, sans-serif';
    paint.fillText(caption, 512, 90);
    paint.fillStyle = '#f3efe9';
    paint.font = '600 54px "Instrument Sans", Arial, sans-serif';
    paint.fillText(title, 512, 159, 995);
    paint.fillStyle = tint;
    paint.fillRect(467, 199, 90, 3);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return new THREE.Mesh(
      new THREE.PlaneGeometry(5.15, 1.46),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false })
    );
  };

  scene.add(new THREE.HemisphereLight('#d2e5ff', '#645046', 2.25));
  const backLight = new THREE.PointLight('#829dff', 210, 23, 1.65);
  backLight.position.set(0, 4.6, -16.7);
  scene.add(backLight);
  const entrance = new THREE.PointLight('#ffe2bf', 180, 17, 1.75);
  entrance.position.set(0, 4.4, 8);
  scene.add(entrance);
  const backSign = plaque('Deep space', 'INTERSTELLAR GALLERY', '#b7aafa');
  backSign.scale.setScalar(1.6);
  backSign.position.set(0, 4.3, -18.8);
  scene.add(backSign);

  const door = new THREE.Group();
  door.position.copy(EXIT);
  door.rotation.y = Math.PI;
  scene.add(door);
  if (css) {
    css.exitDoor(door);
  } else {
    const doorPanel = new THREE.MeshStandardMaterial({ color: '#434951', roughness: .55, metalness: .35 });
    makeBox(2.65, 3.12, .14, 0, 1.56, 0, materials.column, door);
    for (const side of [-1, 1]) {
      makeBox(1.16, 2.86, .12, side * .6, 1.44, .08, doorPanel, door);
      makeBox(.032, .36, .055, side * .16, 1.18, .17, materials.trim, door);
    }
    makeBox(2.35, .034, .06, 0, 2.94, .16, warm, door);
    makeBox(2.44, .027, .17, 0, .014, .08, materials.trim, door);
    const sign = plaque('Exit', '', '#f0d4a1');
    sign.scale.setScalar(.72);
    sign.position.set(0, 3.36, .11);
    door.add(sign);
  }

  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 128;
  const shadowCtx = shadowCanvas.getContext('2d');
  const shade = shadowCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
  shade.addColorStop(0, '#08080cca');
  shade.addColorStop(.5, '#08080c64');
  shade.addColorStop(1, '#08080c00');
  shadowCtx.fillStyle = shade;
  shadowCtx.fillRect(0, 0, 128, 128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);

  const stations = exhibits.map(exhibit => {
    const [x, z] = exhibit.position;
    const angle = x ? Math.sign(-x) * .47 : 0;
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = angle;
    scene.add(group);
    if (css) {
      const { focus } = css.station(group, exhibit);
      return { exhibit, group, radius: .84, trigger: FALLBACK_TRIGGER, focus };
    }
    const label = plaque(exhibit.name, `${exhibit.place} · ${exhibit.year}`, exhibit.color);
    label.position.set(0, 2.45, .05);
    label.visible = false;
    group.add(label);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(exhibit.width * 1.35, 2.6),
      new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = .012;
    group.add(shadow);
    const trigger = FALLBACK_TRIGGER;
    const plate = new THREE.Mesh(new THREE.RingGeometry(trigger - .03, trigger + .03, 64),
      new THREE.MeshBasicMaterial({ color: exhibit.color, transparent: true, opacity: .45 }));
    plate.rotation.x = -Math.PI / 2;
    plate.position.y = .021;
    group.add(plate);
    const light = new THREE.SpotLight(exhibit.color, 200, 15, .62, .8, 1.55);
    light.position.set(x, 5.55, z + 1.28);
    light.target.position.set(x, 0, z);
    scene.add(light, light.target);
    const station = { exhibit, group, radius: .84, trigger, focus(value) {
      light.intensity = value ? 280 : 195;
      plate.material.opacity = value ? .95 : .36;
    } };
    let ready = null;
    const start = () => {
      if (ready) return ready;
      ready = loadArtifact(exhibit.id).then(({ model, dimensions }) => {
        const standHeight = exhibit.id === 'apollo11' ? .29 : exhibit.id === 'voyager' ? .32 : .13;
        const baseWidth = dimensions.x + .22;
        const baseDepth = dimensions.z + .22;
        const platform = new THREE.Mesh(new THREE.BoxGeometry(baseWidth, standHeight, baseDepth), materials.column);
        platform.position.y = standHeight / 2;
        group.add(platform);
        model.position.y = standHeight + .015;
        group.add(model);
        group.updateMatrixWorld(true);
        station.radius = Math.hypot(baseWidth, baseDepth) / 2;
        station.modelHeight = dimensions.y + standHeight;
        station.trigger = station.radius + STORY_CLEARANCE;
        plate.scale.setScalar(station.trigger / trigger);
        label.position.y = Math.max(1.65, dimensions.y + standHeight + .42);
        label.visible = true;
      }).catch(async error => {
        label.visible = true;
        console.warn('Unable to load exhibit model', exhibit.id, error);
        try {
          const texture = await imageLoader.loadAsync(`${import.meta.env.BASE_URL}exhibits/${exhibit.id}.webp`);
          texture.colorSpace = THREE.SRGBColorSpace;
          const height = exhibit.width * texture.image.height / texture.image.width;
          const fallback = new THREE.Mesh(new THREE.PlaneGeometry(exhibit.width, height),
            new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: .08, side: THREE.DoubleSide, toneMapped: false }));
          fallback.position.y = height / 2 + .035;
          label.position.y = height + .5;
          group.add(fallback);
        } catch (error) {
          console.warn('Unable to load exhibit image', exhibit.id, error);
        }
      });
      return ready;
    };
    station.load = start;
    station.label = label;
    return station;
  });

  const keys = new Set();
  const desktopKeys = new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyQ','KeyE']);
  const direction = new THREE.Vector3();
  const next = new THREE.Vector3();
  const pointer = { id: null, x: 0, y: 0 };
  const canvas = renderer.domElement;
  let active = false;
  let blocked = false;

  function clearMovement() {
    keys.clear();
    pointer.id = null;
    if (document.pointerLockElement === canvas) document.exitPointerLock();
  }

  function look(dx, dy) {
    camera.rotation.y -= dx * .003;
    camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x - dy * .003, -MAX_PITCH, MAX_PITCH);
  }

  window.addEventListener('keydown', event => {
    if (!active || blocked || event.altKey || event.ctrlKey || event.metaKey ||
        event.target instanceof HTMLElement && event.target.closest('input, audio, select')) return;
    if (desktopKeys.has(event.code)) {
      event.preventDefault();
      keys.add(event.code);
    }
  });
  window.addEventListener('keyup', event => keys.delete(event.code));
  window.addEventListener('blur', clearMovement);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearMovement(); });
  for (const button of document.querySelectorAll('[data-move]')) {
    button.addEventListener('pointerdown', event => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      keys.add(button.dataset.move);
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      button.addEventListener(type, () => keys.delete(button.dataset.move));
    }
  }
  canvas.addEventListener('click', event => {
    if (active && !blocked && (event.pointerType === 'mouse' || !event.pointerType) && !matchMedia('(pointer:coarse)').matches &&
        document.pointerLockElement !== canvas) {
      try { canvas.requestPointerLock()?.catch(() => {}); }
      catch { /* Drag and keyboard look are still available. */ }
    }
  });
  canvas.addEventListener('pointerdown', event => {
    if (!active || blocked || document.pointerLockElement === canvas || pointer.id !== null) return;
    pointer.id = event.pointerId;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (!active || blocked || pointer.id !== event.pointerId || document.pointerLockElement === canvas) return;
    look(event.clientX - pointer.x, event.clientY - pointer.y);
    pointer.x = event.clientX; pointer.y = event.clientY;
  });
  for (const type of ['pointerup', 'pointercancel','lostpointercapture']) {
    canvas.addEventListener(type, event => { if (pointer.id === event.pointerId) pointer.id = null; });
  }
  document.addEventListener('mousemove', event => {
    if (active && !blocked && document.pointerLockElement === canvas) look(event.movementX, event.movementY);
  });

  function canStandAt(x, z) {
    return Math.abs(x) < 11.65 && z > -18.15 && z < 13.15 &&
      stations.every(({ group, radius }) => Math.hypot(x - group.position.x, z - group.position.z) > radius + .12);
  }
  function resize() {
    const { clientWidth, clientHeight } = container;
    if (!clientWidth || !clientHeight) return;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight, false);
  }
  window.addEventListener('resize', resize);
  resize();

  let previous = performance.now();
  function tick(now) {
    requestAnimationFrame(tick);
    const dt = Math.min(Math.max((now - previous) / 1000, 0), .1);
    previous = now;
    if (!active) return;
    if (!blocked) {
      camera.rotation.y += (Number(keys.has('KeyQ')) - Number(keys.has('KeyE'))) * dt * 1.75;
      direction.set(
        Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft')),
        0,
        Number(keys.has('KeyS') || keys.has('ArrowDown')) - Number(keys.has('KeyW') || keys.has('ArrowUp'))
      );
      direction.normalize().applyAxisAngle(camera.up, camera.rotation.y).multiplyScalar(dt * WALK_SPEED);
      next.copy(camera.position).add(direction);
      if (canStandAt(next.x, camera.position.z)) camera.position.x = next.x;
      if (canStandAt(camera.position.x, next.z)) camera.position.z = next.z;
      const nearest = stations.map(station => ({
        ...station, distance: horizontalDistance(station.group.position, camera.position)
      })).sort((a, b) => (a.distance - a.radius) - (b.distance - b.radius))[0];
      for (const station of stations) {
        const focused = station.exhibit === nearest.exhibit && nearest.distance <= station.trigger;
        station.focus(focused);
        if (station.label) station.label.quaternion.copy(station.group.quaternion).invert().multiply(camera.quaternion);
      }
      onFrame(nearest.exhibit, nearest.distance - nearest.radius, nearest.trigger - nearest.radius,
        horizontalDistance(camera.position, EXIT) <= EXIT_RANGE);
    }
    renderer.render(scene, camera);
  }
  requestAnimationFrame(tick);

  function placeAtEntrance() {
    camera.position.copy(START);
    camera.lookAt(-8.5, 1.24, 3.5);
  }
  placeAtEntrance();

  return {
    load() { return Promise.all(stations.map(station => station.load?.())); },
    start() {
      resize();
      active = true;
      container.classList.add('inside');
    },
    stop() {
      active = false; blocked = false;
      clearMovement(); placeAtEntrance(); container.classList.remove('inside');
    },
    pause(value) { blocked = value; if (value) clearMovement(); },
    releasePointer: clearMovement,
    goToExit() {
      camera.position.set(EXIT.x, START.y, EXIT.z - (EXIT_RANGE - .35));
      camera.lookAt(EXIT.x, 1.85, EXIT.z);
      clearMovement();
    },
    goTo(exhibit) {
      const [x, z] = exhibit.position;
      const station = stations.find(item => item.exhibit === exhibit);
      const distance = Math.max(2.35, station.radius + 1.30, station.radius / camera.aspect);
      camera.position.set(x - Math.sign(x) * .85, START.y, Math.min(z + distance, 12.9));
      camera.lookAt(x, station.modelHeight ? station.modelHeight / 2 + .15 : 1.25, z);
      clearMovement();
    }
  };
}
