/**
 * LUMEN° 2026 Winter Reward Festival
 * 인터랙션 스크립트 (TypeScript)
 */

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
};

/* ------------------------------------------------------------------
   상수
   ------------------------------------------------------------------ */
const EVENT_START = new Date("2026-10-01T00:00:00+09:00").getTime();
const EVENT_END = new Date("2026-12-31T23:59:59+09:00").getTime();

const COUPONS: { code: string; label: string }[] = [
  { code: "WELCOME30", label: "신규 가입 3만원" },
  { code: "FIRST15", label: "첫 구매 15%" },
  { code: "FREESHIP", label: "무료배송" },
  { code: "POINT5K", label: "5,000 포인트" },
];

/* ------------------------------------------------------------------
   유틸
   ------------------------------------------------------------------ */
const $ = <T extends Element = HTMLElement>(
  selector: string,
  scope: ParentNode = document
): T | null => scope.querySelector<T>(selector);

const $$ = <T extends Element = HTMLElement>(
  selector: string,
  scope: ParentNode = document
): T[] => Array.from(scope.querySelectorAll<T>(selector));

const pad = (value: number): string => String(Math.max(0, value)).padStart(2, "0");

const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------
   카운트다운
   ------------------------------------------------------------------ */
function getRemaining(): Countdown {
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

function initCountdown(): void {
  const days = $("#tDays");
  const hours = $("#tHours");
  const minutes = $("#tMinutes");
  const seconds = $("#tSeconds");
  if (!days || !hours || !minutes || !seconds) return;

  const cells: { el: HTMLElement; key: keyof Countdown }[] = [
    { el: days, key: "days" },
    { el: hours, key: "hours" },
    { el: minutes, key: "minutes" },
    { el: seconds, key: "seconds" },
  ];

  const ctaDays = $("#ctaDays");

  const paint = (): void => {
    const remaining = getRemaining();

    cells.forEach(({ el, key }) => {
      const next = pad(remaining[key]);
      if (el.textContent === next) return;
      el.textContent = next;
      if (!prefersReducedMotion()) {
        el.classList.remove("is-tick");
        // reflow로 애니메이션 재시작
        void el.offsetWidth;
        el.classList.add("is-tick");
      }
    });

    if (ctaDays) ctaDays.textContent = String(remaining.days);

    const span = EVENT_END - EVENT_START;
    const progress = Math.min(
      100,
      Math.max(0, ((Date.now() - EVENT_START) / span) * 100)
    );
    const bar = $("#progressBar");
    const text = $("#progressText");
    if (bar) bar.style.width = `${progress.toFixed(1)}%`;
    if (text) text.textContent = `${Math.round(progress)}%`;
  };

  paint();
  window.setInterval(paint, 1000);
}

/* ------------------------------------------------------------------
   숫자 카운트업
   ------------------------------------------------------------------ */
function initCountUp(): void {
  const nodes = $$<HTMLElement>("[data-count]");
  if (!nodes.length) return;

  if (prefersReducedMotion()) {
    nodes.forEach((node) => {
      node.textContent = formatNumber(Number(node.dataset.count ?? 0));
    });
    return;
  }

  const run = (node: HTMLElement): void => {
    const target = Number(node.dataset.count ?? 0);
    const duration = 1400;
    const start = performance.now();

    const step = (now: number): void => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      node.textContent = formatNumber(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target as HTMLElement);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  nodes.forEach((node) => {
    node.textContent = "0";
    observer.observe(node);
  });
}

function formatNumber(value: number): string {
  return value.toLocaleString("ko-KR");
}

/* ------------------------------------------------------------------
   스크롤 등장 애니메이션
   ------------------------------------------------------------------ */
function initReveal(): void {
  const items = $$<HTMLElement>(".reveal");
  if (!items.length) return;

  items.forEach((item) => {
    const delay = item.dataset.delay;
    if (delay) item.style.setProperty("--d", delay);
  });

  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-in"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  );

  items.forEach((item) => observer.observe(item));
}

/* ------------------------------------------------------------------
   헤더 / 모바일 메뉴
   ------------------------------------------------------------------ */
function initNav(): void {
  const nav = $("#nav");
  const burger = $("#navBurger");
  const links = $("#navLinks");

  const onScroll = (): void => {
    nav?.classList.toggle("is-stuck", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (!burger || !links) return;

  const close = (): void => {
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
    if ((event.target as HTMLElement).closest("a")) close();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

/* ------------------------------------------------------------------
   토스트 / 클립보드
   ------------------------------------------------------------------ */
let toastTimer = 0;

function showToast(message: string): void {
  const toast = $("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("is-visible");

  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
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
  } catch {
    return false;
  }
}

function initCoupons(): void {
  $$<HTMLButtonElement>(".coupon").forEach((button) => {
    button.addEventListener("click", async () => {
      const code = button.dataset.code ?? "";
      if (!code) return;

      const ok = await copyText(code);
      if (!ok) {
        showToast(`쿠폰 코드: ${code}`);
        return;
      }

      const action = $(".coupon__action", button);
      button.classList.add("is-copied");
      if (action) action.textContent = "복사됨";
      showToast(`${code} 쿠폰 코드를 복사했습니다`);

      window.setTimeout(() => {
        button.classList.remove("is-copied");
        if (action) action.textContent = "복사";
      }, 2400);
    });
  });
}

/* ------------------------------------------------------------------
   FAQ 아코디언
   ------------------------------------------------------------------ */
function initFaq(): void {
  const items = $$<HTMLElement>(".faq__item");

  items.forEach((item) => {
    const trigger = $<HTMLButtonElement>(".faq__q", item);
    const panel = $<HTMLElement>(".faq__a", item);
    if (!trigger || !panel) return;

    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";

      // 단일 아코디언
      items.forEach((other) => {
        if (other === item) return;
        const otherTrigger = $<HTMLButtonElement>(".faq__q", other);
        const otherPanel = $<HTMLElement>(".faq__a", other);
        other.classList.remove("is-open");
        otherTrigger?.setAttribute("aria-expanded", "false");
        if (otherPanel) otherPanel.style.maxHeight = "0px";
      });

      trigger.setAttribute("aria-expanded", String(!isOpen));
      item.classList.toggle("is-open", !isOpen);
      panel.style.maxHeight = isOpen ? "0px" : `${panel.scrollHeight}px`;
    });
  });

  window.addEventListener("resize", () => {
    items.forEach((item) => {
      if (!item.classList.contains("is-open")) return;
      const panel = $<HTMLElement>(".faq__a", item);
      if (panel) panel.style.maxHeight = `${panel.scrollHeight}px`;
    });
  });
}

/* ------------------------------------------------------------------
   모달
   ------------------------------------------------------------------ */
let lastFocused: HTMLElement | null = null;

function openModal(name: string): void {
  const modal = $("#modal");
  const desc = $("#modalDesc");
  const codes = $("#modalCodes");
  if (!modal) return;

  if (desc) {
    desc.innerHTML = `<strong>${escapeHtml(name)}</strong>님, 참여가 정상적으로 접수되었습니다.<br />아래 쿠폰 4종이 즉시 발급되었습니다.`;
  }

  if (codes) {
    codes.innerHTML = COUPONS.map(
      (item) => `
        <div class="modal__code">
          <b>${item.code}</b>
          <span>${item.label}</span>
        </div>`
    ).join("");
  }

  lastFocused = document.activeElement as HTMLElement | null;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-locked");

  const closeBtn = $<HTMLButtonElement>(".modal__close", modal);
  window.setTimeout(() => closeBtn?.focus(), 60);
}

function closeModal(): void {
  const modal = $("#modal");
  if (!modal || !modal.classList.contains("is-open")) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-locked");
  lastFocused?.focus();
}

function initModal(): void {
  $$<HTMLElement>("[data-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char] ?? char;
  });
}

/* ------------------------------------------------------------------
   폼 유효성 검사
   ------------------------------------------------------------------ */
type Errors = Partial<Record<"name" | "email" | "phone" | "agree", string>>;

function setError(fieldEl: HTMLElement | null, messageEl: HTMLElement | null, message?: string): void {
  if (!fieldEl || !messageEl) return;
  const hasError = Boolean(message);
  fieldEl.classList.toggle("is-invalid", hasError);
  messageEl.textContent = message ?? "";
  messageEl.classList.toggle("is-visible", hasError);
}

function initForm(): void {
  const form = $<HTMLFormElement>("#entryForm");
  if (!form) return;

  const nameInput = $<HTMLInputElement>("#fName");
  const emailInput = $<HTMLInputElement>("#fEmail");
  const phoneInput = $<HTMLInputElement>("#fPhone");
  const agreeInput = $<HTMLInputElement>("#fAgree");
  const agreeWrap = $("#agreeWrap");
  const submitBtn = $<HTMLButtonElement>("#submitBtn");

  // 휴대폰 번호 자동 하이픈
  phoneInput?.addEventListener("input", () => {
    const digits = phoneInput.value.replace(/\D/g, "").slice(0, 11);
    let formatted = digits;

    if (digits.length > 3 && digits.length <= 7) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else if (digits.length > 7) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }

    phoneInput.value = formatted;
  });

  const validate = (): Errors => {
    const errors: Errors = {};

    const name = nameInput?.value.trim() ?? "";
    if (!name) errors.name = "이름을 입력해 주세요.";
    else if (name.length < 2) errors.name = "이름은 2자 이상 입력해 주세요.";

    const email = emailInput?.value.trim() ?? "";
    if (!email) errors.email = "이메일을 입력해 주세요.";
    else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) {
      errors.email = "올바른 이메일 형식이 아닙니다.";
    }

    const phoneDigits = (phoneInput?.value ?? "").replace(/\D/g, "");
    if (!phoneDigits) errors.phone = "휴대폰 번호를 입력해 주세요.";
    else if (!/^01[016789]\d{7,8}$/.test(phoneDigits)) {
      errors.phone = "올바른 휴대폰 번호를 입력해 주세요.";
    }

    if (!agreeInput?.checked) errors.agree = "개인정보 수집에 동의해 주세요.";

    return errors;
  };

  const paint = (errors: Errors): void => {
    setError(nameInput?.closest(".field") as HTMLElement | null, $("#errName"), errors.name);
    setError(emailInput?.closest(".field") as HTMLElement | null, $("#errEmail"), errors.email);
    setError(phoneInput?.closest(".field") as HTMLElement | null, $("#errPhone"), errors.phone);
    agreeWrap?.classList.toggle("is-invalid", Boolean(errors.agree));

    const agreeError = $("#errAgree");
    if (agreeError) {
      agreeError.textContent = errors.agree ?? "";
      agreeError.classList.toggle("is-visible", Boolean(errors.agree));
    }
  };

  [nameInput, emailInput, phoneInput].forEach((input) => {
    input?.addEventListener("blur", () => paint(validate()));
  });

  agreeInput?.addEventListener("change", () => paint(validate()));

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const errors = validate();
    paint(errors);

    const firstKey = Object.keys(errors)[0] as keyof Errors | undefined;
    if (firstKey) {
      const map: Record<string, HTMLElement | null> = {
        name: nameInput,
        email: emailInput,
        phone: phoneInput,
        agree: agreeInput,
      };
      map[firstKey]?.focus();
      showToast(errors[firstKey] ?? "입력값을 확인해 주세요.");
      return;
    }

    submitBtned(submitBtn, nameInput?.value.trim() ?? "고객");
  });
}

function submitBtned(button: HTMLButtonElement | null, name: string): void {
  if (!button) {
    openModal(name);
    return;
  }

  button.classList.add("is-loading");
  const label = $(".btn__label", button);
  const prev = label?.textContent ?? "";
  if (label) label.textContent = "참여 처리 중...";

  window.setTimeout(() => {
    button.classList.remove("is-loading");
    if (label) label.textContent = prev;
    openModal(name);
  }, 900);
}

/* ------------------------------------------------------------------
   라이브 참여자 수 (데모용 랜덤 워크)
   ------------------------------------------------------------------ */
function initLiveJoiners(): void {
  const el = $("#liveJoiners");
  if (!el) return;

  let value = 138;

  window.setInterval(() => {
    value = Math.max(120, Math.min(210, value + Math.round((Math.random() - 0.4) * 6)));
    el.textContent = String(value);
  }, 3200);
}

/* ------------------------------------------------------------------
   마퀴 무한 루프 (복제)
   ------------------------------------------------------------------ */
function initMarquee(): void {
  const track = $("#marqueeTrack");
  if (!track) return;
  track.innerHTML += track.innerHTML;
}

/* ------------------------------------------------------------------
   부드러운 앵커 스크롤 (고정 헤더 보정)
   ------------------------------------------------------------------ */
function initAnchors(): void {
  $$<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector<HTMLElement>(id);
      if (!target) return;

      event.preventDefault();
      const navHeight = $("#nav")?.offsetHeight ?? 0;
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
function boot(): void {
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
} else {
  boot();
}
