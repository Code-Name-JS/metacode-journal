/* =====================================================
   main-v1.js  –  singup v1.0 Interactions
   ===================================================== */

(function () {
   'use strict';



/* ==========================================================================
   1. 검증 규칙 및 헬퍼 함수 (순수 함수)
   ========================================================================== */

// 애니메이션 트리거 (에러 시 흔들림)
function shake(el) {
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth; // 리플로우 강제 트리거
    el.classList.add('shake');
}

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

function paintPassword(v= '', elements = {}) {
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


/* ==========================================================================
   2. DOM 로드 완료 후 실행
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {

    /* -- DOM 요소 취득 -- */
    const form = document.getElementById('signupForm');
    const formView = document.getElementById('formView');
    const successView = document.getElementById('successView');
    const submitBtn = document.getElementById('submitBtn');
    const resetBtn = document.getElementById('resetBtn');
    const successMail = document.getElementById('successEmail');
    const termsBox = document.getElementById('terms');
    const agreeAll = document.getElementById('agreeAll');
    const termItems = [...document.querySelectorAll('.term-item')];
    const strength = document.getElementById('strength');
    const strengthLbl = document.getElementById('strengthLabel');
    const ruleList = document.getElementById('rules');

    const fieldKeys = ['name', 'email', 'password', 'confirm'];

    // 필드 상태 객체 생성
    const fields = fieldKeys.reduce((acc, key) => {
        acc[key] = {
            el: document.getElementById(key),
            msg: document.getElementById(`${key}Msg`),
            touched: false
        };
        return acc;
    }, {});

    // wrapper 컨테이너 취득 ([data-field="key"])
    const wrappers = {};
    fieldKeys.forEach((k) => {
        wrappers[k] = form?.querySelector(`[data-field="${k}"]`) ?? null;
    });

    // 기본 가이드 메시지 저장
    const DEFAULT_MSG = {};
    fieldKeys.forEach((k) => {
        DEFAULT_MSG[k] = fields[k]?.msg?.textContent?.trim() ?? '';
    });
    

    /* ======================================================================
       3. 필드 상태 렌더링
       ====================================================================== */
    function render(key, respectTouched = true) {
        const f = fields[key];
        const wrap = wrappers[key];
        if (!f?.el || !wrap) return false;

        const val = f.el.value;
        const empty = val === '';
        
        // confirm 필드는 비밀번호 원본 값을 전달하여 검증
        const res = (key === 'confirm')
            ? VALIDATORS.confirm(val, fields.password.el?.value || '')
            : VALIDATORS[key](val);

        wrap.classList.remove('is-valid', 'is-invalid');
        f.el.removeAttribute('aria-invalid');

        if (res.ok) {
            if (!empty) wrap.classList.add('is-valid');
            if (f.msg) f.msg.textContent = res.msg || '';
        } else if (!respectTouched || f.touched || !empty) {
            if (empty && !f.touched) {
                if (f.msg) f.msg.textContent = DEFAULT_MSG[key];
            } else {
                wrap.classList.add('is-invalid');
                f.el.setAttribute('aria-invalid', 'true');
                if (f.msg) f.msg.textContent = res.msg;
            }
        } else {
            if (f.msg) f.msg.textContent = DEFAULT_MSG[key];
        }

        return res.ok;
    }

    /* ======================================================================
       4. 약관 동의 동기화
       ====================================================================== */
    function syncTerms() {
        const checked = termItems.filter((c) => c.checked).length;
        if (agreeAll) {
            agreeAll.checked = checked === termItems.length;
            agreeAll.indeterminate = checked > 0 && checked < termItems.length;
        }

        const requiredOk = termItems
            .filter((c) => c.hasAttribute('required'))
            .every((c) => c.checked);

        if (requiredOk && termsBox) {
            termsBox.classList.remove('is-invalid');
        }
        return requiredOk;
    }

    // 필드 이벤트 바인딩
    fieldKeys.forEach((key) => {
        const f = fields[key];
        if (!f?.el) return;

        f.el.addEventListener('input', () => {
            render(key, true);

            // 비밀번호 변경 시 강도 미터 갱신 및 확인 필드 재검증
            if (key === 'password') {
                paintPassword(f.el.value, { strength, strengthLbl, ruleList });
                if (fields.confirm.touched || fields.confirm.el.value) {
                    render('confirm', true);
                }
            }
        });

        f.el.addEventListener('blur', () => {
            f.touched = true;
            render(key, true);
        });
    });

    // 약관 이벤트 바인딩
    termItems.forEach((item) => {
        item.addEventListener('change', () => syncTerms());
    });

    if (agreeAll) {
        agreeAll.addEventListener('change', () => {
            termItems.forEach((c) => { c.checked = agreeAll.checked; });
            syncTerms();
        });
    }

    /* -- 비밀번호 보기/숨기기 토글 -- */
    const toggleButtons = document.querySelectorAll('.toggle-vis');
    toggleButtons.forEach((btn) => {
        btn.addEventListener('click', function () {
            const container = this.closest('.input-wrap') || this.parentElement;
            const targetInput = container ? container.querySelector('input') : null;
            if (!targetInput) return;

            const isPressed = this.getAttribute('aria-pressed') === 'true';
            const nextState = !isPressed;
            this.setAttribute('aria-pressed', String(nextState));
            targetInput.type = nextState ? 'text' : 'password';
        });
    });

    /* -- 폼 제출 핸들러 -- */
    function setLoading(on) {
        if (!submitBtn) return;
        submitBtn.disabled = on;
        submitBtn.classList.toggle('is-loading', on);
        const btnText = submitBtn.querySelector('.btn-text');
        if (btnText) {
            btnText.textContent = on ? '계정을 만드는 중...' : '계정 만들기';
        }
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // 전체 필드 강제 검사 (respectTouched: false)
            let allFieldsOk = true;
            fieldKeys.forEach((key) => {
                fields[key].touched = true;
                const ok = render(key, false);
                if (!ok) {
                    allFieldsOk = false;
                    if (wrappers[key]) {
                    shake(wrappers[key]);
                }
            }
            });

            // 필수 약관 검증
            const termsOk = syncTerms();
            if (!termsOk && termsBox) {
                termsBox.classList.add('is-invalid');
                shake(termsBox);
            }

            if (!allFieldsOk || !termsOk) return;
    
            // 제출 시뮬레이션
            setLoading(true);

            setTimeout(() => {
                setLoading(false);
                if (successMail) {
                    successMail.textContent = fields.email.el.value.trim();
                }
                if (formView) formView.hidden = true;
                if (successView) {
                    successView.hidden = false;
                    successView.scrollIntoView({ block: 'center', behavior: 'smooth' });
                }
            }, 1000);
        });
    }

    // 리셋 버튼
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            form?.reset();
            fieldKeys.forEach((key) => {
                fields[key].touched = false;
                wrappers[key]?.classList.remove('is-valid', 'is-invalid');
                if (fields[key].msg) fields[key].msg.textContent = DEFAULT_MSG[key];
            });
            paintPassword('', { strength, strengthLbl, ruleList });
            termsBox?.classList.remove('is-invalid');
            if (successView) successView.hidden = true;
            if (formView) formView.hidden = false;
        });
    }


    /* -- 테마 전환 -- */
    const themeDots = Array.prototype.slice.call(document.querySelectorAll('.theme-switch .dot'));
    themeDots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            const theme = dot.getAttribute('data-theme-set');
            document.documentElement.setAttribute('data-theme', theme);
            themeDots.forEach((d) => d.setAttribute('aria-pressed', String(d === dot)));
            
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
    paintPassword('', { strength, strengthLbl, ruleList });
    syncTerms();
    });
})();
        
