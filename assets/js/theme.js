/* =========================================================================
   Project Taste — theme.js
   Appearance controller: light/dark theme + accent color.

   Responsibilities:
     1. Toggle light ↔ dark and persist the choice (Taste.store)
     2. Live-sync with the OS prefers-color-scheme (only when the user
        has NOT set an explicit preference)
     3. Build + wire the accent-color switcher (sky/violet/emerald/rose/amber)
     4. Keep <html data-theme> / <html data-accent> in sync
     5. Fire a small 'taste:themechange' event other scripts can listen to

   Depends on: utils.js (Taste.$, Taste.store, Taste.el, Taste.on)
   Note: an inline script in index.html already sets the initial theme
   before paint to avoid a flash — this file takes over interactivity.
   ========================================================================= */
(function (window, document) {
  'use strict';

  const T = window.Taste;
  if (!T) { console.error('[theme] Taste utils not loaded'); return; }

  const { $, el, on, store } = T;

  /* ----------------------------------------------------------------------
     Config
     ---------------------------------------------------------------------- */
  const THEME_KEY  = 'theme';       // "light" | "dark"
  const ACCENT_KEY = 'accent';      // one of ACCENTS[].id
  const THEME_EXPLICIT_KEY = 'theme-explicit'; // true once user toggles

  // Accent palette — id must match the [data-accent="…"] rules in theme.css
  const ACCENTS = [
    { id: 'sky',     label: 'Sky' },
    { id: 'violet',  label: 'Violet' },
    { id: 'emerald', label: 'Emerald' },
    { id: 'rose',    label: 'Rose' },
    { id: 'amber',   label: 'Amber' }
  ];
  const DEFAULT_ACCENT = 'sky';

  const root = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  /* ----------------------------------------------------------------------
     Theme
     ---------------------------------------------------------------------- */
  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme, { persist = true } = {}) {
    const next = theme === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    // Keep the browser UI (form controls, scrollbars) aligned
    root.style.colorScheme = next;
    if (persist) {
      store.set(THEME_KEY, next);
      store.set(THEME_EXPLICIT_KEY, true);
    }
    updateThemeToggleA11y(next);
    emitChange();
  }

  function toggleTheme() {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  }

  function updateThemeToggleA11y(theme) {
    const btn = $('#themeToggle');
    if (!btn) return;
    const isDark = theme === 'dark';
    btn.setAttribute('aria-pressed', String(isDark));
    btn.setAttribute(
      'title',
      isDark ? 'Switch to light theme' : 'Switch to dark theme'
    );
  }

  /* ----------------------------------------------------------------------
     Accent
     ---------------------------------------------------------------------- */
  function applyAccent(id, { persist = true } = {}) {
    const accent = ACCENTS.some((a) => a.id === id) ? id : DEFAULT_ACCENT;
    root.setAttribute('data-accent', accent);
    if (persist) store.set(ACCENT_KEY, accent);
    // Reflect active swatch
    T.$$('.accent-swatch').forEach((s) =>
      s.classList.toggle('is-active', s.dataset.swatch === accent)
    );
    // Keep <meta name="theme-color"> roughly in sync for mobile chrome
    syncMetaThemeColor();
    emitChange();
  }

  function syncMetaThemeColor() {
    const meta = $('meta[name="theme-color"]');
    if (!meta) return;
    // Read the resolved --accent from CSS
    const val = getComputedStyle(root).getPropertyValue('--accent').trim();
    if (val) meta.setAttribute('content', val);
  }

  /**
   * Build the accent switcher and inject it into the navbar, just before
   * the theme toggle. Rendered from the ACCENTS array (no hardcoded markup).
   */
  function buildAccentSwitcher() {
    const navRight = $('.navbar-right');
    const themeBtn = $('#themeToggle');
    if (!navRight || $('.accent-switcher')) return;

    const wrap = el('div', {
      class: 'accent-switcher',
      role: 'group',
      'aria-label': 'Accent color'
    });

    ACCENTS.forEach((a) => {
      wrap.appendChild(
        el('button', {
          class: 'accent-swatch',
          dataset: { swatch: a.id },
          type: 'button',
          title: a.label + ' accent',
          'aria-label': a.label + ' accent'
        })
      );
    });

    // Insert before the theme toggle if present, else append
    if (themeBtn) navRight.insertBefore(wrap, themeBtn);
    else navRight.appendChild(wrap);
  }

  /* ----------------------------------------------------------------------
     Events
     ---------------------------------------------------------------------- */
  function emitChange() {
    window.dispatchEvent(
      new CustomEvent('taste:themechange', {
        detail: { theme: currentTheme(), accent: root.getAttribute('data-accent') }
      })
    );
  }

  /* ----------------------------------------------------------------------
     Wiring
     ---------------------------------------------------------------------- */
  function init() {
    // Restore accent (theme was already set pre-paint by the inline script)
    applyAccent(store.get(ACCENT_KEY, DEFAULT_ACCENT), { persist: false });

    // Build + wire the accent switcher
    buildAccentSwitcher();
    on(document, 'click', '.accent-swatch', function (e, node) {
      applyAccent(node.dataset.swatch);
    });

    // Theme toggle button
    const themeBtn = $('#themeToggle');
    if (themeBtn) on(themeBtn, 'click', toggleTheme);
    updateThemeToggleA11y(currentTheme());

    // Keyboard shortcut: Shift + D toggles dark mode
    on(document, 'keydown', (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(
        (e.target && e.target.tagName) || ''
      );
      if (!typing && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        toggleTheme();
      }
    });

    // Live-follow the OS theme ONLY if the user never chose explicitly
    const onSystemChange = (e) => {
      if (store.get(THEME_EXPLICIT_KEY, false)) return;
      applyTheme(e.matches ? 'dark' : 'light', { persist: false });
    };
    if (systemDark.addEventListener) {
      systemDark.addEventListener('change', onSystemChange);
    } else if (systemDark.addListener) {
      systemDark.addListener(onSystemChange); // older Safari
    }

    // Make sure meta theme-color matches the restored accent/theme
    syncMetaThemeColor();
  }

  /* ----------------------------------------------------------------------
     Public API (handy for other scripts / a future settings panel)
     ---------------------------------------------------------------------- */
  T.theme = {
    get: currentTheme,
    set: applyTheme,
    toggle: toggleTheme,
    setAccent: applyAccent,
    getAccent: () => root.getAttribute('data-accent') || DEFAULT_ACCENT,
    accents: ACCENTS.slice()
  };

  // Run after DOM is ready (script is deferred, but guard anyway)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
