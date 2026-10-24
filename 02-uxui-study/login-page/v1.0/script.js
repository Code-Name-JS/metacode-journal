/* =====================================================
   script-v1.js  –  Login v1.0 Interactions
   ===================================================== */
'use strict';

(function() {



    const form = document.getElementById('loginForm');            // [연결①] index.html id="loginForm"
    const email = document.getElementById('email');               // [연결②] id="email"
    const password = document.getElementById('password');         // [연결③] id="password"
    const emailField = document.getElementById('emailField');     // [연결④] .field → CSS .field.invalid
    const passwordField = document.getElementById('passwordField');
    const emailError = document.getElementById('emailError');     // [연결⑤] .error-msg → CSS .error-msg.show
    const passwordError = document.getElementById('passwordError');
    const toast = document.getElementById('toast');               // [연결⑥] id="toast" → CSS .toast.show
    const signup = document.getElementById('signUpBtn');          // [연결⑦] id="signUpBtn"
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



    const bannerTimers = {};
    let toastTimer = null;



    /* -- 알림 배너 -- */
    function showBanner(id, type, message) {

        const banner = document.getElementById(id);               // [연결⑧] id="signUpBanner"

        if (!banner) return;

        clearTimeout(bannerTimers[id]);

        banner.textContent = message;
        banner.className = `alert-banner ${type} show`;           // [연결⑧] CSS .alert-banner / .info / .show

        bannerTimers[id] = setTimeout(() => {
            banner.classList.remove('show');                      // [연결⑧] .show 제거 → CSS가 접어서 숨김
        }, 3000);
    }



    /* -- 토스트 -- */
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');                              // [연결⑥] CSS .toast.show
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function() { toast.classList.remove('show'); }, 2600);
    }



    /* -- 회원가입 버튼 -- */
    if (signup) {
        signup.addEventListener('click', () => {                  // [연결⑦] 회원가입 버튼 클릭
            showBanner('signUpBanner', 'info', '회원가입은 준비 중입니다.');
        });
    }


    
    /*  ── 비밀번호 토글 ── */
    // index.html에 눈 아이콘 버튼(id="eye-btn", id="eye-ic")을 추가하면 동작함
    setupEyeToggle('password', 'eye-btn', 'eye-ic');

    function setupEyeToggle(inputId, btnId, iconId) {
        const input = document.getElementById(inputId);
        const btn   = document.getElementById(btnId);
        const icon  = document.getElementById(iconId);

        // 요소가 없으면 실행하지 않음
        if (!input || !btn || !icon) return;

        btn.addEventListener('click', () => {

            //현재 비밀번호 상태 확인
            const showPassword = input.type === 'password';

            // password ↔ text 변경
            input.type  = showPassword ? 'text' : 'password';

            // 눈 아이콘 변경
            icon.className = showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';

            // 접근성 문구 변경
            btn.setAttribute('aria-label', showPassword ? '비밀번호 숨기기' : '비밀번호 표시');
        });
    }



    /* -- 에러 문구 -- */
    function showError(field, errEl, msg) {
        field.classList.add('invalid');                           // [연결④] CSS .field.invalid input
        errEl.textContent = msg;
        errEl.classList.add('show');                              // [연결⑤] CSS .error-msg.show
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



    /* -- 로그인 제출 -- */
    form.addEventListener('submit', function(e) {                 // [연결①] 로그인 하기(type="submit") 클릭
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

        if (!ok) return;

        showToast('로그인 성공 (데모)');
    });


})();
