/* =========================================================================
   Project Taste — sidebar.js
   The navigation heart. Loads data/tools.json once and drives:

     1. Dynamic sidebar render   (categories → tools → badges)
     2. Favorites                (⭐ star toggle + pinned group)
     3. Recently used            (📌 auto-tracked group)
     4. Instant search / filter  (navbar search + sidebar filter, debounced)
     5. Dashboard tool grid       (featured / popular cards)
     6. Mobile drawer             (hamburger + backdrop open/close)
     7. Active-item highlighting  (reacts to hash changes)

   Exposes a small API + events so router.js can stay decoupled:
     - Taste.registry        → { meta, categories, tools, byId(id) }
     - Taste.sidebar.*       → open(), close(), pushRecent(id), setActive(id)
     - window 'taste:registryready'  fired once data is loaded

   Depends on: utils.js  (loaded before this file)
   ========================================================================= */
(function (window, document) {
  'use strict';

  const T = window.Taste;
  if (!T) { console.error('[sidebar] Taste utils not loaded'); return; }

  const { $, $$, el, on, store, debounce, toast } = T;

  /* ----------------------------------------------------------------------
     Config + state
     ---------------------------------------------------------------------- */
  const DATA_URL      = 'data/tools.json';
  const FAV_KEY       = 'favorites';   // array of tool ids
  const RECENT_KEY    = 'recents';     // array of tool ids (most-recent first)
  const RECENT_MAX    = 6;

  const BADGE_META = {
    popular: { cls: 'badge-hot',   icon: 'bi-fire',       label: 'Popular' },
    new:     { cls: 'badge-new',   icon: 'bi-stars',      label: 'New' },
    niche:   { cls: 'badge-niche', icon: 'bi-gem',        label: 'Niche' }
  };

  const state = {
    meta: null,
    categories: [],
    tools: [],
    index: {},          // id → tool
    byCategory: {}      // categoryId → [tools]
  };

  /* ----------------------------------------------------------------------
     Load registry
     ---------------------------------------------------------------------- */
  async function loadRegistry() {
    try {
      const res = await fetch(DATA_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      ingest(data);
    } catch (e) {
      console.error('[sidebar] failed to load registry:', e);
      showRegistryError();
    }
  }

  function ingest(data) {
    state.meta = data.meta || {};
    state.categories = (data.categories || []).slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    state.tools = data.tools || [];
    state.index = {};
    state.byCategory = {};
    state.tools.forEach((tool) => {
      state.index[tool.id] = tool;
      (state.byCategory[tool.category] =
        state.byCategory[tool.category] || []).push(tool);
    });

    // Expose registry for other scripts
    T.registry = {
      meta: state.meta,
      categories: state.categories,
      tools: state.tools,
      byId: (id) => state.index[id] || null,
      byCategory: (cat) => state.byCategory[cat] || []
    };

    renderSidebar();
    renderFavorites();
    renderRecents();
    renderDashboardGrid();
    syncActiveFromHash();

    window.dispatchEvent(new CustomEvent('taste:registryready', {
      detail: { count: state.tools.length }
    }));
  }

  /* ----------------------------------------------------------------------
     Render helpers
     ---------------------------------------------------------------------- */
  function badgeNodes(badges) {
    return (badges || [])
      .filter((b) => BADGE_META[b])
      .map((b) => {
        const m = BADGE_META[b];
        return el('span', { class: 'badge-taste ' + m.cls, title: m.label }, [
          el('i', { class: 'bi ' + m.icon })
        ]);
      });
  }

  /** Build a single <li> nav item for a tool. */
  function toolNavItem(tool) {
    const favs = store.get(FAV_KEY, []);
    const isFav = favs.indexOf(tool.id) !== -1;

    const link = el('a', {
      class: 'nav-item' + (tool.status === 'soon' ? ' is-soon-item' : ''),
      href: '#/' + tool.id,
      dataset: { toolId: tool.id, name: tool.name.toLowerCase(), category: tool.category }
    }, [
      el('i', { class: 'bi ' + (tool.icon || 'bi-tools') }),
      el('span', { class: 'nav-item-name', text: tool.name }),
      ...badgeNodes(tool.badges),
      el('button', {
        class: 'nav-item-fav' + (isFav ? ' is-fav' : ''),
        type: 'button',
        title: isFav ? 'Remove from favorites' : 'Add to favorites',
        'aria-label': 'Toggle favorite',
        dataset: { fav: tool.id }
      }, [ el('i', { class: 'bi ' + (isFav ? 'bi-star-fill' : 'bi-star') }) ])
    ]);

    return el('li', {}, [link]);
  }

  /** Render the full categorized tool list into #toolNav. */
  function renderSidebar() {
    const nav = $('#toolNav');
    if (!nav) return;
    nav.innerHTML = '';

    state.categories.forEach((cat) => {
      const tools = state.byCategory[cat.id] || [];
      if (!tools.length) return;

      const list = el('ul', { class: 'nav-list' },
        tools.map(toolNavItem));

      nav.appendChild(
        el('div', { class: 'nav-group', dataset: { group: cat.id } }, [
          el('p', { class: 'nav-group-title' }, [
            el('i', { class: 'bi ' + (cat.icon || 'bi-folder') }),
            document.createTextNode(' ' + cat.name)
          ]),
          list
        ])
      );
    });
  }

  /** Render the pinned Favorites group (hidden when empty). */
  function renderFavorites() {
    const group = $('#favoritesGroup');
    const list = $('#favoritesList');
    if (!group || !list) return;

    const favs = store.get(FAV_KEY, [])
      .map((id) => state.index[id])
      .filter(Boolean);

    list.innerHTML = '';
    if (!favs.length) { group.hidden = true; return; }
    group.hidden = false;
    favs.forEach((tool) => list.appendChild(toolNavItem(tool)));
  }

  /** Render (or create) the Recently-used group above the tool nav. */
  function renderRecents() {
    const recents = store.get(RECENT_KEY, [])
      .map((id) => state.index[id])
      .filter(Boolean);

    let group = $('#recentsGroup');
    if (!recents.length) { if (group) group.hidden = true; return; }

    if (!group) {
      group = el('div', { class: 'nav-group', id: 'recentsGroup' }, [
        el('p', { class: 'nav-group-title' }, [
          el('i', { class: 'bi bi-clock-history' }),
          document.createTextNode(' Recently Used')
        ]),
        el('ul', { class: 'nav-list', id: 'recentsList' })
      ]);
      // Insert right after the favorites group
      const favGroup = $('#favoritesGroup');
      favGroup.parentNode.insertBefore(group, favGroup.nextSibling);
    }
    group.hidden = false;
    const list = $('#recentsList', group);
    list.innerHTML = '';
    recents.forEach((tool) => list.appendChild(toolNavItem(tool)));
  }

  /** Render the dashboard featured grid (popular first, then fill). */
  function renderDashboardGrid() {
    const grid = $('#toolGrid');
    if (!grid) return;

    const popular = state.tools.filter((t) => (t.badges || []).includes('popular'));
    const rest = state.tools.filter((t) => !(t.badges || []).includes('popular'));
    const featured = popular.concat(rest).slice(0, 8);

    grid.innerHTML = '';
    featured.forEach((tool) => {
      const card = el('a', {
        class: 'tool-card' + (tool.status === 'soon' ? ' is-soon' : ''),
        href: '#/' + tool.id,
        dataset: { toolId: tool.id }
      }, [
        el('div', { class: 'tool-card-badges' }, badgeNodes(tool.badges)),
        el('span', { class: 'tool-card-icon' }, [
          el('i', { class: 'bi ' + (tool.icon || 'bi-tools') })
        ]),
        el('span', { class: 'tool-card-title', text: tool.name }),
        el('span', { class: 'tool-card-desc', text: tool.desc || '' }),
        tool.status === 'soon'
          ? el('span', { class: 'soon-tag', text: 'Coming soon' })
          : null
      ]);
      grid.appendChild(card);
    });
  }

  function showRegistryError() {
    const nav = $('#toolNav');
    if (nav) {
      nav.innerHTML = '';
      nav.appendChild(el('p', { class: 'no-results' },
        ['Couldn’t load the tool list. Try refreshing.']));
    }
  }

  /* ----------------------------------------------------------------------
     Favorites + recents mutation
     ---------------------------------------------------------------------- */
  function toggleFavorite(id) {
    const added = store.toggleInArray(FAV_KEY, id);
    renderFavorites();
    // Reflect star state on every instance of this tool in the DOM
    $$('.nav-item-fav[data-fav="' + cssEscape(id) + '"]').forEach((btn) => {
      btn.classList.toggle('is-fav', added);
      const icon = $('i', btn);
      if (icon) icon.className = 'bi ' + (added ? 'bi-star-fill' : 'bi-star');
      btn.title = added ? 'Remove from favorites' : 'Add to favorites';
    });
    const tool = state.index[id];
    toast(
      (added ? 'Added ' : 'Removed ') + (tool ? tool.name : 'tool') +
      (added ? ' to favorites' : ' from favorites'),
      added ? 'success' : 'info'
    );
  }

  function pushRecent(id) {
    if (!state.index[id]) return;
    let recents = store.get(RECENT_KEY, []).filter((r) => r !== id);
    recents.unshift(id);
    recents = recents.slice(0, RECENT_MAX);
    store.set(RECENT_KEY, recents);
    renderRecents();
  }

  /* ----------------------------------------------------------------------
     Search / filter
     ---------------------------------------------------------------------- */
  function applyFilter(query) {
    const q = (query || '').trim().toLowerCase();
    let visibleCount = 0;

    $$('#toolNav .nav-item').forEach((item) => {
      const li = item.parentElement;
      const name = item.dataset.name || '';
      const match = !q || name.indexOf(q) !== -1;
      li.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });

    // Hide category groups that have no visible items
    $$('#toolNav .nav-group').forEach((group) => {
      const anyVisible = $$('.nav-item', group)
        .some((i) => i.parentElement.style.display !== 'none');
      group.style.display = anyVisible ? '' : 'none';
    });

    // No-results message
    let msg = $('#noResults');
    if (!visibleCount) {
      if (!msg) {
        msg = el('p', { class: 'no-results', id: 'noResults' },
          ['No tools match “' + query + '”']);
        $('#toolNav').appendChild(msg);
      } else {
        msg.textContent = 'No tools match “' + query + '”';
        msg.style.display = '';
      }
    } else if (msg) {
      msg.style.display = 'none';
    }
  }

  /* ----------------------------------------------------------------------
     Active highlighting
     ---------------------------------------------------------------------- */
  function setActive(id) {
    $$('.nav-item').forEach((item) =>
      item.classList.toggle('active', item.dataset.toolId === id));
  }

  function syncActiveFromHash() {
    const id = (location.hash || '').replace(/^#\/?/, '');
    if (id) setActive(id);
  }

  /* ----------------------------------------------------------------------
     Mobile drawer
     ---------------------------------------------------------------------- */
  const drawer = {
    open() {
      $('#sidebar')?.classList.add('is-open');
      const bd = $('#sidebarBackdrop');
      if (bd) bd.hidden = false;
      document.body.style.overflow = 'hidden';
    },
    close() {
      $('#sidebar')?.classList.remove('is-open');
      const bd = $('#sidebarBackdrop');
      if (bd) bd.hidden = true;
      document.body.style.overflow = '';
    },
    toggle() {
      $('#sidebar')?.classList.contains('is-open') ? this.close() : this.open();
    }
  };

  /* ----------------------------------------------------------------------
     Small util: CSS.escape fallback for attribute selectors
     ---------------------------------------------------------------------- */
  function cssEscape(str) {
    return window.CSS && CSS.escape ? CSS.escape(str) : String(str).replace(/"/g, '\\"');
  }

  /* ----------------------------------------------------------------------
     Wiring
     ---------------------------------------------------------------------- */
  function init() {
    loadRegistry();

    // Favorite star clicks (delegated; works for dynamic items)
    on(document, 'click', '.nav-item-fav', function (e, node) {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(node.dataset.fav);
    });

    // Search + filter (both boxes drive the same filter, debounced)
    const runFilter = debounce((val) => applyFilter(val), 120);
    const globalSearch = $('#globalSearch');
    const sidebarFilter = $('#sidebarFilter');
    if (globalSearch) on(globalSearch, 'input', (e) => {
      runFilter(e.target.value);
      if (sidebarFilter) sidebarFilter.value = e.target.value;
    });
    if (sidebarFilter) on(sidebarFilter, 'input', (e) => {
      runFilter(e.target.value);
      if (globalSearch) globalSearch.value = e.target.value;
    });

    // "/" focuses global search (unless already typing)
    on(document, 'keydown', (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(
        (e.target && e.target.tagName) || '');
      if (e.key === '/' && !typing && globalSearch) {
        e.preventDefault();
        globalSearch.focus();
        globalSearch.select();
      }
    });

    // Mobile drawer controls
    const toggleBtn = $('#sidebarToggle');
    if (toggleBtn) on(toggleBtn, 'click', () => drawer.toggle());
    const backdrop = $('#sidebarBackdrop');
    if (backdrop) on(backdrop, 'click', () => drawer.close());

    // Close the drawer after picking a tool (mobile) + keep active in sync
    on(document, 'click', '.nav-item', function (e, node) {
      if (!$(e.target).closest?.('.nav-item-fav')) {
        if (window.matchMedia('(max-width: 768px)').matches) drawer.close();
      }
    });

    // Keep the active highlight in sync with navigation
    window.addEventListener('hashchange', syncActiveFromHash);

    // Escape closes the drawer
    on(document, 'keydown', (e) => { if (e.key === 'Escape') drawer.close(); });
  }

  /* ----------------------------------------------------------------------
     Public API
     ---------------------------------------------------------------------- */
  T.sidebar = {
    open: () => drawer.open(),
    close: () => drawer.close(),
    toggle: () => drawer.toggle(),
    pushRecent,
    setActive,
    toggleFavorite,
    refresh: () => { renderSidebar(); renderFavorites(); renderRecents(); syncActiveFromHash(); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
