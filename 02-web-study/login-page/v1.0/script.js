/* =====================================================
   script-v1.js  –  Login v1.0 Interactions
   ===================================================== */
'use strict';

(function() {
    const form = document.getElementById('loginForm');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const emailField = document.getElementById('emailField');
    const passwordField = document.getElementById('passwordField');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');;
    const toast = document.getElementById('toast');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let toastTimer = null;

    function showError(field, errEl, msg) {
        field.classList.add('invalid');
        errEl.textContent = msg;
        errEl.classList.add('show');
        field.querySelector('input').setAttribute('aria-invalid', 'true');
    }

    function clearError(field, errEl) {
        field.classList.remove('invalid');
        errEl.textContent = '';
        errEl.classList.remove('show');
        field.querySelector('input').removeAttribute('aria-invalid');
    }



    email.addEventListener('input', function() {
        if (emailField.classList.contains('invalid')) clearError(emailField, emailError);
    });

    password.addEventListener('input', function() {
        if (passwordField.classList.contains('invalid')) clearError(passwordField, passwordError);
    });

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function() { toast.classList.remove('show'); }, 2600);
    }



    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let ok = true;

        const emailValue = email.value.trim();
        const passwordValue = password.value;

        if (!emailValue) {
            showError(emailField, emailError, '이메일을 입력해주세요.');
            ok = false;
        } else if (!emailRe.test(emailValue)) {
            showError(emailField, emailError, '올바른 이메일 형식이 아닙니다.');
            ok = false;
        } else {
            clearError(emailField, emailError);
        }

        if (!passwordValue) {
            showError(passwordField, passwordError, '비밀번호를 입력해 주세요.');
            ok = false;
        } else if (passwordValue.length < 8) {
            showError(passwordField, passwordError, '비밀번호는 8자 이상이어야 합니다.');
            ok = false;
        } else {
            clearError(passwordField, passwordError);
        }
    });

    document.getElementById('signUpBtn').addEventListener('click', function() {
        showToast('회원가입 선택 (데모)');
    });
})();