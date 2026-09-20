/* ═══════════════════════════════════════════════════════════
   LUMIO — AUTH.JS
   Handles: Login validation, Register validation,
            Password strength meter, Show/hide password,
            Form submission with loading state
   
   MAANG practice: validate on the client first,
   then send to server. Never trust only one side.
═══════════════════════════════════════════════════════════ */

(function ($) {
  'use strict';


  /* ─────────────────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────────────────── */

  // Show a field error message and mark input as error
  function showFieldError($input, $errorEl, message) {
    $input.addClass('is-error').removeClass('is-valid');
    $errorEl.text(message);
  }

  // Clear a field error
  function clearFieldError($input, $errorEl) {
    $input.removeClass('is-error');
    $errorEl.text('');
  }

  // Mark input as valid
  function markValid($input, $errorEl) {
    $input.addClass('is-valid').removeClass('is-error');
    $errorEl.text('');
  }

  // Show the alert box at top of form
  function showAlert($alert, $msg, message) {
    $msg.text(message);
    $alert.slideDown(250);
  }

  // Hide the alert box
  function hideAlert($alert) {
    $alert.slideUp(200);
  }

  // Simple email format check
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  // Set button loading state
  function setButtonLoading($btn, isLoading) {
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
     1. SHOW / HIDE PASSWORD TOGGLE
        Works for any input that has a matching
        .toggle-password button with data-target attribute.
  ───────────────────────────────────────────────────────── */
  function initPasswordToggle() {
    $(document).on('click', '.toggle-password', function () {
      const targetId = $(this).data('target');
      const $input   = $('#' + targetId);
      const $icon    = $(this).find('i');

      if ($input.attr('type') === 'password') {
        $input.attr('type', 'text');
        $icon.removeClass('bi-eye').addClass('bi-eye-slash');
        $(this).attr('aria-label', 'Hide password');
      } else {
        $input.attr('type', 'password');
        $icon.removeClass('bi-eye-slash').addClass('bi-eye');
        $(this).attr('aria-label', 'Show password');
      }
    });
  }


  /* ─────────────────────────────────────────────────────────
     2. PASSWORD STRENGTH METER
        Checks 4 rules and scores 0–4.
  ───────────────────────────────────────────────────────── */
  function initPasswordStrength() {
    const $input        = $('#regPassword');
    if (!$input.length) return;

    const $wrap         = $('#strengthWrap');
    const $fill         = $('#strengthFill');
    const $label        = $('#strengthLabel');

    const $reqLength    = $('#req-length');
    const $reqUpper     = $('#req-upper');
    const $reqNumber    = $('#req-number');
    const $reqSpecial   = $('#req-special');

    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

    $input.on('input', function () {
      const val = $(this).val();

      if (val.length === 0) {
        $wrap.hide();
        resetReqs();
        return;
      }

      $wrap.show();

      // Check each rule
      const hasLength  = val.length >= 8;
      const hasUpper   = /[A-Z]/.test(val);
      const hasNumber  = /[0-9]/.test(val);
      const hasSpecial = /[^A-Za-z0-9]/.test(val);

      // Update requirement indicators
      updateReq($reqLength,  hasLength);
      updateReq($reqUpper,   hasUpper);
      updateReq($reqNumber,  hasNumber);
      updateReq($reqSpecial, hasSpecial);

      // Calculate score
      const score = [hasLength, hasUpper, hasNumber, hasSpecial]
        .filter(Boolean).length;

      // Update strength bar
      $fill
        .attr('class', 'strength-fill strength-' + score)
        .css('width', (score * 25) + '%');

      $label.text(strengthLabels[score] || '');
    });

    function updateReq($el, passed) {
      if (passed) {
        $el.addClass('passed');
        $el.find('i')
          .removeClass('bi-circle')
          .addClass('bi-check-circle-fill');
      } else {
        $el.removeClass('passed');
        $el.find('i')
          .removeClass('bi-check-circle-fill')
          .addClass('bi-circle');
      }
    }

    function resetReqs() {
      [$reqLength, $reqUpper, $reqNumber, $reqSpecial].forEach(function ($r) {
        $r.removeClass('passed');
        $r.find('i')
          .removeClass('bi-check-circle-fill')
          .addClass('bi-circle');
      });
    }
  }


  /* ─────────────────────────────────────────────────────────
     3. LOGIN FORM VALIDATION + SUBMIT
  ───────────────────────────────────────────────────────── */
  function initLoginForm() {
    const $form    = $('#loginForm');
    if (!$form.length) return;

    const $email      = $('#loginEmail');
    const $password   = $('#loginPassword');
    const $emailErr   = $('#emailError');
    const $passErr    = $('#passwordError');
    const $alert      = $('#loginAlert');
    const $alertMsg   = $('#loginAlertMsg');
    const $btn        = $('#loginBtn');

    // Clear errors on input
    $email.on('input', function () {
      clearFieldError($email, $emailErr);
      hideAlert($alert);
    });

    $password.on('input', function () {
      clearFieldError($password, $passErr);
      hideAlert($alert);
    });

    // Validate email on blur
    $email.on('blur', function () {
      const val = $email.val().trim();
      if (!val) {
        showFieldError($email, $emailErr, 'Email is required.');
      } else if (!isValidEmail(val)) {
        showFieldError($email, $emailErr, 'Enter a valid email address.');
      } else {
        markValid($email, $emailErr);
      }
    });

    // Form submit
    $form.on('submit', function (e) {
      e.preventDefault();
      let valid = true;

      const emailVal    = $email.val().trim();
      const passwordVal = $password.val();

      // Validate email
      if (!emailVal) {
        showFieldError($email, $emailErr, 'Email is required.');
        valid = false;
      } else if (!isValidEmail(emailVal)) {
        showFieldError($email, $emailErr, 'Enter a valid email address.');
        valid = false;
      } else {
        markValid($email, $emailErr);
      }

      // Validate password
      if (!passwordVal) {
        showFieldError($password, $passErr, 'Password is required.');
        valid = false;
      } else if (passwordVal.length < 6) {
        showFieldError($password, $passErr, 'Password must be at least 6 characters.');
        valid = false;
      } else {
        markValid($password, $passErr);
      }

      if (!valid) return;

      // ── Show loading state ──
      setButtonLoading($btn, true);
      hideAlert($alert);

      // ── Simulate API call (we will replace this with real fetch in backend phase) ──
      setTimeout(function () {
        setButtonLoading($btn, false);

        // For now: redirect to dashboard as a UI demo
        // In backend phase, this becomes a real API call
        // and we check credentials against the database.
        window.location.href = 'dashboard.html';

      }, 1500);
    });
  }


  /* ─────────────────────────────────────────────────────────
     4. REGISTER FORM VALIDATION + SUBMIT
  ───────────────────────────────────────────────────────── */
  function initRegisterForm() {
    const $form = $('#registerForm');
    if (!$form.length) return;

    const $name        = $('#regName');
    const $email       = $('#regEmail');
    const $password    = $('#regPassword');
    const $confirm     = $('#regConfirm');
    const $terms       = $('#agreeTerms');

    const $nameErr     = $('#nameError');
    const $emailErr    = $('#regEmailError');
    const $passErr     = $('#regPasswordError');
    const $confirmErr  = $('#confirmError');
    const $termsErr    = $('#termsError');

    const $alert       = $('#registerAlert');
    const $alertMsg    = $('#registerAlertMsg');
    const $btn         = $('#registerBtn');

    // Clear errors on input
    $name.on('input',     function () { clearFieldError($name, $nameErr); });
    $email.on('input',    function () { clearFieldError($email, $emailErr); });
    $password.on('input', function () { clearFieldError($password, $passErr); });
    $confirm.on('input',  function () {
      clearFieldError($confirm, $confirmErr);
      // Live match check
      if ($confirm.val() && $password.val() !== $confirm.val()) {
        showFieldError($confirm, $confirmErr, 'Passwords do not match.');
      } else if ($confirm.val() && $password.val() === $confirm.val()) {
        markValid($confirm, $confirmErr);
      }
    });

    // Form submit
    $form.on('submit', function (e) {
      e.preventDefault();
      let valid = true;

      const nameVal     = $name.val().trim();
      const emailVal    = $email.val().trim();
      const passVal     = $password.val();
      const confirmVal  = $confirm.val();
      const termsVal    = $terms.is(':checked');

      // ── Validate name ──
      if (!nameVal) {
        showFieldError($name, $nameErr, 'Full name is required.');
        valid = false;
      } else if (nameVal.length < 2) {
        showFieldError($name, $nameErr, 'Name must be at least 2 characters.');
        valid = false;
      } else {
        markValid($name, $nameErr);
      }

      // ── Validate email ──
      if (!emailVal) {
        showFieldError($email, $emailErr, 'Email is required.');
        valid = false;
      } else if (!isValidEmail(emailVal)) {
        showFieldError($email, $emailErr, 'Enter a valid email address.');
        valid = false;
      } else {
        markValid($email, $emailErr);
      }

      // ── Validate password ──
      if (!passVal) {
        showFieldError($password, $passErr, 'Password is required.');
        valid = false;
      } else if (passVal.length < 8) {
        showFieldError($password, $passErr, 'Password must be at least 8 characters.');
        valid = false;
      } else {
        markValid($password, $passErr);
      }

      // ── Validate confirm password ──
      if (!confirmVal) {
        showFieldError($confirm, $confirmErr, 'Please confirm your password.');
        valid = false;
      } else if (passVal !== confirmVal) {
        showFieldError($confirm, $confirmErr, 'Passwords do not match.');
        valid = false;
      } else {
        markValid($confirm, $confirmErr);
      }

      // ── Validate terms ──
      if (!termsVal) {
        $termsErr.text('You must agree to the terms to continue.');
        valid = false;
      } else {
        $termsErr.text('');
      }

      if (!valid) return;

      // ── Show loading ──
      setButtonLoading($btn, true);
      hideAlert($alert);

      // ── Simulate API call (replaced with real fetch in backend phase) ──
      setTimeout(function () {
        setButtonLoading($btn, false);

        // Redirect to dashboard after successful register (UI demo)
        window.location.href = 'dashboard.html';

      }, 1800);
    });
  }


  /* ─────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────── */
  $(document).ready(function () {
    initPasswordToggle();
    initPasswordStrength();
    initLoginForm();
    initRegisterForm();

    console.log('✦ Lumio auth.js loaded');
  });

}(jQuery));