import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initHeroChrome({ reduced }) {
  initLocalTime();
  initPointerAmbient(reduced);
  initMarkSweep(reduced);

  if (reduced) return;
  initScrollStory();
}

function initLocalTime() {
  const el = document.querySelector('[data-local-time]');
  if (!el) return;

  const format = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Manila'
  });

  const tick = () => {
    el.textContent = format.format(new Date());
  };

  tick();
  window.setInterval(tick, 30000);
}

function initPointerAmbient(reduced) {
  if (reduced || !window.matchMedia('(pointer: fine)').matches) return;

  const root = document.documentElement;
  let raf = 0;

  window.addEventListener(
    'pointermove',
    (event) => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        root.style.setProperty('--px', x.toFixed(3));
        root.style.setProperty('--py', y.toFixed(3));
      });
    },
    { passive: true }
  );
}

function initMarkSweep(reduced) {
  if (reduced) return;
  const wrap = document.querySelector('[data-brand-sweep]');
  if (!wrap) return;

  let seen = false;
  try {
    seen = window.sessionStorage.getItem('zedvora-sweep') === '1';
  } catch {
    seen = false;
  }
  if (seen) return;

  window.setTimeout(() => {
    wrap.classList.add('is-sweep');
    try {
      window.sessionStorage.setItem('zedvora-sweep', '1');
    } catch {
      /* sessionStorage unavailable — the sweep simply runs again next load */
    }
    window.setTimeout(() => wrap.classList.remove('is-sweep'), 1600);
  }, 650);
}

function initScrollStory() {
  gsap.to('[data-hero-copy]', {
    y: -76,
    opacity: 0.32,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.6
    }
  });

  gsap.to('.hero__aside', {
    y: -38,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.7
    }
  });

  gsap.to('.hero__frame', {
    y: -30,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.7
    }
  });

  gsap.to('.hero__foot', {
    y: 18,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: '65% top',
      end: 'bottom top',
      scrub: 0.5
    }
  });

  gsap.to('[data-scroll-progress]', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      start: 0,
      end: 'max',
      scrub: 0.3
    }
  });
}
