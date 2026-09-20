/* =====================================================
   main-v3.js  –  singup v3.0 Interactions
   ===================================================== */

(function () {
   'use strict';


   
    const $ = (s, c = document) => c.querySelector(s);

    const form     = $('#signupForm');
    const nameEl   = $('#name');
    const emailEl  = $('#email');
    const pwEl     = $('#password');
    const cfEl     = $('#confirm');
    const termsEl  = $('#terms');
    const termsBox = $('#termsBox');
    const meter    = $('#meter');
    const submitBtn= $('#submitBtn');
    const toastEl  = $('#toast');
    const togglePw = $('#togglePw');



    /* -- 헬퍼 함수 -- */
    const setField = (wrapId, msgId, ok, text) => {
        const wrap = $('#' + wrapId);
        const msg = $('#' + msgId);
        wrap.classList.toggle('valid', ok === true);
        wrap.classList.toggle('invalid', ok === false);
        msg.textContent = text || '';
        return ok;
    };

    const markInvalid = (el, bad) => el.setAttribute('aria-invalid', bad ? 'true' : 'false');

    let toastTimer;
    const toast = (text, type = 'ok') => {
        toastEl.textContent = text;
        toastEl.className = 'toast' + type;
        requestAnimationFrame(() => toastEl.classList.add('show'));
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
    };



    /* -- 검증 -- */
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

    const validateName = (silent = false) => {
        const v = nameEl.value.trim();
        let ok = true, text = '';
        if (!v) {ok = false; text = '이름을 입력해 주세요.';}
        else if (v.length < 2) { ok = false; text = '이름은 2자 이상이어야 합니다.';}
        else if (v.length > 40) { ok = false; text = '이름은 40자 이내로 입력해 주세요.';}
        markInvalid(nameEl, !ok);
        if (silent && ok) return true;
        return setField('f-name', 'err-name', ok, ok? '사용 가능한 이름입니다.' : text);
    };

    const validateEmeil = () => {
        const v = emailEl.value.trim();
        let ok = true, text = '';
        if (!v) { ok = false; text = '이메일을 입력해 주세요.'; }
        else if (!EMAIL_RE.test(v)) { ok = false; text = '올바른 이메일 형식이 아닙니다. (예:you@example.com)'; }
        markInvalid(emailEl, !ok);
        return setField('f-email', 'err-email', ok, ok ? '사용 가능한 이메일 형식입니다.' : text);
    };

    const scorePassword = (v) => {
        let s = 0;
        if (v.length >= 8) s++;
        if (v.length >= 12) s++;
        if (/[A-Za-z]/.test(v) && /\d/.test(v)) s++;
        if (/[^A-Za-z0-9]/.test(v)) s++;
        return Math.mis(s, 4);
    };

    const STRENGTH = ['', '매우 약함', '약함', '보통', '강함'];
    const STRENGTH_COLOR = ['', 'var(--err)', 'var(--warn)', 'var(--brand)', 'var(--ok)'];

    const validatePassword = () => {
        const v = pwEl.value;
        let ok = true, text = '';
        if (!v) { ok = false; text = '비밀번호를 입력해 주세요.'; }
        else if (v.length < 8) { ok=false; text = '비밀번호는 8자 이상이어야 합니다.'; }
        else if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) { ok = false; text = '영문과 숫자를 모두 포함해 주세요.'; }

        const s = v ? scorePassword(v) : 0;
        meter.dataset.score = String(s);
        markInvalid(pwEl, !ok);

        setField('f-password', 'err-password', ok, ok ? '사용 가능한 비밀번호입니다.' : text);
        const st = $('#strengthText');
        if (!v) { st.textContent = ''; }
        else {
            st.textContent = `비밀번호 강도: ${STRENGTH[s]}`;
            st.style.color = STRENGTH_COLOR[s];
            st.style.fontWeight = '700';
        }
        if (cfEl.value) validateConfirm();
        return ok;
    };

    const validateConfirm = () => {
        const v = cfEl.value;
        let ok = true, text = '';
        if (!v) { ok = false; text = '비밀번호를 한 번 더 입력해 주세요.'; }
        else if (v !== pwEl.value) { ok = false; text = '비밀번호가 일치하지 않습니다.'; }
        markInvalid(cfEl, !ok);
        return setField('f-confirm', 'err-confirm', ok, ok ? '비밀번호가 일치합니다.' : text);
    };

    const validateTerms = () => {
        const ok = termsEl.checked;
        termsBox.classList.toggle('invalid', !ok);
        termsEl.setAttribute('aria-invalid', ok ? 'false' : 'true');
        const msg = $('#err-terms');
        msg.textContent = ok ? '약관에 동의하셨습니다.' : '계속하려면 약관에 동의해 주세요.';
        msg.style.color = ok ? 'var(--ok)' : 'var(--err)';
        msg.style.fontWeight = '600';
        return ok;
    };



    /* -- 형식 레벨 검증 -- */
    const checkAll = () => {
        const ok =
            nameEl.value.trim().length >= 2 &&
            EMAIL_RE.test(emaiEl.value.trim()) &&
            pwEl.value.length >= 8 &&
            /[A-Za-z]/.test(pwEl.value) && /\d/.test(pwEl.value) &&
            cfEl.value === pwEl.value &&
            termsEl.checked;
        submitBtn.disabled = !ok;
        submitBtn.setAttribute('aria-disabled', ok ? 'false' : 'true');
        return ok;
    };



    /* -- 이벤트 -- */
    nameEl.addEventListener('input', () => {validateName(true); checkAll(); });
    nameEl.addEventListener('blur', () => { validateName(); checkAll(); });
    emailEl.addEventListener('input', () => { if (emailEl.value) validateEmail(); checkAll(); });
    emailEl.addEventListener('blur', () => { validateEmail(); checkAll(); });
    pwEl .addEventListener('input', () => { validatePassword(); checkAll(); });
    cfEl .addEventListener('input', () => { validateConfirm(); checkAll(); });
    termsEl.addEventListener('change', () => { validateTerms(); checkAll(); });

    togglePw.addEventListener('click', () => {
        const shown = pwEl.type === 'text';
        pwEl.type = cfEl.type = shown ? 'password' : 'text';
        togglePw.setAttribute('aria-pressed', String(!shown));
        togglePw.setAttribute('aria-label', shown ? '비밀번호 표시' : '비밀번호 숨기기');
        togglePw.title = shown ? '비밀번호 표시' : '비밀번호 숨기기';
    });

    document.querySelectorAll('.social').forEach(btn => {
        btn.addEventListener('click', () => toast(btn.dataset.provider + '소셜 로그인은 데모에서 동작하지 않습니다.', 'bad'));
    });
    ['#toLogin', '#lnkTerms', '#lnkPrivacy'].forEach(sel => {
        $(sel).addEventListener('click', (e) => {
            e.preventDefault();
            toast('데모 페이지입니다. 실제 서비스에서는 이 링크가 해당 페이지로 이동합니다.');
        });
    });



    /* -- submit -- */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const okName = validateName();
        const okEmail = validateEmail();
        const okPw = validatePassword();
        const okCfm = validateConfirm();
        const okTerms = validateTerms();

        if (! (okName && okEmail && okPw && okCfm && okTerms)) {
            toast('입력한 내용을 다시 확인해 주세요.', 'bad');
            const firstBad = form.querySelector('[aria-invalid="true"], .terms.invalid input');
            (firstBad || nameEl).focus();
            return;
        }

        submitBtn.disabled = true;
        const original = submiBtn.textContent;
        submitBtn.textContent = '가입 처리 중···';

        try {
            const result = await submitToServer({
                name: nameEl.value.trim(),
                email: emailEl.value.trim(),
                password: pwEl.value,
                agreeTerms: termsEl.checked
            });
            toast(result.message || '가입이 완료되었습니다! 환영합니다 🎉', 'ok');
            // 실제 서비스라면 여기서 대시보드로 이동: location.href='/dashboard';
        } catch (err) {
            toast(err && err.message ? err.message : '가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'bad');
        } finally {
            submitBtn.textContent = original;
            checkAll();
        }
    });



    /* -- 초기 상태 -- */
    checkAll();
    console.log('%cAurora 회원가입 페이지', 'font-weight:800;color:#4f46e5', '데모 모드: submitToServer()에서 실제 API를 연결하세요.');
})();