export function initNav({ lenis, reduced }) {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;

  const toggle = nav.querySelector('[data-menu-toggle]');
  const toggleLabel = nav.querySelector('.nav__toggle-label');
  const menu = nav.querySelector('[data-menu]');
  const links = Array.from(nav.querySelectorAll('[data-nav-link]'));
  const sections = Array.from(document.querySelectorAll('main section[id]'));

  let open = false;
  const setScrolled = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  window.addEventListener('scroll', setScrolled, { passive: true });
  setScrolled();

  const focusable = () =>
    Array.from(menu.querySelectorAll('a[href], button:not([disabled])')).filter(
      (el) => !el.hidden && el.getClientRects().length > 0
    );

  function setOpen(next, restoreFocus = true) {
    if (open === next) return;
    open = next;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (toggleLabel) toggleLabel.textContent = open ? 'Close' : 'Menu';
    document.body.classList.toggle('menu-open', open);

    if (open) {
      lenis?.stop();
      window.setTimeout(() => focusable()[0]?.focus(), 480);
    } else {
      lenis?.start();
      if (restoreFocus) toggle.focus({ preventScroll: true });
    }
  }

  toggle?.addEventListener('click', () => setOpen(!open));

  menu?.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false, false);
  });

  document.addEventListener('keydown', (event) => {
    if (!open) return;

    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }

    if (event.key !== 'Tab') return;
    const items = focusable();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && open) setOpen(false, false);
  });

  if (sections.length && 'IntersectionObserver' in window) {
    const visible = new Set();

    const applyActive = (active) => {
      links.forEach((link) => {
        const isActive = active
          ? link.getAttribute('href') === `#${active.id}`
          : false;
        if (isActive) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    };

    // A thin band in the middle of the viewport. Whatever section crosses it
    // owns the active state. "Last in document order" stays correct even if
    // observer callbacks arrive out of order during a fast scroll.
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

        // Nothing lands in the band (e.g. a short section over a gap):
        // fall back to the nearest section above the probe line.
        if (!active) {
          const probe =
            window.scrollY + nav.offsetHeight + window.innerHeight * 0.32;
          for (const section of sections) {
            if (section.offsetTop <= probe) active = section;
          }
        }

        applyActive(active);
      },
      { rootMargin: '-38% 0px -56% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.classList.contains('skip-link')) return;

    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;

    if (hash === '#top') {
      event.preventDefault();
      if (open) setOpen(false, false);
      if (lenis) lenis.scrollTo(0, { duration: 1.1 });
      else window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      history.replaceState(null, '', '#top');
      return;
    }

    const target = document.querySelector(hash);
    if (!target) return;

    event.preventDefault();
    if (open) setOpen(false, false);

    const offset = -(nav.offsetHeight || 72);

    if (lenis) {
      lenis.scrollTo(target, { offset, duration: 1.1 });
    } else {
      const top = target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    }

    history.replaceState(null, '', hash);
  });
}
