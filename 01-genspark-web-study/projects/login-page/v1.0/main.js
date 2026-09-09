/* =====================================================
   main-v1.js  –  Login v1.0 Interactions
   ===================================================== */
console.log("main.js 연결 성공!");

'use strict';



//  ── 데모용 계정(실제 서비스에서는 서버 인증으로 대체) ──
const DEMO_ACCOUNTS = [
    {email:'demo@myapp.com', password:'demo1234'},
    {email:'test@example.com', password:'test5678'},
];



//  ── DOM 요소 ──
const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePwBtn = document.getElementById('toggle-pw');
const eyeIcon = document.getElementById('eye-icon');
const submitBtn = document.getElementById('btn-submit');
const rememberMe = document.getElementById('remember-me');
const toast = document.getElementById('toast');

const groupEmail = document.getElementById('group-email');
const groupPassword = document.getElementById('group-password');
const errorEmail = document.getElementById('error-email');
const errorPassword = document.getElementById('error-password');

const googleButton = document.getElementById('btn-google');
const githubButton = document.getElementById('btn-github');
const forgotLink = document.getElementById('link-forgot');
const signupLink = document.getElementById('link-signup');



//  ── 소셜 버튼 ──

// ── Google ──
if (googleButton) {
    googleButton.addEventListener('click', () => {
        showToast('info', '🔍 Google 로그인은 준비 중입니다.');
    });
}


// ── GitHub ──
if (githubButton) {
    githubButton.addEventListener('click', () => {
        showToast('info', '🐙 GitHub 로그인은 준비 중입니다.');
    });
}


// ── 비밀번호 찾기 ──
if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('info', '📧 비밀번호 재설정 메일을 보내드립니다.');
    });
}


// ── 회원가입 ──
if (signupLink) {
    signupLink.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('info', '✍️ 회원가입 페이지로 이동합니다.');
    });
}



// ── 저장된 이메일 복원 ──
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('remembered_email');
    if(saved){
        emailInput.value = saved;
        rememberMe.checked = true;
    }
    // 이메일 필드에 값이 있으면 패스워드로 포커스
    if(emailInput.value) passwordInput.focus();
    else emailInput.focus();
});



// ── 비밀번호 표시/숨기기 ──
togglePwBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    eyeIcon.className = isHidden ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
    togglePwBtn.setAttribute('aria-label', isHidden ? '비밀번호 숨기기' : '비밀번호 표시');
});



// ── 실시간 유효성 검사 ──
emailInput.addEventListener('input', () => {
    clearFieldState(groupEmail, errorEmail);
});
emailInput.addEventListener('blur', () => {
    validateEmail();
});
passwordInput.addEventListener('input', () => {
    clearFieldState(groupPassword, errorPassword);
});
passwordInput.addEventListener('blur', () => {
    validatePassword();
});



// ── 폼 제출 ──
form.addEventListener('submit', async(e) => {
    e.preventDefault();

    const emailOk = validateEmail();
    const passwordOk = validatePassword();
    if(!emailOk || !passwordOk) return;

    // 로딩 시작
    setLoading(true);

    try{
        // 서버 요청 시뮬레이션 (1.2s 딜레이)
        await delay(1200);

        const matched = DEMO_ACCOUNTS.find(
            a => a.email === emailInput.value.trim().toLowerCase()
            && a.password === passwordInput.value
        );

        if(matched){
            // 로그인 상태 유지 처리
            if(rememberMe.checked){
                localStorage.setItem('remembered_email', matched.email);
            } else{
                localStorage.removeItem('remembered_email');
            }

            setFieldSuccess(groupEmail);
            setFieldSuccess(groupPassword);
            showToast('success', '✅ 로그인 성공! 환영합니다.');

            // 버튼 완료 상태
            submitBtn.style.background = 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)';
            submitBtn.querySelector('.btn-text').style.display = 'flex';
            submitBtn.querySelector('.btn-text').textContent = '✓ 로그인 완료';
            submitBtn.querySelector('.btn-spinner').style.display = 'none';
        } else{
            // 로그인 실패
            setFieldError(groupEmail, errorEmail, '');
            setFieldError(groupPassword, errorPassword, '이메일 또는 비밀번호가 일치하지 않습니다.');
            showToast('error', '❌ 로그인에 실패했습니다. 다시 확인해주세요.');
            shakeCard();
        }
    } finally{
        if(!submitBtn.textContent.includes('완료')) setLoading(false);
    }
});



// ── 유효성 검사 함수들 ──
function validateEmail(){
    const val = emailInput.value.trim();
    if(!val) {
        setFieldError(groupEmail, errorEmail, '이메일을 입력해주세요.');
        return false;
    }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)){
        setFieldError(groupEmail, errorEmail, '올바른 이메일 형식이 아닙니다.');
        return false;
    }
    clearFieldState(groupEmail, errorEmail);
    return true;
}

function validatePassword(){
    const val = passwordInput.value;
    if(!val) {
        setFieldError(groupPassword, errorPassword, '비밀번호를 입력해주세요.');
        return false;
    }
    if(val.length < 6){
        setFieldError(groupPassword, errorPassword, '비밀번호는 6자 이상이어야 합니다.');
        return false;
    }
    clearFieldState(groupPassword, errorPassword);
    return true;
}



// ── 필드 상태 헬퍼 ──
function setFieldError(group, errorEl, message) {
    group.classList.remove('is-success');
    group.classList.add('is-error');
    errorEl.innerHTML = message ? `<i class="fa-solid fa-circle-exclamation"></i>${message}` : '';
}

function setFieldSuccess(group) {
    group.classList.remove('is-error');
    group.classList.add('is-success');
}

function clearFieldState(group, errorEl) {
    group.classList.remove('is-error', 'is-success');
    errorEl.textContent = '';
}



// ── 로딩 상태 ──
function setLoading(on) {
    submitBtn.disabled = on;
    if(on) {
        submitBtn.classList.add('loading');
    } else{
        submitBtn.classList.remove('loading');
    }
}



// ── 카드 흔들기 ──
function shakeCard() {
    const card = document.querySelector('.login-card');
    card.style.animation = 'none';
    card.offsetHeight; // reflow
    card.style.animation = 'shake .4s ease';
}



// ── 토스트 메시지 ──
let toastTimer = null;
function showToast(type, message) {
    clearTimeout(toastTimer);
    toast.className = `toast show ${type}`;
    toast.textContent = message;
    toastTimer = setTimeout(() => {
        toast.className = 'toast';
    }, 3500);
}



// ── 유틸 ──
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



// ── CSS:shake 애니메이션 동적 주입 ──
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes shake{
    0%, 100%{transform: translateX(0);}
    15%{transform: translateX(-8px);}
    30%{transform: translateX(7px);}
    45%{transform: translateX(-6px);}
    60%{transform: translateX(5px);}
    75%{transform: translateX(-4px);}
    90%{transform: translateX(3px);}
}
`;
document.head.appendChild(shakeStyle);