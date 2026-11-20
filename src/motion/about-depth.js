import gsap from 'gsap';

// The skills table sits in a CSS perspective box (see .about__depth). The
// entrance tips the whole plane back into place while the rows cascade in
// slightly behind it, then the pointer tilt keeps a shallow, readable depth
// without moving any layout property.
export function initAboutDepth(reduced) {
  const root = document.querySelector('[data-about-depth]');
  if (!root) return;

  const tilt = root.querySelector('[data-skills-tilt]');
  const plane = root.querySelector('.skills');
  if (!tilt || !plane) return;

  if (reduced) {
    gsap.set([tilt, plane], { clearProps: 'transform,opacity' });
    return;
  }

  gsap.fromTo(
    plane,
    { rotationX: 11, y: 30, z: -90, opacity: 0 },
    {
      rotationX: 0,
      y: 0,
      z: 0,
      opacity: 1,
      duration: 1.1,
      ease: 'power3.out',
      transformOrigin: '50% 30%',
      scrollTrigger: { trigger: plane, start: 'top 90%', once: true },
      // Hands the plane back to CSS once it lands, so hover states and any
      // later transforms are never fighting a leftover inline matrix.
      onComplete: () => gsap.set(plane, { clearProps: 'transform,transformOrigin,opacity' })
    }
  );

  const rows = plane.querySelectorAll('.skills__row');
  gsap.fromTo(
    rows,
    { z: -22, y: 12 },
    {
      z: 0,
      y: 0,
      duration: 0.7,
      stagger: 0.055,
      ease: 'power3.out',
      scrollTrigger: { trigger: plane, start: 'top 88%', once: true },
      onComplete: () => gsap.set(rows, { clearProps: 'transform' })
    }
  );

  // Tilt is a fine-pointer nicety only; touch devices keep the scroll
  // entrance and the static perspective.
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const rotX = gsap.quickTo(tilt, 'rotationX', { duration: 0.6, ease: 'power3' });
  const rotY = gsap.quickTo(tilt, 'rotationY', { duration: 0.6, ease: 'power3' });

  let rect = null;
  let frame = 0;
  let decay = 0;
  const latest = { x: 0, y: 0 };

  const measure = () => {
    rect = tilt.getBoundingClientRect();
  };

  tilt.addEventListener('pointerenter', () => {
    window.clearTimeout(decay);
    measure();
    tilt.style.willChange = 'transform';
  });

  tilt.addEventListener('pointermove', (event) => {
    if (!rect) measure();
    if (!rect || !rect.width || !rect.height) return;

    latest.x = (event.clientX - rect.left) / rect.width - 0.5;
    latest.y = (event.clientY - rect.top) / rect.height - 0.5;

    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      rotX(-latest.y * 3.8);
      rotY(latest.x * 5.5);
    });
  });

  const settle = () => {
    if (frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
    rect = null;
    rotX(0);
    rotY(0);
    decay = window.setTimeout(() => {
      tilt.style.willChange = '';
      // At rest the wrapper is back at identity; hand the plane back to CSS
      // so text is not left on a promoted layer.
      gsap.set(tilt, { clearProps: 'transform' });
    }, 700);
  };

  tilt.addEventListener('pointerleave', settle);
  tilt.addEventListener('pointercancel', settle);
  window.addEventListener('resize', () => { rect = null; });
  window.addEventListener('scroll', () => { rect = null; }, { passive: true });
}
