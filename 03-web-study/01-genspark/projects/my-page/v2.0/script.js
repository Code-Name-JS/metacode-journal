/* ============================================================
   AURORA 마이페이지 시안 — script.js
   ============================================================ */
(function () {
    "use strict";

const $ = function (sel, root) { return (root || document).querySelector(sel); };
const $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };



/* -- 토스트 -- */
const toastEl = $("#toast");
let toastTimer = null;
function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
        toastEl.classList.remove("is-show");
    }, 2200);
}



/* -- 테마 토글 -- */
const themeToggle = $("#themeToggle");
const root = document.documentElement;

function syncThemeLabel() {
    if (!themeToggle) return;
    const isDark = root.getAttribute("data-theme") === "dark";
    themeToggle.setAttribute("aria-label", isDark ? "라이트 모드 전환" : "다크 모드 전환");
}

try {
   const saved = localStorage.getItem("aurora-theme");
   if (saved) root.setAttribute("data-theme", saved);
} catch (e) { /* localStorage 미지원 환경 무시 */ }
syncThemeLabel();

if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        syncThemeLabel();
        
        try { localStorage.setItem("aurora-theme", next);} catch (e) {}
        toast(next === "dark" ? "다크 모드로 전환했습니다" : "라이트 모드로 전환했습니다");
    });
}



/* -- 숫자 카운트업 -- */
let counted = false;
function countUp() {
    if (counted) return;
    counted = true;
    $$(".stat-value").forEach(function (el) {
        const target = parseInt(el.getAttribute("data-count"), 10) || 0;
        const start = performance.now();
        const dur = 1100;
        function step(now) {
            const p = Math.min((now - start)/dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased).toLocaleString("ko-KR");
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    });
}
if ("IntersectionObserver" in window) {
    const statsEl = $(".stats");
    if (statsEl) {
        const io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if(en.isIntersecting) { countUp(); io.disconnect(); }
            });
        }, { threshold: 0.25 });
        io.observe(statsEl);
    }
} else {
    countUp();
}
setTimeout(countUp, 1400); // 안전장치



/* -- 탭 전환 -- */
const tabs = $$(".tab");
function activateTab(name) {
    tabs.forEach(function (t) {
        const on = t.getAttribute("data-tab") === name;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById("panel-" + t.getAttribute("data-tab"));
        if (panel) {
            panel.classList.toggle("is-active", on);
            if (on) { panel.removeAttribute("hidden");                
            } else {
                panel.setAttribute("hidden", "");}
            }
        });
    }
    tabs.forEach(function (t) {
        t.addEventListener("click", function () {
            activateTab(t.getAttribute("data-tab"));
        });
        t.addEventListener("keydown", function (e) {
            const i = tabs.indexOf(t);
            let next = null;
            if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
            if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
            if (next) {e.preventDefault(); next.focus(); activateTab(next.getAttribute("data-tab")); }
        });
    });



    /* -- 주문 필터 -- */
    const segBtns = $$("#orderFilter .seg-btn");
    const orderItems = $$("#orderList .order-item");
    const orderEmpty = $("#orderEmpty");
    segBtns.forEach(function (btn) {
        btn.addEventListener("click", function() {
            segBtns.forEach(function (b) { b.classList.remove("is-active"); });
            btn.classList.add("is-active");
            const f = btn.getAttribute("data-filter");
            let shown = 0;
            orderItems.forEach(function (it) {
                const match = f === "all" || it.getAttribute("data-status") === f;
                it.style.display = (match ? "" : "none");
                if (match) shown++;
            });
            if (orderEmpty) orderEmpty.hidden = shown !== 0;
        });
    });



    /* -- 찜 하트 토글 -- */
    $$(".heart").forEach(function (h) {
        h.addEventListener("click", function () {
            const on = h.classList.toggle("is-on");
            h.setAttribute("aria-label", on ? "찜 해제" : "찜하기");
            toast(on ? "찜 목록에 추가했습니다" : "찜 목록에서 제거했습니다");
        });
    });



    /* -- 프로필 수정 모달 -- */
    const modal = $("#modal");
    const modalForm = $("#modalForm");
    const editBtn = $("#editProfileBtn");
    const avatarEditBtn = $("#avatarEditBtn");
    const topAvatar = $("#topAvatar");
    const modalClose = $("#modalClose");
    const modalCancel = $("#modalCancel");
    let lastFocus = null;

    function openModal() {
        if (!modal) return;
        lastFocus = document.activeElement;
        modal.removeAttribute("hidden");
        document.body.style.overflow = "hidden";
        const first = $("#mName");
        if (first) setTimeout(function () { first.focus(); }, 60);
    }
    function closeModal() {
        if (!modal) return;
        modal.setAttribute("hidden", "");
        document.body.style.overflow = "";
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    [editBtn, topAvatar].forEach(function (b) {
        if (b) b.addEventListener("click", openModal);
    });
    [modalClose, modalCancel].forEach(function (b) {
        if (b) b.addEventListener("click", closeModal);
    });
    if (modal) {
        modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    }
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && modal && !modal.hasAttribute("hidden")) closeModal();
    });



    /* -- 유효성 검사 유틸 -- */
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const PHONE_RE = /^01[0-9]-?\d{3,4}-?\d{4}$/;

    function setMsg(input, msg, ok) {
        const el = document.querySelector('.field-msg[data-for="' + input.id + '"]');
        if (!el) return;
        el.textContent = msg || "";
        el.classList.toggle("ok", !!ok);
        input.classList.toggle("is-invalid", !!msg && !ok);
    }

    function validateField(input) {
        const v = (input.value || "").trim();
        switch (input.id) {
            case "inpName":
            case "mName":
                if (v.length < 2) { setMsg(input, "이름은 2자 이상 입력해 주세요."); return false; }
                setMsg(input, "사용 가능한 이름입니다.", true); return true;
            case "inpEmail":
            case "mEmail":
                if (!EMAIL_RE.test(v)) { setMsg(input, "올바른 이메일 형식이 아닙니다."); return false; }
                setMsg(input, "사용 가능한 이메일입니다.", true); return true;
            case "inpPhone":
                if (!PHONE_RE.test(v.replace(/\s/g, ""))) { setMsg(input, "휴대폰 번호 형식을 확인해 주세요. (예: 010-1234-5678)"); return false; }
                setMsg(input, "확인되었습니다.", true); return true;
            case "inpPw":
                if (v === "") { setMsg(input, ""); return true; } // 선택 입력
                if (v.length < 8 || !/[A-Za-z]/.test(v) || !/\d/.test(v)) {
                    setMsg(input, "영문과 숫자를 포함해 8자 이상 입력해 주세요."); return false;
                }
                setMsg(input, "사용 가능한 비밀번호입니다.", true); return true;
                default:
                    return true;
        }
    }

    const validateTargets = ["inpName", "inpEmail", "inpPhone", "inpPw", "mName", "mEmail"];
    validateTargets.forEach(function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("blur", function () { validateField(el); });
        el.addEventListener("input", function () {
            if (el.classList.contains("is-invalid")) validateField(el);
        });
    });



    /* -- 설정 폼 제출 -- */
    const settingsForm = $("#settingsForm");
    const settingsTargets = ["inpName", "inpEmail", "inpPhone", "inpPw"];
    if (settingsForm) {
        settingsForm.addEventListener("submit", function (e) {
            e.preventDefault();
            let ok = true;
            settingsTargets.forEach (function (id) {
                const el = document.getElementById(id);
                if (el && !validateField(el)) ok = false;
            });
            if (!ok) { toast("입력값을 다시 확인해 주세요"); return; }
            toast("변경 사항을 저장했습니다");
        });
        settingsForm.addEventListener("reset", function () {
            setTimeout(function () {
                settingsTargets.forEach(function (id) {
                    const el = document.getElementById(id);
                    if (el) setMsg(el, "");
                });
                toast("입력값을 되돌렸습니다");
            }, 0);
        });
    }



    /* -- 모달 폼 제출 -- */
    if (modalForm) {
        modalForm.addEventListener("submit", function (e) {
            e.preventDefault();
            let ok = true;
            ["mName", "mEmail"].forEach(function (id) {
                const el = document.getElementById(id);
                if (el && !validateField(el)) ok = false;
            });
            if (!ok) return;

            const name = ($("#mName") || {}).value || "";
            const email = ($("#mEmail") || {}).value || "";
            const pName = $("#profileName");
            const pEmail = $("#profileEmail");
            const avatar = $("#profileAvatar");
            const inpName = $("#inpName");
            const inpEmail = $("#inpEmail");
            if (pName) pName.textContent = name;
            if (pEmail) pEmail.textContent = email;
            if (inpName) { inpName.value = name; inpName.defaultValue = name;}
            if (inpEmail) { inpEmail.value = email; inpEmail.defaultValue = email;}
            if (avatar) avatar.textContent = name.charAt(0) || "수";
            if (topAvatar) topAvatar.textContent = name.charAt(0) || "수";
            closeModal();
            toast("프로필을 저장했습니다");
        });
    }



    /* -- 아바타 사진 변경(데모) -- */
    if (avatarEditBtn) {
        avatarEditBtn.addEventListener("click", function() {
            const av = $("#profileAvatar");
            if (!av) return;
            const hues = [265, 320, 168, 38];
            const i = (parseInt(av.getAttribute("data-v"), 10) || 0) + 1;
            av.setAttribute("data-v", String(i));
            av.style.background = 
                "linear-gradient(140deg, hsl(" + hues[i % hues.length] + " 78% 68%), hsl(" +
                hues[(i + 1) % hues.length] + " 82% 62%))";
        });
    }
})();