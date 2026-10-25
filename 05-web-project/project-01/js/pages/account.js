/* =====================================================
   pages/account.js — 회원정보 폼 검증 · 비밀번호 강도 · 회원 탈퇴
   ===================================================== */
(function () {
    "use strict";

/* -- 폼 유효성 검사 -- */
const RULES = {
    required: (v) => (/^[가-힣]{2,}$/.test(v.trim()) ? "" : "이름을 한글 2자 이상으로 입력해 주세요."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "올바른 이메일 형식이 아닙니다."),
    phone: (v) => (/^01[0-9]-?\d{3,4}-?\d{4}$/.test(v.replace(/\s/g, "")) ? "" : "010-0000-0000 형식으로 입력해 주세요."),
    password: (v) => (v === "" ? "" : /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v) ? "" : "영문 + 숫자 조합 8자 이상이어야 합니다.")
};
const form = $("#profileForm");

function validateField(input) {
    const rule = RULES[input.dataset.rule];
    if (!rule) return true;
    const msg = rule(input.value);
    const errEl = $(`[data-err-for="${input.id}"]`);
    input.classList.toggle("is-error", !!msg);
    if (errEl) errEl.textContent = msg;
    return !msg;
}
$$("[data-rule]", form).forEach((i) => {
    i.addEventListener("blur", () => validateField(i));
    i.addEventListener("input", () => { if (i.classList.contains("is-error")) validateField(i); });
});

// 비밀번호 강도 미터
const pw = $("#fPw"), meter = $("#pwMeter"), hint = $("#pwHint");
pw.addEventListener("input", () => {
    const v = pw.value;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Za-z]/.test(v) && /\d/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    const widths = ["0%", "34%", "67%", "100%"];
    const colors = ["#f43f5e", "#f59e0b", "#0ea5e9", "#10b981"];
    const labels = ["", "약함", "보통", "안전"];
    meter.style.width = v ? widths[score] : "0%";
    meter.style.background = colors[score];
    hint.textContent = v ? `비밀번호 강도: ${labels[score]}` : "변경하지 않으려면 비워 두세요.";
});

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = $$("[data-rule]", form).filter((i) => i.dataset.rule !== "password" || i.value !== "");
    const ok = fields.map(validateField).every(Boolean);
    if (!ok) {
        toast("입력값을 다시 확인해 주세요");
        const first = form.querySelector(".is-error");
        first && first.focus();
        return;
    }
    toast("변경사항을 저장했습니다 ✅");
});
$("#formReset").addEventListener("click", () => {
    form.reset();
    $$(".err", form).forEach((e) => (e.textContent=""));
    $$("input", form).forEach((i) => i.classList.remove("is-error"));
    meter.style.width = "0%";
    hint.textContent = "변경하지 않으려면 비워 두세요.";
    toast("입력값을 되돌렸습니다");
});


/* -- 회원 탈퇴 -- */
$("#withdrawBtn").addEventListener("click", () => openConfirm("회원 탈퇴", "정말 탈퇴하시겠어요? 포인트와 쿠폰이 모두 소멸되며 되돌릴 수 없습니다.", () => toast("탈퇴 요청이 접수되었습니다"))
);

})();
