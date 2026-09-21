/* ═══════════════════════════════════════════════════════════
   LUMIO — ENTRIES.JS
   Handles: Search filter, Mood filter, Tag filter, Sort,
            View toggle (grid/list), Clear filters,
            Active filter tags, Delete modal, Load more
═══════════════════════════════════════════════════════════ */

(function ($) {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     STATE — tracks current active filters
  ───────────────────────────────────────────────────────── */
  const filters = {
    search: '',
    mood:   'all',
    tag:    'all',
    sort:   'newest'
  };

  /* ─────────────────────────────────────────────────────────
     1. SEARCH FILTER
  ───────────────────────────────────────────────────────── */
  function initSearch() {
    $('#entriesSearch').on('input', function () {
      filters.search = $(this).val().toLowerCase().trim();
      applyFilters();
      updateActiveFilterTags();
    });
  }

  /* ─────────────────────────────────────────────────────────
     2. MOOD FILTER
  ───────────────────────────────────────────────────────── */
  function initMoodFilter() {
    $(document).on('click', '.filter-mood-btn', function () {
      $('.filter-mood-btn').removeClass('active');
      $(this).addClass('active');
      filters.mood = $(this).data('mood');
      applyFilters();
      updateActiveFilterTags();
    });
  }

  /* ─────────────────────────────────────────────────────────
     3. TAG FILTER
  ───────────────────────────────────────────────────────── */
  function initTagFilter() {
    $('#tagFilter').on('change', function () {
      filters.tag = $(this).val();
      applyFilters();
      updateActiveFilterTags();
    });
  }

  /* ─────────────────────────────────────────────────────────
     4. SORT
  ───────────────────────────────────────────────────────── */
  function initSort() {
    $('#entriesSort').on('change', function () {
      filters.sort = $(this).val();
      applySortOnly();
    });
  }

  /* ─────────────────────────────────────────────────────────
     5. APPLY ALL FILTERS
  ───────────────────────────────────────────────────────── */
  function applyFilters() {
    let visibleCount = 0;

    $('.entry-grid-card').each(function () {
      const $card    = $(this);
      const title    = $card.find('.egc-title').text().toLowerCase();
      const preview  = $card.find('.egc-preview').text().toLowerCase();
      const cardMood = $card.data('mood') || '';
      const cardTags = ($card.data('tag') || '').toLowerCase();

      const matchSearch = !filters.search ||
        title.includes(filters.search) ||
        preview.includes(filters.search);

      const matchMood = filters.mood === 'all' ||
        cardMood === filters.mood;

      const matchTag = filters.tag === 'all' ||
        cardTags.includes(filters.tag.toLowerCase());

      const visible = matchSearch && matchMood && matchTag;

      if (visible) {
        $card.show();
        visibleCount++;
      } else {
        $card.hide();
      }
    });

    // Update count label
    $('#resultsCount').text(
      'Showing ' + visibleCount + ' entr' + (visibleCount === 1 ? 'y' : 'ies')
    );

    // Show empty state if nothing visible
    if (visibleCount === 0) {
      $('#emptyState').slideDown(250);
      $('#loadMoreWrap').hide();
    } else {
      $('#emptyState').slideUp(200);
      $('#loadMoreWrap').show();
    }
  }

  /* ─────────────────────────────────────────────────────────
     6. SORT ONLY (reorder DOM cards)
  ───────────────────────────────────────────────────────── */
  function applySortOnly() {
    const $grid  = $('#entriesGrid');
    const $cards = $grid.find('.entry-grid-card').toArray();

    $cards.sort(function (a, b) {
      if (filters.sort === 'longest' || filters.sort === 'shortest') {
        const wA = parseInt($(a).data('words'), 10) || 0;
        const wB = parseInt($(b).data('words'), 10) || 0;
        return filters.sort === 'longest' ? wB - wA : wA - wB;
      }
      // newest / oldest — use DOM order as proxy (index)
      const idxA = $(a).index();
      const idxB = $(b).index();
      return filters.sort === 'oldest' ? idxA - idxB : idxB - idxA;
    });

    $cards.forEach(function (card) { $grid.append(card); });
  }

  /* ─────────────────────────────────────────────────────────
     7. ACTIVE FILTER TAGS (visual pills below filter bar)
  ───────────────────────────────────────────────────────── */
  function updateActiveFilterTags() {
    const $wrap = $('#activeFilters');
    $wrap.empty();

    const active = [];

    if (filters.search) {
      active.push({ label: 'Search: "' + filters.search + '"', key: 'search' });
    }
    if (filters.mood !== 'all') {
      active.push({ label: 'Mood: ' + filters.mood, key: 'mood' });
    }
    if (filters.tag !== 'all') {
      active.push({ label: 'Tag: #' + filters.tag, key: 'tag' });
    }

    if (!active.length) {
      $wrap.hide();
      return;
    }

    $wrap.show();
    active.forEach(function (f) {
      const $pill = $(
        '<span class="active-filter-tag">' +
        f.label +
        '<button aria-label="Remove filter">✕</button>' +
        '</span>'
      );
      $pill.find('button').on('click', function () {
        clearSingleFilter(f.key);
      });
      $wrap.append($pill);
    });
  }

  function clearSingleFilter(key) {
    if (key === 'search') {
      filters.search = '';
      $('#entriesSearch').val('');
    } else if (key === 'mood') {
      filters.mood = 'all';
      $('.filter-mood-btn').removeClass('active');
      $('.filter-mood-btn[data-mood="all"]').addClass('active');
    } else if (key === 'tag') {
      filters.tag = 'all';
      $('#tagFilter').val('all');
    }
    applyFilters();
    updateActiveFilterTags();
  }

  /* ─────────────────────────────────────────────────────────
     8. CLEAR ALL FILTERS
  ───────────────────────────────────────────────────────── */
  function initClearFilters() {
    function clearAll() {
      filters.search = '';
      filters.mood   = 'all';
      filters.tag    = 'all';

      $('#entriesSearch').val('');
      $('.filter-mood-btn').removeClass('active');
      $('.filter-mood-btn[data-mood="all"]').addClass('active');
      $('#tagFilter').val('all');

      applyFilters();
      updateActiveFilterTags();
    }

    $('#clearFilters').on('click', clearAll);
    $('#emptyStateClear').on('click', clearAll);
  }

  /* ─────────────────────────────────────────────────────────
     9. VIEW TOGGLE (Grid ↔ List)
  ───────────────────────────────────────────────────────── */
  function initViewToggle() {
    $('#viewGrid').on('click', function () {
      $('#entriesGrid').removeClass('list-view');
      $('#viewGrid').addClass('active');
      $('#viewList').removeClass('active');
    });

    $('#viewList').on('click', function () {
      $('#entriesGrid').addClass('list-view');
      $('#viewList').addClass('active');
      $('#viewGrid').removeClass('active');
    });
  }

  /* ─────────────────────────────────────────────────────────
     10. DELETE MODAL
  ───────────────────────────────────────────────────────── */
  function initDeleteModal() {
    const $overlay   = $('#deleteModalOverlay');
    const $cancelBtn = $('#cancelDelete');
    const $confirmBtn = $('#confirmDelete');
    let   targetId   = null;

    $(document).on('click', '.ec-delete', function () {
      targetId = $(this).data('id');
      $overlay.fadeIn(200);
    });

    $cancelBtn.on('click', function () {
      $overlay.fadeOut(200);
      targetId = null;
    });

    $overlay.on('click', function (e) {
      if ($(e.target).is($overlay)) {
        $overlay.fadeOut(200);
        targetId = null;
      }
    });

    $confirmBtn.on('click', function () {
      if (!targetId) return;
      const $card = $('.ec-delete[data-id="' + targetId + '"]')
        .closest('.entry-grid-card');

      $card.animate({ opacity: 0, height: 0, marginBottom: 0 }, 350,
        function () { $(this).remove(); applyFilters(); }
      );
      $overlay.fadeOut(200);
      targetId = null;
    });

    $(document).on('keydown.delmodal', function (e) {
      if (e.key === 'Escape') { $overlay.fadeOut(200); targetId = null; }
    });
  }

  /* ─────────────────────────────────────────────────────────
     11. LOAD MORE (simulated)
  ───────────────────────────────────────────────────────── */
  function initLoadMore() {
    $('#loadMoreBtn').on('click', function () {
      const $btn = $(this);
      $btn.html('<i class="bi bi-arrow-repeat spin"></i> Loading...')
          .prop('disabled', true);

      setTimeout(function () {
        $btn.html('<i class="bi bi-check-circle"></i> All entries loaded')
            .prop('disabled', true)
            .css('opacity', 0.5);
      }, 1200);
    });
  }

  /* ─────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────── */
  $(document).ready(function () {
    initSearch();
    initMoodFilter();
    initTagFilter();
    initSort();
    initClearFilters();
    initViewToggle();
    initDeleteModal();
    initLoadMore();

    // Set initial result count
    const total = $('.entry-grid-card').length;
    $('#resultsCount').text('Showing ' + total + ' entries');

    console.log('✦ Lumio entries.js loaded');
  });

}(jQuery));