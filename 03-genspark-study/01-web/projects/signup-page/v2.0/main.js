(function () {
   'use strict';



/* ==========================================================================
   0. 검증 규칙 및 헬퍼 함수 (순수 함수)
   ========================================================================== */

// 애니메이션 트리거 (에러 시 흔들림)
function shake(el) {
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth; // 리플로우 강제 트리거
    el.classList.add('shake');
}



/* ==========================================================================
   1. DOM 요소 캐싱 & 맵핑
   ========================================================================== */
const form = document.getElementById('signupForm');
const submitBtn = document.getElementById('submitBtn');
const termsCheck = document.getElementById('terms');
const successBanner = document.getElementById('successBanner');
const strengthLabel = document.getElementById('strengthLabel');

// 개별 입력 필드
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const passwordInput = document.getElementById('password');
const password2Input = document.getElementById('password2');

// UI 인터랙션 요소 리스트
const strengthBars = document.querySelectorAll('.strength i');
const togglePwdButtons = document.querySelectorAll('.toggle-pwd');

// 검증 필드 맵핑
const inputElements = {
    name: nameInput,
    email: emailInput,
    phone: phoneInput,
    password: passwordInput,
    password2: password2Input
};

// 동적 메시지 요소({key}Msg) 반환 헬퍼 함수
const getMsgElement = (key) => document.getElementById(`${key}Msg`);



/* ==========================================================================
   2. 개별 검증 함수 정의
   ========================================================================== */
function checkName(v) {
    return typeof v === 'string' && v.trim().length >= 2;
}

function checkEmail(v) {
    return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

function checkPhone(v) {
    if (typeof v !== 'string') return false;
    const val = v.trim();
    return val === '' || /^01[016789]-?\d{3,4}-?\d{4}$/.test(val);
}

function checkPassword(v) {
    return (
        typeof v === 'string' &&
        v.length >= 8 &&
        /[A-Za-z]/.test(v) &&
        /\d/.test(v) &&
        /[^A-Za-z0-9]/.test(v)
    );
}

function checkPassword2(v) {
    return v !== '' && Boolean(passwordInput) && v === passwordInput.value;
}

const VALIDATORS = {
    name: checkName,
    email: checkEmail,
    phone: checkPhone,
    password: checkPassword,
    password2: checkPassword2
};

const validatorKeys = Object.keys(VALIDATORS);



/* ==========================================================================
   3. UI 업데이트 및 검증 보조 함수
   ========================================================================== */
// 개별 필드 에러 메시지 및 aria 속성 업데이트
function setFieldState(id, valid) {
    const input = inputElements[id];
    const msg = getMsgElement(id);

    if (input) {
        input.setAttribute('aria-invalid', valid ? 'false' : 'true');
    }

    if (msg && input) {
        msg.classList.toggle('show', !valid && input.value.trim() !== '');
    }
}

// 비밀번호 강도 계산
function strengthOf(pw) {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(3, Math.max(1, Math.ceil(score * 3 / 4)));
}

// 비밀번호 강도 표시 UI 업데이트
function updateStrength() {
    if (!passwordInput) return;

    const pw = passwordInput.value;
    const s = strengthOf(pw);

    strengthBars.forEach((bar, i) => {
        bar.className = (pw && i < s) ? `on-${s}` : '';
    });

    const labels = ['약함', '보통', '강함'];
    if (strengthLabel) {
        strengthLabel.textContent = '비밀번호 강도: ' + (pw === '' ? '—' : (labels[s - 1] ?? '—'));
    }
}

// 통합 검증 및 제출 버튼 활성화 상태 제어
function validateAll() {
    let allInputsValid = true;

    validatorKeys.forEach((key) => {
        const input = inputElements[key];
        const validateFn = VALIDATORS[key];

        if (!input || typeof validateFn !== 'function') return;

        const isValid = validateFn(input.value);

        if (input.classList.contains('touched') || input.value.trim() !== '') {
            setFieldState(key, isValid);
        }

        if (!isValid) {
            allInputsValid = false;
        }
    });

    const isTermsValid = termsCheck ? termsCheck.checked : true;
    const isFormValid = allInputsValid && isTermsValid;

    if (submitBtn) {
        submitBtn.disabled = !isFormValid;
    }

    return isFormValid;
}



/* ==========================================================================
   4. 이벤트 리스너 바인딩
   ========================================================================== */
// 필드 블러 시 개별 검증
validatorKeys.forEach((id) => {
    const input = inputElements[id];
    if (!input) return;

    input.addEventListener('blur', () => {
        input.classList.add('touched');
        setFieldState(id, VALIDATORS[id](input.value));
        validateAll();
    });
});

// 비밀번호 입력 시: 강도 측정 + 확인(password2) 재동기화
if (passwordInput) {
    passwordInput.addEventListener('input', () => {
        updateStrength();
        if (password2Input && password2Input.classList.contains('touched')) {
            setFieldState('password2', checkPassword2(password2Input.value));
        }
    });
}

// 비밀번호 표시 / 숨기기 토글
togglePwdButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const targetInput = inputElements[targetId] || document.getElementById(targetId);

        if (!targetInput) return;

        const isPassword = targetInput.type === 'password';
        targetInput.type = isPassword ? 'text' : 'password';

        btn.textContent = isPassword ? '🙈' : '👁';
        btn.setAttribute('aria-label', isPassword ? '비밀번호 숨기기' : '비밀번호 표시');
        targetInput.focus();
    });
});

// 약관 동의 체크박스 상태 변경 대응
if (termsCheck) {
    termsCheck.addEventListener('change', validateAll);
}

// 폼 입력 및 최종 제출 처리
if (form) {
    form.addEventListener('input', (e) => {
        if (e.target && e.target.id) {
            e.target.classList.add('touched');
        }
        validateAll();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let focusTarget = null;

        // 전체 필드 강제 검사 및 에러 노출
        validatorKeys.forEach((id) => {
            const input = inputElements[id];
            if (!input || typeof VALIDATORS[id] !== 'function') return;

            const ok = VALIDATORS[id](input.value);
            input.classList.add('touched');
            setFieldState(id, ok);

            if (!ok && !focusTarget) {
                focusTarget = input;
            }
        });

        // 1. 유효성 검사 실패 시 첫 오류 항목으로 포커스
        if (focusTarget) {
            focusTarget.focus();
            return;
        }

        // 2. 약관 미체크 시 약관 항목으로 포커스
        if (termsCheck && !termsCheck.checked) {
            termsCheck.focus();
            return;
        }

        // 3. 제출 성공 처리
        if (successBanner) {
            successBanner.classList.add('show');
            successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // 4. 폼 초기화 및 상태 리셋
        form.reset();

        if (submitBtn) {
            submitBtn.disabled = true;
        }

        strengthBars.forEach(bar => bar.className = '');
        if (strengthLabel) {
            strengthLabel.textContent = '비밀번호 강도: —';
        }

        validatorKeys.forEach((id) => {
            const el = inputElements[id];
            const msg = getMsgElement(id);

            if (el) {
                el.setAttribute('aria-invalid', 'false');
                el.classList.remove('touched');
            }
            if (msg) {
                msg.classList.remove('show');
            }
        });
    });
}
})();