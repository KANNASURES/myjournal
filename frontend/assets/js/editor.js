/* ═══════════════════════════════════════════════════════════
   LUMIO — EDITOR.JS
   Handles: Quill init, Word counter, Auto-save draft,
            Tags input, Photo attach/preview,
            Focus mode, Save/Discard flow, Toast
═══════════════════════════════════════════════════════════ */

(function ($) {
  'use strict';

  let quill        = null;
  let autoSaveTimer = null;
  let isDirty      = false;

  /* ─────────────────────────────────────────────────────────
     1. QUILL EDITOR INIT
  ───────────────────────────────────────────────────────── */
  function initQuill() {
    if (!document.getElementById('quillEditor')) return;

    quill = new Quill('#quillEditor', {
      modules: { toolbar: '#quillToolbar' },
      theme: 'snow',
      placeholder: 'What is on your mind today? Write freely...'
    });

    // Word count + autosave on every keystroke
    quill.on('text-change', function () {
      updateWordCount();
      markDirty();
      scheduleAutoSave();
    });

    // Load draft from localStorage if exists
    loadDraft();
  }

  /* ─────────────────────────────────────────────────────────
     2. WORD COUNT
  ───────────────────────────────────────────────────────── */
  function updateWordCount() {
    if (!quill) return;
    const text  = quill.getText().trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    $('#wordCount').text(words.toLocaleString());
  }

  /* ─────────────────────────────────────────────────────────
     3. AUTO-SAVE DRAFT (localStorage — replaced by API later)
  ───────────────────────────────────────────────────────── */
  function scheduleAutoSave() {
    clearTimeout(autoSaveTimer);
    setAutoSaveState('saving');

    autoSaveTimer = setTimeout(function () {
      saveDraft();
      setAutoSaveState('saved');
      setTimeout(function () {
        setAutoSaveState('idle');
      }, 3000);
    }, 1500);
  }

  function saveDraft() {
    if (!quill) return;
    const draft = {
      title:   $('#entryTitle').val(),
      date:    $('#entryDate').val(),
      mood:    $('#entryMood').val(),
      content: quill.getContents(),
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('lumio-draft', JSON.stringify(draft));
  }

  function loadDraft() {
    const raw = localStorage.getItem('lumio-draft');
    if (!raw) return;
    try {
      const draft = JSON.parse(raw);
      if (draft.title)   $('#entryTitle').val(draft.title);
      if (draft.date)    $('#entryDate').val(draft.date);
      if (draft.mood)    $('#entryMood').val(draft.mood);
      if (draft.content) quill.setContents(draft.content);
      updateWordCount();
    } catch (e) {
      console.warn('Could not load draft:', e);
    }
  }

  function clearDraft() {
    localStorage.removeItem('lumio-draft');
  }

  function setAutoSaveState(state) {
    const $indicator = $('#autosaveIndicator');
    const $icon      = $('#autosaveIcon');
    const $text      = $('#autosaveText');

    $indicator.removeClass('saving saved');

    if (state === 'saving') {
      $indicator.addClass('saving');
      $icon.attr('class', 'bi bi-arrow-repeat spin');
      $text.text('Saving...');
    } else if (state === 'saved') {
      $indicator.addClass('saved');
      $icon.attr('class', 'bi bi-cloud-check-fill');
      $text.text('Draft saved');
    } else {
      $icon.attr('class', 'bi bi-cloud');
      $text.text('Draft');
    }
  }

  function markDirty() { isDirty = true; }

  /* ─────────────────────────────────────────────────────────
     4. DATE SETUP
  ───────────────────────────────────────────────────────── */
  function initDateField() {
    const $date   = $('#entryDate');
    const $label  = $('#editorDateLabel');
    if (!$date.length) return;

    const today   = new Date();
    const yyyy    = today.getFullYear();
    const mm      = String(today.getMonth() + 1).padStart(2, '0');
    const dd      = String(today.getDate()).padStart(2, '0');
    $date.val(yyyy + '-' + mm + '-' + dd);

    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    $label.text(
      days[today.getDay()] + ', ' +
      months[today.getMonth()] + ' ' + today.getDate() + ', ' + yyyy
    );
  }

  /* ─────────────────────────────────────────────────────────
     5. TAGS INPUT
     Press Enter or comma to add a tag. Click × to remove.
  ───────────────────────────────────────────────────────── */
  function initTagsInput() {
    const $input = $('#tagInput');
    const $list  = $('#tagsList');
    if (!$input.length) return;

    const tags = [];

    $input.on('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addTag($(this).val().trim().replace(/,/g, ''));
        $(this).val('');
      }
      if (e.key === 'Backspace' && !$(this).val() && tags.length) {
        removeTag(tags[tags.length - 1]);
      }
    });

    function addTag(text) {
      if (!text || tags.includes(text) || tags.length >= 5) return;
      tags.push(text);
      renderTags();
      markDirty();
    }

    function removeTag(text) {
      const idx = tags.indexOf(text);
      if (idx > -1) tags.splice(idx, 1);
      renderTags();
    }

    function renderTags() {
      $list.empty();
      tags.forEach(function (tag) {
        const $chip = $(
          '<span class="tag-chip">' +
          '#' + tag +
          '<button class="tag-chip-remove" aria-label="Remove tag">' +
          '<i class="bi bi-x"></i>' +
          '</button></span>'
        );
        $chip.find('.tag-chip-remove').on('click', function () {
          removeTag(tag);
        });
        $list.append($chip);
      });
    }
  }

  /* ─────────────────────────────────────────────────────────
     6. PHOTO ATTACH + PREVIEW
  ───────────────────────────────────────────────────────── */
  function initPhotoAttach() {
    const $btn     = $('#attachPhotoBtn');
    const $input   = $('#photoInput');
    const $preview = $('#photoPreviewBar');
    const $img     = $('#photoPreviewImg');
    const $remove  = $('#removePhotoBtn');

    if (!$btn.length) return;

    $btn.on('click', function () { $input.trigger('click'); });

    $input.on('change', function () {
      const file = this.files[0];
      if (!file) return;

      // Validate: image only, max 5MB
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be under 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        $img.attr('src', e.target.result);
        $preview.slideDown(300);
        $btn.html('<i class="bi bi-image-fill"></i> <span>Photo added</span>');
        $btn.css('color', 'var(--color-success)');
        markDirty();
      };
      reader.readAsDataURL(file);
    });

    $remove.on('click', function () {
      $img.attr('src', '');
      $input.val('');
      $preview.slideUp(300);
      $btn.html('<i class="bi bi-image"></i> <span>Photo</span>');
      $btn.css('color', '');
    });
  }

  /* ─────────────────────────────────────────────────────────
     7. FOCUS MODE
  ───────────────────────────────────────────────────────── */
  function initFocusMode() {
    const $btn = $('#focusModeBtn');
    if (!$btn.length) return;

    $btn.on('click', function () {
      $('body').toggleClass('focus-mode');
      const isFocus = $('body').hasClass('focus-mode');
      $btn.find('i')
        .toggleClass('bi-arrows-fullscreen', !isFocus)
        .toggleClass('bi-fullscreen-exit',   isFocus);
      $btn.attr('title', isFocus ? 'Exit focus mode' : 'Focus mode');
    });

    // Exit focus mode on Escape
    $(document).on('keydown.focusmode', function (e) {
      if (e.key === 'Escape' && $('body').hasClass('focus-mode')) {
        $('body').removeClass('focus-mode');
        $btn.find('i')
          .removeClass('bi-fullscreen-exit')
          .addClass('bi-arrows-fullscreen');
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     8. WRITING PROMPTS
  ───────────────────────────────────────────────────────── */
  function initWritingPrompts() {
    const $text    = $('#promptText');
    const $refresh = $('#refreshPrompt');
    if (!$refresh.length) return;

    const prompts = [
      'What made today different from yesterday?',
      'Describe a moment that surprised you recently.',
      'What is one thing you want to remember about this week?',
      'Write about something you are proud of today.',
      'What emotion have you been carrying lately?',
      'Describe your ideal version of tomorrow.',
      'What would your future self thank you for doing today?',
      'What is weighing on your mind right now?',
      'Write about a small thing that brought you peace today.',
      'Who has inspired you recently and why?'
    ];

    let currentIdx = Math.floor(Math.random() * prompts.length);
    $text.text('✍️  ' + prompts[currentIdx]);

    $refresh.on('click', function () {
      currentIdx = (currentIdx + 1) % prompts.length;
      $text.fadeOut(150, function () {
        $(this).text('✍️  ' + prompts[currentIdx]).fadeIn(150);
      });
    });
  }

  /* ─────────────────────────────────────────────────────────
     9. SAVE ENTRY
  ───────────────────────────────────────────────────────── */
  function initSaveEntry() {
    const $btn = $('#publishBtn');
    if (!$btn.length) return;

    $btn.on('click', function () {
      const title   = $('#entryTitle').val().trim();
      const content = quill ? quill.getText().trim() : '';

      if (!title) {
        $('#entryTitle').focus();
        $('#entryTitle').css('border-bottom', '2px solid var(--color-danger)');
        setTimeout(function () {
          $('#entryTitle').css('border-bottom', '');
        }, 2000);
        return;
      }

      if (!content || content.length < 5) {
        quill.focus();
        return;
      }

      // Loading state
      $btn.html('<i class="bi bi-arrow-repeat spin"></i> Saving...')
          .prop('disabled', true);

      // Simulate API save (backend replaces this)
      setTimeout(function () {
        clearDraft();
        isDirty = false;
        showToast();
        $btn.html('<i class="bi bi-check-lg"></i> Save Entry')
            .prop('disabled', false);

        // Redirect to entries after 1.5s
        setTimeout(function () {
          window.location.href = 'entries.html';
        }, 1500);
      }, 1200);
    });
  }

  /* ─────────────────────────────────────────────────────────
     10. DISCARD MODAL
  ───────────────────────────────────────────────────────── */
  function initDiscardModal() {
    const $overlay  = $('#discardModalOverlay');
    const $discard  = $('#discardBtn');
    const $cancel   = $('#cancelDiscard');
    const $confirm  = $('#confirmDiscard');

    if (!$discard.length) return;

    $discard.on('click', function () {
      if (isDirty) {
        $overlay.fadeIn(200);
      } else {
        window.location.href = 'entries.html';
      }
    });

    $cancel.on('click', function () { $overlay.fadeOut(200); });

    $confirm.on('click', function () {
      clearDraft();
      window.location.href = 'entries.html';
    });

    $overlay.on('click', function (e) {
      if ($(e.target).is($overlay)) $overlay.fadeOut(200);
    });
  }

  /* ─────────────────────────────────────────────────────────
     11. SUCCESS TOAST
  ───────────────────────────────────────────────────────── */
  function showToast() {
    const $toast = $('#successToast');
    $toast.show().addClass('show');
    setTimeout(function () {
      $toast.removeClass('show');
      setTimeout(function () { $toast.hide(); }, 400);
    }, 2500);
  }

  /* ─────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────── */
  $(document).ready(function () {
    initQuill();
    initDateField();
    initTagsInput();
    initPhotoAttach();
    initFocusMode();
    initWritingPrompts();
    initSaveEntry();
    initDiscardModal();

    // Warn before leaving with unsaved changes
    $(window).on('beforeunload', function () {
      if (isDirty) return 'You have unsaved changes.';
    });

    console.log('✦ Lumio editor.js loaded');
  });

}(jQuery));