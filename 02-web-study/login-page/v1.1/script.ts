/* =====================================================
   script.ts  –  Login v1.1 (LOGIN-01) 상태 보드 Interactions
   빌드: npx tsc -p 02-web-study/login-page/v1.1  →  script.js 생성
   ===================================================== */

(function () {



    /* ==================================================
       타입 정의
       ================================================== */
    // 설계도 상태 보드의 화면 유형 이름과 같음 → [연결①] HTML body data-state / CSS [data-state="..."]
    type ScreenState = 'A' | 'B-1' | 'B-2' | 'C-1' | 'C-2';

    interface DemoAccount {
        email: string;
        password: string;
    }



    /* ==================================================
       설정값 (설계도 명세 ④ ⑧)
       ================================================== */
    // ④ 판단 기준: 서버가 없으므로 미리 정한 테스트 계정과 비교
    const DEMO_ACCOUNT: DemoAccount = { email: 'demo@myapp.com', password: 'demo1234' };
    const MIN_PASSWORD_LENGTH = 8;                                // ④ B-1: 8자 미만이면 에러
    const DONE_DELAY = 2000;                                      // ⑧ C-1 → C-2 자동 전환: 2초 후
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

    const form          = $<HTMLFormElement>('loginForm');        // [연결②] id="loginForm"
    const email         = $<HTMLInputElement>('email');
    const password      = $<HTMLInputElement>('password');
    const emailField    = $<HTMLDivElement>('emailField');        // [연결③] CSS .field.is-invalid
    const passwordField = $<HTMLDivElement>('passwordField');
    const emailError    = $<HTMLParagraphElement>('emailError');
    const passwordError = $<HTMLParagraphElement>('passwordError');
    const formError     = $<HTMLParagraphElement>('formError');   // B-2 공통 에러 바
    const eyeBtn        = $<HTMLButtonElement>('eyeBtn');         // [연결④] aria-pressed → CSS 아이콘 교체
    const remember      = $<HTMLInputElement>('rememberMe');      // [연결⑤] 체크박스
    const findPwLink    = $<HTMLAnchorElement>('findPwLink');
    const loginBtn      = $<HTMLButtonElement>('loginBtn');       // [연결⑥] disabled
    const signUpBtn     = $<HTMLButtonElement>('signUpBtn');      // [연결⑦]
    const homeLink      = $<HTMLAnchorElement>('homeLink');       // [연결⑧]
    const toast         = $<HTMLDivElement>('toast');             // [연결⑨] CSS .toast.show

    let toastTimer: number | undefined;



    /* ==================================================
       화면 상태 바꾸기 (A · B-1 · B-2 · C-1 · C-2)
       ================================================== */
    function setState(state: ScreenState): void {
        document.body.dataset.state = state;                      // [연결①] body data-state → CSS가 화면을 바꿈
    }

    function getState(): ScreenState {
        return (document.body.dataset.state ?? 'A') as ScreenState;
    }



    /* ==================================================
       ④ B-1 칸별 에러
       ================================================== */
    function setFieldError(field: HTMLElement, errEl: HTMLElement, msg: string | null): void {
        const input = field.querySelector('input');

        if (msg) {
            field.classList.add('is-invalid');                    // [연결③] CSS .field.is-invalid .error-bar
            errEl.textContent = msg;
            input?.setAttribute('aria-invalid', 'true');
        } else {
            field.classList.remove('is-invalid');
            errEl.textContent = '';
            input?.removeAttribute('aria-invalid');
        }
    }

    // 빈칸 → 이메일 형식 순서로 검사. 에러 문구를 돌려주고, 통과하면 null
    function checkEmail(value: string): string | null {
        if (!value) return '이메일을 입력해 주세요.';
        if (!EMAIL_RE.test(value)) return '올바른 이메일 형식이 아닙니다.';
        return null;
    }

    // 빈칸 → 8자 미만 순서로 검사
    function checkPassword(value: string): string | null {
        if (!value) return '비밀번호를 입력해 주세요.';
        if (value.length < MIN_PASSWORD_LENGTH) return `비밀번호를 ${MIN_PASSWORD_LENGTH}자 이상으로 작성해 주세요.`;
        return null;
    }

    // 다시 입력하면: 그 칸의 에러만 지우고, 남은 에러가 없으면 A로 돌아감
    function clearOnInput(field: HTMLElement, errEl: HTMLElement): void {
        if (getState() === 'C-1') return;

        if (field.classList.contains('is-invalid')) setFieldError(field, errEl, null);
        formError.textContent = '';

        const stillInvalid = emailField.classList.contains('is-invalid')
                          || passwordField.classList.contains('is-invalid');
        setState(stillInvalid ? 'B-1' : 'A');
    }

    email.addEventListener('input', () => clearOnInput(emailField, emailError));
    password.addEventListener('input', () => clearOnInput(passwordField, passwordError));



    /* ==================================================
       ③ 눈 아이콘: password ↔ text
       ================================================== */
    eyeBtn.addEventListener('click', () => {
        const show = password.type === 'password';

        password.type = show ? 'text' : 'password';
        eyeBtn.setAttribute('aria-pressed', String(show));        // [연결④] CSS [aria-pressed="true"]
        eyeBtn.setAttribute('aria-label', show ? '비밀번호 숨기기' : '비밀번호 표시');
        password.focus();
    });



    /* ==================================================
       ⑥ 로그인 버튼 시스템 (클릭 · Enter 모두 submit 이벤트로 들어옴)
       Enter → 검사 → B-1 / B-2 / C-1
       ================================================== */
    function isDemoAccount(account: DemoAccount): boolean {
        // 이메일은 대소문자를 구분하지 않고, 비밀번호는 정확히 같아야 함
        return account.email.toLowerCase() === DEMO_ACCOUNT.email.toLowerCase()
            && account.password === DEMO_ACCOUNT.password;
    }

    form.addEventListener('submit', (e: SubmitEvent) => {        // [연결②] type="submit" 버튼 · Enter
        e.preventDefault();
        if (getState() === 'C-1') return;                         // 성공 후에는 다시 제출하지 않음

        const emailValue = email.value.trim();
        const passwordValue = password.value;

        // 1) 형식 검사 → B-1 (칸별)
        const emailMsg = checkEmail(emailValue);
        const passwordMsg = checkPassword(passwordValue);
        setFieldError(emailField, emailError, emailMsg);
        setFieldError(passwordField, passwordError, passwordMsg);
        formError.textContent = '';

        if (emailMsg || passwordMsg) {
            setState('B-1');
            (emailMsg ? email : password).focus();                // 첫 번째로 틀린 칸으로 이동
            return;
        }

        // 2) 테스트 계정과 비교 → B-2 (공통 한 줄)
        if (!isDemoAccount({ email: emailValue, password: passwordValue })) {
            formError.textContent = '이메일 또는 비밀번호가 일치하지 않습니다.';
            setState('B-2');                                      // [연결①] CSS [data-state="B-2"] .form-error
            password.select();
            return;
        }

        // 3) 성공 → C-1: 초록 + "✓ 로그인 성공" + 클릭 막기
        setState('C-1');                                          // [연결①] CSS [data-state="C-1"] .btn-primary
        loginBtn.disabled = true;                                 // [연결⑥] 클릭 · Enter 모두 막힘

        // ⑧ 2초 후 C-2 완료 화면으로 자동 전환
        window.setTimeout(() => {
            setState('C-2');                                      // [연결①] CSS [data-state="C-2"] 카드 숨김 · 완료 화면 표시
            homeLink.focus();
        }, DONE_DELAY);
    });



    /* ==================================================
       ⑤ ⑦ ⑧ 부가 기능 · 회원가입 · 홈페이지 → "준비중" 안내
       ================================================== */
    function showToast(msg: string): void {
        toast.textContent = msg;
        toast.classList.add('show');                              // [연결⑨] CSS .toast.show
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
    }

    // 로그인 상태 유지: v1.1에서는 기능이 없으므로 안내 후 체크를 되돌림
    remember.addEventListener('change', () => {                   // [연결⑤]
        if (!remember.checked) return;
        showToast('로그인 상태 유지는 준비중입니다.');
        remember.checked = false;
    });

    findPwLink.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault();
        showToast('비밀번호 찾기는 준비중입니다.');
    });

    signUpBtn.addEventListener('click', () => {                   // [연결⑦]
        showToast('회원가입은 준비중입니다.');
    });

    homeLink.addEventListener('click', (e: MouseEvent) => {       // [연결⑧] 이동 위치가 정해지기 전까지 안내만
        e.preventDefault();
        showToast('홈페이지는 준비중입니다.');
    });


})();
