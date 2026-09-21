/* =====================================================
   main-v3.js  –  singup v3.0 Interactions
   ===================================================== */

(function () {
   'use strict';


   
    /* -- 유틸리티 함수의 규칙 -- */
    const $ = (s, c = document) => c.querySelector(s);



    /* -- index.html 문서 요소 탐색 -- */
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
    /* setField: wrapId와 errId(안내 문구 ID)를 받아 UI 상태를 업데이트 */
    const setField = (wrapId, errId, ok, text) => {
        const wrap = $('#' + wrapId);
        const msg = $('#' + errId) || (wrap ? $('.msg', wrap) : null);

        if (wrap) {
            wrap.classList.toggle('valid', ok === true);
            wrap.classList.toggle('invalid', ok === false);
        }
        if (msg) {
            msg.textContent = text || '';
        }

        return ok;
    };

    /* 특정 DOM요소의 입력 유효성 상태(오류 여부)를 웹 접근성 표준 속성(aria-invalid)으로 표시하거나 해제하는 기능 수행 */
    const markInvalid = (el, bad) => {
        if (!el) return;
        bad ? el.setAttribute('aria-invalid', 'true') : el.removeAttribute('aria-invalid');
    };

    /* Toast 팝업 UI 표시 함수 */
    let toastTimer;
    const toast = (text, type = 'ok') => {
        if (!toastEl) return;
        toastEl.textContent = text;
        toastEl.className = 'toast ' + type;
        requestAnimationFrame(() => toastEl.classList.add('show'));
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
    };

    /* 데모용 서버 통신 모의 함수 */
    const submitToServer = (data) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: `${data.name}님, 가입이 완료되었습니다! 환영합니다 🎉` });
            }, 1000);
        });
    };



    /* -- 유효성 검증 함수 -- */
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

    const validateName = (silent = false) => {
        const v = nameEl ? nameEl.value.trim() : '';
        let ok = true, text = '';
        if (!v) { ok = false; text = '이름을 입력해 주세요.'; }
        else if (v.length < 2) { ok = false; text = '이름은 2자 이상이어야 합니다.'; }
        else if (v.length > 40) { ok = false; text = '이름은 40자 이내로 입력해 주세요.'; }

        markInvalid(nameEl, !ok);
        if (silent && ok) return true;
        return setField('f-name', 'err-name', ok, ok ? '사용 가능한 이름입니다.' : text);
    };

    const validateEmail = () => {
        const v = emailEl ? emailEl.value.trim() : '';
        let ok = true, text = '';
        if (!v) { ok = false; text = '이메일을 입력해 주세요.'; }
        else if (!EMAIL_RE.test(v)) { ok = false; text = '올바른 이메일 형식이 아닙니다. (예: you@example.com)'; }

        markInvalid(emailEl, !ok);
        return setField('f-email', 'err-email', ok, ok ? '사용 가능한 이메일 형식입니다.' : text);
    };

    const scorePassword = (v) => {
        let s = 0;
        if (v.length >= 8) s++;
        if (v.length >= 12) s++;
        if (/[A-Za-z]/.test(v) && /\d/.test(v)) s++;
        if (/[^A-Za-z0-9]/.test(v)) s++;
        return Math.min(s, 4);
    };

    const STRENGTH = ['', '매우 약함', '약함', '보통', '강함'];
    const STRENGTH_COLOR = ['', 'var(--err)', 'var(--warn)', 'var(--brand)', 'var(--ok)'];

    const validatePassword = () => {
        const v = pwEl ? pwEl.value : '';
        let ok = true, text = '';
        if (!v) { ok = false; text = '비밀번호를 입력해 주세요.'; }
        else if (v.length < 8) { ok = false; text = '비밀번호는 8자 이상이어야 합니다.'; }
        else if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) { ok = false; text = '영문과 숫자를 모두 포함해 주세요.'; }

        const s = v ? scorePassword(v) : 0;
        if (meter) meter.dataset.score = String(s);
        markInvalid(pwEl, !ok);

        setField('f-password', 'err-password', ok, ok ? '사용 가능한 비밀번호입니다.' : text);

        const st = $('#strengthText');
        if (st) {
            if (!v) {
                st.textContent = '';
            } else {
                st.textContent = `비밀번호 강도: ${STRENGTH[s]}`;
                st.style.color = STRENGTH_COLOR[s];
                st.style.fontWeight = '700';
            }
        }

        if (cfEl && cfEl.value) validateConfirm();
        return ok;
    };

    const validateConfirm = () => {
        const v = cfEl ? cfEl.value : '';
        let ok = true, text = '';
        if (!v) { ok = false; text = '비밀번호를 한 번 더 입력해 주세요.'; }
        else if (pwEl && v !== pwEl.value) { ok = false; text = '비밀번호가 일치하지 않습니다.'; }

        markInvalid(cfEl, !ok);
        return setField('f-confirm', 'err-confirm', ok, ok ? '비밀번호가 일치합니다.' : text);
    };

    const validateTerms = () => {
        if (!termsEl) return false;
        const ok = termsEl.checked;
        if (termsBox) termsBox.classList.toggle('invalid', !ok);
        termsEl.setAttribute('aria-invalid', ok ? 'false' : 'true');

        const msg = $('#err-terms');
        if (msg) {
            msg.textContent = ok ? '약관에 동의하셨습니다.' : '계속하려면 약관에 동의해 주세요.';
            msg.style.color = ok ? 'var(--ok)' : 'var(--err)';
            msg.style.fontWeight = '600';
        }
        return ok;
    };



    /* -- 전체 입력 폼 상태 및 가입 버튼 활성화 검증 -- */
    const checkAll = () => {
        if (!nameEl || !emailEl || !pwEl || !cfEl || !termsEl || !submitBtn) return false;

        const isNameValid = nameEl.value.trim().length >= 2 && nameEl.value.trim().length <= 40;
        const isEmailValid = EMAIL_RE.test(emailEl.value.trim()); // emaiEl 오타 수정
        const isPwValid = pwEl.value.length >= 8 && /[A-Za-z]/.test(pwEl.value) && /\d/.test(pwEl.value);
        const isCfValid = cfEl.value.length > 0 && cfEl.value === pwEl.value;
        const isTermsValid = termsEl.checked;

        const ok = isNameValid && isEmailValid && isPwValid && isCfValid && isTermsValid;
        submitBtn.disabled = !ok;
        submitBtn.setAttribute('aria-disabled', ok ? 'false' : 'true');
        return ok;
    };



    /* -- 이벤트 등록 -- */
    nameEl?.addEventListener('input', () => { validateName(true); checkAll(); });
    nameEl?.addEventListener('blur', () => { validateName(); checkAll(); });

    emailEl?.addEventListener('input', () => { if (emailEl.value) validateEmail(); checkAll(); });
    emailEl?.addEventListener('blur', () => { validateEmail(); checkAll(); });

    pwEl?.addEventListener('input', () => { validatePassword(); checkAll(); });
    cfEl?.addEventListener('input', () => { validateConfirm(); checkAll(); });
    termsEl?.addEventListener('change', () => { validateTerms(); checkAll(); });

    if (togglePw) {
        togglePw.addEventListener('click', () => {
            const shown = pwEl.type === 'text';
            pwEl.type = cfEl.type = shown ? 'password' : 'text';
            togglePw.setAttribute('aria-pressed', String(!shown));
            togglePw.setAttribute('aria-label', shown ? '비밀번호 표시' : '비밀번호 숨기기');
            togglePw.title = shown ? '비밀번호 표시' : '비밀번호 숨기기';
        });
    }

    document.querySelectorAll('.social').forEach(btn => {
        btn.addEventListener('click', () => toast(`${btn.dataset.provider} 소셜 로그인은 데모에서 동작하지 않습니다.`, 'bad'));
    });

    ['#toLogin', '#lnkTerms', '#lnkPrivacy'].forEach(sel => {
        const el = $(sel);
        if (el) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                toast('데모 페이지입니다. 실제 서비스에서는 이 링크가 해당 페이지로 이동합니다.');
            });
        }
    });



    /* -- 폼 제출 (Submit) -- */
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const okName = validateName();
            const okEmail = validateEmail();
            const okPw = validatePassword();
            const okCfm = validateConfirm();
            const okTerms = validateTerms();

            if (!(okName && okEmail && okPw && okCfm && okTerms)) {
                toast('입력한 내용을 다시 확인해 주세요.', 'bad');
                const firstBad = form.querySelector('[aria-invalid="true"], .terms.invalid input');
                (firstBad || nameEl)?.focus();
                return;
            }

            submitBtn.disabled = true;
            const original = submitBtn.textContent; // submiBtn 오타 수정
            submitBtn.textContent = '가입 처리 중···';

            try {
                const result = await submitToServer({
                    name: nameEl.value.trim(),
                    email: emailEl.value.trim(),
                    password: pwEl.value,
                    agreeTerms: termsEl.checked
                });
                toast(result.message || '가입이 완료되었습니다! 환영합니다 🎉', 'ok');
            } catch (err) {
                toast(err && err.message ? err.message : '가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'bad');
            } finally {
                submitBtn.textContent = original;
                checkAll();
            }
        });
    }



    /* -- 초기 상태 실행 -- */
    checkAll();
    console.log('%cAurora 회원가입 페이지', 'font-weight:800;color:#4f46e5', '정상적으로 스크립트가 로드되었습니다.');
})();