import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createSystemCore } from './hero-object.js';
import { createParticles } from './particles.js';

gsap.registerPlugin(ScrollTrigger);

export function initHero() {
  const canvas = document.querySelector('#hero-canvas');
  const hero = document.querySelector('#hero');
  const wrap = document.querySelector('.hero__canvas-wrap');
  const stage = document.querySelector('.hero__stage');
  if (!canvas || !hero || !wrap) return;

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    canvas.classList.remove('is-ready');
    hero.classList.remove('has-webgl');
  });

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
  } catch {
    canvas.style.display = 'none';
    hero.classList.add('no-webgl');
    return;
  }

  const mobile = window.matchMedia('(max-width: 760px)').matches;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.6));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 44);
  camera.position.set(0, 0.1, mobile ? 8.9 : 7.6);
  camera.lookAt(0, 0, 0);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.68;
  pmrem.dispose();

  const redLight = new THREE.PointLight(0xff1e36, 52, 32, 2);
  redLight.position.set(-3.2, 2.2, 3);
  scene.add(redLight);

  const rimLight = new THREE.PointLight(0x8fa0ff, 20, 32, 2);
  rimLight.position.set(3.8, -1.6, 2.4);
  scene.add(rimLight);

  const keyLight = new THREE.DirectionalLight(0xfff3ea, 1.2);
  keyLight.position.set(2.4, 3.4, 4.2);
  scene.add(keyLight);

  const core = createSystemCore();
  const { group, rings, nodes, fragments, scanRing } = core;
  scene.add(group);

  const coreLight = new THREE.PointLight(0xff2438, 14, 6, 2);
  coreLight.position.set(0, 0, 0.2);
  group.add(coreLight);

  // The object lives inside a float group so scroll parallax never fights the
  // pointer tilt or the breakpoint layout applied to `group` itself.
  const float = new THREE.Group();
  float.add(group);
  scene.add(float);

  const particles = createParticles(mobile ? 140 : 420);
  particles.position.z = -1.8;
  scene.add(particles);

  const timer = new THREE.Timer();
  timer.connect(document);
  const pointer = { x: 0, y: 0 };
  const smooth = { x: 0, y: 0 };

  let frame = 0;
  let running = false;
  let inView = true;
  let baseY = 0.1;

  const onPointerMove = (event) => {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  };

  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  const draw = () => renderer.render(scene, camera);

  function loop() {
    if (!running) return;
    frame = window.requestAnimationFrame(loop);
    timer.update();

    const delta = Math.min(timer.getDelta(), 0.05);
    const elapsed = timer.getElapsed();

    smooth.x += (pointer.x - smooth.x) * 0.045;
    smooth.y += (pointer.y - smooth.y) * 0.045;

    camera.position.x = smooth.x * 0.5;
    camera.position.y = 0.1 - smooth.y * 0.32;
    camera.lookAt(0, 0, 0);

    redLight.position.x = -3.2 + smooth.x * 0.6;
    redLight.position.y = 2.2 - smooth.y * 0.4;
    rimLight.intensity = 20 + smooth.x * 4;

    // Slow rotation rather than a spin: the stack must stay readable.
    group.rotation.y += delta * 0.1;
    group.rotation.x = Math.sin(elapsed * 0.19) * 0.045;
    group.position.y = baseY + Math.sin(elapsed * 0.55) * 0.05;

    float.rotation.y = smooth.x * 0.1;
    float.rotation.x = -smooth.y * 0.06;

    rings[0].rotation.z += delta * 0.05;
    rings[1].rotation.z -= delta * 0.035;
    rings[2].rotation.z += delta * 0.02;

    rings[0].material.opacity = 0.3 + Math.sin(elapsed * 0.5) * 0.06;
    rings[1].material.opacity = 0.15 + Math.sin(elapsed * 0.33 + 1.6) * 0.035;
    rings[2].material.opacity = 0.07 + Math.sin(elapsed * 0.27 + 3.1) * 0.02;

    core.core.material.opacity = 0.44 + Math.sin(elapsed * 0.95) * 0.14;
    core.halo.material.opacity = 0.08 + Math.sin(elapsed * 0.95 + 0.6) * 0.035;
    coreLight.intensity = 12 + Math.sin(elapsed * 0.95) * 4;

    scanRing.position.y = Math.sin(elapsed * 0.33) * 0.74;
    scanRing.material.opacity = 0.08 + (Math.cos(elapsed * 0.33) * 0.5 + 0.5) * 0.14;

    nodes.rotation.y -= delta * 0.04;

    fragments.children.forEach((plate, index) => {
      plate.rotation.y += delta * (0.05 + index * 0.008);
      plate.position.y = plate.userData.baseY + Math.sin(elapsed * 0.5 + index) * 0.035;
    });

    particles.rotation.y += delta * 0.014;

    draw();
  }

  function layout(width, height) {
    const aspect = width / height;
    let x = 1.65;
    let y = 0.1;
    let scale = 1;
    let depth = 7.6;

    if (aspect >= 1.45) {
      x = 1.65;
      y = 0.1;
      scale = 1;
      depth = 7.6;
    } else if (aspect >= 1.15) {
      x = 1.45;
      y = 0.12;
      scale = 0.9;
      depth = 7.9;
    } else if (aspect >= 0.9) {
      x = 1.1;
      y = -0.02;
      scale = 0.72;
      depth = 8.4;
    } else if (aspect >= 0.6) {
      x = 0.92;
      y = -1.02;
      scale = 0.62;
      depth = 8.7;
    } else {
      x = 0.32;
      y = -1.5;
      scale = 0.6;
      depth = 8.8;
    }

    baseY = y;
    group.position.set(x, y, 0);
    group.scale.setScalar(scale);
    camera.position.z = depth;
  }

  function resize() {
    const width = hero.clientWidth;
    const height = hero.clientHeight;
    if (!width || !height) return;

    layout(width, height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    if (!running) draw();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(hero);
  resize();

  function setRunning(next) {
    if (next === running) return;
    running = next;

    if (running) {
      timer.update();
      loop();
    } else {
      window.cancelAnimationFrame(frame);
    }
  }

  running = true;
  loop();

  const visibility = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      stage?.classList.toggle('is-paused', !inView);
      setRunning(inView && !document.hidden);
    },
    { threshold: 0 }
  );

  visibility.observe(hero);

  document.addEventListener('visibilitychange', () => {
    setRunning(inView && !document.hidden);
  });

  gsap.to(wrap, {
    opacity: 0.24,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  gsap.to(float.position, {
    y: 1.1,
    z: -1.1,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  window.requestAnimationFrame(() => {
    canvas.classList.add('is-ready');
    hero.classList.add('has-webgl');
  });
}
