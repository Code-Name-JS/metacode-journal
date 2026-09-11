/* =====================================================
   main-v3.js  –  Login v3.0 Interactions
===================================================== */

(function () {
    var form = document.getElementById('loginForm');
    var email = document.getElementById('email');
    var password = document.getElementById('password');
    var emailField = document.getElementById('emailField');
    var passwordField = document.getElementById('passwordField');
    var emailError = document.getElementById('emailEorror');
    var passwordError = document.getElementById('passwordError');
    var togglePw = document.getElementById('togglePw');
    var toast = document.getElementById('toast');

    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    email.addEventListener('input', function(){
        if (emailField.classList.contains('invalid')) clearError(emailField, emailError); 
    });

    password.addEventListener('input', function(){
        if (passwordField.classList.contains('invalid')) clearError(passwordField, passwordError);
    });

    togglePw.addEventListener('click', function() {
        var isPw = password.type === 'password';
        password.type = isPw ? 'text' : 'password';
        togglePw.setAttribute('aria-pressed', String(!isPw));
        togglePw.textContent = isPw ? '🙈' : '👁️';
        password.focus();
    });

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(showToast._t);
        showToast._t = setTimeout(function () { toast.classList.remove('show');}, 2600);
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = true;

        if (!email.value.trim()) {
            showError(emailField, emailError, '이메일을 입력해 주세요.');
            ok = false;
        } else if (!emailRe.test(email.value.trim())) {
            showError(emailField, emailError, '올바른 이메일 형식이 아닙니다.');
            ok = false;
        } else {
            clearError(emailField, emailError);
        }

        if (!password.value) {
            showError(passwordField, passwordError, '비밀번호를 입력해 주세요.');
            ok = false;
        } else if (password.value.length < 8) {
            showError(passwordField, passwordError, '비밀번호는 8자 이상이어야 합니다.');
            ok = false;
        } else {
            clearError(passwordField, passwordError);
        }

        if (ok) {
            var remember = document.getElementById('remember').checked;
            showToast(remember ? '로그인 성공! (상태 유지됨)' : '로그인 성공!');
            form.reset();
        } else {
            var firstInvalid = form.querSelector('.field.invalid input');
            if (firstInvalid) firstInvalid.focus();
        }
    });

    document.getElementById('googleBtn').addEventListener('click', function() {
        showToast('Google 로그인(데모)');
    });

    document.getElementById('appleBtn').addEventListener('click', function() {
        showToast('Apple 로그인(데모)');
    });
})();