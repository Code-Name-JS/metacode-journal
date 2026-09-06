/* =====================================================
   main-v2.js  –  Login v2 Interactions
   ===================================================== */
'use strict';



/* -- Demo Account -- */
const ACCOUNTS = [
  { email: 'demo@myapp.com',    password: 'demo1234' },
  { email: 'test@example.com',  password: 'test5678' },
];



/* -- Password toggle -- */
setupEyeToggle('password',  'eye-btn',  'eye-ic');
setupEyeToggle('su-pass',   'eye-btn2', 'eye-ic2');

function setupEyeToggle(inputId, btnId, iconId) {
  const input = document.getElementById(inputId);
  const btn   = document.getElementById(btnId);
  const icon  = document.getElementById(iconId);
  if (!btn) return;
  btn.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type  = show ? 'text' : 'password';
    icon.className = show ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
    btn.setAttribute('aria-label', show ? 'Hide Password' : 'Show password');
  });
}


/* -- Restore login state -- */
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('v2_remembered');
  if (saved) {
    document.getElementById('email').value = saved;
    document.getElementById('remember').checked = true;
  }
  animateStats();
});



/* -- Social Buttons -- */

// Google
const googleBtn = document.getElementById('s-google');

if (googleBtn) {
    googleBtn.addEventListener('click', () => {
        showAlert(
            'alert-login',
            'info',
            '🔍 Google 로그인은 준비 중입니다.'
        );
    });
}


// Kakao
const kakaoBtn = document.getElementById('s-kakao');

if (kakaoBtn) {
    kakaoBtn.addEventListener('click', () => {
        showAlert(
            'alert-login',
            'info',
            '💛 카카오 로그인은 준비 중입니다.'
        );
    });
}


// Naver
const naverBtn = document.getElementById('s-naver');

if (naverBtn) {
    naverBtn.addEventListener('click', () => {
        showAlert(
            'alert-login',
            'info',
            '🟢 네이버 로그인은 준비 중입니다.'
        );
    });
}


// Forgot Password
const forgotLink = document.getElementById('link-forgot');

if (forgotLink) {
    forgotLink.addEventListener('click', e => {
        e.preventDefault();

        showAlert(
            'alert-login',
            'info',
            '📧 비밀번호 재설정 이메일을 발송합니다.'
        );
    });
}



/* -- Password Strength -- */
const suPassInput = document.getElementById('su-pass');
suPassInput && suPassInput.addEventListener('input', () => checkStrength(suPassInput.value));

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



/* -- Submit Login Form -- */
const loginForm = document.getElementById('form-login');

if (loginForm) {
  loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const emailVal = document.getElementById('email').value.trim();
  const passVal  = document.getElementById('password').value;

  let ok = true;
  if (!validateEmail(emailVal, 'f-email', 'err-email')) ok = false;
  if (!validateRequired(passVal, 'f-pass', 'err-pass', '비밀번호를 입력해주세요.')) ok = false;
  if (!ok) return;

  setLoading('btn-login', true);

  await delay(1300);

  const matched = ACCOUNTS.find(a => a.email === emailVal.toLowerCase() && a.password === passVal);
  if (matched) {
    if (document.getElementById('remember').checked) {
      localStorage.setItem('v2_remembered', matched.email);
    } else {
      localStorage.removeItem('v2_remembered');
    }
    setFieldOk('f-email');
    setFieldOk('f-pass');
    showAlert('alert-login', 'success', '✅ 로그인 성공! 대시보드로 이동합니다.');

    const btn = document.getElementById('btn-login');
    btn.querySelector('.btn-label').textContent = '✓ 완료';
    btn.style.background = '#22c55e';
    btn.querySelector('.btn-loader').style.display = 'none';
    btn.querySelector('.btn-label').style.display  = 'flex';
  } else {
    setFieldErr('f-email',    'err-email',    '');
    setFieldErr('f-pass',     'err-pass',     '이메일 또는 비밀번호가 일치하지 않습니다.');
    showAlert('alert-login', 'error', '❌ 로그인 정보를 다시 확인해주세요.');
    shakeForm('form-login');
    setLoading('btn-login', false);
  }
 });
}



/* -- Submit Membership Form -- */
const signupForm = document.getElementById('form-signup');

if (signupForm) {
  signupForm.addEventListener('submit', async e => {
  e.preventDefault();
  const nameVal  = document.getElementById('username').value.trim();
  const emailVal = document.getElementById('su-email').value.trim();
  const passVal  = document.getElementById('su-pass').value;
  const agreed   = document.getElementById('agree').checked;

  let ok = true;
  if (!validateRequired(nameVal,  'f-name',     'err-name',     '이름을 입력해주세요.'))      ok = false;
  if (!validateEmail(emailVal,     'f-su-email', 'err-su-email'))                              ok = false;
  if (!validatePassStrength(passVal, 'f-su-pass', 'err-su-pass'))                             ok = false;
  if (!agreed) { showAlert('alert-signup', 'error', '약관에 동의해주세요.'); ok = false; }
  if (!ok) return;

  setLoading('btn-signup', true);
  await delay(1400);

  showAlert('alert-signup', 'success', `🎉 ${nameVal}님, 가입이 완료되었습니다!`);
  const btn = document.getElementById('btn-signup');
  btn.querySelector('.btn-label').textContent = '✓ 가입 완료';
  btn.style.background = '#22c55e';
  btn.querySelector('.btn-loader').style.display = 'none';
  btn.querySelector('.btn-label').style.display  = 'flex';
});
}



/* -- Real-time verification (blur) -- */
document.getElementById('email').addEventListener('blur', () => {
  validateEmail(document.getElementById('email').value.trim(), 'f-email', 'err-email');
});
document.getElementById('password').addEventListener('input', () =>
  clearField('f-pass', 'err-pass'));
document.getElementById('su-email') && document.getElementById('su-email').addEventListener('blur', () =>
  validateEmail(document.getElementById('su-email').value.trim(), 'f-su-email', 'err-su-email'));



/* -- Validity Functions -- */
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



/* -- Button Loading -- */
function setLoading(btnId, on) {
  const btn = document.getElementById(btnId);
  btn.disabled = on;
  btn.classList.toggle('loading', on);
}



/* -- Notification Banner -- */
const alertTimers = {};
function showAlert(elId, type, msg) {
  const el = document.getElementById(elId);
  clearTimeout(alertTimers[elId]);
  el.className = `alert-banner ${type} show`;
  el.textContent = msg;
  alertTimers[elId] = setTimeout(() => { el.className = 'alert-banner'; }, 4000);
}



/* -- Shaking the Form -- */
function shakeForm(formId) {
  const form = document.getElementById(formId);
  form.style.animation = 'none';
  form.offsetHeight;
  form.style.animation = 'shake-v2 .4s ease';
}



/* -- Counter Animation -- */
function animateStats() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = +el.dataset.target;
    let cur = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = cur;
      if (cur >= target) clearInterval(timer);
    }, 28);
  });
}




/* -- Utility -- */
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }



/* -- Dynamic CSS Injection (shake) -- */
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
`;
document.head.appendChild(style);