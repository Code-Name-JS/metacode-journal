/* ==========================================================================
   NOVA 런칭 페스티벌 — 이벤트 페이지 인터랙션 (TypeScript)
   컴파일:  npx tsc  →  dist/script.js
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. 설정값 (여기만 바꾸면 이벤트 내용이 바뀝니다)
   -------------------------------------------------------------------------- */
interface EventConfig {
    /** 이벤트 종료 시각 (ISO 8601) */
    deadline: string;
    /** 목료 참여자 수 (진행률 계산용) */
    goalParticipants: number;
    /** 현재 참여자 수 (데모용 고정값 / 실제로는 API 응답으로 교체) */
    currentParticipants: number;
    /** 할인 쿠폰 접두어 */
    couponPrefix: string;
}

const CONFIG: EventConfig = {
    deadline: "2026-11-30T23:59:59+09:00",
    goalParticipants: 5000,
    currentParticipants: 3842,
    couponPrefix: "NOVA",
};



/* --------------------------------------------------------------------------
   2. 유틸
   -------------------------------------------------------------------------- */
const $ = <T extends Element>(selector: string, scope: ParentNode = document): T | null =>
    scope.querySelector<T>(selector);

const $$ = <T extends Element>(selector: string, scope: ParentNode = document): T[] =>
    Array.from(scope.querySelectorAll<T>(selector));

const pad2 = (n: number): string => String(n).padStart(2, "0");

/** 숫자에 천 단위 구분 기호를 넣습니다. */
const formatNumber = (n: number): string => n.toLocaleString("ko-KR");

/** 요소가 있으면 콜백을 실행합니다. */
const on = <K extends keyof HTMLElementEventMap>(
    target: EventTarget | null,
    type: K | string,
    handler: (event: Event) => void,
): void => {
    if (!target) return;
    target.addEventListener(type, handler as EventListener);
};



/* --------------------------------------------------------------------------
   3. 헤더 스크롤 상태 + 모바일 메뉴
   -------------------------------------------------------------------------- */
function initHeader(): void {
    const header = $<HTMLElement>("[data-header]");
    const nav = $<HTMLElement>("[data-nav]");
    const toggle = $<HTMLButtonElement>("[data-nav-toggle]");
 
    const syncScrolled = (): void => {
        if (!header) return;
        header.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    syncScrolled();
    on(window, "scroll", syncScrolled);

    on(toggle, "click", () => {
        if (!nav || !toggle) return;
        const willOpen = !nav.classList.contains("is-open");
        nav.classList.toggle("is-open", willOpen);
        toggle.setAttribute("aria-expanded", String(willOpen));
        toggle.setAttribute("aria-label", willOpen ? "메뉴 닫기" : "메뉴 열기");
    });
}



/* --------------------------------------------------------------------------
   5. 카운트다운
   -------------------------------------------------------------------------- */
function initCountdown(): void {
    const root = $<HTMLElement>("[data-countdown]");
    if (!root) return;

    const units: Record<string, HTMLElement | null> = {
        days: $<HTMLElement>('[data-countdown-unit="days"]', root),
        hours: $<HTMLElement>('[data-countdown-unit="hours"]', root),
        minutes: $<HTMLElement>('[data-countdown-unit="minutes"]', root),
        seconds: $<HTMLElement>('[data-countdown-unit="seconds"]', root),
    };
    const endedMessage = $<HTMLElement>("[data-countdown-ended]", root);
    const grid = $<HTMLElement>(".countdown__grid", root);
    const target = new Date(CONFIG.deadline).getTime();

    const render = (): void => {
        const diff = target - Date.now();

        if (diff <= 0) {
            Object.values(units).forEach((el) => {
                if (el) el.textContent = "00";
            });
            if (endedMessage) endedMessage.hidden = false;
            if (grid) grid.style.opacity = "0.45";
            window.clearInterval(timerId);
            return;
        }
        
        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (units.days) units.days.textContent = pad2(days);
        if (units.hours) units.hours.textContent = pad2(hours);
        if (units.minutes) units.minutes.textContent = pad2(minutes);
        if (units.seconds) units.seconds.textContent = pad2(seconds);        
    };

    render();
    const timerId = window.setInterval(render, 1000);
}



/* --------------------------------------------------------------------------
   6. 참여 진행률
   -------------------------------------------------------------------------- */
function initProgress(): void {
    const bar = $<HTMLElement>("[data-progress-bar]");
    const label = $<HTMLElement>("[data-progress-label]");
    if (!bar || !label) return;

    const ratio = Math.min(CONFIG.currentParticipants / CONFIG.goalParticipants, 1);
    const percent = Math.round(ratio * 100);

    label.textContent = `${formatNumber(CONFIG.currentParticipants)} / ${formatNumber(
        CONFIG.goalParticipants,
    )}명 (${percent}%)`;

    // 레이아웃이 잡힌 뒤 애니메이션되도록 한 프레임 지연
    window.requestAnimationFrame(() => {
        bar.style.width = `${percent}%`;
    });
}



/* --------------------------------------------------------------------------
   8. 스크롤 등장 애니메이션
   -------------------------------------------------------------------------- */
function initReveal(): void {
    const items = $$<HTMLElement>("[data-reveal]");
    if (items.length === 0) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
        items.forEach((item) => item.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target as HTMLElement;
                const delay = Number(el.dataset.revealDelay ?? 0);
                window.setTimeout(() => el.classList.add("is-visible"), delay);
                obs.unobserve(el);
            });
        },
        { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    );

    items.forEach((item) => observer.observe(item));
}



/* --------------------------------------------------------------------------
   10. 모달
   -------------------------------------------------------------------------- */
interface ModalContent {
    title: string;
    body: string;
    icon?: string;
}

const Modal = (() => {
    const root = $<HTMLElement>("[data-modal]");
    const titleEl = $<HTMLElement>("[data-modal-title]");
    const bodyEl = $<HTMLElement>("[data-modal-body]");
    let lastFocused: HTMLElement | null = null;

    const close = (): void => {
        if (!root) return;
        root.classList.remove("is-open");
        root.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        lastFocused?.focus();
    };

    const open = (content: ModalContent): void => {
        if (!root) return;
        lastFocused = document.activeElement as HTMLElement | null;
        if (titleEl) titleEl.textContent = content.title;
        if (bodyEl) {
            bodyEl.innerHTML = `${content.icon ? `<p class="modal__icon">${content.icon}</p>` : ""}${content.body}`;
        }
        root.classList.add("is-open");
        root.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        $<HTMLButtonElement>("[data-modal-close]", root)?.focus();
    };

    $$<HTMLElement>("[data-modal-close]", root ?? document).forEach((btn) => on(btn, "click", close));

    on(root, "click", (event: Event) => {
        if (event.target === root) close();
    });

    on(document, "keydown", (event: Event) => {
        if ((event as KeyboardEvent).key === "Escape" && root?.classList.contains("is-open")) close();
    });

    return { open, close };
})();



/* --------------------------------------------------------------------------
   11. 토스트 알림
   -------------------------------------------------------------------------- */
type ToastType = "success" | "error" | "info";

function showToast(message: string, type: ToastType = "info", duration = 3200): void {
    const host = $<HTMLElement>("[data-toast-host]");
    if (!host) return;

    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.setAttribute("role", "status");

    const icon = type === "success" ? "✅" : type === "error" ? "⚠️" : "ℹ️";
    toast.innerHTML = `<span aria-hidden="true">${icon}</span><span>${message}</span>`;
    host.appendChild(toast);

    window.requestAnimationFrame(() => toast.classList.add("is-visible"));

    window.setTimeout(() => {
        toast.classList.remove("is-visible");
        window.setTimeout(() => toast.remove(), 300);
    }, duration);
}



/* --------------------------------------------------------------------------
   13. 부드러운 앵커 이동 (구형 브라우저 대응)
   -------------------------------------------------------------------------- */
function initSmoothAnchors(): void {
    const supportsSmooth = "scrollBehavior" in document.documentElement.style;
    if (supportsSmooth) return;

    $$<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
        on(anchor, "click", (event: Event) => {
            const id = anchor.getAttribute("href");
            if (!id || id === "#") return;
            const target = $<HTMLElement>(id);
            if (!target) return;
            event.preventDefault();
            window.scrollTo({ top: target.offsetTop - 76, behavior: "smooth" });
        });
    });
}



/* --------------------------------------------------------------------------
   14. 실행
   -------------------------------------------------------------------------- */
function main(): void {
    initHeader();
    initCountdown();
    initReveal();
    initSmoothAnchors();

    console.info("[NOVA] 이벤트 페이지 초기화 완료", { deadline: CONFIG.deadline });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}