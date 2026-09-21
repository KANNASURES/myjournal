/* ═══════════════════════════════════════════════════════════
   LUMIO — SETTINGS.JS
   Handles: Profile save, Password update, Avatar upload,
            Theme radio sync, Font size control,
            Toggle switches, Data export, Danger zone,
            Settings nav active link, Toast notifications
═══════════════════════════════════════════════════════════ */

(function ($) {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     TOAST HELPER
  ───────────────────────────────────────────────────────── */
  function showToast(message, isError) {
    const $toast = $('#settingsToast');
    const $msg   = $('#toastMessage');

    $msg.text(message || 'Saved!');

    $toast
      .css('border-color', isError
        ? 'var(--color-danger)'
        : 'var(--color-success)')
      .css('color', isError
        ? 'var(--color-danger)'
        : 'var(--color-success)');

    $toast.find('i')
      .attr('class', isError
        ? 'bi bi-x-circle-fill'
        : 'bi bi-check-circle-fill');

    $toast.show().addClass('show');

    setTimeout(function () {
      $toast.removeClass('show');
      setTimeout(function () { $toast.hide(); }, 400);
    }, 2800);
  }

  /* ─────────────────────────────────────────────────────────
     BUTTON LOADING STATE
  ───────────────────────────────────────────────────────── */
  function setLoading($btn, isLoading) {
    if (isLoading) {
      $btn.find('.btn-text').hide();
      $btn.find('.btn-spinner').show();
      $btn.prop('disabled', true);
    } else {
      $btn.find('.btn-text').show();
      $btn.find('.btn-spinner').hide();
      $btn.prop('disabled', false);
    }
  }

  /* ─────────────────────────────────────────────────────────
     1. SETTINGS NAV — Active link on scroll
  ───────────────────────────────────────────────────────── */
  function initSettingsNav() {
    const $links    = $('.settings-nav-link');
    const sections  = $('.settings-section');

    $links.on('click', function (e) {
      e.preventDefault();
      const target = $(this).attr('href');
      const $target = $(target);
      if (!$target.length) return;

      const offset = $target.offset().top - 72 - 24;
      $('html, body').animate({ scrollTop: offset }, 500, 'swing');

      $links.removeClass('active');
      $(this).addClass('active');
    });

    // Highlight nav on scroll
    $(window).on('scroll.settingsnav', function () {
      const scrollY = $(this).scrollTop() + 72 + 60;

      sections.each(function () {
        const top = $(this).offset().top;
        const id  = $(this).attr('id');
        if (scrollY >= top) {
          $links.removeClass('active');
          $links.filter('[href="#' + id + '"]').addClass('active');
        }
      });
    });
  }

  /* ─────────────────────────────────────────────────────────
     2. AVATAR UPLOAD PREVIEW
  ───────────────────────────────────────────────────────── */
  function initAvatarUpload() {
    const $btn     = $('#avatarUploadBtn');
    const $input   = $('#avatarInput');
    const $preview = $('#avatarPreview');

    if (!$btn.length) return;

    $btn.on('click', function () { $input.trigger('click'); });

    $input.on('change', function () {
      const file = this.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file.', true);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image must be under 2MB.', true);
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        // Replace letter with actual image
        $preview.html('<img src="' + e.target.result + '" alt="Avatar" />');
        // Also update sidebar avatar
        $('#sidebarAvatar').html('<img src="' + e.target.result +
          '" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />');
        showToast('Profile photo updated!');
      };
      reader.readAsDataURL(file);
    });
  }

  /* ─────────────────────────────────────────────────────────
     3. PROFILE FORM SAVE
  ───────────────────────────────────────────────────────── */
  function initProfileForm() {
    const $form = $('#profileForm');
    if (!$form.length) return;

    $form.on('submit', function (e) {
      e.preventDefault();
      const $btn  = $('#saveProfileBtn');
      const name  = $('#settingsName').val().trim();
      const email = $('#settingsEmail').val().trim();

      if (!name || !email) {
        showToast('Name and email are required.', true);
        return;
      }

      setLoading($btn, true);

      // Simulate API call
      setTimeout(function () {
        setLoading($btn, false);

        // Update sidebar name
        $('#sidebarName').text(name);

        // Save to localStorage (backend replaces this)
        localStorage.setItem('lumio-user-name', name);
        localStorage.setItem('lumio-user-email', email);

        showToast('Profile saved successfully!');
      }, 1200);
    });
  }

  /* ─────────────────────────────────────────────────────────
     4. PASSWORD FORM
  ───────────────────────────────────────────────────────── */
  function initPasswordForm() {
    const $form = $('#passwordForm');
    if (!$form.length) return;

    // Show/hide password toggle (reuse from auth.js pattern)
    $(document).on('click', '.toggle-password', function () {
      const targetId = $(this).data('target');
      const $input   = $('#' + targetId);
      const $icon    = $(this).find('i');

      if ($input.attr('type') === 'password') {
        $input.attr('type', 'text');
        $icon.removeClass('bi-eye').addClass('bi-eye-slash');
      } else {
        $input.attr('type', 'password');
        $icon.removeClass('bi-eye-slash').addClass('bi-eye');
      }
    });

    $form.on('submit', function (e) {
      e.preventDefault();
      let valid = true;

      const current = $('#currentPassword').val();
      const newPass = $('#newPassword').val();
      const confirm = $('#confirmNewPassword').val();

      // Clear previous errors
      $('#currentPassError, #newPassError, #confirmNewPassError').text('');
      $('#currentPassword, #newPassword, #confirmNewPassword')
        .removeClass('is-error is-valid');

      if (!current) {
        $('#currentPassError').text('Current password is required.');
        $('#currentPassword').addClass('is-error');
        valid = false;
      }

      if (!newPass || newPass.length < 8) {
        $('#newPassError').text('New password must be at least 8 characters.');
        $('#newPassword').addClass('is-error');
        valid = false;
      }

      if (newPass !== confirm) {
        $('#confirmNewPassError').text('Passwords do not match.');
        $('#confirmNewPassword').addClass('is-error');
        valid = false;
      }

      if (!valid) return;

      const $btn = $('#savePasswordBtn');
      setLoading($btn, true);

      // Simulate API call
      setTimeout(function () {
        setLoading($btn, false);
        $form[0].reset();
        showToast('Password updated successfully!');
      }, 1400);
    });
  }

  /* ─────────────────────────────────────────────────────────
     5. THEME RADIO SYNC with main theme toggle
  ───────────────────────────────────────────────────────── */
  function initThemeRadio() {
    const $radios = $('input[name="theme"]');

    // Sync on load
    const saved = localStorage.getItem('lumio-theme') || 'dark';
    $radios.filter('[value="' + saved + '"]').prop('checked', true);

    // On change
    $radios.on('change', function () {
      const theme = $(this).val();
      $('html').attr('data-theme', theme);
      localStorage.setItem('lumio-theme', theme);

      // Sync main theme toggle icon
      const $icon = $('#themeIcon');
      if (theme === 'dark') {
        $icon.removeClass('bi-sun-fill').addClass('bi-moon-stars-fill');
        $('#themeLabel').text('Dark mode');
      } else {
        $icon.removeClass('bi-moon-stars-fill').addClass('bi-sun-fill');
        $('#themeLabel').text('Light mode');
      }

      showToast('Theme updated to ' + theme + ' mode!');
    });
  }

  /* ─────────────────────────────────────────────────────────
     6. FONT SIZE CONTROL
  ───────────────────────────────────────────────────────── */
  function initFontSizeControl() {
    const $display  = $('#fontSizeDisplay');
    const $increase = $('#fontIncrease');
    const $decrease = $('#fontDecrease');

    if (!$display.length) return;

    let fontSize = parseInt(
      localStorage.getItem('lumio-font-size') || '18', 10
    );

    const MIN = 14;
    const MAX = 24;

    updateDisplay();

    $increase.on('click', function () {
      if (fontSize < MAX) {
        fontSize += 2;
        updateDisplay();
        saveFont();
      }
    });

    $decrease.on('click', function () {
      if (fontSize > MIN) {
        fontSize -= 2;
        updateDisplay();
        saveFont();
      }
    });

    function updateDisplay() {
      $display.text(fontSize + 'px');
      $decrease.prop('disabled', fontSize <= MIN);
      $increase.prop('disabled', fontSize >= MAX);
    }

    function saveFont() {
      localStorage.setItem('lumio-font-size', fontSize);
      showToast('Font size set to ' + fontSize + 'px');
    }
  }

  /* ─────────────────────────────────────────────────────────
     7. TOGGLE SWITCHES — save to localStorage
  ───────────────────────────────────────────────────────── */
  function initToggles() {
    const toggleMap = {
      reminderToggle: 'lumio-reminder',
      autosaveToggle: 'lumio-autosave',
      wordcountToggle: 'lumio-wordcount',
      weeklySummary: 'lumio-weekly-summary',
      streakAlerts: 'lumio-streak-alerts',
      productUpdates: 'lumio-product-updates'
    };

    // Load saved states
    Object.entries(toggleMap).forEach(function ([id, key]) {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        $('#' + id).prop('checked', saved === 'true');
      }
    });

    // Save on change
    Object.entries(toggleMap).forEach(function ([id, key]) {
      $('#' + id).on('change', function () {
        const val = $(this).is(':checked');
        localStorage.setItem(key, val);
        showToast('Preference saved!');
      });
    });
  }

  /* ─────────────────────────────────────────────────────────
     8. DATA EXPORT BUTTONS
  ───────────────────────────────────────────────────────── */
  function initDataExport() {

    // Export JSON — creates a downloadable JSON file
    $('#exportJsonBtn').on('click', function () {
      const $btn = $(this);
      $btn.text('Preparing...');

      setTimeout(function () {
        // Placeholder data (backend provides real data)
        const data = {
          exported_at: new Date().toISOString(),
          user: 'KANNASURESH',
          entries: [
            {
              id: 1,
              title: 'Today was quiet and golden',
              mood: 'okay',
              date: '2026-09-20',
              content: 'Woke up to soft rain...',
              tags: ['peaceful', 'morning']
            }
          ]
        };

        const blob = new Blob(
          [JSON.stringify(data, null, 2)],
          { type: 'application/json' }
        );
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href     = url;
        link.download = 'lumio-journal-export.json';
        link.click();
        URL.revokeObjectURL(url);

        $btn.text('Export JSON');
        showToast('Journal exported as JSON!');
      }, 800);
    });

    // Export PDF — placeholder (real PDF in backend phase)
    $('#exportPdfBtn').on('click', function () {
      const $btn = $(this);
      $btn.text('Preparing...');
      setTimeout(function () {
        $btn.text('Export PDF');
        showToast('PDF export coming in the full version!');
      }, 1000);
    });
  }

  /* ─────────────────────────────────────────────────────────
     9. DANGER ZONE — Confirm Modal
  ───────────────────────────────────────────────────────── */
  function initDangerZone() {
    const $overlay   = $('#dangerModalOverlay');
    const $title     = $('#dangerModalTitle');
    const $desc      = $('#dangerModalDesc');
    const $cancelBtn = $('#cancelDanger');
    const $confirmBtn = $('#confirmDanger');

    let pendingAction = null;

    // Clear drafts
    $('#clearDraftsBtn').on('click', function () {
      pendingAction = 'clear-drafts';
      $title.text('Clear all drafts?');
      $desc.text('All locally saved drafts on this device will be removed.');
      $overlay.fadeIn(200);
    });

    // Delete all entries
    $('#deleteAllEntriesBtn').on('click', function () {
      pendingAction = 'delete-entries';
      $title.text('Delete all entries?');
      $desc.text('Every journal entry will be permanently deleted. This cannot be undone.');
      $overlay.fadeIn(200);
    });

    // Delete account
    $('#deleteAccountBtn').on('click', function () {
      pendingAction = 'delete-account';
      $title.text('Delete your account?');
      $desc.text('Your account and all data will be permanently removed. There is no recovery.');
      $overlay.fadeIn(200);
    });

    // Cancel
    $cancelBtn.on('click', function () {
      $overlay.fadeOut(200);
      pendingAction = null;
    });

    // Close on overlay click
    $overlay.on('click', function (e) {
      if ($(e.target).is($overlay)) {
        $overlay.fadeOut(200);
        pendingAction = null;
      }
    });

    // Confirm
    $confirmBtn.on('click', function () {
      if (!pendingAction) return;

      if (pendingAction === 'clear-drafts') {
        localStorage.removeItem('lumio-draft');
        showToast('All drafts cleared.');
      } else if (pendingAction === 'delete-entries') {
        // Backend will handle real deletion
        showToast('All entries deleted. (Demo mode)');
      } else if (pendingAction === 'delete-account') {
        // Backend will handle real account deletion
        setTimeout(function () {
          window.location.href = 'index.html';
        }, 1500);
        showToast('Account deleted. Redirecting...');
      }

      $overlay.fadeOut(200);
      pendingAction = null;
    });

    // Escape key
    $(document).on('keydown.danger', function (e) {
      if (e.key === 'Escape') {
        $overlay.fadeOut(200);
        pendingAction = null;
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────── */
  $(document).ready(function () {
    initSettingsNav();
    initAvatarUpload();
    initProfileForm();
    initPasswordForm();
    initThemeRadio();
    initFontSizeControl();
    initToggles();
    initDataExport();
    initDangerZone();

    console.log('✦ Lumio settings.js loaded');
  });

}(jQuery));