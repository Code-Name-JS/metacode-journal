/* TypeScript reference implementation for the login form.
   This is a source version; compile it with your project's TypeScript setup. */

type MessageKind = "" | "error" | "success";

const getElement = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Required element not found: ${selector}`);
  return element;
};

const setMessage = (text: string, kind: MessageKind = ""): void => {
  const message = getElement<HTMLParagraphElement>("#form-message");
  message.textContent = text;
  message.className = `form-message ${kind}`.trim();
};

document.addEventListener("DOMContentLoaded", (): void => {
  const form = getElement<HTMLFormElement>("#login-form");
  const email = getElement<HTMLInputElement>("#email");
  const password = getElement<HTMLInputElement>("#password");
  const emailError = getElement<HTMLElement>("#email-error");
  const passwordError = getElement<HTMLElement>("#password-error");
  const loginButton = getElement<HTMLButtonElement>("#login-button");
  const passwordToggle = getElement<HTMLButtonElement>("#password-toggle");
  const themeToggle = getElement<HTMLButtonElement>("#theme-toggle");

  passwordToggle.addEventListener("click", (): void => {
    const reveal = password.type === "password";
    password.type = reveal ? "text" : "password";
    passwordToggle.setAttribute("aria-label", reveal ? "비밀번호 숨기기" : "비밀번호 표시");
    passwordToggle.innerHTML = `<i data-lucide="${reveal ? "eye-off" : "eye"}"></i>`;
    window.lucide?.createIcons();
  });

  themeToggle.addEventListener("click", (): void => {
    document.body.classList.toggle("dark");
    const dark = document.body.classList.contains("dark");
    themeToggle.setAttribute("aria-label", dark ? "라이트 모드 전환" : "다크 모드 전환");
    themeToggle.innerHTML = `<i data-lucide="${dark ? "sun" : "moon"}"></i>`;
    window.lucide?.createIcons();
  });

  form.addEventListener("submit", async (event: SubmitEvent): Promise<void> => {
    event.preventDefault();
    emailError.textContent = "";
    passwordError.textContent = "";
    setMessage("");

    let valid = true;
    if (!email.value.trim()) {
      emailError.textContent = "이메일 또는 사용자명을 입력해주세요.";
      valid = false;
    }
    if (!password.value) {
      passwordError.textContent = "비밀번호를 입력해주세요.";
      valid = false;
    } else if (password.value.length < 8) {
      passwordError.textContent = "비밀번호는 8자 이상 입력해주세요.";
      valid = false;
    }

    if (!valid) {
      setMessage("입력 항목을 확인해주세요.", "error");
      return;
    }

    // Demo only. Call your backend here; never validate real credentials in the browser.
    loginButton.disabled = true;
    loginButton.querySelector("span")!.textContent = "확인 중...";
    await new Promise<void>((resolve) => window.setTimeout(resolve, 650));
    loginButton.disabled = false;
    loginButton.querySelector("span")!.textContent = "로그인";
    setMessage("입력 형식이 확인되었습니다. 실제 로그인은 인증 API 연결 후 사용할 수 있습니다.", "success");
  });
});

// For the lucide CDN script in index.html:
declare global {
  interface Window {
    lucide?: { createIcons: () => void };
  }
}
