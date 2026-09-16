/* =====================================================
   main-v1.js  –  singup v1.0 Interactions
   ===================================================== */

(function () {
   'use strict'


/* -- DOM 요소 -- */
const form = document.getElementById('signupForm');
const formView = document.getElementById('formView');
const successView = document.getElementById('successView');
const submitBtn = document.getElementById('submitBtn');
const succnessMail = document.getElementById('successEmail');
const termsBox = document.getElementById('terms');
const agreeAll = document.getElementById('agreeAll');
const termItems = Array.prototype.slice.call(document.querySelectorAll('.term-item'));
const strength = document.getElementById('strength');
const strengthLb1 = document.getElementById('strengthLabel');
const ruleList = document.getElementById('rules');

const fields = {
    name: { el: document.getElementById('name'), msg: document.getElementById('nameMsg'), touched: false },
    email: { el: document.getElementById('email'), msg: document.getElementById('emailMsg'), touched: false },
    password: { el: document.getElementById('password'), msg: document.getElementById('passwordMsg'), touched: false },
    confirm: { el: document.getElementById('confirm'), msg: document.getElementById('confirmMsg'), touched: false }
};
const wrappers = {};
Object.keys(fields).forEach(function (k) {
    wrappers[k] = form.querySelector('[data-field="' + k + '"]');
});

const DEFAULT_MSG = {};
Object.keys(fields).forEach(function (k) { DEFAULT_MSG[k] = fields[k].msg.textContent; });



/* -- 검증 규칙 -- */
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
    const n = (passed.len ? 1 : 0) + (passed.mix ? 1 : 0) + (passed.special ? 1 : 0);
    n += (v.length >= 12) ? 1 : 0;
    return { passed: passed, level: Math.min(n, 4) };
}

function checkPassword(v) {
    if (!v) return { ok: false, msg: '비밀번호를 입력해 주세요.' };
    const r = scorePassword(v);
    if (!r.passed.len) return { ok: false, msg: '8자 이상 입력해 주세요.' };
    if (!(r.passed.mix && r.passed.special)) return { ok: false, msg: '영문·숫자와 특수문자를 조합해 주세요.' };
    return { ok: true, msg: '안전한 비밀번호입니다.' };
}

function checkConfirm(v) {
    if (!v) return { ok: false, msg: '비밀번호를 한 번 더 입력해 주세요.' };
    if (v !== fields.password.el.value) return { ok: false, msg: '비밀번호가 일치하지 않습니다.' };
    return { ok: true, msg: '비밀번호가 일치합니다.' };
}

const VALIDATORS = {
    name: checkName,
    email: checkEmail,
    password: checkPassword,
    confirm: checkConfirm
};

const LEVEL_LABEL = { 0: '강도 —', 1: '매우 약함', 2: '보통', 3: '강함', 4: '매우 강함' };

function paintPassword(v) {
    const r = scorePassword(v);
    strength.setAttribute('data-level', v ? String(r.level) : '0');
    strengthLb1.textContent = v ? LEVEL_LABEL[r.level] : LEVEL_LABEL[0];
    Array.prototype.forEach.call(ruleList.children, function (li) {
        li.classList.toggle('met', !!r.passed[li.getAttribute('data-rule')]);
    });
}



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



/* -- 비밀번호 표시 토글 -- */
const toggleBtn = document.getElementById('togglePassword');
toggleBtn.addEventListener('click', function () {
    const on = toggleBtn.getAttribute('aria-pressed') === 'true';
    const next = !on;
    fields.password.el.type = next ? 'text' : 'password';
    toggleBtn.setAttribute('aria-pressed', String(next));
    toggleBtn.setAttribute('aria-label', next ? '비밀번호 숨기기' : '비밀번호 표시');
    toggleBtn.classList.toggle('is-on', next);
    fields.password.el.focus();
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
        succnessMail.textContent = fields.email.el.value.trim();
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
    var saved = window.localStorage.getItem('aurora-theme');
    if (saved) {
        var match = themeDots.filter(function (d) { return d.getAttribute('data-theme-set') === saved; })[0];
        if (match) match.click();
    }
} catch (err) { /* 무시 */}



/* -- 초기 상태 -- */
paintPassword('');
syncTerms();

})();
