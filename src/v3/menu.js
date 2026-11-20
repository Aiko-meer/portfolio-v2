export function initMenu({ lenis }) {
  const menu = document.querySelector('[data-menu]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const close = document.querySelector('[data-menu-close]');
  if (!menu || !toggle) return;

  let open = false;
  let lastFocus = null;

  const focusables = () =>
    Array.from(menu.querySelectorAll('a[href], button:not([disabled])')).filter(
      (el) => el.getClientRects().length > 0
    );

  function setOpen(next, restore = true) {
    if (open === next) return;
    open = next;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);

    if (open) {
      lastFocus = document.activeElement;
      lenis?.stop();
      window.setTimeout(() => close?.focus({ preventScroll: true }), 140);
    } else {
      lenis?.start();
      if (restore) {
        const target = lastFocus && lastFocus !== document.body ? lastFocus : toggle;
        target.focus?.({ preventScroll: true });
      }
    }
  }

  toggle.addEventListener('click', () => setOpen(true));
  close?.addEventListener('click', () => setOpen(false));

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false, false);
  });

  document.addEventListener('keydown', (event) => {
    if (!open) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key !== 'Tab') return;
    const items = focusables();
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
    if (window.innerWidth > 1100 && open) setOpen(false, false);
  });
}
