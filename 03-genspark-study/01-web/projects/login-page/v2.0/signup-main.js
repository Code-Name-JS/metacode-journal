/* =====================================================
   signup-main-v2.js  –  Login v2.0 Interactions
===================================================== */
'use strict';



/* -- 데모 계정 -- */
const ACCOUNTS = [
  { email: 'demo@myapp.com',    password: 'demo1234' },
  { email: 'test@example.com',  password: 'test5678' },
];



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
const alertTimers = {};



/* -- 알림 배너 -- */
function showAlert (id, type, message) {
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



// 회원가입 비밀번호 눈 버튼
setupEyeToggle('su-pass', 'eye-btn2', 'eye-ic2');



/* -- 비밀번호 강도 -- */
if (signupPasswordInput) {
    signupPasswordInput.addEventListener('input', () => {
        checkStrength(signupPasswordInput.value);
    });
}

function checkStrength(value) {
    const bars = [
        document.getElementById('sb1'),
        document.getElementById('sb2'),
        document.getElementById('sb3'),
        document.getElementById('sb4')
    ];

    const label = document.getElementById('strength-label');

    if (!label) return;

    // 기존 클래스 초기화
    bars.forEach(bar => {
        if (bar) {
            bar.className = 'sb';
        }
    });

    // 입력값이 없으면 종료
    if (!value) {
        label.textContent = '강도 없음';
        return;
    }

    let score = 0;

    // 8자 이상
    if (value.length >= 8) {
        score++;
    }

    // 대문자
    if (/[A-Z]/.test(value)) {
        score++;
    }

    // 숫자
    if (/[0-9]/.test(value)) {
        score++;
    }

    // 특수문자
    if (/[^A-Za-z0-9]/.test(value)) {
        score++;
    }

    const levels = [
        '강도 없음', '약함', '보통', '강함', '매우 강함'
    ];

    const classes = [
        '', 's1', 's2', 's3', 's4'
    ];

    // 강도 막대 표시
    for (let i = 0; i < score; i++) {
        if (bars[i]) {
            bars[i].classList.add(classes[score]);
        }
    }

    // 강도 문구
    label.textContent = levels[score];
}



/* -- 이름 실시간 검증 -- */
if (nameInput) {
    nameInput.addEventListener('blur', () => {
        validateRequired(
            nameInput.value.trim(),
            'f-name',
            'err-su-name',
            '이름을 입력해주세요.'
        );
    });
}



/* -- 이메일 실시간 검증 -- */
if (signupEmailInput) {
    signupEmailInput.addEventListener('blur', () => {
        validateEmail(
            signupEmailInput.value.trim(),
            'f-su-email',
            'err-su-email'
        );
    });
}



/* -- 비밀번호 실시간 검증 -- */
if (signupPasswordInput) {
    signupPasswordInput.addEventListener('blur', () => {
        validatePassStrength(
            signupPasswordInput.value,
            'f-su-pass',
            'err-su-pass'
        );
    });
}



/* -- 이름 / 이메일 / 비밀번호 유효성 함수 -- */
function validateRequired(
    value, groupId, errorId, message
) {
    if (!value) {
        setFieldErr(
            groupId, errorId, message
        );

        return false;
    }

    clearField(groupId, errorId);

    return true;
}

function validateEmail(
    value, groupId, errorId
) {
    // 이메일 미입력
    if (!value) {

        setFieldErr(
            groupId, errorId, '이메일을 입력해주세요.'
        );

        return false;
    }

    // 이메일 형식 검사
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setFieldErr(
            groupId, errorId, '올바른 이메일 형식이 아닙니다.'
        );

        return false;
    }
    clearField(groupId, errorId);
    
    return true;
}

function validatePassStrength(
    value, groupId, errorId
) {
    // 비밀번호 미입력
    if (!value) {
        setFieldErr(
            groupId, errorId, '비밀번호를 입력해주세요.'
        );

        return false;
    }

    // 8자 미만
    if (value.length < 8) {
        setFieldErr(
            groupId, errorId, '비밀번호는 8자 이상이어야 합니다.'
        );

        return false;
    }

    clearField(groupId, errorId);

    return true;
}



/* -- 필드 에러 표시 -- */
function setFieldErr(
    groupId, errorId, message
) {
    const group = document.getElementById(groupId);
    const error = document.getElementById(errorId);

    if (!group || !error) return;

    group.classList.remove('is-ok');
    group.classList.add('is-err');

    error.innerHTML = message
        ? `<i class="fa-solid fa-circle-exclamation"></i> ${message}`
        : '';
}



/* -- 필드 정상 표시 -- */
function setFieldOk(groupId) {
    const group = document.getElementById(groupId);

    if (!group) return;

    group.classList.remove('is-err');
    group.classList.add('is-ok');
}



/* -- 필드 초기화 -- */
function clearField(
    groupId, errorId
) {
    const group = document.getElementById(groupId);
    const error = document.getElementById(errorId);

    if (group) {
        group.classList.remove(
            'is-err', 'is-ok'
        );
    }

    if (error) {
        error.textContent = '';
    }
}



/* -- 버튼 로딩 -- */
function setLoading(
    buttonId, isLoading
) {
    const button = document.getElementById(buttonId);

    if (!button) {
        console.error(
            `${buttonId} 버튼을 찾을 수 없습니다.`
        );

        return;
    }

    button.disabled = isLoading;

    button.classList.toggle(
        'loading', isLoading
    );
}



/* -- 회원가입 폼 제출 -- */
if (signupForm) {
    signupForm.addEventListener(
        'submit', async (event) => {

            // 기본 제출 방지
            event.preventDefault();

            /* -- 입력값 가져오기 -- */
            const nameVal = nameInput
                ? nameInput.value.trim()
                : '';

            const emailVal = signupEmailInput
                ? signupEmailInput.value.trim()
                : '';

            const passVal = signupPasswordInput
                ? signupPasswordInput.value
                : '';

            const agreed = agreeInput
                ? agreeInput.checked
                : false;

            
            
            /* -- 유효성 검사 -- */
            let ok = true;

            // 이름
            if (!validateRequired(nameVal, 'f-name', 'err-su-name', '이름을 입력해주세요.')) {
                ok = false;
            }

            // 이메일
            if (!validateEmail(emailVal, 'f-su-email', 'err-su-email')) {
                ok = false;
            }

            // 비밀번호
            if (!validatePassStrength(passVal, 'f-su-pass', 'err-su-pass')) {
                ok = false;
            }

            // 약관
            if (!agreed) {showAlert('alert-signup', 'error', '약관에 동의해주세요.');
                ok = false;
            }

            /* -- 하나라도 잘못되면 종료 -- */
            if (!ok) {
                shakeForm('form-signup');

                return;
            }

            /* -- 회원가입 버튼 로딩 -- */
            setLoading('btn-signup', true);

            /* -- 1.4초 로딩 -- */
            await delay(1400);

            /* -- 가입 완료 -- */
            showAlert('alert-signup', 'success', `🎉 ${nameVal}님, 가입이 완료되었습니다!`);

            /* -- 버튼 찾기 -- */
            const button = document.getElementById('btn-signup');

            if (!button) {

                console.error('btn-signup을 찾을 수 없습니다.');

                return;
            }

            /* -- 버튼 문구 -- */
            const label = button.querySelector('.btn-label');

            if (label) {
                label.textContent = '✓ 가입 완료';
                label.style.display = 'flex';
            }

            /* -- 화살표 숨기기 -- */
            const arrow = button.querySelector(
                '.btn-arrow'
            );

            if (arrow) {
                arrow.style.display = 'none';
            }

            /* -- 로딩 아이콘 숨기기 -- */
            const loader = button.querySelector('.btn-loader');
            
            if (loader) {
                loader.style.display = 'none';
            }

            /* -- 버튼 색상 변경 -- */
            button.style.background = '#22c55e';

            /* -- 중복 클릭 방지 -- */
            button.disabled = true;

            console.log('회원가입 성공 처리 완료');
        }
    );
}



/* -- 폼 흔들기 -- */
function shakeForm(formId) {
    
    const form = document.getElementById(formId);

    if (!form) return;

    form.style.animation = 'none';

    // 브라우저가 다시 animation을 인식하도록 강제
    form.offsetHeight;

    form.style.animation = 'shake-v2 .4s ease';
}



/* -- 딜레이 -- */
function delay(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}



document.head.appendChild(style);


