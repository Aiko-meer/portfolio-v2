import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { processSteps } from '../data/process.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function initProcess(reduced) {
  const wrap = document.querySelector('[data-process-wrap]');
  const stage = document.querySelector('[data-process-stage]');
  const list = document.querySelector('[data-process]');
  if (!wrap || !stage || !list) return;

  const fill = document.querySelector('[data-process-fill]');
  const currentEl = document.querySelector('[data-process-current]');
  const totalEl = document.querySelector('[data-process-total]');
  const detailEl = document.querySelector('.process__detail');
  const copyEl = document.querySelector('[data-process-copy]');
  const labelEl = document.querySelector('[data-process-label]');
  const descEl = document.querySelector('[data-process-desc]');
  const prevBtn = document.querySelector('[data-process-prev]');
  const nextBtn = document.querySelector('[data-process-next]');

  const count = processSteps.length;
  const is3d = !reduced;

  // Cards stay in the markup as a plain list so the reduced-motion fallback,
  // crawlers and the no-3D path all get the same six stages.
  list.innerHTML = processSteps
    .map(
      (step, index) => `
        <li class="process__item" data-index="${index}">
          <button
            class="process__card"
            type="button"
            aria-controls="process-detail"
            aria-label="Stage ${step.index} — ${step.label}"
          >
            <span class="process__num">${step.index}</span>
            <span class="process__card-title">${step.label}</span>
            <span class="process__card-desc">${step.description}</span>
            <span class="process__card-go" aria-hidden="true">→</span>
          </button>
        </li>`
    )
    .join('');

  const items = Array.from(list.children);
  const cards = items.map((item) => item.querySelector('.process__card'));

  let active = 0;
  let dragUnits = 0;
  let gapPx = 150;
  let frame = 0;
  let pointerId = null;
  let startX = 0;
  let dragMoved = false;
  let ignoreClick = false;
  let ignoreTimer = 0;
  let stageRect = null;
  let tiltFrame = 0;
  let tiltEvent = null;

  if (is3d) wrap.classList.add('is-3d');

  function paint() {
    if (!is3d) {
      items.forEach((item, i) => {
        item.classList.toggle('is-active', i === active);
        if (i === active) cards[i].setAttribute('aria-current', 'step');
        else cards[i].removeAttribute('aria-current');
      });
      return;
    }

    // `dragUnits` is fractional while a pointer drag is in progress, so the
    // coverflow tracks the finger and then snaps to the nearest stage.
    const pos = active - dragUnits;

    items.forEach((item, i) => {
      const offset = i - pos;
      const distance = Math.abs(offset);

      item.style.setProperty('--offset', offset.toFixed(3));
      item.style.setProperty('--scale', String(1 - Math.min(distance, 4) * 0.035));
      item.style.opacity = String(distance > 1 ? Math.max(0, 1 - (distance - 1) * 0.55) : 1);
      item.style.zIndex = String(40 - Math.round(distance * 6));
      item.style.pointerEvents = distance > 2.2 ? 'none' : 'auto';
      item.classList.toggle('is-active', i === active);

      if (i === active) cards[i].setAttribute('aria-current', 'step');
      else cards[i].removeAttribute('aria-current');
    });
  }

  function paintDetail(animate) {
    const step = processSteps[active];

    if (currentEl) currentEl.textContent = step.index;
    if (totalEl) totalEl.textContent = processSteps[count - 1].index;
    if (labelEl) labelEl.textContent = step.label;
    if (descEl) descEl.textContent = step.description;
    if (detailEl) detailEl.dataset.stage = step.index;
    if (prevBtn) prevBtn.disabled = active === 0;
    if (nextBtn) nextBtn.disabled = active === count - 1;
    if (fill) fill.style.setProperty('--rail-progress', ((active + 1) / count).toFixed(4));

    if (animate && !reduced && copyEl) {
      gsap.fromTo(
        copyEl,
        { opacity: 0.15, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'power3.out',
          overwrite: true,
          clearProps: 'transform,opacity'
        }
      );
    }
  }

  function setActive(index, options = {}) {
    const next = clamp(index, 0, count - 1);
    if (next === active && !options.force) {
      paint();
      return;
    }
    active = next;
    dragUnits = 0;
    paint();
    paintDetail(options.animate !== false);
  }

  function engage() {
    wrap.classList.add('has-engaged');
  }

  function measure() {
    if (!is3d) return;
    const width = cards[0].offsetWidth || 190;
    gapPx = Math.max(74, Math.round(width * 1.06));
    stage.style.setProperty('--process-gap', `${gapPx}px`);
    stageRect = null;
    paint();
  }

  function scheduleTilt(event) {
    tiltEvent = event;
    if (tiltFrame) return;
    tiltFrame = requestAnimationFrame(() => {
      tiltFrame = 0;
      if (!tiltEvent || !stageRect) return;
      const px = clamp((tiltEvent.clientX - stageRect.left) / stageRect.width - 0.5, -0.5, 0.5);
      const py = clamp((tiltEvent.clientY - stageRect.top) / stageRect.height - 0.5, -0.5, 0.5);
      stage.style.setProperty('--px', px.toFixed(3));
      stage.style.setProperty('--py', py.toFixed(3));
    });
  }

  function onDragMove(event) {
    if (pointerId === null || event.pointerId !== pointerId) return;

    const dx = event.clientX - startX;

    if (!dragMoved && Math.abs(dx) > 3) {
      dragMoved = true;
      wrap.classList.add('is-dragging');
    }

    if (!dragMoved) return;

    dragUnits = clamp(dx / gapPx, -3, 3);

    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (dragMoved) paint();
    });
  }

  function endDrag(event) {
    if (pointerId === null) return;

    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
    pointerId = null;

    const dx = event && typeof event.clientX === 'number' ? event.clientX - startX : 0;
    const stepped = dragMoved ? Math.round(clamp(dx / gapPx, -3, 3)) : 0;

    if (dragMoved) {
      engage();
      ignoreClick = true;
      window.clearTimeout(ignoreTimer);
      ignoreTimer = window.setTimeout(() => {
        ignoreClick = false;
      }, 420);
    }

    wrap.classList.remove('is-dragging');
    dragUnits = 0;

    if (stepped !== 0) setActive(active - stepped);
    else paint();
  }

  list.addEventListener('click', (event) => {
    if (ignoreClick) {
      ignoreClick = false;
      return;
    }

    const button = event.target.closest('.process__card');
    if (!button) return;

    const index = Number(button.closest('.process__item').dataset.index);
    if (Number.isNaN(index)) return;

    engage();
    setActive(index);
  });

  list.addEventListener('keydown', (event) => {
    if (!is3d) return;

    const moves = { ArrowRight: 1, ArrowLeft: -1 };
    let target = null;

    if (event.key in moves) target = active + moves[event.key];
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = count - 1;

    if (target === null) return;

    event.preventDefault();
    const next = clamp(target, 0, count - 1);
    if (next === active) return;

    engage();
    setActive(next);
    cards[next].focus({ preventScroll: true });
  });

  prevBtn?.addEventListener('click', () => {
    engage();
    setActive(active - 1);
  });

  nextBtn?.addEventListener('click', () => {
    engage();
    setActive(active + 1);
  });

  stage.addEventListener('pointerdown', (event) => {
    if (!is3d) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    pointerId = event.pointerId;
    startX = event.clientX;
    dragMoved = false;

    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  });

  stage.addEventListener('pointerenter', (event) => {
    if (!is3d || event.pointerType !== 'mouse') return;
    stageRect = stage.getBoundingClientRect();
  });

  stage.addEventListener('pointermove', (event) => {
    if (!is3d || pointerId !== null || event.pointerType !== 'mouse') return;
    if (!stageRect) stageRect = stage.getBoundingClientRect();
    scheduleTilt(event);
  });

  stage.addEventListener('pointerleave', () => {
    if (pointerId !== null) return;
    stageRect = null;
    stage.style.setProperty('--px', '0');
    stage.style.setProperty('--py', '0');
  });

  stage.addEventListener('dragstart', (event) => event.preventDefault());

  window.addEventListener(
    'scroll',
    () => {
      stageRect = null;
    },
    { passive: true }
  );

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(measure, 140);
  });

  paint();
  paintDetail(false);
  measure();

  if (!reduced) {
    // Cards cascade inside the deck; the coverflow transform lives on the
    // list items, so animating the buttons avoids fighting it.
    gsap.from(cards, {
      y: 36,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.06,
      scrollTrigger: {
        trigger: stage,
        start: 'top 82%',
        once: true
      },
      onComplete: () => {
        gsap.set(cards, { clearProps: 'transform,opacity' });
        paint();
      }
    });
  }
}
