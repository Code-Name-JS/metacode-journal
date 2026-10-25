"use strict";
/**
 * LUMEN° 2026 Winter Reward Festival
 * 인터랙션 스크립트 (TypeScript)
 */
/* ------------------------------------------------------------------
   상수
   ------------------------------------------------------------------ */
const EVENT_START = new Date("2026-10-01T00:00:00+09:00").getTime();
const EVENT_END = new Date("2026-12-31T23:59:59+09:00").getTime();
const COUPONS = [
    { code: "WELCOME30", label: "신규 가입 3만원" },
    { code: "FIRST15", label: "첫 구매 15%" },
    { code: "FREESHIP", label: "무료배송" },
    { code: "POINT5K", label: "5,000 포인트" },
];
/* ------------------------------------------------------------------
   유틸
   ------------------------------------------------------------------ */
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
const pad = (value) => String(Math.max(0, value)).padStart(2, "0");
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/* ------------------------------------------------------------------
   카운트다운
   ------------------------------------------------------------------ */
function getRemaining() {
    const now = Date.now();
    const diff = Math.max(0, EVENT_END - now);
    const totalSeconds = Math.floor(diff / 1000);
    return {
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        total: totalSeconds,
    };
}
function initCountdown() {
    const days = $("#tDays");
    const hours = $("#tHours");
    const minutes = $("#tMinutes");
    const seconds = $("#tSeconds");
    if (!days || !hours || !minutes || !seconds)
        return;
    const cells = [
        { el: days, key: "days" },
        { el: hours, key: "hours" },
        { el: minutes, key: "minutes" },
        { el: seconds, key: "seconds" },
    ];
    const ctaDays = $("#ctaDays");
    const paint = () => {
        const remaining = getRemaining();
        cells.forEach(({ el, key }) => {
            const next = pad(remaining[key]);
            if (el.textContent === next)
                return;
            el.textContent = next;
            if (!prefersReducedMotion()) {
                el.classList.remove("is-tick");
                // reflow로 애니메이션 재시작
                void el.offsetWidth;
                el.classList.add("is-tick");
            }
        });
        if (ctaDays)
            ctaDays.textContent = String(remaining.days);
        const span = EVENT_END - EVENT_START;
        const progress = Math.min(100, Math.max(0, ((Date.now() - EVENT_START) / span) * 100));
        const bar = $("#progressBar");
        const text = $("#progressText");
        if (bar)
            bar.style.width = `${progress.toFixed(1)}%`;
        if (text)
            text.textContent = `${Math.round(progress)}%`;
    };
    paint();
    window.setInterval(paint, 1000);
}
/* ------------------------------------------------------------------
   숫자 카운트업
   ------------------------------------------------------------------ */
function initCountUp() {
    const nodes = $$("[data-count]");
    if (!nodes.length)
        return;
    if (prefersReducedMotion()) {
        nodes.forEach((node) => {
            var _a;
            node.textContent = formatNumber(Number((_a = node.dataset.count) !== null && _a !== void 0 ? _a : 0));
        });
        return;
    }
    const run = (node) => {
        var _a;
        const target = Number((_a = node.dataset.count) !== null && _a !== void 0 ? _a : 0);
        const duration = 1400;
        const start = performance.now();
        const step = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            node.textContent = formatNumber(Math.round(target * eased));
            if (t < 1)
                requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting)
                return;
            run(entry.target);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.4 });
    nodes.forEach((node) => {
        node.textContent = "0";
        observer.observe(node);
    });
}
function formatNumber(value) {
    return value.toLocaleString("ko-KR");
}
/* ------------------------------------------------------------------
   스크롤 등장 애니메이션
   ------------------------------------------------------------------ */
function initReveal() {
    const items = $$(".reveal");
    if (!items.length)
        return;
    items.forEach((item) => {
        const delay = item.dataset.delay;
        if (delay)
            item.style.setProperty("--d", delay);
    });
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
        items.forEach((item) => item.classList.add("is-in"));
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting)
                return;
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
        });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
}
/* ------------------------------------------------------------------
   헤더 / 모바일 메뉴
   ------------------------------------------------------------------ */
function initNav() {
    const nav = $("#nav");
    const burger = $("#navBurger");
    const links = $("#navLinks");
    const onScroll = () => {
        nav === null || nav === void 0 ? void 0 : nav.classList.toggle("is-stuck", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (!burger || !links)
        return;
    const close = () => {
        links.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "메뉴 열기");
    };
    burger.addEventListener("click", () => {
        const isOpen = links.classList.toggle("is-open");
        burger.setAttribute("aria-expanded", String(isOpen));
        burger.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
    });
    links.addEventListener("click", (event) => {
        if (event.target.closest("a"))
            close();
    });
    window.addEventListener("resize", () => {
        if (window.innerWidth > 860)
            close();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape")
            close();
    });
}
/* ------------------------------------------------------------------
   토스트 / 클립보드
   ------------------------------------------------------------------ */
let toastTimer = 0;
function showToast(message) {
    const toast = $("#toast");
    if (!toast)
        return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
        toast.classList.remove("is-visible");
    }, 2200);
}
async function copyText(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    }
    catch (_a) {
        /* 폴백으로 이동 */
    }
    try {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.top = "-9999px";
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(area);
        return ok;
    }
    catch (_b) {
        return false;
    }
}
function initCoupons() {
    $$(".coupon").forEach((button) => {
        button.addEventListener("click", async () => {
            var _a;
            const code = (_a = button.dataset.code) !== null && _a !== void 0 ? _a : "";
            if (!code)
                return;
            const ok = await copyText(code);
            if (!ok) {
                showToast(`쿠폰 코드: ${code}`);
                return;
            }
            const action = $(".coupon__action", button);
            button.classList.add("is-copied");
            if (action)
                action.textContent = "복사됨";
            showToast(`${code} 쿠폰 코드를 복사했습니다`);
            window.setTimeout(() => {
                button.classList.remove("is-copied");
                if (action)
                    action.textContent = "복사";
            }, 2400);
        });
    });
}
/* ------------------------------------------------------------------
   FAQ 아코디언
   ------------------------------------------------------------------ */
function initFaq() {
    const items = $$(".faq__item");
    items.forEach((item) => {
        const trigger = $(".faq__q", item);
        const panel = $(".faq__a", item);
        if (!trigger || !panel)
            return;
        trigger.addEventListener("click", () => {
            const isOpen = trigger.getAttribute("aria-expanded") === "true";
            // 단일 아코디언
            items.forEach((other) => {
                if (other === item)
                    return;
                const otherTrigger = $(".faq__q", other);
                const otherPanel = $(".faq__a", other);
                other.classList.remove("is-open");
                otherTrigger === null || otherTrigger === void 0 ? void 0 : otherTrigger.setAttribute("aria-expanded", "false");
                if (otherPanel)
                    otherPanel.style.maxHeight = "0px";
            });
            trigger.setAttribute("aria-expanded", String(!isOpen));
            item.classList.toggle("is-open", !isOpen);
            panel.style.maxHeight = isOpen ? "0px" : `${panel.scrollHeight}px`;
        });
    });
    window.addEventListener("resize", () => {
        items.forEach((item) => {
            if (!item.classList.contains("is-open"))
                return;
            const panel = $(".faq__a", item);
            if (panel)
                panel.style.maxHeight = `${panel.scrollHeight}px`;
        });
    });
}
/* ------------------------------------------------------------------
   모달
   ------------------------------------------------------------------ */
let lastFocused = null;
function openModal(name) {
    const modal = $("#modal");
    const desc = $("#modalDesc");
    const codes = $("#modalCodes");
    if (!modal)
        return;
    if (desc) {
        desc.innerHTML = `<strong>${escapeHtml(name)}</strong>님, 참여가 정상적으로 접수되었습니다.<br />아래 쿠폰 4종이 즉시 발급되었습니다.`;
    }
    if (codes) {
        codes.innerHTML = COUPONS.map((item) => `
        <div class="modal__code">
          <b>${item.code}</b>
          <span>${item.label}</span>
        </div>`).join("");
    }
    lastFocused = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    const closeBtn = $(".modal__close", modal);
    window.setTimeout(() => closeBtn === null || closeBtn === void 0 ? void 0 : closeBtn.focus(), 60);
}
function closeModal() {
    const modal = $("#modal");
    if (!modal || !modal.classList.contains("is-open"))
        return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    lastFocused === null || lastFocused === void 0 ? void 0 : lastFocused.focus();
}
function initModal() {
    $$("[data-close]").forEach((el) => {
        el.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape")
            closeModal();
    });
}
function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (char) => {
        var _a;
        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };
        return (_a = map[char]) !== null && _a !== void 0 ? _a : char;
    });
}
function setError(fieldEl, messageEl, message) {
    if (!fieldEl || !messageEl)
        return;
    const hasError = Boolean(message);
    fieldEl.classList.toggle("is-invalid", hasError);
    messageEl.textContent = message !== null && message !== void 0 ? message : "";
    messageEl.classList.toggle("is-visible", hasError);
}
function initForm() {
    const form = $("#entryForm");
    if (!form)
        return;
    const nameInput = $("#fName");
    const emailInput = $("#fEmail");
    const phoneInput = $("#fPhone");
    const agreeInput = $("#fAgree");
    const agreeWrap = $("#agreeWrap");
    const submitBtn = $("#submitBtn");
    // 휴대폰 번호 자동 하이픈
    phoneInput === null || phoneInput === void 0 ? void 0 : phoneInput.addEventListener("input", () => {
        const digits = phoneInput.value.replace(/\D/g, "").slice(0, 11);
        let formatted = digits;
        if (digits.length > 3 && digits.length <= 7) {
            formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
        }
        else if (digits.length > 7) {
            formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
        }
        phoneInput.value = formatted;
    });
    const validate = () => {
        var _a, _b, _c;
        const errors = {};
        const name = (_a = nameInput === null || nameInput === void 0 ? void 0 : nameInput.value.trim()) !== null && _a !== void 0 ? _a : "";
        if (!name)
            errors.name = "이름을 입력해 주세요.";
        else if (name.length < 2)
            errors.name = "이름은 2자 이상 입력해 주세요.";
        const email = (_b = emailInput === null || emailInput === void 0 ? void 0 : emailInput.value.trim()) !== null && _b !== void 0 ? _b : "";
        if (!email)
            errors.email = "이메일을 입력해 주세요.";
        else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) {
            errors.email = "올바른 이메일 형식이 아닙니다.";
        }
        const phoneDigits = ((_c = phoneInput === null || phoneInput === void 0 ? void 0 : phoneInput.value) !== null && _c !== void 0 ? _c : "").replace(/\D/g, "");
        if (!phoneDigits)
            errors.phone = "휴대폰 번호를 입력해 주세요.";
        else if (!/^01[016789]\d{7,8}$/.test(phoneDigits)) {
            errors.phone = "올바른 휴대폰 번호를 입력해 주세요.";
        }
        if (!(agreeInput === null || agreeInput === void 0 ? void 0 : agreeInput.checked))
            errors.agree = "개인정보 수집에 동의해 주세요.";
        return errors;
    };
    const paint = (errors) => {
        var _a;
        setError(nameInput === null || nameInput === void 0 ? void 0 : nameInput.closest(".field"), $("#errName"), errors.name);
        setError(emailInput === null || emailInput === void 0 ? void 0 : emailInput.closest(".field"), $("#errEmail"), errors.email);
        setError(phoneInput === null || phoneInput === void 0 ? void 0 : phoneInput.closest(".field"), $("#errPhone"), errors.phone);
        agreeWrap === null || agreeWrap === void 0 ? void 0 : agreeWrap.classList.toggle("is-invalid", Boolean(errors.agree));
        const agreeError = $("#errAgree");
        if (agreeError) {
            agreeError.textContent = (_a = errors.agree) !== null && _a !== void 0 ? _a : "";
            agreeError.classList.toggle("is-visible", Boolean(errors.agree));
        }
    };
    [nameInput, emailInput, phoneInput].forEach((input) => {
        input === null || input === void 0 ? void 0 : input.addEventListener("blur", () => paint(validate()));
    });
    agreeInput === null || agreeInput === void 0 ? void 0 : agreeInput.addEventListener("change", () => paint(validate()));
    form.addEventListener("submit", (event) => {
        var _a, _b, _c;
        event.preventDefault();
        const errors = validate();
        paint(errors);
        const firstKey = Object.keys(errors)[0];
        if (firstKey) {
            const map = {
                name: nameInput,
                email: emailInput,
                phone: phoneInput,
                agree: agreeInput,
            };
            (_a = map[firstKey]) === null || _a === void 0 ? void 0 : _a.focus();
            showToast((_b = errors[firstKey]) !== null && _b !== void 0 ? _b : "입력값을 확인해 주세요.");
            return;
        }
        submitBtned(submitBtn, (_c = nameInput === null || nameInput === void 0 ? void 0 : nameInput.value.trim()) !== null && _c !== void 0 ? _c : "고객");
    });
}
function submitBtned(button, name) {
    var _a;
    if (!button) {
        openModal(name);
        return;
    }
    button.classList.add("is-loading");
    const label = $(".btn__label", button);
    const prev = (_a = label === null || label === void 0 ? void 0 : label.textContent) !== null && _a !== void 0 ? _a : "";
    if (label)
        label.textContent = "참여 처리 중...";
    window.setTimeout(() => {
        button.classList.remove("is-loading");
        if (label)
            label.textContent = prev;
        openModal(name);
    }, 900);
}
/* ------------------------------------------------------------------
   라이브 참여자 수 (데모용 랜덤 워크)
   ------------------------------------------------------------------ */
function initLiveJoiners() {
    const el = $("#liveJoiners");
    if (!el)
        return;
    let value = 138;
    window.setInterval(() => {
        value = Math.max(120, Math.min(210, value + Math.round((Math.random() - 0.4) * 6)));
        el.textContent = String(value);
    }, 3200);
}
/* ------------------------------------------------------------------
   마퀴 무한 루프 (복제)
   ------------------------------------------------------------------ */
function initMarquee() {
    const track = $("#marqueeTrack");
    if (!track)
        return;
    track.innerHTML += track.innerHTML;
}
/* ------------------------------------------------------------------
   부드러운 앵커 스크롤 (고정 헤더 보정)
   ------------------------------------------------------------------ */
function initAnchors() {
    $$('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            var _a, _b;
            const id = link.getAttribute("href");
            if (!id || id === "#")
                return;
            const target = document.querySelector(id);
            if (!target)
                return;
            event.preventDefault();
            const navHeight = (_b = (_a = $("#nav")) === null || _a === void 0 ? void 0 : _a.offsetHeight) !== null && _b !== void 0 ? _b : 0;
            const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
            window.scrollTo({
                top,
                behavior: prefersReducedMotion() ? "auto" : "smooth",
            });
        });
    });
}
/* ------------------------------------------------------------------
   부트스트랩
   ------------------------------------------------------------------ */
function boot() {
    initNav();
    initCountdown();
    initCountUp();
    initReveal();
    initCoupons();
    initFaq();
    initModal();
    initForm();
    initLiveJoiners();
    initMarquee();
    initAnchors();
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
}
else {
    boot();
}
