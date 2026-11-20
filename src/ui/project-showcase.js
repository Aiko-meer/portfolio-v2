import gsap from 'gsap';
import { projects } from '../data/projects.js';

const skeleton = `
  <div class="ui ui--generic" aria-hidden="true">
    <aside class="ui__side">
      <span class="ui__logo"></span>
      <i></i><i></i><i></i><i></i><i></i>
    </aside>
    <div class="ui__main">
      <div class="ui__top"><span class="ui__title"></span><span class="ui__pill"></span></div>
      <div class="ui__stats">
        <div class="ui__stat"><b>—</b><small>Loading</small></div>
        <div class="ui__stat"><b>—</b><small>Loading</small></div>
        <div class="ui__stat"><b>—</b><small>Loading</small></div>
      </div>
      <div class="ui__table">
        <div class="ui__thead"><span>Item</span><span>Value</span><span>Status</span></div>
        <div class="ui__row"><span class="ui__bar ui__bar--dim"></span><span class="ui__bar"></span><span class="ui__bar ui__bar--red"></span></div>
        <div class="ui__row"><span class="ui__bar ui__bar--dim"></span><span class="ui__bar"></span><span class="ui__bar"></span></div>
        <div class="ui__row"><span class="ui__bar ui__bar--dim"></span><span class="ui__bar"></span><span class="ui__bar"></span></div>
      </div>
    </div>
  </div>`;

function mediaBase(media) {
  return media.avif.replace(/-1600\.avif$/, '');
}

function picture(media, sizes) {
  const base = mediaBase(media);
  return `
    <picture>
      <source
        type="image/avif"
        srcset="${base}-800.avif 800w, ${base}-1600.avif 1600w"
        sizes="${sizes}"
      />
      <img
        src="${media.webp}"
        width="1600"
        height="1000"
        loading="lazy"
        decoding="async"
        alt="${media.alt}"
      />
    </picture>`;
}

function deviceMarkup(project) {
  const frame = project.media
    ? `<div class="device__screen">${skeleton}<div class="device__media">${picture(
        project.media,
        '(min-width: 900px) 640px, 90vw'
      )}</div></div>`
    : `<div class="device__screen" aria-hidden="true">${skeleton}</div>`;

  switch (project.device) {
    case 'laptop':
      return `
        <div class="device device--laptop">
          <div class="device__frame">${frame}</div>
          <div class="device__base"></div>
        </div>`;
    case 'browser':
      return `
        <div class="device device--browser">
          <div class="device__frame">
            <div class="device__chrome">
              <span class="device__dot"></span><span class="device__dot"></span><span class="device__dot"></span>
              <span class="device__url"></span>
            </div>
            ${frame}
          </div>
        </div>`;
    case 'tablet':
      return `
        <div class="device device--tablet">
          <div class="device__frame">
            ${frame}
            <div class="device__home"></div>
          </div>
        </div>`;
    default:
      return `
        <div class="device device--monitor">
          <div class="device__frame">${frame}</div>
          <div class="device__stand"></div>
          <div class="device__base"></div>
        </div>`;
  }
}

function metaLine(project) {
  return [project.category, project.client, project.year].filter(Boolean).join(' · ');
}

function statusChip(project) {
  if (project.status !== 'client' && project.status !== 'personal') return '';
  const label = project.status === 'client' ? 'Client system' : 'Personal project';
  return `<span class="tag tag--${project.status}">${label}</span>`;
}

function actionsMarkup(project) {
  const tour = Boolean(project.video);
  const caseLabel = tour ? 'Watch the system tour' : 'Case study';

  const secondary = project.demo
    ? `<a class="project__link" href="${project.demo.url}" target="_blank" rel="noopener">${project.demo.label} <span aria-hidden="true">↗</span></a>
       <span class="project__note">${project.demo.note}</span>`
    : project.status === 'client'
      ? '<span class="project__note">Private client system — walkthrough on request.</span>'
      : '<span class="project__note">Local-only by design.</span>';

  return `
    <div class="project__actions">
      <button class="project__case" type="button" data-case-study="${project.id}" aria-haspopup="dialog" aria-controls="case-study">
        ${caseLabel}<span aria-hidden="true">→</span>
      </button>
      ${secondary}
    </div>`;
}

function galleryMarkup(project) {
  if (!project.gallery?.length) return '';
  const links = project.gallery
    .map((item) => {
      const base = mediaBase(item);
      return `
        <a class="case-study__thumb" href="${item.webp}" target="_blank" rel="noopener"
           aria-label="Open image in a new tab: ${item.alt}">
          <img src="${base}-800.webp" width="800" height="500" loading="lazy" decoding="async" alt="${item.alt}" />
        </a>`;
    })
    .join('');
  return `<div class="case-study__gallery">${links}</div>`;
}

function videoMarkup(project) {
  if (!project.video) return '';
  return `
    <div class="case-study__video">
      <video controls preload="none" playsinline poster="${project.video.poster}">
        <source src="${project.video.src}" type="video/mp4" />
        <track kind="captions" src="${project.video.captions}" srclang="en" label="English" default />
      </video>
    </div>`;
}

function dialogMarkup(project) {
  const details = project.caseStudy;
  const highlights = project.highlights?.length
    ? `<section class="case-study__section">
         <h3>Highlights</h3>
         <ul>${project.highlights.map((item) => `<li>${item}</li>`).join('')}</ul>
       </section>`
    : '';
  const build = details?.build?.length
    ? `<section class="case-study__section">
         <h3>What I built</h3>
         <ul>${details.build.map((item) => `<li>${item}</li>`).join('')}</ul>
       </section>`
    : '';

  const action = project.demo
    ? `<a class="btn btn--primary" href="${project.demo.url}" target="_blank" rel="noopener">
         ${project.demo.label}<span class="btn__arrow" aria-hidden="true">↗</span>
       </a>
       <span class="case-study__note">${project.demo.note}</span>`
    : project.video
      ? '<span class="case-study__note">Local-only by design. The tour plays the real app with fictional data.</span>'
      : '<span class="case-study__note">Private client system — walkthrough on request.</span>';

  return `
    <div class="case-study__panel">
      <button class="case-study__close" type="button" data-case-close aria-label="Close case study">×</button>
      <header class="case-study__head">
        <p class="eyebrow">${project.category} · ${project.year}</p>
        <h2 id="case-study-title">${project.title}</h2>
        <p class="case-study__meta">${metaLine(project)}${statusChip(project)}</p>
        <p class="case-study__role">${project.role}</p>
      </header>
      <div class="case-study__body">
        ${videoMarkup(project)}
        ${details?.problem ? `<section class="case-study__section"><h3>The problem</h3><p>${details.problem}</p></section>` : ''}
        ${highlights}
        ${build}
        ${details?.outcome ? `<section class="case-study__section case-study__section--outcome"><h3>Outcome</h3><p>${details.outcome}</p></section>` : ''}
        ${galleryMarkup(project)}
      </div>
      <footer class="case-study__actions">
        ${action}
      </footer>
    </div>`;
}

function initCaseStudy(reduced) {
  const dialog = document.getElementById('case-study');
  if (!dialog) return;

  let trigger = null;
  let closing = false;

  const finishClose = () => {
    dialog.close();
    closing = false;
    document.documentElement.classList.remove('dialog-open');
    trigger?.focus();
  };

  const close = () => {
    if (closing || !dialog.open) return;
    closing = true;
    dialog.classList.remove('is-open');
    if (reduced) {
      finishClose();
    } else {
      window.setTimeout(finishClose, 300);
    }
  };

  document.querySelectorAll('[data-case-study]').forEach((button) => {
    button.addEventListener('click', () => {
      const project = projects.find((p) => p.id === button.dataset.caseStudy);
      if (!project) return;
      trigger = button;
      dialog.innerHTML = dialogMarkup(project);
      document.documentElement.classList.add('dialog-open');
      dialog.showModal();
      // Flush the closed opacity so the open class animates instead of snapping.
      void dialog.offsetHeight;
      dialog.classList.add('is-open');
    });
  });

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
    if (event.target.closest('[data-case-close]')) close();
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  });
}

// One CSS-built 3D artifact per project, sitting in the stage gutter.
const WORK_MODELS = {
  smr: `
    <div class="wmodel wmodel--analytics" aria-hidden="true">
      <div class="wmodel__core">
        <div class="wbars">
          <span class="wbar" style="--x:1%;--h:42%"></span>
          <span class="wbar" style="--x:20%;--h:68%"></span>
          <span class="wbar" style="--x:39%;--h:34%"></span>
          <span class="wbar wbar--hot" style="--x:58%;--h:86%"></span>
          <span class="wbar" style="--x:77%;--h:56%"></span>
        </div>
      </div>
    </div>`,
  'uco-tms': `
    <div class="wmodel wmodel--workflow" aria-hidden="true">
      <div class="wmodel__core">
        <div class="wtickets">
          <span class="wticket wticket--a"><i></i><b></b></span>
          <span class="wticket wticket--b"><i></i><b></b></span>
          <span class="wticket wticket--c"><i></i><b></b></span>
        </div>
      </div>
    </div>`,
  'budget-desk': `
    <div class="wmodel wmodel--finance" aria-hidden="true">
      <div class="wmodel__core">
        <div class="wcoins">
          <span class="wcoin" style="--i:0"></span>
          <span class="wcoin" style="--i:1"></span>
          <span class="wcoin" style="--i:2"></span>
          <span class="wcoin wcoin--top" style="--i:3"></span>
        </div>
      </div>
    </div>`
};

export function initProjects(reduced) {
  const root = document.querySelector('[data-projects]');
  if (!root) return;

  root.innerHTML = projects
    .map(
      (project, index) => `
        <article class="project${index % 2 === 1 ? ' project--flip' : ''}" aria-labelledby="project-${project.id}">
          <header class="project__bar">
            <span class="project__index">${String(index + 1).padStart(2, '0')}</span>
            <p class="project__meta">
              <span>${project.category}</span>
              <span>${[project.client, project.year].filter(Boolean).join(' · ')}</span>
            </p>
            ${statusChip(project)}
          </header>
          <div class="project__body">
            <div class="project__media" data-project-media tabindex="0" role="group"
                 aria-label="Interactive 3D preview of ${project.title}. Drag or use the arrow keys to orbit it.">
              <div class="project__depth" aria-hidden="true">
                <span class="depth__glow"></span>
                <span class="depth__grid"></span>
                <span class="depth__pane depth__pane--a"></span>
                <span class="depth__pane depth__pane--b"></span>
                ${WORK_MODELS[project.id] ?? WORK_MODELS.smr}
              </div>
              <div class="project__device">${deviceMarkup(project)}</div>
              <span class="project__hint" aria-hidden="true">Drag to orbit</span>
            </div>
            <div class="project__info" data-reveal>
              <h3 id="project-${project.id}">${project.title}</h3>
              <p>${project.description}</p>
              <ul class="project__stack" aria-label="Technology stack">
                ${project.stack.map((tech) => `<li>${tech}</li>`).join('')}
              </ul>
              ${actionsMarkup(project)}
            </div>
          </div>
        </article>`
    )
    .join('');

  initCaseStudy(reduced);

  if (reduced) {
    // The stage is decorative in reduced motion; drop the orbit affordance.
    root.querySelectorAll('[data-project-media]').forEach((media) => {
      media.removeAttribute('tabindex');
      media.removeAttribute('role');
      media.removeAttribute('aria-label');
      media.querySelector('.project__hint')?.remove();
    });
    return;
  }

  document.querySelectorAll('.project').forEach((project) => {
    const media = project.querySelector('[data-project-media]');
    if (!media) return;
    const flip = project.classList.contains('project--flip');
    const inner = media.querySelector('.device__media') ?? media.querySelector('.device__screen > .ui');
    const depth = media.querySelector('.project__depth');
    const model = media.querySelector('.wmodel');

    // C — the copy and clip are one scrub: the frame travels forward (y, z,
    // scale, rotate) while the screen wipes open. Clip expands past the box at
    // the end so the device shadow and the media bloom are never boxed in.
    gsap.fromTo(
      media,
      {
        y: 46,
        z: -40,
        rotateY: flip ? -7 : 7,
        rotateX: 3,
        scale: 0.96,
        clipPath: 'inset(0% 0% 100% 0%)'
      },
      {
        y: 0,
        z: 0,
        rotateY: 0,
        rotateX: 0,
        scale: 1,
        clipPath: 'inset(-30% -20% -30% -20%)',
        ease: 'none',
        scrollTrigger: {
          trigger: project,
          start: 'top 86%',
          end: 'top 32%',
          scrub: 0.7
        }
      }
    );

    // Inner screen parallax: the screen content slides against the page travel.
    // The slight scale keeps the screen edge covered on tall captures.
    if (inner) {
      gsap.fromTo(
        inner,
        { y: 9, scale: 1.04 },
        {
          y: -9,
          scale: 1.04,
          ease: 'none',
          scrollTrigger: {
            trigger: project,
            start: 'top 86%',
            end: 'top 32%',
            scrub: 0.9
          }
        }
      );
    }

    // Depth panes drift against the page so the stage reads as a space, not a
    // flat backdrop.
    if (depth) {
      gsap.fromTo(
        depth,
        { y: 20 },
        {
          y: -22,
          ease: 'none',
          scrollTrigger: {
            trigger: project,
            start: 'top 90%',
            end: 'bottom 20%',
            scrub: 1
          }
        }
      );
    }

    // The 3D artifact lifts out of the stage on first entry.
    if (model) {
      gsap.fromTo(
        model,
        { z: -130, y: 26, rotationY: -24, opacity: 0 },
        {
          z: 0,
          y: 0,
          rotationY: 0,
          opacity: 1,
          duration: 1.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: media, start: 'top 86%', once: true },
          onComplete: () => gsap.set(model, { clearProps: 'transform,opacity' })
        }
      );
    }
  });

  // Interactive stages: hover parallax on fine pointers, drag-to-orbit on
  // everything, and arrow-key orbit for keyboard users.
  const hoverPointer = window.matchMedia('(pointer: fine)').matches && window.innerWidth > 900;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  document.querySelectorAll('[data-project-media]').forEach((media) => {
    let frame = 0;
    let rect = media.getBoundingClientRect();
    let latest = { x: 0, y: 0 };
    let dragging = false;
    let dragId = null;
    let start = { x: 0, y: 0, wx: 0, wy: 0 };
    let moved = 0;
    let settleTimer = 0;

    const measure = () => {
      rect = media.getBoundingClientRect();
    };

    const apply = () => {
      frame = 0;
      media.style.setProperty('--wx', latest.x.toFixed(3));
      media.style.setProperty('--wy', latest.y.toFixed(3));
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    const hold = () => {
      window.clearTimeout(settleTimer);
      media.classList.remove('is-settling');
    };

    const settle = () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      media.classList.add('is-settling');
      latest = { x: 0, y: 0 };
      apply();
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => media.classList.remove('is-settling'), 650);
    };

    if (hoverPointer) {
      media.addEventListener('pointerenter', () => {
        hold();
        measure();
      });

      media.addEventListener('pointermove', (event) => {
        if (dragging) return;
        if (!rect.width) measure();
        latest = {
          x: clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5),
          y: clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5)
        };
        schedule();
      });

      media.addEventListener('pointerleave', () => {
        if (!dragging) settle();
      });
    }

    media.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (event.target.closest('a, button')) return;
      hold();
      measure();
      dragging = true;
      dragId = event.pointerId;
      moved = 0;
      start = { x: event.clientX, y: event.clientY, wx: latest.x, wy: latest.y };
      media.classList.add('is-dragging');
      media.setPointerCapture?.(event.pointerId);
    });

    media.addEventListener('pointermove', (event) => {
      if (!dragging || event.pointerId !== dragId) return;
      const dx = (event.clientX - start.x) / (rect.width || 1);
      const dy = (event.clientY - start.y) / (rect.height || 1);
      moved = Math.max(moved, Math.abs(event.clientX - start.x) + Math.abs(event.clientY - start.y));
      latest = {
        x: clamp(start.wx + dx * 1.8, -1, 1),
        y: clamp(start.wy + dy * 1.8, -1, 1)
      };
      schedule();
    });

    const release = (event) => {
      if (!dragging) return;
      if (event?.pointerId !== undefined && event.pointerId !== dragId) return;
      dragging = false;
      media.classList.remove('is-dragging');
      if (event?.pointerId !== undefined && media.hasPointerCapture?.(event.pointerId)) {
        try {
          media.releasePointerCapture(event.pointerId);
        } catch {
          // Capture may already be gone after a cancel.
        }
      }
      dragId = null;
      if (moved > 8) media.classList.add('has-orbited');
      settle();
    };

    media.addEventListener('pointerup', release);
    media.addEventListener('pointercancel', release);
    media.addEventListener('lostpointercapture', release);
    media.addEventListener('dragstart', (event) => event.preventDefault());

    media.addEventListener('keydown', (event) => {
      const step = 0.14;
      let handled = true;
      if (event.key === 'ArrowLeft') latest.x = clamp(latest.x - step, -1, 1);
      else if (event.key === 'ArrowRight') latest.x = clamp(latest.x + step, -1, 1);
      else if (event.key === 'ArrowUp') latest.y = clamp(latest.y - step, -1, 1);
      else if (event.key === 'ArrowDown') latest.y = clamp(latest.y + step, -1, 1);
      else if (event.key === 'Home' || event.key === '0') latest = { x: 0, y: 0 };
      else handled = false;

      if (!handled) return;
      event.preventDefault();
      hold();
      apply();
      if (event.key !== 'Home' && event.key !== '0') media.classList.add('has-orbited');
    });

    media.addEventListener('blur', () => {
      if (!dragging) settle();
    });

    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, { passive: true });
  });
}
