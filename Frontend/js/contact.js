(function () {
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function setAlert(el, type, message) {
    if (!el) return;
    el.textContent = message;
    el.classList.remove('hidden', 'alert-success', 'alert-error');
    el.classList.add(type === 'success' ? 'alert-success' : 'alert-error');
  }

  function clearAlert(el) {
    if (!el) return;
    el.classList.add('hidden');
    el.textContent = '';
    el.classList.remove('alert-success', 'alert-error');
  }

  onReady(() => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');
    const formAlert = document.getElementById('formAlert');

    const errorName = document.querySelector('[data-error="name"]');
    const errorEmail = document.querySelector('[data-error="email"]');
    const errorSubject = document.querySelector('[data-error="subject"]');
    const errorMessage = document.querySelector('[data-error="message"]');

    function showFieldError(el, errorEl, condition) {
      if (!errorEl) return false;
      if (condition) {
        errorEl.classList.remove('hidden');
        el?.classList.add('ring-2', 'ring-red-500', 'border-red-500');
        return true;
      } else {
        errorEl.classList.add('hidden');
        el?.classList.remove('ring-2', 'ring-red-500', 'border-red-500');
        return false;
      }
    }

    function validate() {
      const nameEmpty = !nameInput.value.trim();
      const emailVal = emailInput.value.trim();
      const emailInvalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
      const subjectEmpty = !subjectInput.value.trim();
      const messageEmpty = !messageInput.value.trim();

      const a = showFieldError(nameInput, errorName, nameEmpty);
      const b = showFieldError(emailInput, errorEmail, !emailVal || emailInvalid);
      const c = showFieldError(subjectInput, errorSubject, subjectEmpty);
      const d = showFieldError(messageInput, errorMessage, messageEmpty);

      return !(a || b || c || d);
    }

    [nameInput, emailInput, subjectInput, messageInput].forEach((el) => {
      el?.addEventListener('input', () => {
        validate();
        clearAlert(formAlert);
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert(formAlert);
      if (!validate()) return;

      const sendingLabel = submitBtn.querySelector('[data-label="sending"]');
      const defaultLabel = submitBtn.querySelector('[data-label="default"]');
      submitBtn.disabled = true;
      if (sendingLabel && defaultLabel) {
        sendingLabel.classList.remove('hidden');
        defaultLabel.classList.add('hidden');
      }

      try {
        // Placeholder: simulate send. Replace with real endpoint later.
        await new Promise((r) => setTimeout(r, 900));
        form.reset();
        setAlert(formAlert, 'success', 'Thank you! Your message has been sent successfully.');
      } catch (err) {
        setAlert(formAlert, 'error', 'Sorry, something went wrong. Please try again later.');
      } finally {
        submitBtn.disabled = false;
        if (sendingLabel && defaultLabel) {
          sendingLabel.classList.add('hidden');
          defaultLabel.classList.remove('hidden');
        }
      }
    });
  });
})();


