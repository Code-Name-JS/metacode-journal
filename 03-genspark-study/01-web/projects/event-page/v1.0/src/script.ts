/* ============================================================
 * 2026 가을 감사 페스티벌 — main.ts
 * 이벤트 페이지의 모든 동작(데이터 로딩 · 렌더링 · 카운트다운 ·
 * FAQ 아코디언 · 응모 폼 검증 · 완료 모달 · 스크롤 인터랙션)
 * 을 담당하는 TypeScript 원본입니다.
 * 컴파일: npx tsc  →  js/main.js
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
        endDate: "2026-10-31T23:59:59+90:00",
        countdownLabel: "응모 마감까지",
        closedLabel: "이벤트가 종료되었습니다",
        ctaPrimary: "지금 응모하기",
        ctaSecondary: "경품 보로가기",
        metaLabel: "응모 기간 2026.09.15 (화) ~ 2026.10.31 (토) · 누구나 무료 참여"
    },
    stats: [
        { value: "1,200", suffix: "명", label: "총 당첨 인원"}
    ]
}