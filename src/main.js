import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/sections.css';

import { site } from './data/site.js';
import { initMotion } from './motion/setup.js';
import { initReveals } from './motion/reveals.js';
import { initAboutDepth } from './motion/about-depth.js';
import { initProcess } from './motion/process.js';
import { renderServices } from './ui/services.js';
import { initProjects } from './ui/project-showcase.js';
import { initNav } from './ui/nav.js';

const { lenis, reduced } = initMotion();

document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

initSiteDetails();
renderServices(reduced);
initProjects(reduced);
initProcess(reduced);
initNav({ lenis, reduced });
initReveals(reduced);
initAboutDepth(reduced);
initAmbient(reduced);

// Three.js is a large dependency. Defer it so the poster/headline paint first
// and the scene streams in while the visitor is already reading the page.
if (!reduced) {
  const bootHero = () => {
    import('./gl/scene.js')
      .then(({ initHero }) => initHero({ reduced }))
      .catch(() => {
        // Poster stays visible; nothing else to do.
      });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(bootHero, { timeout: 1800 });
  } else {
    window.setTimeout(bootHero, 400);
  }
}

function initSiteDetails() {
  const email = (site.email || '').trim();
  const hasEmail = email && !email.startsWith('TODO');

  document.querySelectorAll('[data-contact-email]').forEach((el) => {
    el.replaceChildren();
    if (!hasEmail) {
      el.textContent = 'Email not configured';
      el.classList.add('is-placeholder');
      return;
    }
    const link = document.createElement('a');
    link.href = `mailto:${email}`;
    link.textContent = email;
    el.append(link);
  });

  document.querySelectorAll('[data-email-link]').forEach((el) => {
    if (!hasEmail) return;
    el.href = `mailto:${email}?subject=${encodeURIComponent('Project inquiry — ZEDVORA')}`;
  });

  const copyButton = document.querySelector('[data-copy-email]');
  const copyLabel = copyButton?.querySelector('[data-copy-label]');
  const copyStatus = document.querySelector('[data-copy-status]');

  if (copyButton) {
    if (!hasEmail || !navigator.clipboard) {
      copyButton.hidden = true;
    } else {
      copyButton.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(email);
          if (copyLabel) copyLabel.textContent = 'Copied';
          if (copyStatus) copyStatus.textContent = `${email} copied to the clipboard.`;
          window.setTimeout(() => {
            if (copyLabel) copyLabel.textContent = 'Copy email address';
          }, 2200);
        } catch {
          if (copyStatus) copyStatus.textContent = `Copy didn't work here. The address is ${email}.`;
        }
      });
    }
  }

  const socials = document.querySelector('[data-socials]');
  if (!socials) return;

  socials.replaceChildren();
  const ready = (site.socials || []).filter(
    (item) => item.href && !item.href.startsWith('TODO')
  );

  if (!ready.length) {
    socials.hidden = true;
    return;
  }

  ready.forEach((item) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = item.href;
    link.textContent = item.label;
    link.rel = 'noopener';
    link.target = '_blank';
    li.append(link);
    socials.append(li);
  });
}

function initAmbient(isReduced) {
  if (isReduced) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const root = document.documentElement;
  let frame = 0;

  window.addEventListener(
    'pointermove',
    (event) => {
      const x = (event.clientX / window.innerWidth - 0.5).toFixed(3);
      const y = (event.clientY / window.innerHeight - 0.5).toFixed(3);
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        root.style.setProperty('--pointer-x', x);
        root.style.setProperty('--pointer-y', y);
      });
    },
    { passive: true }
  );
}
