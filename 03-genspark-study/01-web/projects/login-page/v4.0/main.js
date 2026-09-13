/* =====================================================
   main-v4.js  –  Login v4.0 Interactions
   ===================================================== */
console.log("main.js 연결 성공!");



//  ── 데모용 계정(실제 서비스에서는 서버 인증으로 대체) ──
const DEMO_ACCOUNTS = [
    {email:'demo@myapp.com', password:'demo1234'},
    {email:'test@example.com', password:'test5678'},
];



(function () {
    "use strict";

/* ---------- 테마 (다크모드) ---------- */
    var root = document.documentElement;
    var themeToggle = document.getElementById("themeToggle");

    function applyTheme(theme) {
      root.setAttribute("data-theme", theme);
      try { localStorage.setItem("nova-theme", theme); } catch (e) {}
    }

    var saved = null;
    try { saved = localStorage.getItem("nova-theme"); } catch (e) {}
    applyTheme(saved || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
    });

    /* ---------- 비밀번호 보기 토글 ---------- */
    var pwInput = document.getElementById("password");
    var togglePw = document.getElementById("togglePw");

    togglePw.addEventListener("click", function () {
      var showing = pwInput.type === "text";
      pwInput.type = showing ? "password" : "text";
      togglePw.classList.toggle("showing", !showing);
      togglePw.setAttribute("aria-pressed", String(!showing));
      togglePw.setAttribute("aria-label", showing ? "비밀번호 보기" : "비밀번호 숨기기");
      pwInput.focus();
    });

    /* ---------- 유효성 검사 ---------- */
    var form = document.getElementById("loginForm");
    var email = document.getElementById("email");
    var emailError = document.getElementById("emailError");
    var passwordError = document.getElementById("passwordError");
    var submitBtn = document.getElementById("submitBtn");

    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function showError(input, errorEl, message) {
      input.classList.add("has-error");
      errorEl.querySelector(".error-text").textContent = message;
      errorEl.classList.add("visible");
      input.setAttribute("aria-invalid", "true");
    }

    function clearError(input, errorEl) {
      input.classList.remove("has-error");
      errorEl.classList.remove("visible");
      input.removeAttribute("aria-invalid");
    }

    function validateEmail() {
      var value = email.value.trim();
      if (!value) { showError(email, emailError, "이메일을 입력해 주세요."); return false; }
      if (!EMAIL_RE.test(value)) { showError(email, emailError, "올바른 이메일 형식이 아닙니다."); return false; }
      clearError(email, emailError);
      return true;
    }

    function validatePassword() {
      var value = pwInput.value;
      if (!value) { showError(pwInput, passwordError, "비밀번호를 입력해 주세요."); return false; }
      if (value.length < 8) { showError(pwInput, passwordError, "비밀번호는 8자 이상이어야 합니다."); return false; }
      clearError(pwInput, passwordError);
      return true;
    }

    email.addEventListener("blur", validateEmail);
    email.addEventListener("input", function () { if (email.classList.contains("has-error")) validateEmail(); });
    pwInput.addEventListener("blur", validatePassword);
    pwInput.addEventListener("input", function () { if (pwInput.classList.contains("has-error")) validatePassword(); });

    /* ---------- 제출 (로딩 스피너 시뮬레이션) ---------- */
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var okEmail = validateEmail();
      var okPw = validatePassword();
      if (!okEmail || !okPw) {
        (!okEmail ? email : pwInput).focus();
        return;
      }

      submitBtn.classList.add("loading");
      submitBtn.disabled = true;

      setTimeout(function () {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
        var msg = "로그인 성공!";
        var existing = document.querySelector(".demo-success");
        if (existing) existing.remove();
        var banner = document.createElement("p");
        banner.className = "demo-success";
        banner.style.cssText = "margin-top:16px;padding:11px 14px;border-radius:10px;background:var(--success);color:#fff;font-size:13.5px;font-weight:600;text-align:center;";
        banner.textContent = msg;
        form.appendChild(banner);
        form.reset();
        clearError(email, emailError);
        clearError(pwInput, passwordError);
      }, 1400);
    });
  })();