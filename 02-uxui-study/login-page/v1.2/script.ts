/* =====================================================
   script.ts  –  Login Modal v1.2 (LOGIN-02) Interactions
   빌드: npx tsc -p 02-web-study/login-page/v1.2  →  script.js 생성
   ===================================================== */

(function () {



    /* ==================================================
       타입 정의
       ================================================== */
    type Provider = 'Google' | 'GitHub';                          // [연결⑨] HTML data-provider 값과 같아야 함

    interface DemoAccount {
        email: string;
        password: string;
    }



    /* ==================================================
       설정값
       ================================================== */
    // 서버(인증 API)가 없으므로 미리 정한 데모 계정 목록과 비교해서 성공/실패를 흉내 냄
    // 테스트 계정을 늘리려면 이 배열에 { email, password }를 추가
    const DEMO_ACCOUNTS: readonly DemoAccount[] = [
        { email: 'demo@myapp.com',   password: 'demo1234' },
        { email: 'test@example.com', password: 'test5678' },
    ];
    const FAKE_API_DELAY = 1200;                                  // 로딩 스피너를 보여줄 시간(ms)
    const CLOSE_ON_DIMMED = true;                                 // 설계도: dimmed 영역 클릭 시 닫힘 = true
    const REMEMBER_KEY = 'login-v1.2:remember-email';
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



    /* ==================================================
       요소 찾기
       ================================================== */
    // 요소를 못 찾으면 null 대신 바로 에러를 던짐 → id 오타를 콘솔에서 즉시 확인 가능
    function $<T extends HTMLElement>(id: string): T {
        const el = document.getElementById(id);
        if (!el) throw new Error(`#${id} 요소를 찾을 수 없습니다. index.html의 id를 확인하세요.`);
        return el as T;
    }

    const overlay       = $<HTMLDivElement>('loginOverlay');      // [연결①] id="loginOverlay" → [연결②] CSS .is-open
    const openBtn       = $<HTMLButtonElement>('openModalBtn');   // [연결①] id="openModalBtn"
    const closeBtn      = $<HTMLButtonElement>('closeModalBtn');  // [연결③] id="closeModalBtn"
    const form          = $<HTMLFormElement>('loginForm');        // [연결④] id="loginForm"
    const email         = $<HTMLInputElement>('email');
    const password      = $<HTMLInputElement>('password');
    const emailField    = $<HTMLDivElement>('emailField');        // [연결⑤] CSS .field.is-invalid
    const passwordField = $<HTMLDivElement>('passwordField');
    const emailError    = $<HTMLParagraphElement>('emailError');
    const passwordError = $<HTMLParagraphElement>('passwordError');
    const eyeBtn        = $<HTMLButtonElement>('eyeBtn');         // [연결⑥] aria-pressed → CSS 아이콘 교체
    const remember      = $<HTMLInputElement>('rememberMe');      // [연결⑦] 체크박스
    const formError     = $<HTMLParagraphElement>('formError');
    const loginBtn      = $<HTMLButtonElement>('loginBtn');       // [연결⑧] disabled · .is-loading
    const findPwLink    = $<HTMLAnchorElement>('findPwLink');
    const signUpLink    = $<HTMLAnchorElement>('signUpLink');
    const toast         = $<HTMLDivElement>('toast');             // [연결⑩] CSS .toast.show
    const socialBtns    = document.querySelectorAll<HTMLButtonElement>('.btn-social[data-provider]');

    let toastTimer: number | undefined;
    let isLoading = false;



    /* ==================================================
       localStorage (실패해도 화면은 동작하도록 try/catch)
       ================================================== */
    function loadRemembered(): string | null {
        try { return localStorage.getItem(REMEMBER_KEY); } catch { return null; }
    }

    function saveRemembered(value: string | null): void {
        try {
            if (value) localStorage.setItem(REMEMBER_KEY, value);
            else localStorage.removeItem(REMEMBER_KEY);
        } catch { /* 저장 실패는 무시 */ }
    }



    /* ==================================================
       ① 모달 열기 / 닫기
       ================================================== */
    function openModal(): void {
        overlay.classList.add('is-open');                         // [연결②] CSS .overlay.is-open
        email.focus();
    }

    function closeModal(): void {
        if (isLoading) return;                                    // 로그인 처리 중에는 닫지 않음
        overlay.classList.remove('is-open');
        openBtn.focus();
    }

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);              // [연결③] 닫기(X) 클릭

    // dimmed 영역 클릭 → 닫힘 (모달 카드 안쪽 클릭은 e.target이 overlay가 아니므로 무시)
    overlay.addEventListener('click', (e: MouseEvent) => {
        if (CLOSE_ON_DIMMED && e.target === overlay) closeModal();
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
    });



    /* ==================================================
       ② ③ 에러 표시
       ================================================== */
    function setFieldError(field: HTMLElement, errEl: HTMLElement, msg: string | null): void {
        const input = field.querySelector('input');

        if (msg) {
            field.classList.add('is-invalid');                    // [연결⑤] CSS .field.is-invalid
            errEl.textContent = msg;
            input?.setAttribute('aria-invalid', 'true');
        } else {
            field.classList.remove('is-invalid');
            errEl.textContent = '';
            input?.removeAttribute('aria-invalid');
        }
    }

    // 이메일 정규식 검사 → 통과하면 true
    function validateEmail(): boolean {
        const value = email.value.trim();

        if (!EMAIL_RE.test(value)) {
            setFieldError(emailField, emailError, '올바른 이메일 형식을 입력해 주세요.');
            return false;
        }
        setFieldError(emailField, emailError, null);
        return true;
    }

    // 칸을 벗어날 때(blur) 검사 — 비어 있으면 아직 입력 전이므로 검사하지 않음
    email.addEventListener('blur', () => {
        if (email.value.trim()) validateEmail();
    });



    /* ==================================================
       ⑥ 로그인 버튼 활성화
       ================================================== */
    function updateLoginBtn(): void {
        const filled = email.value.trim() !== '' && password.value !== '';
        loginBtn.disabled = !filled || isLoading;                 // [연결⑧] CSS .btn-primary:disabled
    }

    // 입력할 때마다: 에러 지우기 + 버튼 상태 갱신
    email.addEventListener('input', () => {
        if (emailField.classList.contains('is-invalid')) setFieldError(emailField, emailError, null);
        formError.textContent = '';
        updateLoginBtn();
    });

    password.addEventListener('input', () => {
        if (passwordField.classList.contains('is-invalid')) setFieldError(passwordField, passwordError, null);
        formError.textContent = '';
        updateLoginBtn();
    });



    /* ==================================================
       ③ 비밀번호 표시 / 숨김 토글
       ================================================== */
    eyeBtn.addEventListener('click', () => {
        const show = password.type === 'password';

        password.type = show ? 'text' : 'password';
        eyeBtn.setAttribute('aria-pressed', String(show));        // [연결⑥] CSS [aria-pressed="true"]
        eyeBtn.setAttribute('aria-label', show ? '비밀번호 숨기기' : '비밀번호 표시');
        password.focus();
    });



    /* ==================================================
       ⑥ 로그인 제출 (클릭 · Enter 모두 submit 이벤트로 들어옴)
       ================================================== */
    function setLoading(on: boolean): void {
        isLoading = on;
        loginBtn.classList.toggle('is-loading', on);              // [연결⑧] CSS .btn-primary.is-loading
        loginBtn.setAttribute('aria-busy', String(on));
        updateLoginBtn();                                         // 로딩 중에는 disabled → 중복 클릭 방지
    }

    // 인증 API 대신: 일정 시간 기다린 뒤 데모 계정 목록 중 하나라도 일치하는지 확인
    // 이메일은 대소문자를 구분하지 않고, 비밀번호는 정확히 같아야 함
    function fakeLoginApi(account: DemoAccount): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const inputEmail = account.email.toLowerCase();
                resolve(DEMO_ACCOUNTS.some((demo) =>
                    demo.email.toLowerCase() === inputEmail && demo.password === account.password
                ));
            }, FAKE_API_DELAY);
        });
    }

    form.addEventListener('submit', async (e: SubmitEvent) => {   // [연결④] type="submit" 버튼 · Enter
        e.preventDefault();
        if (isLoading) return;

        formError.textContent = '';
        if (!validateEmail()) {
            email.focus();
            return;
        }

        setLoading(true);
        const ok = await fakeLoginApi({ email: email.value.trim(), password: password.value });
        setLoading(false);

        if (!ok) {
            formError.textContent = '이메일 또는 비밀번호가 일치하지 않습니다.';
            password.select();
            return;
        }

        // ④ 로그인 상태 유지: 서버가 없으므로 이메일만 기억해 다음에 자동으로 채움
        saveRemembered(remember.checked ? email.value.trim() : null);  // [연결⑦] checked 읽기

        showToast('로그인되었습니다.');
        form.reset();
        if (remember.checked) email.value = loadRemembered() ?? '';
        updateLoginBtn();
        closeModal();
    });



    /* ==================================================
       ⑤ ⑦ ⑧ 링크 · 소셜 로그인 → 토스트 안내
       ================================================== */
    function showToast(msg: string): void {
        toast.textContent = msg;
        toast.classList.add('show');                              // [연결⑩] CSS .toast.show
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
    }

    socialBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const provider = btn.dataset.provider as Provider;    // [연결⑨] data-provider → dataset.provider
            showToast(`${provider} 로그인을 준비중입니다.`);
        });
    });

    findPwLink.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault();
        showToast('비밀번호 재설정은 준비중입니다.');
    });

    signUpLink.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault();
        showToast('회원가입은 준비중입니다.');
    });



    /* ==================================================
       시작
       ================================================== */
    const remembered = loadRemembered();
    if (remembered) {
        email.value = remembered;
        remember.checked = true;
    }
    updateLoginBtn();
    if (overlay.classList.contains('is-open')) email.focus();


})();
