/* =====================================================
   main-v1.js  –  singup v1.0 Interactions
   ===================================================== */

(function () {
   'use strict'



/* -- 검증 규칙 및 헬퍼 함수 (순수 함수) -- */
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

function checkName(v) {
    const t = v.trim();
    if (!t) return { ok: false, msg: '이름을 입력해 주세요.' };
    if (t.length < 2) return { ok: false, msg: '이름은 2자 이상이어야 합니다.' };
    if (t.length > 30) return { ok: false, msg: '이름은 30자 이하로 입력해 주세요.' };
    return { ok: true, msg: '사용 가능한 이름입니다.' };
}

function checkEmail(v) {
    const t = v.trim();
    if (!t) return { ok: false, msg: '이메일을 입력해 주세요.' };
    if (!EMAIL_RE.test(t)) return { ok: false, msg: '이메일 형식이 올바르지 않습니다.' };
    return { ok: true, msg: '사용 가능한 이메일 형식입니다.' };
}

function scorePassword(v) {
    const hasLetter = /[A-Za-z]/.test(v);
    const hasDigit = /[0-9]/.test(v);
    const hasSpecial = /[^A-Za-z0-9]/.test(v);
    const passed = {
        len: v.length >= 8,
        mix: hasLetter && hasDigit,
        special: hasSpecial
    };
    let n = (passed.len ? 1 : 0) + (passed.mix ? 1 : 0) + (passed.special ? 1 : 0);
    if (v.length >= 12) n += 1;
    return { passed, level: Math.min(n, 4) };
}

function checkPassword(v) {
    if (!v) return { ok: false, msg: '비밀번호를 입력해 주세요.' };
    const r = scorePassword(v);
    if (!r.passed.len) return { ok: false, msg: '8자 이상 입력해 주세요.' };
    if (!(r.passed.mix && r.passed.special)) return { ok: false, msg: '영문·숫자와 특수문자를 조합해 주세요.' };
    return { ok: true, msg: '안전한 비밀번호입니다.' };
}

// targetPassword(비교 대상 비밀번호)를 인자로 받아 스코프 의존성 제거
function checkConfirm(v, targetPassword = '') {
    if (!v) return { ok: false, msg: '비밀번호를 한 번 더 입력해 주세요.' };
    if (v !== targetPassword) return { ok: false, msg: '비밀번호가 일치하지 않습니다.' };
    return { ok: true, msg: '비밀번호가 일치합니다.' };
}

const VALIDATORS = {
    name: checkName,
    email: checkEmail,
    password: checkPassword,
    confirm: checkConfirm
};

const LEVEL_LABEL = { 0: '강도 —', 1: '매우 약함', 2: '보통', 3: '강함', 4: '매우 강함' };

function paintPassword(v, elements) {
    const { strength, strengthLbl, ruleList } = elements;
    const r = scorePassword(v);

    if (strength) strength.setAttribute('data-level', v ? String(r.level) : '0');
    if (strengthLbl) strengthLbl.textContent = v ? LEVEL_LABEL[r.level] : LEVEL_LABEL[0];

    if (ruleList) {
        Array.from(ruleList.children).forEach((li) => {
            li.classList.toggle('met', !!r.passed[li.getAttribute('data-rule')]);
        });
    }
}



/* -- DOM 로드 완료 후 실행 -- */
document.addEventListener('DOMContentLoaded', () => {

    /* -- DOM 요소 취득 -- */
    const form = document.getElementById('signupForm');
    const formView = document.getElementById('formView');
    const successView = document.getElementById('successView');
    const submitBtn = document.getElementById('submitBtn');
    const successMail = document.getElementById('successEmail');
    const termsBox = document.getElementById('terms');
    const agreeAll = document.getElementById('agreeAll');
    const termItems = [...document.querySelectorAll('.term-item')];
    const strength = document.getElementById('strength');
    const strengthLbl = document.getElementById('strengthLabel');
    const ruleList = document.getElementById('rules');

    const fieldKeys = ['name', 'email', 'password', 'confirm'];

    // fields 객체 생성 (데이터 가공)
    const fields = fieldKeys.reduce((acc, key) => {
        let inputEl = document.getElementById(key);
        if (!inputEl && key === 'password') {
            inputEl = document.getElementById('password-input');
        }

        acc[key] = {
            el: inputEl,
            msg: document.getElementById(`${key}Msg`),
            touched: false
        };
        return acc;
    }, {});

    // wrappers 생성 
    const wrappers = {};
    fieldKeys.forEach((k) => {
        wrappers[k] = form?.querySelector(`[data-field="${k}"]`) ?? null;
    });

    // DEFAULT_MSG 생성 
    const DEFAULT_MSG = {};
    fieldKeys.forEach((k) => {
        DEFAULT_MSG[k] = fields[k]?.msg?.textContent?.trim() ?? '';
    });

    // 공통 검증 및 화면 반영 함수
    function validateField(key) {
        const field = fields[key];
        const wrapper = wrappers[key];
        if (!field?.el) return false;

        const value = field.el.value;

        // confirm 필드는 비밀번호 값도 함께 넘겨서 비교
        const result = (key === 'confirm')
          ? VALIDATORS.confirm(value, fields.password.el?.value || '')
          : VALIDATORS[key](value);

        // 에러/성공 메시지 출력
        if (field.msg) {
            field.msg.textContent = result.msg;
        }

        // UI 스타일(클래스) 업데이트
        if (wrapper) {
            wrapper.classList.toggle('error', !result.ok);
            wrapper.classList.toggle('success', result.ok);
        }

        return result.ok;
    }

    // 이벤트 리스너 등록 (입력 감지)
    fieldKeys.forEach((key) => {
        const field = fields[key];
        if (!field?.el) return;

        field.el.addEventListener('input', () => {
            field.touched = true;

            // 실시간 검증 실행
            validateField(key);

            // 비밀번호 수정 시 추가 동작
            if (key === 'password') {
                paintPassword(field.el.value, { strength, strengthLbl, ruleList });
            
                // 비밀번호 확인 입력창에 이미 값을 넣은 상태라면 일치 여부 재검증
                if (fields.confirm.touched && fields.confirm.el?.value) {
                    validateField('confirm');
                }
            }
        });
    });

    /* -- 비밀번호 표시 토글 이벤트 (개선) -- */
    const toggleButtons = document.querySelectorAll('.toggle-vis');

    toggleButtons.forEach((btn) => {
        btn.addEventListener('click', function () {
        // 같은 wrapper 또는 부모 컨테이너 내의 input 요소를 동적으로 탐색
        const container = this.closest('.input-wrapper') || this.parentElement;
        const targetInput = container ? container.querySelector('input') : null;

        if (!targetInput) return;

        // aria-pressed 속성 전환
        const isPressed = this.getAttribute('aria-pressed') === 'true';
        const nextState = !isPressed;
        this.setAttribute('aria-pressed', String(nextState));

        // input type 전환
        targetInput.type = nextState ? 'text' : 'password';
    });
  });
});
        


/* -- 필드 상태 렌더링 -- */
function render(key, respectTouched) {
    const f = fields[key];
    const res = VALIDATORS[key](f.el.value);
    const wrap = wrappers[key];
    const empty = f.el.value === '';

    wrap.classList.remove('is-valid', 'is-invalid');
    f.el.removeAttribute('aria-invalid');

    if (res.ok) {
        if (!empty) wrap.classList.add('is-invalid');
        f.msg.textContent = res.msg;
    } else if (!respectTouched || f.touched || !empty) {
        if (empty && !f.touched) {
            f.msg.textContent = DEFAULT_MSG[key];
        } else {
            wrap.classList.add('is-invalid');
            f.el.setAttribute('aria-invalid', 'true');
            f.msg.textContent = res.msg;
        }
    } else {
        f.msg.textContent = DEFAULT_MSG[key];
    }
    return res.ok;
}

function syncTerms() {
    const checked = termItems.filter(function (c) { return c.checked; }).length;
    agreeAll.checked = checked === termItems.length;
    agreeAll.indeterminate = checked > 0 && checked < termItems.length;
    const requiredOk = termItems
        .filter(function (c) { return c.hasAttribut('required'); })
        .every(function (c) { return c.checked; });
    if (requiredOk) termsBox.classList.remove('is-invalid');
    return requiredOk;
}



/* -- 이벤트 연결 -- */
Object.keys(fields).forEach(function (key) {
   const f = fields[key];
   
   f.el.addEventListener('input', function () {
    render(key, true);
    if (key === 'password') {
        paintPassword(f.el.value);
        if (fields.confirm.el.value) render('confirm', true);
    }
   });

   f.el.addEventListener('blur', function () {
    f.touched = true;
    render(key, false);
   });
});



/* -- 약관 동의 -- */
agreeAll.addEventListener('change', function () {
    termItems.forEach(function (c) { c.checked = agreeAll.checked; });
    syncTerms();
});

termItems.forEach(function (c) {
    c.addEventListener('change', function () {
        if (syncTerms()) return;
        termsBox.classList.add('is-invalid');
    });
});



/* -- 제출 -- */
function shake(el) {
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
}

function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.classList.toggle('is-loading', on);
    submitBtn.querySelector('.btn-text').textContent = on ? '계정을 만드는 중...' : '계정 만들기';
}

form.addEventListener('submit', function (e) {
    e.preventDefault();

    const allOk = true;
    const firstBad = null;

    Object.keys(fields).forEach(function (key) {
        fields[key].touched = true;
        const ok = render(key, false);
        if (!ok) {
            allOk = false;
            if (!firstBad) firstBad = fields[key].el;
        }
    });

    paintPassword(fields.password.el.value);

    const termsOk = syncTerms();
    if (!termsOk) termsBox.classList.add('is-invalid');

    if (!allOk || !termsOk) {
        if (firstBad) {
            firstBad.focus();
            shake(wrappers[firstBad.id]);
        } else if (!termsOk) {
            shake(termsBox);
        }
        return;
    }

    // 서버가 없는 시안이므로 로딩 상태만 시뮬레이션합니다
    setLoading(true);
    window.setTimeout(function () {
        setLoading(false);
        successMail.textContent = fields.email.el.value.trim();
        formView.hidden = true;
        successView.hidden = false;
        successView.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 1100);
});



/* -- 처음부터 다시 -- */
document.getElementById('resetBtn').addEventListener('click', function () {
    form.reset();
    Object.keys(fields).forEach(function (k) {
        fields[k].touched = false;
        wrappers[k].classList.remove('is-valid', 'is-invalid');
        fields[k].msg.textContent = DEFAULT_MSG[k];
    });

    paintPassword('');
    termsBox.classList.remove('is-invalid');
    syncTerms();
    successView.classList.remove('show');
    successView.hidden = true;
    formView.hidden = false;
    fields.name.el.focus();
});



/* -- 테마 전환 -- */
const themeDots = Array.prototype.slice.call(document.querySelectorAll('.theme-switch .dot'));
themeDots.forEach(function (dot) {
    dot.addEventListener('click', function () {
        const theme = dot.getAttribute('data-theme-set');
        document.documentElement.setAttribute('data-theme', theme);
        themeDots.forEach(function (d) {
            d.setAttribute('aria-pressed', String(d === dot));
        });

        try { window.localStorage.setItem('aurora-theme', theme); } catch (err) { /* 무시 */ }
    });
});

try {
    const saved = window.localStorage.getItem('aurora-theme');
    if (saved) {
        const match = themeDots.filter(function (d) { return d.getAttribute('data-theme-set') === saved; })[0];
        if (match) match.click();
    }
} catch (err) { /* 무시 */}



/* -- 초기 상태 -- */
paintPassword('');
syncTerms();

})();
