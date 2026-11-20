import * as THREE from 'three';
import gsap from 'gsap';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createHeroObject } from './hero-object.js';
import { createParticles } from './particles.js';

export function initHero({ reduced }) {
  const canvas = document.querySelector('#hero-canvas');
  const hero = document.querySelector('#hero');
  const wrap = document.querySelector('.hero__canvas-wrap');
  const sceneLayer = document.querySelector('.hero__scene');
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

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
  camera.position.set(0, 0.15, mobile ? 8.6 : 7.4);
  camera.lookAt(0, 0, 0);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.55;
  pmrem.dispose();

  const redLight = new THREE.PointLight(0xff2438, 55, 30, 2);
  redLight.position.set(-3.5, 2.2, 3);
  scene.add(redLight);

  const coolLight = new THREE.PointLight(0x91a4ff, 24, 30, 2);
  coolLight.position.set(4, -1.6, 2.5);
  scene.add(coolLight);

  const { group, rings, shards } = createHeroObject();
  scene.add(group);

  // The object lives inside a float group so scroll parallax never fights
  // the breakpoint layout applied to `group` itself.
  const float = new THREE.Group();
  float.add(group);
  scene.add(float);

  const particles = createParticles(mobile ? 180 : 520);
  particles.position.z = -1.5;
  scene.add(particles);

  const timer = new THREE.Timer();
  timer.connect(document);
  const pointer = { x: 0, y: 0 };
  const smooth = { x: 0, y: 0 };
  let frame = 0;
  let running = false;
  let inView = true;

  const onPointerMove = (event) => {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  };

  if (!reduced) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  function draw() {
    renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    frame = window.requestAnimationFrame(loop);
    timer.update();

    const delta = Math.min(timer.getDelta(), 0.05);
    const elapsed = timer.getElapsed();

    smooth.x += (pointer.x - smooth.x) * 0.045;
    smooth.y += (pointer.y - smooth.y) * 0.045;

    camera.position.x = smooth.x * 0.55;
    camera.position.y = 0.15 - smooth.y * 0.35;
    camera.lookAt(0, 0, 0);

    // Lights drift a little with the pointer so the metal answers the cursor.
    redLight.position.x = -3.5 + smooth.x * 0.7;
    redLight.position.y = 2.2 - smooth.y * 0.5;
    coolLight.intensity = 24 + smooth.x * 5;

    group.rotation.y += delta * 0.16;
    group.rotation.x = Math.sin(elapsed * 0.18) * 0.07;

    rings[0].rotation.z += delta * 0.08;
    rings[1].rotation.z -= delta * 0.05;

    // A — independent opacity drift so the rings stop reading as static
    // circles. Periods differ (~15 s / ~22 s), amplitude stays ±18%.
    rings[0].material.opacity = 0.4 + Math.sin(elapsed * 0.42) * 0.07;
    rings[1].material.opacity = 0.22 + Math.sin(elapsed * 0.29 + 1.9) * 0.04;

    shards.rotation.y += delta * 0.1;
    shards.rotation.x = Math.sin(elapsed * 0.22) * 0.12;

    particles.rotation.y += delta * 0.018;

    draw();
  }

  function layout(width, height) {
    const aspect = width / height;
    let x = 1.55;
    let y = 0.1;
    let scale = 1;
    let depth = 7.4;

    if (aspect >= 1.45) {
      // wide desktop — object sits right of the headline
      x = 1.55;
      y = 0.1;
      scale = 1;
      depth = 7.4;
    } else if (aspect >= 1.15) {
      // small laptop / landscape tablet
      x = 1.42;
      y = 0.15;
      scale = 0.88;
      depth = 7.7;
    } else if (aspect >= 0.9) {
      // portrait tablet
      x = 1.12;
      y = -0.05;
      scale = 0.68;
      depth = 8.4;
    } else if (aspect >= 0.6) {
      // tablet portrait — drop it into the open lower-right space
      x = 1.1;
      y = -0.9;
      scale = 0.6;
      depth = 8.6;
    } else {
      // phone — ambient depth behind the lower-right corner
      x = 0.66;
      y = -1.28;
      scale = 0.55;
      depth = 8.6;
    }

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

    if (reduced || !running) draw();
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

  if (reduced) {
    draw();
  } else {
    running = true;
    loop();

    const visibility = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        // Reuse the canvas signal to pause the CSS hero pulse offscreen.
        sceneLayer?.classList.toggle('is-paused', !inView);
        setRunning(inView && !document.hidden);
      },
      { threshold: 0 }
    );
    visibility.observe(hero);

    document.addEventListener('visibilitychange', () => {
      setRunning(inView && !document.hidden);
    });

    gsap.to(wrap, {
      opacity: 0.2,
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
  }

  window.requestAnimationFrame(() => {
    canvas.classList.add('is-ready');
    hero.classList.add('has-webgl');
  });
}
