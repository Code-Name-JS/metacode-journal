/* ==========================================================================
   NOVA 런칭 페스티벌 — 이벤트 페이지 인터랙션 (TypeScript)
   컴파일:  npx tsc  →  dist/script.js
   ========================================================================== */

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
   2. 유틸
   -------------------------------------------------------------------------- */
const $ = <T extends Element>(selector: string, scope: ParentNode = document): T | null =>
    scope.querySelector<T>(selector);

const $$ = <T extends Element>(selector: string, scope: ParentNode = document): T[] =>
    Array.from(scope.querySelectorAll<T>(selector));

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
        root.classList = `${content.icon ? `<p class="modal__icon">${content.icon}</p>` : ""}${content.body}`;
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
    initSmoothAnchors();
}