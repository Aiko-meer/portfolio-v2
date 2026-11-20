// B — pointer depth for capability cards. Transform only, capped at 5–6°,
// disabled on touch and under reduced motion.
export function initTilt(reduced) {
  if (reduced) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.innerWidth < 901) return;

  const cards = Array.from(document.querySelectorAll('[data-tilt]'));

  cards.forEach((card) => {
    let rect = null;
    let raf = 0;
    let px = 0;
    let py = 0;

    const apply = () => {
      raf = 0;
      card.style.setProperty('--rx', `${(-py * 5).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${(px * 6).toFixed(2)}deg`);
      card.style.setProperty('--lx', px.toFixed(3));
      card.style.setProperty('--ly', py.toFixed(3));
      card.style.setProperty('--mx', `${((px + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${((py + 0.5) * 100).toFixed(1)}%`);
    };

    const onEnter = () => {
      rect = card.getBoundingClientRect();
      card.classList.add('is-tilting');
    };

    const onMove = (event) => {
      if (!rect) rect = card.getBoundingClientRect();
      px = (event.clientX - rect.left) / rect.width - 0.5;
      py = (event.clientY - rect.top) / rect.height - 0.5;
      if (!raf) raf = window.requestAnimationFrame(apply);
    };

    const reset = () => {
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
      card.classList.remove('is-tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--lx', '0');
      card.style.setProperty('--ly', '0');
      rect = null;
    };

    card.addEventListener('pointerenter', onEnter);
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', reset);
    card.addEventListener('pointercancel', reset);
  });
}
