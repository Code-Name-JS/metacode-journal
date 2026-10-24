/* =====================================================
   main-v2.js  –  singup v2.0 Interactions
   ===================================================== */

(function () {
   'use strict';



/* ==========================================================================
   1. DOM 요소 캐싱 & 맵핑
   ========================================================================== */
const form = document.getElementById('signupForm');
const submitBtn = document.getElementById('submitBtn');
const termsCheck = document.getElementById('terms');
const togglePwdButtons = document.querySelectorAll('.toggle-pwd');
const passwordInput = document.getElementById('password');
const password2Input = document.getElementById('password2');
const strengthBars = document.querySelectorAll('.strength i');
const strengthLabel = document.getElementById('strengthLabel');
const termsMsg = document.getElementById('termsMsg');

const validatorKeys = ['name', 'email', 'phone', 'password', 'password2', 'terms'];

const inputElements = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    password: document.getElementById('password'),
    password2: document.getElementById('password2'),
    terms: document.getElementById('terms')
};

const getMsgElement = (id) => document.getElementById(`${id}Msg`);


/* ==========================================================================
   2. 개별 검증 함수 정의
   ========================================================================== */
// 이름: 공백 제외 2~5자 완성형 한글만 허용
function checkName(v) {
    if (typeof v !== 'string') return false;
    const trimmed = v.trim();
    return /^[가-힣]{2,5}$/.test(trimmed);
}

// 이메일: 표준 이메일 형식
function checkEmail(v) {
    return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

// 전화번호: 필수 입력값으로 빈 값 허용 제거
function checkPhone(v) {
    if (typeof v !== 'string') return false;
    const val = v.trim();
    return /^01[016789]-?\d{3,4}-?\d{4}$/.test(val);
}

// 비밀번호: 8자 이상, 영문 + 숫자 + 특수문자 조합
function checkPassword(v) {
    return (
        typeof v === 'string' &&
        v.length >= 8 &&
        /[A-Za-z]/.test(v) &&
        /\d/.test(v) &&
        /[^A-Za-z0-9]/.test(v)
    );
}

// 비밀번호 확인: 일치 여부 확인
function checkPassword2(v) {
    return Boolean(passwordInput) && v.length > 0 && v === passwordInput.value;
}

// 약관 동의 검증: 체크 여부(true) 확인
function checkTerms(v) {
    // 1) input.checked(boolean)가 전달되었을 경우
    if (typeof v === 'boolean') {
        return v === true;
    }
    // 2) 요소 직접 확인 또는 fallback 처리
    const termsEl = inputElements?.terms || document.getElementById('terms');
    return termsEl ? termsEl.checked : false;
}

// 검증 함수 맵
const VALIDATORS = {
    name: checkName,
    email: checkEmail,
    phone: checkPhone,
    password: checkPassword,
    password2: checkPassword2,
    terms: checkTerms // [추가]
};



/* ==========================================================================
   3. UI 업데이트 및 검증 보조 함수
   ========================================================================== */
// 애니메이션 트리거 (에러 시 흔들림)
function shake(el) {
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth; // 리플로우 강제 트리거
    el.classList.add('shake');
}

// 개별 필드 에러 메시지 및 aria 속성 업데이트
function setFieldState(id, valid) {
    const input = inputElements[id];
    const msg = getMsgElement(id);

    if (input) {
        input.setAttribute('aria-invalid', valid ? 'false' : 'true');
    }

    if (msg && input) {
        // [수정] 빈 문자열이어도 valid가 false이고 touched 상태면 에러를 노출
        const isErrorVisible = !valid && (input.classList.contains('touched') || input.value.trim() !== '');
        
        // 이전 상태와 비교하여 '에러 상태로 새롭게 진입한 경우'에만 shake 실행
        const wasError = msg.classList.contains('show');
        msg.classList.toggle('show', isErrorVisible);
    
        // 에러 상태일 때 input 요소에 흔들림 애니메이션 실행
        if (isErrorVisible && !wasError) {
            shake(input);
        }
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
        if (!input) return;

        const isValid = VALIDATORS[key]?.(input.value) ?? false;

        if (input.classList.contains('touched') || input.value.trim() !== '') {
            setFieldState(key, isValid);
        }

        if (!isValid) {
            allInputsValid = false;
        }
    });

    const isTermsValid = termsCheck ? termsCheck.checked : true;
    return allInputsValid && isTermsValid;
}



/* ==========================================================================
   4. 이벤트 리스너 바인딩
   ========================================================================== */
// 필드 블러 시 개별 검증
validatorKeys.forEach((key) => {
    const input = inputElements[key];
    if (input) {
        input.addEventListener('blur', () => {
            input.classList.add('touched');
            validateAll();
        });
    }
});

// 폼 실시간 입력 감지 (이벤트 위임으로 실시간 검증 및 버튼 제어)
if (form) {
    form.addEventListener('input', (e) => {
        if (e.target && e.target.id) {
            e.target.classList.add('touched');
        }
        validateAll();
    });
}

// 이름 입력 시: 한글 이외 문자 실시간 제거 및 검증
const nameInputEl = inputElements?.['name'] || document.getElementById('name');
if (nameInputEl) {
    nameInputEl.addEventListener('input', (e) => {
        const originalValue = e.target.value;
        // 한글(완성형/자음/모음) 및 공백을 제외한 문자 제거
        const filteredValue = originalValue.replace(/[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣\s]/g, '');

        if (originalValue !== filteredValue) {
            e.target.value = filteredValue;
        }

        // 기존 폼 검증 엔진과 상태 동기화
        if (typeof setFieldState === 'function' && VALIDATORS?.['name']) {
            setFieldState('name', VALIDATORS['name'](e.target.value));
        }
    });
}

// 비밀번호 입력 시: 강도 측정 + 확인(password2) 재동기화
if (passwordInput) {
    passwordInput.addEventListener('input', () => {
        updateStrength();
        if (password2Input && password2Input.classList.contains('touched')) {
            const checkFn = VALIDATORS['password2'] || checkPassword2;
            if (typeof checkFn === 'function') {
                setFieldState('password2', checkFn(password2Input.value));
            }
        }
    });
}

// 비밀번호 표시 / 숨기기 토글
togglePwdButtons.forEach((btn) => {
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
    termsCheck.addEventListener('change', () => {
        checkTerms(); // termsMsg의 .show 클래스 및 aria-invalid 갱신
        if (typeof validateAll === 'function') {
            validateAll();
        }
    });
}

// 폼 최종 제출 처리
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let focusTarget = null;

        // [단계 1] 제출 시 전체 필드 강제 검사 및 에러 시각화
        validatorKeys.forEach((id) => {
            const input = inputElements[id];
            if (!input) return;

            // input 타입이 checkbox이면 checked 값을, 아니면 value를 전달
            const val = input.type === 'checkbox' ? input.checked : input.value;
            const isValid = VALIDATORS[id]?.(val) ?? false;

            input.classList.add('touched');
            setFieldState(id, isValid);

            if (!isValid && !focusTarget) {
                focusTarget = input;
            }
        });

        // [단계 2] 일반 입력창 오류 항목 우선 포커스 (약관 검사 전에 먼저 탈출)
        if (focusTarget) {
            focusTarget.focus();
            return;
        }

        // [단계 3] 약관 동의 여부 검증 (에러 메시지 표시, 애니메이션, 포커스)
        if (termsCheck) {
            const isTermsValid = checkTerms(); // 정의해둔 검증 함수 실행 (에러 메시지 자동 노출)

            if (!isTermsValid) {
                // 체크박스 또는 라벨 요소 흔들림 효과 트리거
                const termsWrapper = termsCheck.closest('.terms') || termsCheck;
                if (typeof shake === 'function') {
                    shake(termsWrapper);
                }

                termsCheck.focus();
                return; // 약관 미동의 시 제출 중단
            }
        }

        // [단계 4] 최종 유효성 검증 확인 (버튼 활성화 상태 등 전체 점검)
        if (!validateAll()) {
            return;
        }

        // [단계 5] 제출 성공 처리
        if (typeof successBanner !== 'undefined' && successBanner) {
            successBanner.classList.add('show');
            successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            alert('회원가입이 완료되었습니다!');
        }

        // [단계 6] 폼 초기화 및 상태 리셋
        form.reset();

        if (submitBtn) {
            submitBtn.disabled = true;
        }

        strengthBars.forEach((bar) => (bar.className = ''));
        if (strengthLabel) {
            strengthLabel.textContent = '비밀번호 강도: —';
        }
    
        // 일반 필드 리셋
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

        // [추가] 약관 체크박스 및 메시지 초기화
        if (termsCheck) {
            termsCheck.checked = false;
            termsCheck.setAttribute('aria-invalid', 'false');
        }
        if (termsMsg) {
            termsMsg.classList.remove('show'); // 약관 에러 메시지 숨김
        }
    });
}
})();