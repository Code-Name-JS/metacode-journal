/* =====================================================
   signup-main-v2.js  –  Login v2.0 Interactions
===================================================== */
'use strict';



/* -- DOM -- */



/* -- 탭 -- */
const loginTab = document.getElementById('tab-login');
const signupTab = document.getElementById('tab-signup');

/* -- 회원가입 폼 -- */
const signupForm = document.getElementById('form-signup');

/* -- 회원가입 입력 -- */
const nameInput = document.getElementById('username');
const signupEmailInput = document.getElementById('su-email');
const signupPasswordInput = document.getElementById('su-pass');
const agreeInput = document.getElementById('agree');

/* -- 회원가입 버튼 -- */
const signupButton = document.getElementById('btn-signup');



/* -- 로그인 / 회원가입 페이지 이동 -- */
if (loginTab) {
    loginTab.addEventListener('click', () => {
        window.location.href = './index.html';
    });
}

if (signupTab) {
    signupTab.addEventListener('click', () => {
        window.location.href = './signup.html';
    });
}



/* -- 알림 타이머 -- */
const alerTimers = {};



/* -- 알림 배너 -- */
function showHlert (id, type, message) {
    const alert = document.getElementById(id);

    // 요소가 없으면 종료
    if (!alert) return;

    // 기존 타이머 제거
    clearTimeout(alertTimers[id]);

    // 메시지 출력
    alert.textContent = message;

    // 클래스 적용
    alert.className = `alert-banner ${type} show`;

    // 표시
    alert.style.display = 'block';

    // 4초 후 숨김
    alertTimers[id] = setTimeout(() => {
        alert.className = 'alert-banner';
        alert.style.display = 'none';
    }, 4000);
}



/* -- 비밀번호 표시 / 숨기기 -- */
function setupEyeToggle(inputId, buttonId, iconId) {
    
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    const icon = document.getElementById(iconId);

    // 요소가 없으면 실행하지 않음
    if (!input || !button || !icon) return;

    button.addEventListener('click', () => {

        // 현재 상태 확인
        const showPassword = input.type === 'password';

        // password ↔ text
        input.type = showPassword ? 'text' : 'password';

        // 아이콘 변경
        icon.className = showPassword
            ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';

        // 접근성 문구 변경
        button.setAttribute('aria-label', showPassword ? '비밀번호 숨기기' : '비밀번호 표시');
    });
}


