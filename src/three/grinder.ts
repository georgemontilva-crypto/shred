import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { FULL, MARK, LOGO_OFFSET, LOGO_SIZE } from "../components/Logo";

/* A real-time 3D model of the 4-piece aluminum grinder, built from simple shapes
   (no model file): four machined pieces that thread together, drawn with a metal material.
   The page drives it through the small controller returned by createGrinder(). */

export type Focus = "closed" | "apart" | "sizes" | "lid" | "teeth" | "screen" | "catcher";
/** Colours for catcher, screen chamber, teeth chamber and lid, in that order. */
export type Finish = [string, string, string, string];

export type Grinder = {
  setFinish(finish: Finish): void;
  setFocus(focus: Focus): void;
  /** Size of the model relative to the 2.2″ grinder. */
  setScale(scale: number): void;
  dispose(): void;
};

const TAU = Math.PI * 2;
const SEGMENTS = 128;

/** Revolves a profile of [radius, height] points around the vertical axis.
    Each profile segment keeps its own normal, so machined edges stay crisp. */
function revolve(profile: [number, number][]): THREE.BufferGeometry {
  const pos: number[] = [];
  const nor: number[] = [];
  const idx: number[] = [];
  for (let s = 0; s < profile.length - 1; s++) {
    const [r0, y0] = profile[s];
    const [r1, y1] = profile[s + 1];
    const len = Math.hypot(r1 - r0, y1 - y0);
    if (len < 1e-6) continue;
    const nr = -(y1 - y0) / len;
    const ny = (r1 - r0) / len;
    const base = pos.length / 3;
    for (let i = 0; i <= SEGMENTS; i++) {
      const a = (i / SEGMENTS) * TAU;
      const c = Math.cos(a);
      const z = Math.sin(a);
      pos.push(r0 * c, y0, r0 * z, r1 * c, y1, r1 * z);
      nor.push(nr * c, ny, nr * z, nr * c, ny, nr * z);
    }
    for (let i = 0; i < SEGMENTS; i++) {
      const a = base + i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

/** Thread ridges between two heights at a given radius, as extra profile points. */
function threads(radius: number, top: number, bottom: number, turns: number): [number, number][] {
  const pts: [number, number][] = [];
  const pitch = (top - bottom) / turns;
  for (let i = 0; i < turns; i++) {
    const y = top - i * pitch;
    pts.push([radius, y], [radius + 0.018, y - pitch * 0.35], [radius + 0.018, y - pitch * 0.65], [radius, y - pitch]);
  }
  return pts;
}

/** Ring of thin ridges, the grip texture on the lid and the base. */
function knurl(material: THREE.Material, radius: number, y: number, height: number, count: number): THREE.InstancedMesh {
  const ridge = new THREE.BoxGeometry(0.026, height, 0.022);
  const mesh = new THREE.InstancedMesh(ridge, material, count);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU;
    q.setFromAxisAngle(up, -a);
    m.compose(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius), q, new THREE.Vector3(1, 1, 1));
    mesh.setMatrixAt(i, m);
  }
  return mesh;
}

/** A four-sided grinding tooth standing on the chamber floor. */
function toothGeometry(height: number): THREE.BufferGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, 0.085);
  s.lineTo(0.06, 0);
  s.lineTo(0, -0.085);
  s.lineTo(-0.06, 0);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: height, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.02, bevelSegments: 1 });
  g.rotateX(-Math.PI / 2);
  return g;
}

function placeRing(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  count: number,
  radius: number,
  y: number,
  offset = 0,
) {
  for (let i = 0; i < count; i++) {
    const a = offset + (i / count) * TAU;
    const m = new THREE.Mesh(geometry, material);
    m.position.set(Math.cos(a) * radius, y, Math.sin(a) * radius);
    m.rotation.y = -a + Math.PI / 2;
    parent.add(m);
  }
}

/** White brand mark and wordmark, drawn from the same vector paths as the site logo. */
function logoTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  const wordPath = FULL.slice(0, FULL.length - MARK.length);
  const markW = LOGO_SIZE.mark.w;
  const markH = LOGO_SIZE.mark.h;
  // Wordmark sits to the right of the mark in the traced logo: x from 136.7 to 489.5, y from 17.9 to 138.8.
  const word = { x: 136.7, y: 17.9, w: 352.8, h: 120.9 };

  const markScale = (size * 0.26) / markH;
  ctx.save();
  ctx.translate(size / 2 - (markW * markScale) / 2, size * 0.17);
  ctx.scale(markScale, markScale);
  ctx.translate(LOGO_OFFSET.x, LOGO_OFFSET.y);
  ctx.fill(new Path2D(MARK));
  ctx.restore();

  const wordScale = (size * 0.66) / word.w;
  ctx.save();
  ctx.translate(size / 2 - (word.w * wordScale) / 2, size * 0.5);
  ctx.scale(wordScale, wordScale);
  ctx.translate(LOGO_OFFSET.x - word.x, LOGO_OFFSET.y - word.y);
  ctx.fill(new Path2D(wordPath));
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function meshTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#26272a";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "#8d9096";
  ctx.lineWidth = 5;
  for (let i = -size; i < size * 2; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + size, size);
    ctx.moveTo(i, size);
    ctx.lineTo(i + size, 0);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(7, 7);
  tex.anisotropy = 8;
  return tex;
}

function shadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(0,0,0,0.75)");
  g.addColorStop(0.55, "rgba(0,0,0,0.28)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/* Heights of the visible band of each piece when the grinder is shut, bottom to top. */
const REST = [0, 0.34, 0.7, 1.2];
const HEIGHT = 1.56;
const GAP = 0.9;

type Piece = { group: THREE.Group; material: THREE.MeshStandardMaterial; color: THREE.Color; center: number };

function buildPieces(): { pieces: Piece[]; extras: THREE.Material[]; textures: THREE.Texture[] } {
  const metal = () => new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.96, roughness: 0.31, envMapIntensity: 1.35 });
  const steel = new THREE.MeshStandardMaterial({ color: 0xd9dce0, metalness: 1, roughness: 0.22 });
  const plastic = new THREE.MeshStandardMaterial({ color: 0xc9cad0, metalness: 0, roughness: 0.75, envMapIntensity: 0.6 });
  const mesh = meshTexture();
  const logo = logoTexture();
  const screenMat = new THREE.MeshStandardMaterial({ map: mesh, color: 0x8a8a8a, metalness: 0.3, roughness: 0.75, envMapIntensity: 0.35 });
  const print = new THREE.MeshStandardMaterial({ map: logo, transparent: true, metalness: 0, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2 });

  /* 1. Catcher: the bottom cup, with a thread band on top and a grip band at the base. */
  const catcher = new THREE.Group();
  const catcherMat = metal();
  catcher.add(
    new THREE.Mesh(
      revolve([[0, 0.07], [0.86, 0.07], [0.86, 0.48], [0.93, 0.48], ...threads(0.93, 0.47, 0.35, 4), [0.93, 0.34], [1, 0.34], [1, 0.125], [0.975, 0.115], [0.975, 0.02], [0.955, 0], [0, 0]]),
      catcherMat,
    ),
    knurl(catcherMat, 0.975, 0.066, 0.086, 110),
  );
  const blade = new THREE.Shape();
  blade.moveTo(-0.3, 0.035);
  blade.lineTo(0.08, 0.035);
  blade.lineTo(0.34, 0.2);
  blade.lineTo(0.34, -0.2);
  blade.lineTo(0.08, -0.035);
  blade.lineTo(-0.3, -0.035);
  blade.absarc(-0.3, 0, 0.035, -Math.PI / 2, Math.PI / 2, true);
  const scraper = new THREE.Mesh(new THREE.ExtrudeGeometry(blade, { depth: 0.014, bevelEnabled: false }), plastic);
  scraper.rotation.set(-Math.PI / 2, 0, 0.6);
  scraper.position.set(-0.08, 0.075, 0.1);
  catcher.add(scraper);

  /* 2. Screen chamber: a ring with the mesh screen stretched across it. */
  const screen = new THREE.Group();
  const screenBody = metal();
  screen.add(
    new THREE.Mesh(
      revolve([[0.94, 0], [0.94, 0.14], [0.86, 0.14], [0.86, 0.5], [0.93, 0.5], ...threads(0.93, 0.49, 0.37, 4), [0.93, 0.36], [1, 0.36], [1, 0.012], [0.988, 0], [0.94, 0]]),
      screenBody,
    ),
  );
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.862, 96), screenMat);
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.2;
  const discUnder = disc.clone();
  discUnder.rotation.x = Math.PI / 2;
  discUnder.position.y = 0.198;
  screen.add(disc, discUnder);

  /* 3. Teeth chamber: a floor with drop-through holes and a ring of teeth. */
  const teeth = new THREE.Group();
  const teethMat = metal();
  teeth.add(new THREE.Mesh(revolve([[0.92, 0.18], [0.92, 0.5], [0.985, 0.5], [1, 0.485], [1, 0.012], [0.988, 0], [0.94, 0], [0.94, 0.14], [0.92, 0.14]]), teethMat));
  const floor = new THREE.Shape();
  floor.absarc(0, 0, 0.925, 0, TAU, false);
  const hole = (radius: number, angle: number, long: number, wide: number) => {
    const p = new THREE.Path();
    p.absellipse(Math.cos(angle) * radius, Math.sin(angle) * radius, long, wide, 0, TAU, true, angle + Math.PI / 2);
    floor.holes.push(p);
  };
  for (let i = 0; i < 8; i++) hole(0.66, (i / 8) * TAU + 0.39, 0.13, 0.062);
  for (let i = 0; i < 4; i++) hole(0.33, (i / 4) * TAU + 0.78, 0.1, 0.055);
  const floorMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(floor, { depth: 0.04, bevelEnabled: false, curveSegments: 48 }), teethMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = 0.14;
  teeth.add(floorMesh);
  const tooth = toothGeometry(0.24);
  placeRing(teeth, tooth, teethMat, 8, 0.66, 0.18);
  placeRing(teeth, tooth, teethMat, 4, 0.33, 0.18);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.2, 32), teethMat);
  post.position.y = 0.28;
  const magnet = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 32), steel);
  magnet.position.y = 0.386;
  teeth.add(post, magnet);

  /* 4. Lid: solid top with the logo, a grip band, and teeth underneath. */
  const lid = new THREE.Group();
  const lidMat = metal();
  lid.add(
    new THREE.Mesh(
      revolve([[0, 0.36], [0.95, 0.36], [1, 0.325], [1, 0.3], [0.975, 0.29], [0.975, 0.1], [1, 0.09], [1, 0.012], [0.988, 0], [0.91, 0], [0.91, 0.1], [0, 0.1]]),
      lidMat,
    ),
    knurl(lidMat, 0.975, 0.195, 0.19, 110),
  );
  const mark = new THREE.Mesh(new THREE.CircleGeometry(0.9, 64), print);
  mark.rotation.x = -Math.PI / 2;
  mark.position.y = 0.362;
  lid.add(mark);
  const lidTooth = toothGeometry(0.2);
  const underside = new THREE.Group();
  placeRing(underside, lidTooth, lidMat, 8, 0.5, 0, 0.39);
  placeRing(underside, lidTooth, lidMat, 4, 0.2, 0, 0.78);
  underside.position.y = -0.1;
  lid.add(underside);

  const groups = [catcher, screen, teeth, lid];
  const mats = [catcherMat, screenBody, teethMat, lidMat];
  const centers = [0.24, 0.25, 0.25, 0.18];
  return {
    pieces: groups.map((group, i) => ({ group, material: mats[i], color: new THREE.Color(0x888888), center: centers[i] })),
    extras: [steel, plastic, screenMat, print],
    textures: [mesh, logo],
  };
}

type View = { explode: number; pitch: number; frame: number; piece: number };

const VIEWS: Record<Focus, View> = {
  closed: { explode: 0, pitch: 0.5, frame: 3.5, piece: -1 },
  apart: { explode: 1, pitch: 0.46, frame: 6.1, piece: -1 },
  sizes: { explode: 0, pitch: 0.42, frame: 6.3, piece: -1 },
  catcher: { explode: 1, pitch: 0.78, frame: 3.6, piece: 0 },
  screen: { explode: 1, pitch: 0.8, frame: 3.6, piece: 1 },
  teeth: { explode: 1, pitch: 0.86, frame: 3.6, piece: 2 },
  lid: { explode: 1, pitch: 0.55, frame: 3.6, piece: 3 },
};

export function createGrinder(canvas: HTMLCanvasElement, options: { finish: Finish; reducedMotion?: boolean }): Grinder {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.03);
  scene.environment = env.texture;

  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(2.5, 4, 3.5);
  const rim = new THREE.DirectionalLight(0xffffff, 0.9);
  rim.position.set(-3, 1.5, -3);
  scene.add(key, rim);

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  const tilt = new THREE.Group(); // looks down into the grinder
  const spin = new THREE.Group(); // turns around the grinder's own axis
  const root = new THREE.Group(); // scale and vertical centring
  scene.add(tilt);
  tilt.add(spin);
  spin.add(root);

  const { pieces, extras, textures } = buildPieces();
  pieces.forEach((p) => root.add(p.group));

  const shadowTex = shadowTexture();
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.55 });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.02;
  root.add(shadow);

  const targetColors = pieces.map(() => new THREE.Color());
  const applyFinish = (finish: Finish) => finish.forEach((hex, i) => targetColors[i].set(hex));
  applyFinish(options.finish);
  pieces.forEach((p, i) => p.color.copy(targetColors[i]));

  let focus: Focus = "closed";
  let scaleTarget = 1;
  const now = { explode: 0, pitch: 0.5, frame: 3.5, scale: 1, yaw: -0.5, lookY: 0 };
  const dim = pieces.map(() => 1);
  let yawVelocity = 0;
  let pitchOffset = 0;
  let dragging = false;
  let lastTouch = 0;
  let aspect = 1;
  let running = false;
  let frame = 0;
  let last = 0;
  const look = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const black = new THREE.Color(0x000000);

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  const tick = (time: number) => {
    frame = running ? requestAnimationFrame(tick) : 0;
    const dt = Math.min(0.05, (time - last) / 1000 || 0.016);
    last = time;
    const view = VIEWS[focus];
    const k = 1 - Math.exp(-dt * 5.5);

    now.explode += (view.explode - now.explode) * k;
    now.scale += (scaleTarget - now.scale) * k;
    now.pitch += (view.pitch + pitchOffset - now.pitch) * k;
    // Wide enough for the grinder on narrow screens, tall enough for the stack on wide ones.
    const wanted = Math.max(view.frame, (2.7 * (focus === "sizes" ? 1.82 : 1)) / aspect);
    now.frame += (wanted - now.frame) * k;

    if (!dragging) {
      const idle = time - lastTouch > 2200;
      const cruise = options.reducedMotion ? 0 : view.piece >= 0 ? 0.1 : 0.22;
      yawVelocity += ((idle ? cruise : 0) - yawVelocity) * (1 - Math.exp(-dt * (idle ? 1.2 : 3)));
      now.yaw += yawVelocity * dt;
      pitchOffset += (0 - pitchOffset) * (1 - Math.exp(-dt * (idle ? 1.5 : 0)));
    }

    const top = HEIGHT + GAP * 3 * now.explode;
    pieces.forEach((p, i) => {
      p.group.position.y = REST[i] + GAP * i * now.explode;
      const want = view.piece < 0 || view.piece === i ? 1 : 0.06; // colours are linear, so this reads as about a quarter brightness
      dim[i] += (want - dim[i]) * k;
      p.color.lerp(targetColors[i], 1 - Math.exp(-dt * 7));
      p.material.color.copy(p.color).lerp(black, 1 - dim[i]);
      p.material.envMapIntensity = 1.35 * (0.1 + 0.9 * dim[i]);
    });
    root.scale.setScalar(now.scale);
    root.position.y = (-top / 2) * now.scale;
    shadowMat.opacity = 0.55 * (1 - now.explode * 0.6);
    tilt.rotation.x = now.pitch;
    spin.rotation.y = now.yaw;

    scene.updateMatrixWorld();
    let wantY = 0;
    if (view.piece >= 0) {
      const p = pieces[view.piece];
      wantY = tmp.set(0, p.center, 0).applyMatrix4(p.group.matrixWorld).y;
    }
    now.lookY += (wantY - now.lookY) * k;
    look.set(0, now.lookY, 0);
    const distance = now.frame / 2 / Math.tan((camera.fov * Math.PI) / 360);
    camera.position.set(0, now.lookY, distance);
    camera.lookAt(look);
    renderer.render(scene, camera);
  };

  const start = () => {
    if (running) return;
    running = true;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };
  const stop = () => {
    running = false;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
  // Only draw while the model is on screen.
  const visible = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0.05 });
  visible.observe(canvas);

  let px = 0;
  let py = 0;
  const down = (e: PointerEvent) => {
    dragging = true;
    px = e.clientX;
    py = e.clientY;
    yawVelocity = 0;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("is-dragging");
  };
  const move = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - px;
    const dy = e.clientY - py;
    px = e.clientX;
    py = e.clientY;
    now.yaw += dx * 0.0085;
    yawVelocity = (dx * 0.0085) / 0.016;
    pitchOffset = Math.max(-0.75, Math.min(0.75, pitchOffset + dy * 0.006));
    lastTouch = performance.now();
  };
  const up = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    lastTouch = performance.now();
    yawVelocity = Math.max(-6, Math.min(6, yawVelocity));
    canvas.classList.remove("is-dragging");
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
  };
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);

  return {
    setFinish: applyFinish,
    setFocus(next) {
      focus = next;
      pitchOffset = 0;
    },
    setScale(scale) {
      scaleTarget = scale;
    },
    dispose() {
      stop();
      visible.disconnect();
      observer.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      [...pieces.map((p) => p.material), ...extras, shadowMat].forEach((m) => m.dispose());
      [...textures, shadowTex, env.texture].forEach((t) => t.dispose());
      room.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
