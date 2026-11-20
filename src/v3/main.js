import './styles/tokens.css';
import './styles/base.css';
import './styles/hero.css';
import './styles/sections.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initMenu } from './menu.js';

gsap.registerPlugin(ScrollTrigger);

const html = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis = null;

if (!reduced) {
  lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    wheelMultiplier: 0.92,
    touchMultiplier: 1.1
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ------------------------------------------------------------- page details */

document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

const timeNodes = document.querySelectorAll('[data-local-time]');
if (timeNodes.length) {
  const format = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const tick = () => {
    const value = format.format(new Date());
    timeNodes.forEach((node) => {
      node.textContent = value;
    });
  };
  tick();
  window.setInterval(tick, 30000);
}

/* ------------------------------------------------------------------ header */

const header = document.querySelector('[data-header]');

if (header) {
  const setScrolled = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', setScrolled, { passive: true });
  setScrolled();
}

initMenu({ lenis });

/* ------------------------------------------------------------ active links */

const navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));
const sections = Array.from(document.querySelectorAll('main section[id]'));

if (navLinks.length && sections.length) {
  const visible = new Set();

  const applyActive = (active) => {
    navLinks.forEach((link) => {
      if (active && link.getAttribute('href') === `#${active.id}`) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const probeActive = () => {
    const probe = window.scrollY + (header?.offsetHeight || 72) + window.innerHeight * 0.32;
    let active = null;
    for (const section of sections) {
      if (section.offsetTop <= probe) active = section;
    }
    applyActive(active);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }

        let active = null;
        for (const section of sections) {
          if (visible.has(section.id)) active = section;
        }

        if (active) applyActive(active);
        else probeActive();
      },
      { rootMargin: '-38% 0px -52% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  window.addEventListener('scroll', probeActive, { passive: true });
  probeActive();
}

/* -------------------------------------------------------------- anchor flow */

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || link.classList.contains('skip-link')) return;

  const hash = link.getAttribute('href');
  if (!hash || hash === '#') return;

  if (hash === '#top') {
    event.preventDefault();
    if (lenis) lenis.scrollTo(0, { duration: 1.1 });
    else window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    history.replaceState(null, '', '#top');
    return;
  }

  const target = document.querySelector(hash);
  if (!target) return;

  event.preventDefault();

  if (lenis) {
    // Lenis subtracts the CSS scroll-margin (header + 20px) on its own.
    lenis.scrollTo(target, { offset: 0, duration: 1.1 });
  } else {
    const top =
      target.getBoundingClientRect().top + window.scrollY - ((header?.offsetHeight || 72) + 10);
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  }

  history.replaceState(null, '', hash);
});

/* ------------------------------------------------------------------ motion */

if (!reduced) {
  // The headline lines are hidden by CSS and revealed with a transition once
  // the first frame has painted — no GSAP transform fighting the CSS unit.
  window.setTimeout(() => html.classList.add('is-lines-up'), 100);

  const intro = gsap.timeline({
    defaults: { ease: 'power4.out' },
    onComplete: () => {
      html.classList.add('is-intro-done');
      ScrollTrigger.refresh();
    }
  });

  intro.to('.hero [data-intro]', { opacity: 1, duration: 0.9, stagger: 0.06 }, 0.18);

  // Section rules draw in from the left.
  gsap.utils.toArray('[data-rule]').forEach((rule) => {
    gsap.fromTo(
      rule,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: rule, start: 'top 92%', once: true }
      }
    );
  });

  // Content reveals.
  const seen = new Map();
  const variants = {
    rise: { from: { y: 26, opacity: 0 }, to: { y: 0, opacity: 1, duration: 0.92 } },
    fade: { from: { opacity: 0 }, to: { opacity: 1, duration: 1.1 } },
    mask: {
      from: { clipPath: 'inset(0 0 100% 0)' },
      to: { clipPath: 'inset(0 0 0% 0)', duration: 1.05 }
    }
  };

  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    const section = el.closest('section') || document.body;
    const index = seen.get(section) ?? 0;
    seen.set(section, index + 1);

    const name = variants[el.dataset.reveal] ? el.dataset.reveal : 'rise';
    const variant = variants[name];

    gsap.fromTo(el, { ...variant.from }, {
      ...variant.to,
      ease: 'power3.out',
      delay: Math.min(index, 4) * 0.055,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onComplete: () => {
        el.classList.add('is-in');
        gsap.set(el, { clearProps: name === 'mask' ? 'clipPath' : 'transform,opacity' });
      }
    });
  });

  // Slow portrait drift inside the ID card.
  const idPhoto = document.querySelector('.idcard__photo img');
  if (idPhoto) {
    gsap.fromTo(
      idPhoto,
      { yPercent: -3.5, scale: 1.07 },
      {
        yPercent: 3.5,
        scale: 1.07,
        ease: 'none',
        scrollTrigger: { trigger: '.idcard', start: 'top bottom', end: 'bottom top', scrub: true }
      }
    );
  }

  // Scroll progress thread.
  const bar = document.querySelector('[data-progress]');
  if (bar) {
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        bar.style.transform = `scaleX(${self.progress})`;
      }
    });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
} else {
  html.classList.add('is-intro-done');
}
