/* Demo interaction layer. Connect this form to your real authentication API before production. */
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();

  const form = document.querySelector("#login-form");
  const email = document.querySelector("#email");
  const password = document.querySelector("#password");
  const emailError = document.querySelector("#email-error");
  const passwordError = document.querySelector("#password-error");
  const message = document.querySelector("#form-message");
  const loginButton = document.querySelector("#login-button");
  const passwordToggle = document.querySelector("#password-toggle");
  const themeToggle = document.querySelector("#theme-toggle");

  const setMessage = (text, kind = "") => {
    message.textContent = text;
    message.className = `form-message ${kind}`.trim();
  };

  passwordToggle?.addEventListener("click", () => {
    const isHidden = password.type === "password";
    password.type = isHidden ? "text" : "password";
    passwordToggle.setAttribute("aria-label", isHidden ? "비밀번호 숨기기" : "비밀번호 표시");
    passwordToggle.innerHTML = `<i data-lucide="${isHidden ? "eye-off" : "eye"}"></i>`;
    if (window.lucide) window.lucide.createIcons();
  });

  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const dark = document.body.classList.contains("dark");
    themeToggle.setAttribute("aria-label", dark ? "라이트 모드 전환" : "다크 모드 전환");
    themeToggle.innerHTML = `<i data-lucide="${dark ? "sun" : "moon"}"></i>`;
    if (window.lucide) window.lucide.createIcons();
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    emailError.textContent = "";
    passwordError.textContent = "";
    setMessage("");

    const emailValue = email.value.trim();
    const passwordValue = password.value;
    let valid = true;

    if (!emailValue) {
      emailError.textContent = "이메일 또는 사용자명을 입력해주세요.";
      valid = false;
    }
    if (!passwordValue) {
      passwordError.textContent = "비밀번호를 입력해주세요.";
      valid = false;
    } else if (passwordValue.length < 8) {
      passwordError.textContent = "비밀번호는 8자 이상 입력해주세요.";
      valid = false;
    }
    if (!valid) {
      setMessage("입력 항목을 확인해주세요.", "error");
      return;
    }

    // Demo only: no credentials are sent or stored. Replace with your backend API.
    loginButton.disabled = true;
    loginButton.querySelector("span").textContent = "확인 중...";
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    loginButton.disabled = false;
    loginButton.querySelector("span").textContent = "로그인";
    setMessage("입력 형식이 확인되었습니다. 실제 로그인은 인증 API 연결 후 사용할 수 있습니다.", "success");
  });

  document.querySelector("#google-login")?.addEventListener("click", () => {
    setMessage("Google 로그인을 사용하려면 OAuth 인증 설정이 필요합니다.");
  });
  document.querySelector("#forgot-link")?.addEventListener("click", (event) => {
    event.preventDefault();
    setMessage("비밀번호 재설정 페이지를 연결해주세요.");
  });
  document.querySelector("#signup-link")?.addEventListener("click", (event) => {
    event.preventDefault();
    setMessage("회원가입 페이지를 연결해주세요.");
  });
});
