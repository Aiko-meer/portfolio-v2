import './styles/tokens.css';
import './styles/base.css';
import './styles/nav.css';
import './styles/hero.css';
import './styles/sections.css';

import { initMotion } from './motion/setup.js';
import { initReveals } from './motion/reveals.js';
import { initNav } from './ui/nav.js';
import { initHeroChrome } from './motion/hero.js';
import { initTilt } from './motion/tilt.js';
import { initWorkParallax } from './motion/work.js';

const { lenis, reduced } = initMotion();

document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

initNav({ lenis, reduced });
initReveals(reduced);
initHeroChrome({ reduced });
initTilt(reduced);
initWorkParallax(reduced);

// Three.js is the only heavy dependency. Keep it off the critical path and
// let the poster + copy paint first.
if (!reduced) {
  const bootHero = () => {
    import('./gl/scene.js')
      .then(({ initHero }) => initHero({ reduced }))
      .catch(() => {
        // Poster remains — nothing else to do.
      });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(bootHero, { timeout: 1800 });
  } else {
    window.setTimeout(bootHero, 400);
  }
}
