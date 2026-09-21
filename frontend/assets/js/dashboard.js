/* ═══════════════════════════════════════════════════════════
   LUMIO — DASHBOARD.JS
   Handles: Sidebar toggle, Time greeting, Live date,
            Stat counters, Mini calendar, Streak dots,
            Quick write char count, Writing prompts,
            Mood picker, Delete modal
═══════════════════════════════════════════════════════════ */

(function ($) {
  'use strict';


  /* ─────────────────────────────────────────────────────────
     1. SIDEBAR TOGGLE (Mobile)
  ───────────────────────────────────────────────────────── */
  function initSidebar() {
    const $sidebar  = $('#sidebar');
    const $overlay  = $('#sidebarOverlay');
    const $openBtn  = $('#dashHamburger');
    const $closeBtn = $('#sidebarClose');

    $openBtn.on('click', openSidebar);
    $closeBtn.on('click', closeSidebar);
    $overlay.on('click', closeSidebar);

    // Close on Escape key
    $(document).on('keydown.sidebar', function (e) {
      if (e.key === 'Escape') closeSidebar();
    });

    function openSidebar() {
      $sidebar.addClass('open');
      $overlay.addClass('open');
      $openBtn.attr('aria-expanded', 'true');
      $('body').css('overflow', 'hidden');
    }

    function closeSidebar() {
      $sidebar.removeClass('open');
      $overlay.removeClass('open');
      $openBtn.attr('aria-expanded', 'false');
      $('body').css('overflow', '');
    }
  }


  /* ─────────────────────────────────────────────────────────
     2. GREETING + LIVE DATE
     Changes greeting based on time of day.
  ───────────────────────────────────────────────────────── */
  function initGreeting() {
    const $greeting = $('#greetingText');
    const $date     = $('#greetingDate');
    const $moodDate = $('#moodCardDate');

    const now   = new Date();
    const hour  = now.getHours();
    const name  = 'KANNASURESH';

    let greet;
    if      (hour >= 5  && hour < 12) greet = 'Good morning';
    else if (hour >= 12 && hour < 17) greet = 'Good afternoon';
    else if (hour >= 17 && hour < 21) greet = 'Good evening';
    else                               greet = 'Good night';

    const emoji = hour >= 5 && hour < 12 ? '☀️'
                : hour >= 12 && hour < 17 ? '🌤️'
                : hour >= 17 && hour < 21 ? '🌆'
                : '🌙';

    $greeting.text(greet + ', ' + name + ' ' + emoji);

    // Full date string
    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];

    const dateStr =
      days[now.getDay()] + ', ' +
      months[now.getMonth()] + ' ' +
      now.getDate() + ', ' +
      now.getFullYear();

    $date.text(dateStr);
    $moodDate.text('Today — ' + months[now.getMonth()] + ' ' + now.getDate());
  }


  /* ─────────────────────────────────────────────────────────
     3. ANIMATED STAT COUNTERS
     Counts up from 0 to the target value on page load.
  ───────────────────────────────────────────────────────── */
  function initStatCounters() {
    $('.stat-value[data-count]').each(function () {
      const $el     = $(this);
      const target  = parseInt($el.data('count'), 10);
      const duration = 1400;
      const steps    = 50;
      const interval = duration / steps;
      let   current  = 0;

      const timer = setInterval(function () {
        current += target / steps;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        // Format with commas for large numbers
        $el.text(Math.floor(current).toLocaleString());
      }, interval);
    });
  }


  /* ─────────────────────────────────────────────────────────
     4. MINI CALENDAR
     Builds the current month calendar dynamically.
     Dots appear on days that have entries.
  ───────────────────────────────────────────────────────── */
  function initMiniCalendar() {
    const $cal = $('#miniCalendar');
    if (!$cal.length) return;

    // Simulate entry dates (backend will provide real ones)
    const entryDays = [1, 3, 5, 7, 9, 10, 12, 14, 15,
                       17, 18, 19, 20, 21];

    let currentDate = new Date();

    renderCalendar(currentDate);

    function renderCalendar(date) {
      const year  = date.getFullYear();
      const month = date.getMonth();

      const today       = new Date();
      const isThisMonth = (today.getFullYear() === year && today.getMonth() === month);

      const monthNames = [
        'January','February','March','April','May','June',
        'July','August','September','October','November','December'
      ];

      const firstDay    = new Date(year, month, 1).getDay();
      const totalDays   = new Date(year, month + 1, 0).getDate();
      const dayNames    = ['Su','Mo','Tu','We','Th','Fr','Sa'];

      let html = '';

      // Header
      html += '<div class="cal-header">';
      html += '  <button class="cal-nav-btn" id="calPrev"><i class="bi bi-chevron-left"></i></button>';
      html += '  <span class="cal-month-label">' + monthNames[month] + ' ' + year + '</span>';
      html += '  <button class="cal-nav-btn" id="calNext"><i class="bi bi-chevron-right"></i></button>';
      html += '</div>';

      // Grid
      html += '<div class="cal-grid">';

      // Day name headers
      dayNames.forEach(function (d) {
        html += '<div class="cal-day-name">' + d + '</div>';
      });

      // Empty cells before first day
      for (let i = 0; i < firstDay; i++) {
        html += '<div class="cal-day empty"></div>';
      }

      // Day cells
      for (let d = 1; d <= totalDays; d++) {
        let cls = 'cal-day';
        if (isThisMonth && d === today.getDate()) cls += ' today';
        if (entryDays.includes(d))               cls += ' has-entry';

        html += '<div class="' + cls + '">' + d + '</div>';
      }

      html += '</div>';

      $cal.html(html);

      // Prev / Next navigation
      $('#calPrev').on('click', function () {
        currentDate = new Date(year, month - 1, 1);
        renderCalendar(currentDate);
      });

      $('#calNext').on('click', function () {
        currentDate = new Date(year, month + 1, 1);
        renderCalendar(currentDate);
      });
    }
  }


  /* ─────────────────────────────────────────────────────────
     5. STREAK DOTS (Last 7 days visual)
  ───────────────────────────────────────────────────────── */
  function initStreakDots() {
    const $dots = $('#streakDots');
    if (!$dots.length) return;

    // Simulated: last 7 days all written (backend provides real data)
    const written = [true, true, true, true, true, true, false];
    let html = '';

    written.forEach(function (did) {
      html += '<div class="streak-dot' + (did ? ' active' : '') + '"></div>';
    });

    $dots.html(html);
  }


  /* ─────────────────────────────────────────────────────────
     6. QUICK WRITE — Char Counter + Writing Prompts
  ───────────────────────────────────────────────────────── */
  function initQuickWrite() {
    const $textarea  = $('#quickTextarea');
    const $counter   = $('#charCount');
    const $prompt    = $('#writingPrompt');
    const $saveBtn   = $('#quickSaveBtn');

    if (!$textarea.length) return;

    // Writing prompts — rotates daily
    const prompts = [
      'What made you smile today?',
      'Describe the last thing that surprised you.',
      'What is one thing you are grateful for right now?',
      'What was the best part of your week so far?',
      'What is something you want to remember about today?',
      'Who made a positive impact on your life recently?',
      'What is one goal you are working toward quietly?',
      'Describe your mood in three words.',
      'What is something you learned this week?',
      'If today were a colour, what would it be and why?'
    ];

    // Pick prompt based on day of year for consistency
    const dayOfYear = Math.floor(
      (new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
    );
    $prompt.text('✍️  ' + prompts[dayOfYear % prompts.length]);

    // Character counter
    $textarea.on('input', function () {
      const len = $(this).val().length;
      $counter.text(len);

      // Warn when near limit
      if (len >= 450) {
        $counter.css('color', 'var(--color-danger)');
      } else if (len >= 350) {
        $counter.css('color', 'var(--color-warning)');
      } else {
        $counter.css('color', 'var(--text-muted)');
      }
    });

    // Save button
    $saveBtn.on('click', function () {
      const text = $textarea.val().trim();

      if (!text) {
        $textarea.css('border-color', 'var(--color-danger)');
        $textarea.attr('placeholder', 'Write something first...');
        setTimeout(function () {
          $textarea.css('border-color', '');
          $textarea.attr('placeholder', 'Start writing whatever is on your mind...');
        }, 2000);
        return;
      }

      // Loading state
      const $btn = $(this);
      $btn.html('<i class="bi bi-arrow-repeat spin"></i> Saving...')
          .prop('disabled', true);

      // Simulate save (backend replaces this)
      setTimeout(function () {
        $btn.html('<i class="bi bi-check-circle-fill"></i> Saved!')
            .css('background', 'var(--color-success)');

        setTimeout(function () {
          $btn.html('<i class="bi bi-check-lg"></i> Save')
              .css('background', '')
              .prop('disabled', false);
          $textarea.val('');
          $counter.text('0');
        }, 2000);
      }, 1000);
    });
  }


  /* ─────────────────────────────────────────────────────────
     7. MOOD PICKER (Dashboard)
  ───────────────────────────────────────────────────────── */
  function initDashMood() {
    const $btns   = $('.mood-pick-btn');
    const $result = $('#moodResult');
    const $emoji  = $('#moodResultEmoji');
    const $label  = $('#moodResultLabel');

    // Check if today's mood already saved (localStorage simulation)
    const todayKey  = 'lumio-mood-' + new Date().toDateString();
    const savedMood = localStorage.getItem(todayKey);

    if (savedMood) {
      const saved = JSON.parse(savedMood);
      showMoodResult(saved.emoji, saved.label);
      $btns.filter('[data-mood="' + saved.mood + '"]').addClass('selected');
    }

    $btns.on('click', function () {
      const mood  = $(this).data('mood');
      const label = $(this).data('label');
      const emoji = $(this).text().trim();

      $btns.removeClass('selected');
      $(this).addClass('selected');

      showMoodResult(emoji, label);

      // Save to localStorage (replaced by API in backend phase)
      localStorage.setItem(todayKey, JSON.stringify({ mood, emoji, label }));

      // Update the "today" cell in weekly strip
      $('.wms-day.today .wms-emoji').text(emoji);
    });

    function showMoodResult(emoji, label) {
      $emoji.text(emoji);
      $label.text(label);
      $result.hide().slideDown(300);
    }
  }


  /* ─────────────────────────────────────────────────────────
     8. DELETE ENTRY MODAL
  ───────────────────────────────────────────────────────── */
  function initDeleteModal() {
    const $overlay  = $('#deleteModalOverlay');
    const $cancelBtn = $('#cancelDelete');
    const $confirmBtn = $('#confirmDelete');
    let   deleteTargetId = null;

    // Open modal on delete button click
    $(document).on('click', '.ec-delete', function () {
      deleteTargetId = $(this).data('id');
      $overlay.fadeIn(200);
    });

    // Cancel
    $cancelBtn.on('click', function () {
      $overlay.fadeOut(200);
      deleteTargetId = null;
    });

    // Close on overlay click
    $overlay.on('click', function (e) {
      if ($(e.target).is($overlay)) {
        $overlay.fadeOut(200);
        deleteTargetId = null;
      }
    });

    // Confirm delete
    $confirmBtn.on('click', function () {
      if (!deleteTargetId) return;

      // Find the entry card and remove it with animation
      const $card = $('.ec-delete[data-id="' + deleteTargetId + '"]')
        .closest('.entry-card');

      $card.animate({ opacity: 0, height: 0, marginBottom: 0 }, 350, function () {
        $(this).remove();
      });

      $overlay.fadeOut(200);
      deleteTargetId = null;
    });

    // Close on Escape
    $(document).on('keydown.modal', function (e) {
      if (e.key === 'Escape') {
        $overlay.fadeOut(200);
        deleteTargetId = null;
      }
    });
  }


  /* ─────────────────────────────────────────────────────────
     9. DASHBOARD SEARCH (filter entry cards)
  ───────────────────────────────────────────────────────── */
  function initDashSearch() {
    const $input = $('#dashSearch');
    if (!$input.length) return;

    $input.on('input', function () {
      const query = $(this).val().toLowerCase().trim();

      $('.entry-card').each(function () {
        const title   = $(this).find('.ec-title').text().toLowerCase();
        const preview = $(this).find('.ec-preview').text().toLowerCase();
        const match   = title.includes(query) || preview.includes(query);

        if (query === '' || match) {
          $(this).slideDown(200);
        } else {
          $(this).slideUp(200);
        }
      });
    });
  }


  /* ─────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────── */
  $(document).ready(function () {
    initSidebar();
    initGreeting();
    initStatCounters();
    initMiniCalendar();
    initStreakDots();
    initQuickWrite();
    initDashMood();
    initDeleteModal();
    initDashSearch();

    console.log('✦ Lumio dashboard.js loaded');
  });

}(jQuery));