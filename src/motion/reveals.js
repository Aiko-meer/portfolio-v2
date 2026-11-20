import gsap from 'gsap';

// E — three deliberate reveal personalities, assigned per section.
//   rise  : default text reveal (24–28 px lift + fade)
//   clip  : work section header (clip-path wipe + short lift)
//   depth : services grid + about (scale + fade, no Y travel)
const VARIANTS = {
  rise: {
    from: { y: 26, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 0.9 }
  },
  clip: {
    from: { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
    to: { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: 0.95 }
  },
  depth: {
    from: { scale: 0.97, opacity: 0 },
    to: { scale: 1, opacity: 1, duration: 0.8 }
  }
};

const STAGGER = 0.07;
const STAGGER_CAP = 4;

function buildTween(el) {
  const name = VARIANTS[el.getAttribute('data-reveal')] ? el.getAttribute('data-reveal') : 'rise';
  const variant = VARIANTS[name];
  const from = { ...variant.from };
  const to = { ...variant.to };

  if (name === 'clip') {
    from.y = 12;
    to.y = 0;
  }

  return { name, from, to };
}

export function initReveals(reduced) {
  const elements = gsap.utils.toArray('[data-reveal]');
  const html = document.documentElement;

  if (reduced) {
    html.classList.remove('js-motion');
    elements.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.clipPath = 'none';
    });
    return;
  }

  // Stagger is scoped per section so neighbours cascade together without
  // pulling unrelated elements into one long timeline.
  const seen = new Map();

  elements.forEach((el) => {
    const section = el.closest('section') || document.body;
    const index = seen.get(section) ?? 0;
    seen.set(section, index + 1);

    const { name, from, to } = buildTween(el);

    gsap.fromTo(el, from, {
      ...to,
      ease: 'power3.out',
      delay: Math.min(index, STAGGER_CAP) * STAGGER,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true
      },
      // Release inline transforms so CSS hover states (e.g. the service-card
      // lift) keep working. `is-revealed` stops the initial-state CSS from
      // reapplying once the inline values are cleared.
      onComplete: () => {
        el.classList.add('is-revealed');
        gsap.set(el, { clearProps: name === 'clip' ? 'transform,clipPath' : 'transform' });
      }
    });
  });
}
