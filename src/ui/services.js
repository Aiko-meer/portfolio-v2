import gsap from 'gsap';
import { services } from '../data/services.js';

// Each service gets a volumetric model built from DOM planes. Everything is
// sized in `cqw` against the card stage, so the models scale with the card
// without a second canvas or any external asset.
const crate = (modifier) => `
  <div class="crate crate--${modifier}">
    ${['front', 'back', 'left', 'right', 'top', 'bottom']
      .map((face) => `<span class="crate__face crate__face--${face}"></span>`)
      .join('')}
  </div>`;

const models = {
  browser: `
    <div class="stack">
      <div class="pane pane--a">
        <span class="pane__chrome"><i></i><i></i><i></i></span>
        <span class="pane__content">
          <span class="pane__col">
            <span class="wire" style="--w:74%"></span>
            <span class="wire" style="--w:52%"></span>
            <span class="wire" style="--w:64%"></span>
            <span class="wire" style="--w:44%"></span>
          </span>
          <span class="pane__chart">
            <i style="--h:38%"></i><i style="--h:56%"></i><i style="--h:46%"></i>
            <i style="--h:76%"></i><i style="--h:60%"></i>
          </span>
        </span>
      </div>
      <div class="pane pane--b">
        <span class="pane__chrome"><i></i><i></i><i></i></span>
        <span class="pane__content pane__content--stack">
          <span class="wire wire--hot" style="--w:42%"></span>
          <span class="wire" style="--w:88%"></span>
          <span class="wire" style="--w:66%"></span>
          <span class="wire" style="--w:78%"></span>
          <span class="wire" style="--w:54%"></span>
        </span>
      </div>
      <div class="pane pane--c">
        <span class="pane__chip">access</span>
        <span class="wire wire--hot" style="--w:62%"></span>
        <span class="wire" style="--w:84%"></span>
        <span class="wire" style="--w:48%"></span>
        <span class="pane__dot"></span>
      </div>
    </div>`,

  blueprint: `
    <div class="blueprint">
      <span class="halo"></span>
      <div class="cube">
        <span class="cube__face cube__face--front"></span>
        <span class="cube__face cube__face--back"></span>
        <span class="cube__face cube__face--left"></span>
        <span class="cube__face cube__face--right"></span>
        <span class="cube__face cube__face--top"></span>
        <span class="cube__face cube__face--bottom"></span>
      </div>
      <div class="doc">
        <span class="doc__tab"></span>
        <span class="wire" style="--w:78%"></span>
        <span class="wire" style="--w:92%"></span>
        <span class="wire" style="--w:58%"></span>
        <span class="doc__seal"></span>
      </div>
    </div>`,

  network: `
    <div class="orbit">
      <span class="orbit__ring orbit__ring--a"><i></i><i></i></span>
      <span class="orbit__ring orbit__ring--b"><i></i></span>
      <span class="orbit__ring orbit__ring--c"></span>
    </div>
    <span class="orb"></span>`,

  inventory: `
    <div class="crates">
      ${crate('a')}
      ${crate('b')}
      ${crate('c')}
    </div>`
};

export function renderServices(reduced) {
  const root = document.querySelector('[data-services]');
  if (!root) return;

  root.innerHTML = services
    .map(
      (service) => `
        <article class="service-card service-card--${service.visual}">
          <div class="service-card__visual">
            <div class="service-card__layer service-card__layer--glow" aria-hidden="true"></div>
            <div class="service-card__layer service-card__layer--grid" aria-hidden="true"></div>
            <div class="service-card__model" aria-hidden="true">
              <div class="model model--${service.visual}">
                <div class="model__drift">
                  <div class="model__core">${models[service.visual] ?? ''}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="service-card__body">
            <span class="service-card__index">${service.index}</span>
            <h3>${service.title}</h3>
            <p>${service.summary}</p>
            <ul class="service-card__points">
              ${service.points.map((point) => `<li>${point}</li>`).join('')}
            </ul>
          </div>
        </article>`
    )
    .join('');

  const cards = [...root.querySelectorAll('.service-card')];
  const modelEls = [...root.querySelectorAll('.model')];

  if (!reduced) {
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: root, start: 'top 86%', once: true }
    });

    timeline.fromTo(
      cards,
      { y: 46, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.85,
        stagger: 0.09,
        ease: 'power3.out',
        onComplete: () => {
          cards.forEach((card) => card.classList.add('is-revealed'));
          gsap.set(cards, { clearProps: 'transform,opacity' });
        }
      },
      0
    );

    timeline.fromTo(
      modelEls,
      { z: -140, rotationX: -10, opacity: 0 },
      {
        z: 0,
        rotationX: 0,
        opacity: 1,
        duration: 1.15,
        stagger: 0.09,
        ease: 'power3.out',
        onComplete: () => gsap.set(modelEls, { clearProps: 'transform,opacity' })
      },
      0.12
    );

    timeline.eventCallback('onComplete', () => root.classList.add('is-motion-ready'));
  } else {
    cards.forEach((card) => card.classList.add('is-revealed'));
    root.classList.add('is-motion-ready');
  }

  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.innerWidth <= 900) return;

  const clamp = (value) => Math.max(-0.5, Math.min(0.5, value));

  cards.forEach((card) => {
    let frame = 0;
    let latest = { x: 0, y: 0 };
    let rect = card.getBoundingClientRect();

    const measure = () => {
      rect = card.getBoundingClientRect();
    };

    const apply = () => {
      frame = 0;
      const { x, y } = latest;
      // One pointer signal, three depth ratios: grid 5 px, glow 9 px,
      // model 16 px, plus a <=6deg stage tilt.
      card.style.setProperty('--card-x', x.toFixed(3));
      card.style.setProperty('--card-y', y.toFixed(3));
      card.style.setProperty('--card-tilt-x', `${(x * 6).toFixed(2)}deg`);
      card.style.setProperty('--card-tilt-y', `${(-y * 6).toFixed(2)}deg`);
    };

    card.addEventListener('pointerenter', measure);
    card.addEventListener('pointermove', (event) => {
      latest = {
        x: clamp((event.clientX - rect.left) / rect.width - 0.5),
        y: clamp((event.clientY - rect.top) / rect.height - 0.5)
      };
      if (!frame) frame = window.requestAnimationFrame(apply);
    });

    card.addEventListener('pointerleave', () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      ['--card-x', '--card-y', '--card-tilt-x', '--card-tilt-y'].forEach((name) =>
        card.style.removeProperty(name)
      );
    });

    window.addEventListener('resize', measure);
  });
}
