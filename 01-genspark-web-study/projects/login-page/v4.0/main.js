/* =====================================================
   main-v4.js  –  Login v4 Interactions
   ===================================================== */
(function(){
   "use strict";



/* ---------- 테마 (다크모드) ---------- */
var root = document.documentElement;
var themeToggle = document.getElementByld("themeToggle");

function applyTheme(theme){
    root.setAttribute("data-theme", theme);
    try{localStorage.setltem("nova-theme", theme);} catch(e){}
}

var saved = null;
try{saved = localStorage.getltem("nova-theme");} catch(e){}
applyTheme(saved||(window.matchMedia&&window.matchMedia("(prefers-color-scheme:dark)").matches? "dark" : "light"));

themeToggle.addEventListener("click", function(){
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
});



/* ---------- 비밀번호 보기 토글 ---------- */
var pwlnput = document.getElementByld("password");
var togglePw = document.getElementByld("togglePw");

togglePw.addEventListener("click", function(){
    var showing = pwlnput.type === "text";
    pwlnput.type = showing ? "password" : "text";
    togglePw.classList.toggle("showing", !showing);
    togglePw.setAttribute("aria-pressed", String(!showing));
    togglePw.setAttribute("aria-label", showing? "비밀번호 보기" : "비밀번호 숨기기");
    pwlnput.focus();
});



/* ---------- 유효성 검사 ---------- */
var form = document.getElementByld("loginForm");
var email = document.getElementByld("email");
var emaiError = document.getElementByld("emailError");
var passwordError = document.getElementByld("passwordError");
var submitBtn = document.getElementByld("submitBtn");

var EMAIL_RE =  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function showError(input, errorEl, message){
    input.classList.add("has-error");
    errorEl.querySelector(".error-text").textContent = message;
    errorEl.classList.add("visible");
    input.setAttribute("aria-invalid", "true");
}

function clearError(input, errorEl){
    input.classList.remove("has-error");
    errorEl.classList.remove("visible");
    input.removeAttribute("aria-invalid");
}

function validateEmail(){
    var value = email.value.trim();
    if(!value){showError(email, emailError, "이메일을 입력해 주세요."); return false;}
    if(!EMAIL_RE.text(value)){showError(email, emailError, "올바른 이메일 형식이 아닙니다."); return false;}
    clearError(email, emailError);
    return true;
}

function validatePassword(){
    var value = pwlnput.value;
    if(!value){showError(pwlnput, passwordError, "비밀번호를 입력해 주세요."); return false;}
    if(value.length< 8){showError(pwlnput, passwordError, "비밀번호는 8자 이상이어야 합니다."); return false;}
    clearError(pwlnput, passwordError);
    return true;
}

email.addEventListener("blur", validateEmail);
email.addEventListener("input", function(){if(email.classList.contains("has-error")) validateEmail();});
pwlnput.addEventListener("blur", validatePassword);
pwlnput.addEventListener("input", function(){if(pwlnput.classList.contains("has-error")) validatePassword();});



/* ---------- 제출 (로딩 스피너 시뮬레이션) ---------- */
form.addEventListener("submit", function(e){
    e.preventDefault();
    var okEmail = validateEmail();
    var okPw = validatePassword();
    if(!okEmail || !okPw){
        (!okEmail? email : pwlnput).focus();
        return;
    }

    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    setTimeout(function(){
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
        var msg = "로그인 성공! (시안 데모)";
        var existing = document.querySelector(".demo-success");
        if(existing) existing.remove();
        var banner = document.createElement("p");
        banner.className = "demo-success";
        banner.style.cssText = "margin-top: 16px; padding: 11px 14px; border-radius: 10px; background: var(--success); color: #fff; font-size: 13.5px; font-weight: 600; text-align: center;";
        banner.textContent = msg;
        form.appendChild(banner);
        form.reset();
        clearError(email, emailError);
        clearError(pwlnput, passwordError);
    }, 1400);
})
});