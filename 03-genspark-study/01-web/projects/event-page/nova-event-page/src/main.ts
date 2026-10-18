/* ==========================================================================
   NOVA 런칭 페스티벌 — 이벤트 페이지 인터랙션 (TypeScript)
   컴파일:  npx tsc  →  dist/main.js
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. 설정값 (여기만 바꾸면 이벤트 내용이 바뀝니다)
   -------------------------------------------------------------------------- */
interface EventConfig {
  /** 이벤트 종료 시각 (ISO 8601) */
  deadline: string;
  /** 목표 참여자 수 (진행률 계산용) */
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

/** 1 ~ max 범위의 임의 정수를 만듭니다. */
const randomInt = (max: number): number => Math.floor(Math.random() * max) + 1;

/** 쿠폰 코드를 생성합니다. 예: NOVA-4F9K-2026 */
const createCouponCode = (prefix: string): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let body = "";
  for (let i = 0; i < 4; i += 1) {
    body += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${body}-2026`;
};

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

  const closeNav = (): void => {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "메뉴 열기");
  };

  on(toggle, "click", () => {
    if (!nav || !toggle) return;
    const willOpen = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", willOpen);
    toggle.setAttribute("aria-expanded", String(willOpen));
    toggle.setAttribute("aria-label", willOpen ? "메뉴 닫기" : "메뉴 열기");
  });

  // 메뉴 링크 클릭 시 닫기
  $$<HTMLAnchorElement>(".nav__link").forEach((link) => on(link, "click", closeNav));

  // 바깥 클릭 시 닫기
  on(document, "click", (event: Event) => {
    const target = event.target as Node | null;
    if (!nav || !toggle || !nav.classList.contains("is-open")) return;
    if (target && (nav.contains(target) || toggle.contains(target))) return;
    closeNav();
  });

  // ESC 로 닫기
  on(document, "keydown", (event: Event) => {
    const key = (event as KeyboardEvent).key;
    if (key === "Escape") closeNav();
  });
}

/* --------------------------------------------------------------------------
   4. 현재 섹션 하이라이트 (스크롤 스파이)
   -------------------------------------------------------------------------- */
function initScrollSpy(): void {
  const links = $$<HTMLAnchorElement>(".nav__link");
  const sections = links
    .map((link) => {
      const id = link.getAttribute("href")?.replace("#", "");
      return id ? $<HTMLElement>(`#${id}`) : null;
    })
    .filter((el): el is HTMLElement => el !== null);

  if (sections.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        links.forEach((link) =>
          link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`),
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
  );

  sections.forEach((section) => observer.observe(section));
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
   7. 숫자 카운트업 (통계)
   -------------------------------------------------------------------------- */
function initCounters(): void {
  const counters = $$<HTMLElement>("[data-counter]");
  if (counters.length === 0) return;

  const animate = (el: HTMLElement): void => {
    const raw = el.dataset.counter ?? "0";
    const target = Number.parseFloat(raw);
    const suffix = el.dataset.counterSuffix ?? "";
    const isFloat = raw.includes(".");
    const duration = 1400;
    const start = performance.now();

    const step = (now: number): void => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const value = target * eased;
      el.textContent = isFloat
        ? value.toFixed(1)
        : formatNumber(Math.round(value)) + suffix;

      if (progress < 1) window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target as HTMLElement);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.4 },
  );

  counters.forEach((counter) => observer.observe(counter));
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
   9. FAQ 아코디언
   -------------------------------------------------------------------------- */
function initFaq(): void {
  const items = $$<HTMLElement>("[data-faq-item]");
  if (items.length === 0) return;

  items.forEach((item) => {
    const trigger = $<HTMLButtonElement>("[data-faq-trigger]", item);
    const panel = $<HTMLElement>("[data-faq-panel]", item);
    if (!trigger || !panel) return;

    on(trigger, "click", () => {
      const isOpen = item.classList.contains("is-open");

      // 단일 아코디언: 다른 항목 닫기
      items.forEach((other) => {
        if (other === item) return;
        other.classList.remove("is-open");
        $<HTMLElement>("[data-faq-panel]", other)?.style.setProperty("max-height", "0px");
        $<HTMLButtonElement>("[data-faq-trigger]", other)?.setAttribute("aria-expanded", "false");
      });

      item.classList.toggle("is-open", !isOpen);
      trigger.setAttribute("aria-expanded", String(!isOpen));
      panel.style.maxHeight = isOpen ? "0px" : `${panel.scrollHeight + 24}px`;
    });
  });

  // 창 크기가 바뀌면 열린 패널 높이 재계산
  on(window, "resize", () => {
    $$<HTMLElement>("[data-faq-item].is-open").forEach((item) => {
      const panel = $<HTMLElement>("[data-faq-panel]", item);
      if (panel) panel.style.maxHeight = `${panel.scrollHeight + 24}px`;
    });
  });
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
   12. 신청 폼 검증 + 제출
   -------------------------------------------------------------------------- */
interface ApplyFormValues {
  name: string;
  email: string;
  phone: string;
  interest: string;
  agree: boolean;
}

type FieldName = "name" | "email" | "phone" | "interest" | "agree";
type Errors = Partial<Record<FieldName, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

/** 휴대폰 번호에서 숫자만 남깁니다. */
const digitsOnly = (value: string): string => value.replace(/\D/g, "");

/** 010-1234-5678 형태로 자동 포맷합니다. */
const formatPhone = (value: string): string => {
  const d = digitsOnly(value).slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
};

const validators: Record<FieldName, (values: ApplyFormValues) => string> = {
  name: (v) => {
    if (!v.name.trim()) return "이름을 입력해 주세요.";
    if (v.name.trim().length < 2) return "이름은 2자 이상 입력해 주세요.";
    return "";
  },
  email: (v) => {
    if (!v.email.trim()) return "이메일을 입력해 주세요.";
    if (!EMAIL_RE.test(v.email.trim())) return "올바른 이메일 형식이 아닙니다.";
    return "";
  },
  phone: (v) => {
    const d = digitsOnly(v.phone);
    if (!d) return "휴대폰 번호를 입력해 주세요.";
    if (d.length < 10 || d.length > 11) return "휴대폰 번호는 10~11자리여야 합니다.";
    if (!d.startsWith("01")) return "'01'로 시작하는 번호를 입력해 주세요.";
    return "";
  },
  interest: (v) => (v.interest ? "" : "관심 카테고리를 선택해 주세요."),
  agree: (v) => (v.agree ? "" : "개인정보 수집 및 이용에 동의해 주세요."),
};

function initApplyForm(): void {
  const form = $<HTMLFormElement>("[data-apply-form]");
  if (!form) return;

  const submitBtn = $<HTMLButtonElement>("[data-submit]", form);
  const submitLabel = $<HTMLElement>("[data-submit-label]", form);
  const phoneInput = $<HTMLInputElement>("#phone", form);

  // 휴대폰 번호 자동 하이픈
  on(phoneInput, "input", () => {
    if (phoneInput) phoneInput.value = formatPhone(phoneInput.value);
  });

  const readValues = (): ApplyFormValues => ({
    name: ($<HTMLInputElement>("#name", form)?.value ?? "").trim(),
    email: ($<HTMLInputElement>("#email", form)?.value ?? "").trim(),
    phone: ($<HTMLInputElement>("#phone", form)?.value ?? "").trim(),
    interest: $<HTMLSelectElement>("#interest", form)?.value ?? "",
    agree: $<HTMLInputElement>("#agree", form)?.checked ?? false,
  });

  const setError = (field: FieldName, message: string): void => {
    const errorEl = $<HTMLElement>(`[data-error-for="${field}"]`, form);
    const inputEl =
      field === "agree"
        ? $<HTMLElement>(".checkbox", form)
        : $<HTMLElement>(`#${field}`, form)?.closest(".field");

    if (errorEl) errorEl.textContent = message;
    inputEl?.classList.toggle("has-error", Boolean(message));
  };

  const clearErrors = (): void => {
    (Object.keys(validators) as FieldName[]).forEach((field) => setError(field, ""));
  };

  const validate = (values: ApplyFormValues): Errors => {
    const errors: Errors = {};
    (Object.keys(validators) as FieldName[]).forEach((field) => {
      const message = validators[field](values);
      if (message) errors[field] = message;
      setError(field, message);
    });
    return errors;
  };

  // 입력 시 해당 필드 오류 즉시 해제
  (["name", "email", "phone", "interest"] as FieldName[]).forEach((field) => {
    const el = $<HTMLElement>(`#${field}`, form);
    on(el, "input", () => setError(field, ""));
    on(el, "change", () => setError(field, ""));
  });
  on($<HTMLElement>("#agree", form), "change", () => setError("agree", ""));

  const sleep = (ms: number): Promise<void> => new Promise((resolve) => window.setTimeout(resolve, ms));

  const setLoading = (loading: boolean): void => {
    if (submitBtn) submitBtn.disabled = loading;
    if (submitLabel) submitLabel.textContent = loading ? "신청 처리 중…" : "무료로 사전예약 신청하기";
  };

  on(form, "submit", (event: Event) => {
    event.preventDefault();

    const values = readValues();
    clearErrors();
    const errors = validate(values);

    if (Object.keys(errors).length > 0) {
      showToast("입력하신 정보를 다시 확인해 주세요.", "error");
      const firstError = Object.keys(errors)[0];
      const focusTarget =
        firstError === "agree"
          ? $<HTMLElement>("#agree", form)
          : $<HTMLElement>(`#${firstError}`, form);
      focusTarget?.focus();
      return;
    }

    // 실제 서비스에서는 여기서 fetch() 로 서버에 전송합니다.
    void (async () => {
      setLoading(true);
      await sleep(900);

      const coupon = createCouponCode(CONFIG.couponPrefix);
      const ticket = `${CONFIG.couponPrefix}-${randomInt(9999)}`;

      setLoading(false);
      form.reset();
      clearErrors();

      Modal.open({
        icon: "🎉",
        title: `${values.name}님, 사전예약 완료!`,
        body: `
          <p>할인 쿠폰을 <strong>${values.email}</strong> 로 발송했습니다.</p>
          <span class="modal__highlight">쿠폰 코드: ${coupon}</span>
          <p style="margin-top:12px">웰컴 키트 발송 시 <strong>${values.phone}</strong> 로 알림을 보내드립니다.</p>
          <p style="margin-top:8px">접수 번호: ${ticket}</p>
        `,
      });

      showToast("사전예약이 정상적으로 접수되었습니다.", "success");
    })();
  });
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
  initScrollSpy();
  initCountdown();
  initProgress();
  initCounters();
  initReveal();
  initFaq();
  initApplyForm();
  initSmoothAnchors();

  console.info("[NOVA] 이벤트 페이지 초기화 완료", { deadline: CONFIG.deadline });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
