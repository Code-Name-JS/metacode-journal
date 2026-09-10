/* =====================================================
   main-v2.js  –  Login v2 Interactions
   ===================================================== */
'use strict';



/* -- 데모 계정 -- */
const ACCOUNTS = [
  { email: 'demo@myapp.com',    password: 'demo1234' },
  { email: 'test@example.com',  password: 'test5678' },
];



/* -- DOM (로그인 화면에 실제 존재하는 요소만 선택) -- */
const formLogin = document.getElementById('form-login');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const googleBtn = document.getElementById('s-google');
const kakaoBtn = document.getElementById('s-kakao');
const naverBtn = document.getElementById('s-naver');
const forgotBtn = document.getElementById('link-forgot');



/*
  [제거됨]
  - tabLogin, tabSignup, formSignup 관련 변수 및 switchTab() 함수
  - window.location.href 로 수동 이동시키던 클릭 이벤트
  -> HTML의 <a href="..."> 태그가 자동으로 페이지 이동을 처리하므로 JS가 필요 없음!
*/



tabLogin.addEventListener('click', () => switchTab('login'));



/* -- 로그인 / 회원가입 페이지 이동 -- */
if(loginTab){
  loginTab.addEventListener('click', () => {
    window.location.href = './index.html';
  });
}

if(signupTab){
  signupTab.addEventListener('click', () => {
    window.location.href = './signup.html';
  });
}


function switchTab(which) {
  const toLogin = which === 'login';

  tabLogin.classList.toggle('active',  toLogin);
  tabSignup.classList.toggle('active', !toLogin);

  tabLogin.setAttribute('aria-selected',  toLogin);
  tabSignup.setAttribute('aria-selected', !toLogin);

  tabGroup.classList.toggle('on-signup', !toLogin);

  formLogin.classList.toggle('hidden',  !toLogin);
  // formSignup이 null이므로 여기서 "Cannot read properties of null (reading 'classList')" 에러 발생
  formSignup.classList.toggle('hidden',  toLogin);
}


/* -- 알림 배너 타이머 보관함 -- */
const alertTimers = {};

/* -- 알림 배너 표시 함수 -- */
function showAlert(id, type, message) {
  const alert = document.getElementById(id); // 여기서 매번 id를 전달받아 직접 요소를 찾고 있습니다.
  if (!alert) return;

  // 이전에 돌고 있던 타이머가 있다면 즉시 취소!(중복 방지)
  clearTimeout(alertTimers[id]);
  
  // 문구 및 스타일 클래스 부여 (.show가 붙으면서 부드럽게 펼쳐짐)
  alert.textContent = message;
  alert.className = `alert-banner ${type} show`;

  // 새로운 3.5초 타이머를 등록하고 .show 클래스 제거하여 부드럽게 닫힘
  alertTimers[id] = setTimeout(() => {
    alert.className = 'alert-banner';
  }, 3500);
}

/* -- 소셜 버튼 -- */
if(googleBtn){
  googleBtn.addEventListener('click', () => {
    showAlert('alert-login', 'info', '🔍 Google 로그인은 준비 중입니다.');
  });
}

if(kakaoBtn){
  kakaoBtn.addEventListener('click', () => {
    showAlert('alert-login', 'info', '💛 카카오 로그인은 준비 중입니다.');
  });
}

if(naverBtn){
  naverBtn.addEventListener('click', () => {
    showAlert('alert-login', 'info', '🟢 네이버 로그인은 준비 중입니다.');
  });
}

if(forgotBtn){
  forgotBtn.addEventListener('click', (e) => {
    e.preventDefault();

    showAlert('alert-login', 'info', '📧 비밀번호 재설정 이메일을 발송합니다.');
  });
}



/*  ── 비밀번호 토글 ── */
setupEyeToggle('password', 'eye-btn', 'eye-ic');
setupEyeToggle('f-su-pass', 'eye-btn2', 'eye-ic2');

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



/* -- 초기 실행 (자동완성 복원 및 스탯 애니메이션) -- */
window.addEventListener('DOMContentLoaded', () => {

  // [주의] 저장할 때 'v2_remembered'로 저장하므로 키 이름을 일치시켜줍니다.
  const saved = localStorage.getItem('v2_remembered');
  if (saved) {
    const emailInput = document.getElementById('email');
    const rememberCheck = document.getElementById('remember');
    if (emailInput) emailInput.value = saved;
    if (rememberCheck) rememberCheck.checked = true; 
  }

  // 여기서 딱 1번만 스탯 애니메이션 실행!
  animateStats();
});



/* -- 비밀번호 강도 -- */
const suPassInput = document.getElementById('f-su-pass');

if(suPassInput){ 
  suPassInput.addEventListener('input', () => {
    checkStrength(suPassInput.value);
  });
}

function checkStrength(val) {
  const bars  = [document.getElementById('sb1'), document.getElementById('sb2'),
                 document.getElementById('sb3'), document.getElementById('sb4')];
  const label = document.getElementById('strength-label');
  bars.forEach(b => b.className = 'sb');

  let score = 0;
  if (val.length >= 8)           score++;
  if (/[A-Z]/.test(val))         score++;
  if (/[0-9]/.test(val))         score++;
  if (/[^A-Za-z0-9]/.test(val))  score++;

  const levels = ['', '약함', '보통', '강함', '매우 강함'];
  const cls    = ['', 's1', 's2', 's3', 's4'];
  for (let i = 0; i < score; i++) bars[i].classList.add(cls[score]);
  label.textContent = val.length ? levels[score] || '강도 없음' : '강도 없음';
}

const loginForm = document.getElementById('form-login');

if(loginForm){

  /* -- 로그인 폼 제출 -- */
  loginForm.addEventListener('submit', async e => {
  e.preventDefault();

  const emailVal = document.getElementById('email').value.trim();
  const passVal  = document.getElementById('password').value;

  let ok = true;

  if (!validateEmail(emailVal, 'f-email', 'err-email')){
    ok = false;
  } 
  if (!validateRequired(passVal, 'f-pass', 'err-pass', '비밀번호를 입력해주세요.')){
    ok = false;
  }

  if (!ok) return;

  /* 로그인 버튼 로딩 시작 */
  setLoading('btn-login', true);

  /* 1.3초 동안 로딩 */
  await delay(1300);

  /* 계정 확인 */
  const matched = ACCOUNTS.find(a => a.email === emailVal.toLowerCase() && a.password === passVal);
  


  /* 로그인 성공 */
  if(matched){

    console.log('로그인 성공:', matched);

    /* 로그인 상태 저장 */
    const remember = document.getElementById('remember');

    if(remember && remember.checked){
      localStorage.setItem('v2-remembered', matched.email);
    } else{
      localStorage.removeItem('v2-remembered');
    }

    /* 입력창 성공 상태 */
    setFieldOk('f-email');
    setFieldOk('f-pass');

    /* 성공 알림 */
    showAlert('alert-login', 'success', '✅ 로그인 성공! 대시보드로 이동합니다.');

    /* 로그인 버튼 */
    const btn = document.getElementById('btn-login');

    if(!btn){
      console.error('btn-login을 찾을 수 없습니다.');
      return;
    }

    /* 버튼 문구 변경 */
    const label = btn.querySelector('.btn-label');

    if(label){
      label.textContent = '✓ 완료';
      label.style.display = 'flex';
    }

    /* 로그인 화살표 숨기기 */
    const arrow = btn.querySelector('.btn-arrow');

    if(arrow){
      arrow.style.display = 'none';
    }

    /* 로딩 아이콘 숨기기 */
    const loader = btn.querySelector('.btn-loader');

    if(loader){
      loader.style.display = 'none';
    }

    /* 버튼 색상 변경 */
    btn.style.background = '#22c55e';

    /* 버튼 중복 클릭 방지 */
    btn.disabled = true;

    console.log('로그인 성공 처리 완료');

    /* 필요하다면 잠시 후 대시보드로 이동 */
    // window.Location.href = 'dashboard.html'
}

  /* -- 로그인 실패 -- */
  else{
    setFieldErr('f-email', 'err-email', '');
    setFieldErr('f-pass', 'err-pass', '이메일 또는 비밀번호가 일치하지 않습니다.');
    showAlert('alert-login', 'error', '❌ 로그인 정보를 다시 확인해주세요.');
    shakeForm('form-login');

    /* 로딩 종료 */
    setLoading('btn-login', false);
  }

});





/* ── 실시간 검증 (blur) ── */
document.getElementById('email').addEventListener('blur', () => {
  validateEmail(document.getElementById('email').value.trim(), 'f-email', 'err-email');
});
document.getElementById('password').addEventListener('input', () =>
  clearField('f-pass', 'err-pass'));
document.getElementById('su-email') && document.getElementById('su-email').addEventListener('blur', () =>
  validateEmail(document.getElementById('su-email').value.trim(), 'f-su-email', 'err-su-email'));



/* ── 유효성 함수들 ── */
function validateEmail(val, groupId, errId) {
  if (!val) {
    setFieldErr(groupId, errId, '이메일을 입력해주세요.');
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    setFieldErr(groupId, errId, '올바른 이메일 형식이 아닙니다.');
    return false;
  }
  clearField(groupId, errId);
  return true;
}

function validateRequired(val, groupId, errId, msg) {
  if (!val) { setFieldErr(groupId, errId, msg); return false; }
  clearField(groupId, errId);
  return true;
}

function validatePassStrength(val, groupId, errId) {
  if (!val) { setFieldErr(groupId, errId, '비밀번호를 입력해주세요.'); return false; }
  if (val.length < 8) { setFieldErr(groupId, errId, '비밀번호는 8자 이상이어야 합니다.'); return false; }
  clearField(groupId, errId);
  return true;
}

function setFieldErr(groupId, errId, msg) {
  const g = document.getElementById(groupId);
  const e = document.getElementById(errId);
  g.classList.remove('is-ok'); g.classList.add('is-err');
  e.innerHTML = msg ? `<i class="fa-solid fa-circle-exclamation"></i> ${msg}` : '';
}
function setFieldOk(groupId) {
  const g = document.getElementById(groupId);
  g.classList.remove('is-err'); g.classList.add('is-ok');
}
function clearField(groupId, errId) {
  document.getElementById(groupId).classList.remove('is-err', 'is-ok');
  document.getElementById(errId).textContent = '';
}



/* ── 버튼 로딩 ── */
function setLoading(btnId, on) {
  const btn = document.getElementById(btnId);

  if(!btn){
    console.err(`${btnId} 버튼을 찾을 수 없습니다.`);
    return;
  }

  btn.disabled = on;
  btn.classList.toggle('loading', on);
}



/* ── 알림 배너 ── */
function showAlert(elId, type, msg) {
  const el = document.getElementById(elId);
  clearTimeout(alertTimers[elId]);
  el.className = `alert-banner ${type} show`;
  el.textContent = msg;
  alertTimers[elId] = setTimeout(() => { el.className = 'alert-banner'; }, 4000);
}



/* -- 폼 흔들기 -- */
function shakeForm(formId){
  const form = document.getElementById(formId);
  form.style.animation = 'none';
  form.offsetHeight;
  form.style.animation = 'shake-v2 .4s ease';
}



/* -- 카운터 애니메이션 -- */
function animateStats() {
  const statElements = document.querySelectorAll('.stat-num');

  statElements.forEach(el => {
    const target = Number(el.dataset.target);
    if (!target) return;

    let current = 0;
    const step = Math.ceil(target / 40); // 약 40단계에 걸쳐 부드럽게 증가

    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;

      // 목표 숫자에 도달하면 타이머 종료
      if (current >= target) {
        clearInterval(timer);
      }
    }, 28);
  });
}



/* -- 유틸 -- */
function delay(ms){return new Promise(r => setTimeout(r, ms));}



/* -- 동적 CSS 주입 (shake) -- */
const style = document.createElement('style');
style.textContent = `
  @keyframes shake-v2 {
    0%,100% { transform: translateX(0); }
    15%     { transform: translateX(-7px); }
    30%     { transform: translateX(6px); }
    45%     { transform: translateX(-5px); }
    60%     { transform: translateX(4px); }
    75%     { transform: translateX(-3px); }
    90%     { transform: translateX(2px); }
  }
`}

/* -- 하단 스탯 숫자 애니메이션 -- */
function animateStats() {
  document.querySelectorAll('.stat-num').forEach(el => {

    // data-target 가져오기
    const target = Number(el.dataset.target);

    let current = 0;

    // 약 40번에 걸쳐 증가
    const step = Math.ceil(target / 40);

    const timer = setInterval(() => {
      current = Math.min(
      current + step,
        target
      );

      el.textContent = current;

      /// 목적 숫자에 도달하면 종료
      if (current >= target) {
        clearInterval(timer);
        }
      }, 28);
    })
}

document.head.appendChild(style);