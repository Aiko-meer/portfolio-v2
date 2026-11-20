import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// C — inner screen parallax. The frame keeps the crop; only the image moves,
// and only on transform, so CLS stays at zero.
export function initWorkParallax(reduced) {
  if (reduced) return;

  document.querySelectorAll('[data-parallax-media]').forEach((media) => {
    const img = media.querySelector('img');
    if (!img) return;

    gsap.fromTo(
      img,
      { yPercent: -2.3 },
      {
        yPercent: 2.3,
        ease: 'none',
        scrollTrigger: {
          trigger: media,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.55
        }
      }
    );
  });
}
