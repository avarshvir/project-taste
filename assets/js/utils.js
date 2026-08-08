/* =========================================================================
   Project Taste — utils.js
   Shared, dependency-free helpers used by every other script and tool page.
   Everything is attached to a single global namespace: window.Taste

   Sections:
     1. DOM helpers            ($, $$, el, on)
     2. Safe storage wrapper   (Taste.store)
     3. Toast notifications    (Taste.toast)
     4. Clipboard              (Taste.copy)
     5. File download          (Taste.download)
     6. Drag & drop            (Taste.dropzone)
     7. Timing                 (debounce, throttle)
     8. Formatting / misc      (bytes, escapeHtml, slugify, uid)

   No build step, no modules — plain ES that runs in the browser directly.
   ========================================================================= */
(function (window, document) {
  'use strict';

  /** The single global namespace. */
  const Taste = window.Taste || {};

  /* ======================================================================
     1. DOM HELPERS
     ====================================================================== */

  /** Query a single element. `$('.foo')` or scoped `$('.foo', parent)`. */
  const $ = (selector, scope = document) => scope.querySelector(selector);

  /** Query all elements, returned as a real Array (so .map/.filter work). */
  const $$ = (selector, scope = document) =>
    Array.prototype.slice.call(scope.querySelectorAll(selector));

  /**
   * Create an element with attributes and children in one call.
   * el('button', { class: 'btn', onclick: fn }, ['Click me'])
   */
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.keys(attrs).forEach((key) => {
      const val = attrs[key];
      if (val === null || val === undefined || val === false) return;
      if (key === 'class' || key === 'className') {
        node.className = val;
      } else if (key === 'dataset') {
        Object.keys(val).forEach((d) => { node.dataset[d] = val[d]; });
      } else if (key.startsWith('on') && typeof val === 'function') {
        node.addEventListener(key.slice(2).toLowerCase(), val);
      } else if (key === 'html') {
        node.innerHTML = val;
      } else if (key === 'text') {
        node.textContent = val;
      } else {
        node.setAttribute(key, val === true ? '' : val);
      }
    });
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (child === null || child === undefined || child === false) return;
      node.appendChild(
        typeof child === 'string' || typeof child === 'number'
          ? document.createTextNode(String(child))
          : child
      );
    });
    return node;
  }

  /**
   * Delegated / direct event binding helper.
   * on(document, 'click', '.nav-item', handler)  // delegated
   * on(button, 'click', handler)                 // direct
   */
  function on(target, type, selectorOrHandler, maybeHandler) {
    if (typeof selectorOrHandler === 'function') {
      target.addEventListener(type, selectorOrHandler);
      return () => target.removeEventListener(type, selectorOrHandler);
    }
    const selector = selectorOrHandler;
    const handler = maybeHandler;
    const wrapped = (event) => {
      const match = event.target.closest(selector);
      if (match && target.contains(match)) {
        handler.call(match, event, match);
      }
    };
    target.addEventListener(type, wrapped);
    return () => target.removeEventListener(type, wrapped);
  }

  /* ======================================================================
     2. SAFE STORAGE WRAPPER
     Wraps localStorage with JSON encoding, a key prefix, and graceful
     failure (private mode / quota / disabled storage never throws).
     Powers: theme, accent, favorites, recents, per-tool auto-save.
     ====================================================================== */
  const PREFIX = 'taste:';
  const memoryFallback = {};
  let storageAvailable = true;
  try {
    const t = PREFIX + '__test__';
    window.localStorage.setItem(t, '1');
    window.localStorage.removeItem(t);
  } catch (e) {
    storageAvailable = false;
  }

  const store = {
    /** Read a value; returns `fallback` if missing or unparseable. */
    get(key, fallback = null) {
      const k = PREFIX + key;
      try {
        const raw = storageAvailable
          ? window.localStorage.getItem(k)
          : memoryFallback[k];
        return raw === null || raw === undefined ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    /** Write a JSON-serialisable value. Returns true on success. */
    set(key, value) {
      const k = PREFIX + key;
      try {
        const raw = JSON.stringify(value);
        if (storageAvailable) window.localStorage.setItem(k, raw);
        else memoryFallback[k] = raw;
        return true;
      } catch (e) {
        return false;
      }
    },
    /** Remove a key. */
    remove(key) {
      const k = PREFIX + key;
      try {
        if (storageAvailable) window.localStorage.removeItem(k);
        else delete memoryFallback[k];
      } catch (e) { /* ignore */ }
    },
    /** Toggle membership of `value` inside an array key (e.g. favorites). */
    toggleInArray(key, value) {
      const arr = this.get(key, []);
      const idx = arr.indexOf(value);
      if (idx === -1) arr.push(value);
      else arr.splice(idx, 1);
      this.set(key, arr);
      return idx === -1; // true = added, false = removed
    }
  };

  /* ======================================================================
     3. TOAST NOTIFICATIONS
     Reuses the #toast element styled in components.css.
     Taste.toast('Copied!')                       // neutral
     Taste.toast('Saved', 'success')              // green
     Taste.toast('Something broke', 'error')      // red
     ====================================================================== */
  let toastTimer = null;
  const TOAST_ICONS = {
    success: 'bi-check-circle-fill',
    error:   'bi-exclamation-triangle-fill',
    info:    'bi-info-circle-fill'
  };

  function toast(message, type = 'info', duration = 2200) {
    const node = $('#toast');
    if (!node) return;
    const icon = TOAST_ICONS[type] || TOAST_ICONS.info;
    node.className = 'toast-taste'; // reset
    node.classList.add('toast-' + type);
    node.innerHTML = '';
    node.appendChild(el('i', { class: 'bi ' + icon }));
    node.appendChild(el('span', { text: message }));
    // Force reflow so re-triggering restarts the transition
    void node.offsetWidth;
    node.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('is-visible'), duration);
  }

  /* ======================================================================
     4. CLIPBOARD
     Uses the async Clipboard API with a legacy execCommand fallback.
     Returns a Promise<boolean> and fires a toast automatically.
     ====================================================================== */
  async function copy(text, { silent = false } = {}) {
    const value = String(text ?? '');
    if (!value) {
      if (!silent) toast('Nothing to copy', 'info');
      return false;
    }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback for non-HTTPS / older browsers
        const ta = el('textarea', {
          style: 'position:fixed;top:-9999px;opacity:0'
        });
        ta.value = value;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      if (!silent) toast('Copied to clipboard', 'success');
      return true;
    } catch (e) {
      if (!silent) toast('Copy failed', 'error');
      return false;
    }
  }

  /* ======================================================================
     5. FILE DOWNLOAD
     Taste.download('output.json', jsonString, 'application/json')
     ====================================================================== */
  function download(filename, content, mime = 'text/plain') {
    try {
      const blob =
        content instanceof Blob ? content : new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = el('a', { href: url, download: filename });
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Revoke on next tick so the download has time to start
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('Downloaded ' + filename, 'success');
      return true;
    } catch (e) {
      toast('Download failed', 'error');
      return false;
    }
  }

  /* ======================================================================
     6. DRAG & DROP
     Wire a dropzone (usually a textarea) to receive dropped text files.
     Taste.dropzone(textarea, (text, file) => { ... })
     Adds/removes the .is-dragover class handled in components.css.
     ====================================================================== */
  function dropzone(node, onFile, { accept = null } = {}) {
    if (!node) return () => {};
    const stop = (e) => { e.preventDefault(); e.stopPropagation(); };
    const enter = (e) => { stop(e); node.classList.add('is-dragover'); };
    const leave = (e) => { stop(e); node.classList.remove('is-dragover'); };
    const drop = (e) => {
      stop(e);
      node.classList.remove('is-dragover');
      const file = e.dataTransfer && e.dataTransfer.files[0];
      if (!file) return;
      if (accept && !file.name.match(accept) && !file.type.match(accept)) {
        toast('Unsupported file type', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => onFile(String(reader.result), file);
      reader.onerror = () => toast('Could not read file', 'error');
      reader.readAsText(file);
    };
    ['dragenter', 'dragover'].forEach((t) => node.addEventListener(t, enter));
    ['dragleave', 'dragend'].forEach((t) => node.addEventListener(t, leave));
    node.addEventListener('drop', drop);
    return () => {
      ['dragenter', 'dragover'].forEach((t) => node.removeEventListener(t, enter));
      ['dragleave', 'dragend'].forEach((t) => node.removeEventListener(t, leave));
      node.removeEventListener('drop', drop);
    };
  }

  /* ======================================================================
     7. TIMING HELPERS
     ====================================================================== */

  /** Delay invocation until `wait`ms after the last call. For instant search. */
  function debounce(fn, wait = 200) {
    let timer = null;
    function debounced(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    }
    debounced.cancel = () => clearTimeout(timer);
    return debounced;
  }

  /** Invoke at most once per `limit`ms. For scroll / resize handlers. */
  function throttle(fn, limit = 200) {
    let waiting = false;
    let lastArgs = null;
    return function throttled(...args) {
      if (waiting) { lastArgs = args; return; }
      fn.apply(this, args);
      waiting = true;
      setTimeout(() => {
        waiting = false;
        if (lastArgs) { fn.apply(this, lastArgs); lastArgs = null; }
      }, limit);
    };
  }

  /* ======================================================================
     8. FORMATTING / MISC
     ====================================================================== */

  /** Human-readable byte size: bytes(1536) -> "1.5 KB". */
  function bytes(n) {
    if (!Number.isFinite(n)) return '—';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    let val = n;
    while (val >= 1024 && i < units.length - 1) { val /= 1024; i++; }
    return (i === 0 ? val : val.toFixed(1)) + ' ' + units[i];
  }

  /** Escape a string for safe insertion into HTML. */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Slugify text to match the id scheme used in data/tools.json. */
  function slugify(str) {
    return String(str)
      .toLowerCase()
      .replace(/↔/g, 'to')
      .replace(/→/g, 'to')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /** Short, collision-resistant id (not cryptographic). */
  function uid(len = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    const rnd = window.crypto && window.crypto.getRandomValues
      ? window.crypto.getRandomValues(new Uint32Array(len))
      : null;
    for (let i = 0; i < len; i++) {
      const r = rnd ? rnd[i] : Math.floor(Math.random() * chars.length);
      out += chars[r % chars.length];
    }
    return out;
  }

  /* ======================================================================
     EXPORT
     ====================================================================== */
  Object.assign(Taste, {
    $, $$, el, on,
    store,
    toast,
    copy,
    download,
    dropzone,
    debounce, throttle,
    bytes, escapeHtml, slugify, uid,
    storageAvailable
  });

  window.Taste = Taste;
})(window, document);
