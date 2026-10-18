/* ============================================================
 * 2026 가을 감사 페스티벌 — script.ts
 * 이벤트 페이지의 모든 동작(데이터 로딩 · 렌더링 · 카운트다운 ·
 * FAQ 아코디언 · 응모 폼 검증 · 완료 모달 · 스크롤 인터랙션)
 * 을 담당하는 TypeScript 원본입니다.
 * 컴파일: npx tsc  →  js/script.js
 * ============================================================ */

/* ---------------- 1. 타입 정의 ---------------- */
interface EventMeta {
    eventId: string;
    brand: string;
    tagline: string;
    locale: string;
}

interface NavLink {
    href: string;
    label: string;
}

interface NavConfig {
    links: NavLink[];
    cta: string;
}

interface HeroConfig {
    badge: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    startDate: string;
    endDate: string;
    countdownLabel: string;
    closedLabel: string;
    ctaPrimary: string;
    ctaSecondary: string;
    metaLabel: string;
}

interface StatItem {
    value: string;
    suffix: string;
    label: string;
}

interface PrizeItem {
    rank: string;
    title: string;
    description: string;
    quantity: string;
    icon: string;
    featured?: boolean;
}

interface PrizeConfig {
    eyebrow: string;
    title: string;
    description: string;
    items: PrizeItem[];
}

interface ScheduleItem {
    date: string;
    title: string;
    description: string;
}

interface ScheduleConfig {
    eyebrow: string;
    title: string;
    description: string;
    items: ScheduleItem[];
}

interface FaqItem {
    question: string;
    answer: string;
}

interface FaqConfig {
    eyebrow: string;
    title: string;
    description: string;
    items: FaqItem[];
}

interface FieldConfig {
   label: string;
   placeholder?: string;
   options?: string[];
   error: string; 
}

interface FormFields {
   name: FieldConfig;
   phone: FieldConfig;
   email: FieldConfig;
   channel: FieldConfig;
   agree: FieldConfig; 
}

interface FormConfig {
    eyebrow: string;
    title: string;
    description: string;
    fields: FormFields;
    privacyNote: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successBody: string;
    ticketLabel: string;
}

interface FooterConfig {
    tagline: string;
    address: string;
    contact: string;
    note: string;
}

interface EventData {
    meta: EventMeta;
    nav: NavConfig;
    hero: HeroConfig;
    stats: StatItem[];
    prizes: PrizeConfig;
    schedule: ScheduleConfig;
    faq: FaqConfig;
    form: FormConfig;
    footer: FooterConfig;
}



/* ---------------- 2. 대체(fallback) 데이터 ----------------
 * file:// 로 페이지를 열면 브라우저 보안 정책상 fetch 가 차단됩니다.
 * 이때 사용할 data/event.json 과 동일한 내용의 사본입니다.
 * --------------------------------------------------------- */

const FALLBACK_DATA: EventData = {
    meta: { eventId: "AUTUMN-2026-THANKS", brand: "오늘의 정원", tagline: "매일의 식탁에 제철을 담습니다", locale: "ko-KR" },
    nav: {
       links: [
        { href: "#prizes", label: "경품 안내" },
        { href: "#schedule", label: "이벤트 일정" },
        { href: "#faq", label: "자주 묻는 질문" },
        { href: "#entry", label: "응모하기" }
       ],
       cta: "응모하기" 
    },
    hero: {
        badge: "총 상금 3,000만 원 상당",
        eyebrow: "2026 가을 감사 페스티벌",
        title: "가을의 결실을\n당신의 식탁으로",
        subtitle:
            "9월 15일부터 10월 31일까지, 오늘의 정원이 준비한 가을맞이 감사 이벤트에 참여하고 제철 선물을 받아가세요.",
        startDate: "2026-09-15T00:00:00+09:00",
        endDate: "2026-10-31T23:59:59+09:00",
        countdownLabel: "응모 마감까지",
        closedLabel: "이벤트가 종료되었습니다",
        ctaPrimary: "지금 응모하기",
        ctaSecondary: "경품 보러가기",
        metaLabel: "응모 기간 2026.09.15 (화) ~ 2026.10.31 (토) · 누구나 무료 참여"
    },
    stats: [
        { value: "1,200", suffix: "명", label: "총 당첨 인원" },
        { value: "47", suffix: "일", label: "이벤트 진행 기간" },
        { value: "4.9", suffix: "/5", label: "지난 시즌 만족도" }
    ],
    prizes: {
        eyebrow: "PRIZES",
        title: "풍성한 가을 선물",
        description: "응모 한 번으로 네 가지 행운에 도전하세요. 중복 당첨은 되지 않습니다.",
        items: [
            {
                rank: "1등",
                title: "제주 감귤 한 상자 + 호텔 1박",
                description: "제주 프리미엄 감귤 10kg 박스와 오션뷰 호텔 숙박권을 함께 드립니다.",
                quantity: "3명",
                icon: "🍊",
                featured: true
            },
            {
                rank: "2등",
                title: "프리미엄 한우 세트",
                description: "1++ 등급 한우 등심 4인분 세트를 집에서 편하게 받아보세요.",
                quantity: "20명",
                icon: "🥩"
            },
            {
                rank: "3등",
                title: "가을 유기농 꾸러미",
                description: "제철 채소와 견과류로 구성된 유기농 정기 꾸러미 3개월 이용권.",
                quantity: "100명",
                icon: "🥬"
            },
            {
                rank: "참여상",
                title: "5,000원 할인 쿠폰",
                description: "응모해 주신 모든 분께 전 상품에 사용 가능한 할인 쿠폰을 발송합니다.",
                quantity: "전원",
                icon: "🎟️"
            }
        ]
    },
    schedule: {
        eyebrow: "SCHEDULE",
        title: "이벤트 일정",
        description: "응모부터 당첨자 발표까지, 가을 한 시즌 동안 진행됩니다.",
        items: [
            { date: "09.15", title: "이벤트 시작 · 응모 오픈", description: "온라인 응모 페이지가 열리고 누구나 참여할 수 있습니다." },
            { date: "09.30", title: "1차 추첨 · 참여상 발송", description: "참여상 할인 쿠폰을 입력하신 이메일로 순차 발송합니다." },
            { date: "10.31", title: "응모 마감", description: "이벤트 종료 시각(23:59)까지 접수된 응모만 유효합니다." },
            { date: "11.05", title: "최종 당첨자 발표", description: "당첨자에게 개별 연락 후 경품을 순차 발송합니다." }
        ]
    },
    faq: {
        eyebrow: "FAQ",
        title: "자주 묻는 질문",
        description: "응모 전에 확인해 보세요.",
        items: [
            { question: "참여 비용이 있나요?", answer: "없습니다. 본 이벤트는 누구나 무료로 참여할 수 있으며, 응모 과정에서 결제 정보를 요구하지 않습니다." },
            { question: "응모는 몇 번까지 가능한가요?", answer: "휴대폰 번호 기준 1인 1회 응모 원칙입니다. 중복 응모가 확인되면 최초 응모만 유효 처리됩니다." },
            { question: "당첨 결과는 어떻게 알 수 있나요?", answer: "11월 5일에 응모 시 입력하신 휴대폰 번호와 이메일로 개별 안내드립니다. 미당첨자에게는 별도 안내가 가지 않습니다." },
            { question: "경품 발송은 언제 이뤄지나요?", answer: "당첨 안내 후 7일 이내에 순차 발송됩니다. 주소지 오류로 반송된 경우 재발송이 어려울 수 있습니다." },
            { question: "입력한 개인정보는 어떻게 처리되나요?", answer: "수집한 정보는 당첨 안내 목적으로만 사용되며, 이벤트 종료 후 3개월 이내에 안전하게 파기됩니다." }
        ]
    },
    form: {
        eyebrow: "ENTRY",
        title: "가을 선물 응모하기",
        description:
            "아래 정보를 입력하시면 응모가 완료됩니다. 당첨자 발표는 11월 5일, 등록하신 연락처로 개별 안내드립니다.",
        fields: {
            name: { label: "이름", placeholder: "홍길동", error: "이름을 2자 이상 입력해 주세요." },
            phone: { label: "휴대폰 번호", placeholder: "010-1234-5678", error: "010으로 시작하는 휴대폰 번호를 입력해 주세요." },
            email: { label: "이메일", placeholder: "garden@example.com", error: "이메일 형식이 올바르지 않습니다." },
            channel: {
                label: "가입 경로",
                options: ["인스타그램", "블로그", "지인 추천", "뉴스레터", "기타"],
                error: "가입 경로를 선택해 주세요."
            },
            agree: { label: "개인정보 수집 및 이용에 동의합니다.", error: "이벤트 참여를 위해 동의가 필요합니다." }
        },
        privacyNote: "수집한 정보는 이벤트 당첨 안내 목적으로만 사용되며, 이벤트 종료 후 3개월 이내에 파기됩니다.",
        submit: "응모 완료하기",
        submitting: "전송 중...",
        successTitle: "응모가 완료되었습니다",
        successBody:
            "가을 감사 페스티벌에 참여해 주셔서 감사합니다. 당첨 여부는 11월 5일 등록하신 연락처로 안내드립니다.",
        ticketLabel: "응모 번호"
    },
    footer: {
        tagline: "매일의 식탁에 제철을 담습니다",
        address: "서울특별시 중구 세종대로 00, 3층",
        contact: "고객센터 1600-0000 · help@todaygarden.example",
        note: "본 페이지는 데모용으로 제작된 가상의 이벤트 페이지입니다."
    }
};



/* ---------------- 3. 유틸리티 ---------------- */
const ESCAPE_MAP: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
};

function esc(value: string): string {
    return value.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch] ?? ch);
}

function el<T extends HTMLElement>(id: string): T {
    const found = document.getElementById(id);
    if (!found) {
        throw new Error("[event-page] #" + id + " 요소를 찾을 수 없습니다.");
    }
    return found as unknown as T;
}

function setText(id: string, text: string): void {
    const node = document.getElementById(id);
    if (node) node.textContent = text;
}

function pad2(n: number): string {
    return String(n).padStart(2, "0");
}

/** 시작·마감 시각을 사용자 위치와 무관하게 항상 한국 시간(KST)으로 표기합니다. */
const KST_FORMAY: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
    timeStyle: "medium"
};

function fmtKST(ms: number): string {
    return new Date(ms).toLocaleString("ko-KR", KST_FORMAY);
}



/* ---------------- 4. 데이터 로딩 ----------------
 * 우선순위: ① HTML 에 인라인된 JSON ② fetch('data/event.json') ③ FALLBACK_DATA
 * ------------------------------------------------- */
function readInlineData(): EventData | null {
    const tag = document.getElementById("event-data");
    if (!tag || !tag.textContent) return null;
    try {
        return JSON.parse(tag.textContent) as EventData;
    } catch (err) {
        console.warn("[event-page] 인라인 JSON 파싱 실패:", err);
        return null;
    }
}

async function loadEventData(): Promise<EventData> {
    const inline = readInlineData();
    if (inline) {
        console.info("[event-page] HTML에 내장된 JSON 데이터를 사용합니다.");
        return inline;
    }

    try {
        const res = await fetch("data/event.json", { cache: "no-cache" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = (await res.json()) as EventData;
        console.info("[event-page] data/event.json 를 불러왔습니다.");
        return data;
    } catch (err) {
        console.warn(
            "[event-page] event.json 을 불러오지 못해 내장 데이터로 렌더링합니다. " +
                "(file:// 로 열었다면 로컬 서버로 실행하면  JSON 을 직접 읽어옵니다.)",
            err
        );
        return FALLBACK_DATA;
    }
}



/* ---------------- 5. 각 섹션 렌더링 ---------------- */
function renderNav(data: EventData): void {
    const nav = el<HTMLElement>("navLinks");
    nav.innerHTML = data.nav.links
        .map((link) => '<a class="nav-link" href="' + esc(link.href) + '">' + esc(link.label) + "</a>")
        .join("");
    setText("navCta", data.nav.cta);
}

function renderHero(data: EventData): void {
    const hero = data.hero;
    setText("heroBadge", hero.badge);
    setText("heroEyebrow", hero.eyebrow);

    // 제목은 "\n" 기준으로 줄을 나누고, 두 번째 줄에 강조 그라디언트를 적용합니다.
    const lines = hero.title.split("\n");
    el<HTMLElement>("heroTitle").innerHTML = lines
        .map((line, i) => '<span class="hero-line' + (i === lines.length - 1 && lines.length > 1 ? " accent" : "") + '">' + esc(line) + "</span>")
        .join("");
    
    setText("heroSubtitle", hero.subtitle);
    setText("heroCtaPrimary", hero.ctaPrimary);
    setText("heroCtaSecondary", hero.ctaSecondary);
    setText("heroMeta", hero.metaLabel);
    setText("countdownLabel", hero.countdownLabel);
    setText("brandName", data.meta.brand);
}

function renderStats(data: EventData): void {
    el<HTMLElement>("statsGrid").innerHTML = data.stats
        .map(
            (stat) =>
                '<div class="stat">' +
                '<span class="stat-value">' + esc(stat.value) + "</span>" +
                '<span class="stat-suffix">' + esc(stat.suffix) + "</span>" +
                '<span class="stat-label">' + esc(stat.label) + "</span>" +
                "</div>"
        )
        .join("");
}

function renderPrizes(data: EventData): void {
    setText("prizeEyebrow", data.prizes.eyebrow);
    setText("prizeTitle", data.prizes.title);
    setText("prizeDesc", data.prizes.description);

    el<HTMLElement>("prizeGrid").innerHTML = data.prizes.items
        .map(
            (prize) =>
                '<article class="prize' + (prize.featured ? " prize--featured" : "") + '">' +
                '<div class="prize-top">' +
                '<span class="prize-icon" aria-hidden="true">' + esc(prize.icon) + "</span>" +
                '<span class="prize-rank">' + esc(prize.rank) + "</span>" +
                "</div>" +
                '<h3 class="prize-title">' + esc(prize.title) + "</h3>" +
                '<p class="prize-desc">' + esc(prize.description) + "</p>" +
                '<div class="prize-foot">' +
                '<span class="prize-foot-label">당첨 인원</span>' +
                '<span class="prize-qty">' + esc(prize.quantity) + "</span>" +
                "</div>" +
                "</article>"
        )
        .join("");
}

function renderSchedule(data: EventData): void {
    setText("scheduleEyebrow", data.schedule.eyebrow);
    setText("scheduleTitle", data.schedule.title);
    setText("scheduleDesc", data.schedule.description);

    el<HTMLElement>("scheduleList").innerHTML = data.schedule.items
        .map(
            (item) => 
                '<li class="tl-item">' +
                '<span class="tl-date">' + esc(item.date) + "</span>" +
                '<div class="tl-body">' +
                '<h3 class="tl-title">' + esc(item.title) + "</h3>" +
                '<p class="tl-desc">' + esc(item.description) + "</p>" +
                "</div>" +
                "</li>"
        )
        .join("");
}

function renderFaq(data: EventData): void {
    setText("faqEyebrow", data.faq.eyebrow);
    setText("faqTitle", data.faq.title);
    setText("faqDesc", data.faq.description);

    const list = el<HTMLElement>("faqList");
    list.innerHTML = data.faq.items
        .map(
            (item, i) =>
                '<div class="faq-item" data-index="' + i + '">' +
                '<button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-a-' + i + '">' +
                '<span class="faq-mark" aria-hidden="true">Q.</span>' +
                "<span>" + esc(item.question) + "</span>" +
                '<span class="faq-arrow" aria-hidden="true">▾</span>' +
                "</button>" +
                '<div class="faq-a" id="faq-a-' + i + '" role="region">' +
                '<div class="faq-a-inner">' + esc(item.answer) + "</div>" +
                "</div>" +
                "</div>"
        )
        .join("");
    
    list.querySelectorAll<HTMLButtonElement>(".faq-q").forEach((btn) => {
        btn.addEventListener("click", () => toggleFaq(btn));
    });
}

function toggleFaq(btn: HTMLButtonElement): void {
    const item = btn.closest<HTMLElement>(".faq-item");
    if (!item) return;   
    
    const panel = item.querySelector<HTMLElement>(".faq-a");
    if (!panel) return;

    const isOpen = item.classList.contains("is-open");

    // 한 번에 하나만 열리도록 나머지를 닫습니다.
    document.querySelectorAll<HTMLElement>(".faq-item.is-open").forEach((other) => {
        if (other === item) return;
        other.classList.remove("is-open");
        const otherPanel = other.querySelector<HTMLElement>(".faq-a");
        if (otherPanel) otherPanel.style.maxHeight = "0px";
        const otherBtn = other.querySelector<HTMLButtonElement>(".faq-q");
        if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
    });

    if (isOpen) {
        item.classList.remove("is-open");
        panel.style.maxHeight = "0px";
        btn.setAttribute("aria-expanded", "false");
    } else {
        item.classList.add("is-open");
        panel.style.maxHeight = panel.scrollHeight + "px";
        btn.setAttribute("aria-expanded", "true");
    }
}

function renderForm(data: EventData): void {
    const form = data.form;
    setText("entryEyebrow", form.eyebrow);
    setText("entryTitle", form.title);
    setText("entryDesc", form.description);
    setText("privacyNote", form.privacyNote);
    setText("entrySubmit", form.submit);

    (["name", "phone", "email", "channel", "agree"] as Array<keyof FormFields>).forEach((key) => {
        const cfg = form.fields[key];
        setText("label-" + key, cfg.label);
        const input = document.getElementById("f-" + key) as HTMLInputElement | HTMLSelectElement | null;
        if (input && cfg.placeholder) input.setAttribute("placeholder", cfg.placeholder);
        const err = document.getElementById("err-" + key);
        if (err) err.textContent = cfg.error;
    });

    const select = el<HTMLSelectElement>("f-channel");
    select.innerHTML =
        '<option value="" disabled selected>선택해 주세요</option>' +
        (form.fields.channel.options ?? []).map((opt) => '<option value="' + esc(opt) + '">' + esc(opt) + "</option>").join("");
}

function renderFooter(data: EventData): void {
    setText("footerBrand", data.meta.brand);
    setText("footerTagline", data.footer.tagline);
    setText("footerAddress", data.footer.address);
    setText("footerContact", data.footer.contact);
    setText("footerNote", data.footer.note);
    setText("footerCopyBrand", data.meta.brand);
    const year = document.getElementById("footerYear");
    if (year) year.textContent = String(new Date().getFullYear());
}



/* ---------------- 6. 카운트다운 ---------------- */
interface CountdownParts{
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
}

const CD_UNITS: Array<{ key: keyof CountdownParts; unit: string }> = [
    { key: "days", unit: "일" },
    { key: "hours", unit: "시간" },
    { key: "minutes", unit: "분" },
    { key: "seconds", unit: "초" }
];

function startCountdown(hero: HeroConfig): void {
    const box = el<HTMLElement>("countdown");
    const foot = el<HTMLElement>("countdownFoot");
    const card = box.closest<HTMLElement>(".countdown-card");
    const label = el<HTMLElement>("countdownLabel");

    const start = new Date(hero.startDate).getTime();
    const end = new Date(hero.endDate).getTime();

    box.innerHTML = CD_UNITS.map(
        (u) => 
            '<div class="cd-box">' +
            '<span class="cd-value" data-unit="' + u.key + '">00</span>' +
            '<span class="cd-unit">' + u.unit + "</span>" +
            "</div>"
    ).join("");

    const slots = new Map<keyof CountdownParts, HTMLElement>();
    box.querySelectorAll<HTMLElement>("[data-unit]").forEach((node) => {
        slots.set(node.dataset.unit as keyof CountdownParts, node);
    });

    const tick = (): void => {
        const now = Date.now();

        if (now < start) {
            label.textContent = "응모 시작까지";
            foot.textContent = "이벤트 시작 " + fmtKST(start) + " · D-day 알림을 준비해 두세요.";
        } else if (now >= end) {
            label.textContent = hero.closedLabel;
            foot.textContent = "다음 시즌 이벤트를 준비하고 있습니다. 뉴스레터를 구독해 주세요.";
            if (card) card.classList.add("is-closed");
            const closed: CountdownParts = { days: "00", hours: "00", minutes: "00", seconds: "00" };
            (Object.keys(closed) as Array<keyof CountdownParts>).forEach((k) => {
                const node = slots.get(k);
                if (node) node.textContent = closed[k];
            });
            window.clearInterval(timer);
            return;
        } else {
            label.textContent = hero.countdownLabel;
        }

        const diff = Math.max(0, end - now);
        const parts: CountdownParts = {
            days: pad2(Math.floor(diff / 86400000)),
            hours: pad2(Math.floor((diff % 86400000) / 3600000)),
            minutes: pad2(Math.floor((diff % 3600000) / 60000)),
            seconds: pad2(Math.floor((diff % 60000) / 1000))
        };

        CD_UNITS.forEach((u) => {
            const node = slots.get(u.key);
            if (node) node.textContent = parts[u.key];
        });

        if (now >= start) {
            foot.textContent =
                "마감 " + fmtKST(end) + " 까지 · 남은 기간 " +
                Math.ceil(diff / 86400000) + "일";
        }
    };

    const timer = window.setInterval(tick, 1000);
    tick();
}



/* ---------------- 7. 응모 폼 ---------------- */
type FieldName = keyof FormFields;

function digitsOnly(value: string): string {
    return value.replace(/\D/g, "");
}

function formatPhone(value: string): string {
    const d = digitsOnly(value).slice(0, 11);
    if (d.length < 4) return d;
    if (d.length < 8) return d.slice(0, 3) + "-" + d.slice(3);
    if (d.length < 11) return d.slice(0, 3) + "-" +d.slice(3, 6) + "-" + d.slice(6);
    return d.slice(0, 3) + "-" + d.slice(3, 7) + "-" + d.slice(7);
}

function validateField(name: FieldName, fields: FormFields): string | null {
    if (name === "agree") {
        const agree = el<HTMLInputElement>("f-agree");
        return agree.checked ? null : fields.agree.error;
    }
    if (name === "channel") {
        const value = el<HTMLSelectElement>("f-channel").value;
        return value ? null : fields.channel.error;
    }
    if (name === "name") {
        const value = el<HTMLInputElement>("f-name").value.trim();
        return value.length >= 2 ? null : fields.name.error;
    }
    if (name === "phone") {
        const d = digitsOnly(el<HTMLInputElement>("f-phone").value);
        return /^01[016789]\d{7,8}$/.test(d) ? null : fields.phone.error;
    }
    const email = el<HTMLInputElement>("f-email").value.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? null : fields.email.error;
}

function showFieldError(name: FieldName, message: string | null): void {
    const field = document.querySelector<HTMLElement>('[data-field="' + name + '"]');
    const box = document.getElementById("err-" + name);
    if (field) field.classList.toggle("has-error", Boolean(message));
    if (box) {
        box.textContent = message ?? "";
        box.hidden = !message;
    }
}

function buildTicketNo(): string {
    const now = new Date();
    const serial = String(Math.floor(Math.random() * 9000) + 1000);
    return "A" + String(now.getFullYear()).slice(2) + "-" + pad2(now.getMonth() + 1) + serial;
}

let lastFocused: HTMLElement | null = null;

function openModal(title: string, body: string, ticketLabel: string, ticketNo: string): void {
    lastFocused = document.activeElement as HTMLElement | null;
    setText("modalTitle", title);
    el<HTMLElement>("modalBody").innerHTML =
        "<p>" + esc(body) + "</p>" +
        '<div class="modal-ticket">' +
        '<p class="modal-ticket-label">' + esc(ticketLabel) + "</p>" +
        '<p class="modal-ticket-value">' + esc(ticketNo) + "</p>" +
        "</div>";
    el<HTMLElement>("modalBackdrop").hidden = false;
    document.body.style.overflow = "hidden";
    el<HTMLButtonElement>("modalConfirm").focus();
}

function closeModal(): void {
    el<HTMLElement>("modalBackdrop").hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
}

function setupForm(data: EventData): void {
    const form = el<HTMLFormElement>("entryForm");
    const status = el<HTMLElement>("formStatus");
    const submit = el<HTMLButtonElement>("entrySubmit");
    const fields = data.form.fields;

    const phoneInput = el<HTMLInputElement>("f-phone");
    phoneInput.addEventListener("input", () => {
        phoneInput.value = formatPhone(phoneInput.value);
    });

    (["name", "phone", "email", "channel", "agree"] as FieldName[]).forEach((name) => {
        const input = document.getElementById("f-" + name);
        if (!input) return;
        const eventName = name === "agree" || name === "channel" ? "change" : "blur";
        input.addEventListener(eventName, () => {
            if (document.querySelector('[data-field="' + name + '"].has-error')) {
                showFieldError(name, validateField(name, fields));
            }
        });
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        status.textContent = "";

        let firstInvalid: FieldName | null = null;
        (["name", "phone", "email", "channel", "agree"] as FieldName[]).forEach((name) => {
            const error = validateField(name, fields);
            showFieldError(name, error);
            if (error && !firstInvalid) firstInvalid = name;
        });

        if (firstInvalid) {
            status.textContent = "입력하지 않았거나 형식이 올바르지 않은 항목이 있습니다.";
            status.style.color = "#dc2626";
            const target = document.getElementById("f-" + firstInvalid);
            if (target) target.focus();
            return;
        }

        status.style.color = "";
        submit.disabled = true;
        submit.textContent = data.form.submitting;

        // 실서비스에서는 아래 블록을 fetch('/api/entry', { method: 'POST', ... }) 로 교체하세요.
        window.setTimeout(() => {
            const payload = {
                eventId: data.meta.eventId,
                name: el<HTMLInputElement>("f-name").value.trim(),
                phone: digitsOnly(phoneInput.value),
                email: el<HTMLInputElement>("f-email").value.trim(),
                channel: el<HTMLSelectElement>("f-channel").value,
                agreedAt: new Date().toISOString()
            };
            console.info("[event-page] 응모 데이터(데모, 서버 전송 없음):", payload);

            submit.disabled = false;
            submit.textContent = data.form.submit;
            form.reset();
            status.textContent = "응모가 접수되었습니다. 참여해 주셔서 감사합니다!";
            status.style.color = "";

            openModal(data.form.successTitle, data.form.successBody, data.form.ticketLabel, buildTicketNo());
        }, 600);
    });
}



/* ---------------- 8. 헤더 · 스크롤 인터랙션 ---------------- */
function setupHeader(): void {
    const header = el<HTMLElement>("siteHeader");
    const toggle = el<HTMLButtonElement>("navToggle");

    const onScroll = (): void => {
        header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    toggle.addEventListener("click", () => {
        const open = header.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    });

    document.querySelectorAll<HTMLAnchorElement>('.nav-link, .nav-cta, .brand').forEach((link) => {
        link.addEventListener("click", () => {
            header.classList.remove("nav-open");
            toggle.setAttribute("aria-expanded", "false");
        });
    });
}

function setupReveal(): void {
    const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
        targets.forEach((node) => node.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    targets.forEach((node) => observer.observe(node));

    // 안전장치: 스크롤 이벤트가 없는 환경(정적 캡처·일부 인앱 브라우저)에서도
    // 콘텐츠가 opacity 0 으로 남지 않도록 1.4초 뒤 모두 노출합니다.
    window.setTimeout(() => {
        document
            .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)")
            .forEach((node) => node.classList.add("is-visible"));
    }, 1400);
}

function setupModal(): void {
    el<HTMLButtonElement>("modalConfirm").addEventListener("click", closeModal);
    el<HTMLButtonElement>("modalClose").addEventListener("click", closeModal);
    el<HTMLElement>("modalBackdrop").addEventListener("click", (event) => {
        if (event.target === event.currentTarget) closeModal();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && ! el<HTMLElement>("modalBackdrop").hidden) closeModal();
    });
}



/* ---------------- 9. 부트스트랩 ---------------- */
async function init(): Promise<void> {
    const data = await loadEventData();

    renderNav(data);
    renderHero(data);
    renderStats(data);
    renderPrizes(data);
    renderSchedule(data);
    renderFaq(data);
    renderForm(data);
    renderFooter(data);

    startCountdown(data.hero);
    setupForm(data);
    setupHeader();
    setupModal();
    setupReveal();

    document.documentElement.lang = data.meta.locale;
    document.title = "2026 가을 감사 페스티벌 | " + data.meta.brand;

    document.body.dataset.ready = "true";
}

document.addEventListener("DOMContentLoaded", () => {
    void init().catch((err: unknown) => {
        console.error("[event-page] 초기화 중 오류:", err);
    });
});