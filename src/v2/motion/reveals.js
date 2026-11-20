import gsap from 'gsap';

// E — three reveal personalities, assigned per section.
//   rise  : text and meta (28 px lift + fade)
//   clip  : section headers and media (wipe + short lift)
//   depth : cards and panels (scale + fade, no vertical travel)
const VARIANTS = {
  rise: {
    from: { y: 28, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 0.92 }
  },
  clip: {
    from: { y: 14, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
    to: { y: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.98 }
  },
  depth: {
    from: { scale: 0.965, opacity: 0 },
    to: { scale: 1, opacity: 1, duration: 0.85 }
  }
};

const STAGGER = 0.068;
const STAGGER_CAP = 5;

export function initReveals(reduced) {
  const html = document.documentElement;
  const elements = gsap.utils.toArray('[data-reveal]');

  if (reduced) {
    html.classList.remove('js-motion');
    elements.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.clipPath = 'none';
    });
    return;
  }

  const seen = new Map();

  elements.forEach((el) => {
    const section = el.closest('section') || document.body;
    const index = seen.get(section) ?? 0;
    seen.set(section, index + 1);

    const name = VARIANTS[el.getAttribute('data-reveal')]
      ? el.getAttribute('data-reveal')
      : 'rise';
    const variant = VARIANTS[name];

    gsap.fromTo(el, { ...variant.from }, {
      ...variant.to,
      ease: 'power3.out',
      delay: Math.min(index, STAGGER_CAP) * STAGGER,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true
      },
      onComplete: () => {
        el.classList.add('is-revealed');
        gsap.set(el, {
          clearProps: name === 'clip' ? 'transform,clipPath' : 'transform'
        });
      }
    });
  });
}
