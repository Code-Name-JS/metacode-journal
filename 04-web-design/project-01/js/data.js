/* =====================================================
   data.js — 공유 데이터 · 포맷 함수 (모든 페이지가 먼저 불러옴)
   ===================================================== */
"use strict";

// 주문 내역 (최신순) — 멤버십 등급은 이 목록에서 "최근 6개월 + 구매확정(done)" 주문만 모아 계산함 [연결㉒]
const ORDERS = [
    { id: "20261001-001", date: "2026.10.01", name: "무선 노이즈캔슬링 헤드폰", opt: "미드나이트 블랙/단품", price: 249000, status: "shipping", emoji: "🎧" },
    { id: "20260929-014", date: "2026.09.29", name: "오버사이즈 코튼 셔츠", opt: "화이트 / M", price: 39800, status: "shipping", emoji: "👕" },
    { id: "20260922-008", date: "2026.09.22", name: "스마트 워치 밴드 세트", opt: "실리콘 + 메탈 / 42mm", price: 59000, status: "done", emoji: "⌚" },
    { id: "20260915-031", date: "2026.09.15", name: "데일리 백팩 20L", opt: "차콜 그레이", price: 89000, status: "done", emoji: "🎒" },
    { id: "20260908-002", date: "2026.09.08", name: "텀블러 500ml 2개 세트", opt: "크림 + 세이지", price: 42000, status: "done", emoji: "🥤" },
    { id: "20260826-019", date: "2026.08.26", name: "울 혼방 오버핏 코트", opt: "카멜 / L", price: 190400, status: "done", emoji: "🧥" },
    { id: "20260802-007", date: "2026.08.02", name: "경량 러닝화", opt: "화이트 / 260", price: 118000, status: "done", emoji: "👟" },
    { id: "20260714-022", date: "2026.07.14", name: "블루투스 스피커 미니", opt: "샌드 베이지", price: 79200, status: "done", emoji: "🔊" },
    { id: "20260621-003", date: "2026.06.21", name: "무드 스탠드 조명", opt: "웜 화이트", price: 64000, status: "done", emoji: "💡" },
    { id: "20260528-011", date: "2026.05.28", name: "무선 충전 거치대 3in1", opt: "블랙", price: 47200, status: "done", emoji: "🔋" },
    { id: "20260430-016", date: "2026.04.30", name: "프리미엄 에어프라이어 5.5L", opt: "매트 블랙", price: 278800, status: "done", emoji: "🍳" },
    { id: "20260318-005", date: "2026.03.18", name: "캐시미어 라운드 니트", opt: "오트밀 / M", price: 159000, status: "done", emoji: "🧶" }   // 6개월 지남 → 등급에서 빠짐
];

const STATUS_TEXT = { shipping: "배송중", done: "구매확정", ready: "결제대기" };

// 주문 상태 저장 — 구매확정 버튼으로 바뀐 상태를 { "주문번호": "done" } 형태로 저장
// 페이지를 옮기거나 새로고침해도 ORDERS에 다시 덮어써서 mypage ↔ membership이 같은 상태를 봄
const ORDER_STATUS_KEY = "shoply-order-status";

function loadOrderStatus() {
    try {
        const saved = JSON.parse(localStorage.getItem(ORDER_STATUS_KEY));
        if (saved && typeof saved === "object") return saved;
    } catch (e) { }
    return {};
}

function saveOrderStatus() {
    const map = {};
    ORDERS.forEach((o) => (map[o.id] = o.status));
    try { localStorage.setItem(ORDER_STATUS_KEY, JSON.stringify(map)); } catch (e) { }
}

// 저장된 상태를 ORDERS에 덮어쓰기 — 다른 탭에서 바뀌었을 때도 이 함수를 다시 부름
function applyOrderStatus() {
    const saved = loadOrderStatus();
    ORDERS.forEach((o) => {
        if (STATUS_TEXT[saved[o.id]]) o.status = saved[o.id];   // 모르는 상태값은 무시
    });
}
applyOrderStatus();

const WISH = [
    { brand: "SOUNDLAB", name: "블루투스 스피커 미니", price: 79000, was: 99000, emoji: "🔊" },
    { brand: "MODEWORK", name: "울 혼방 오버핏 코트", price: 189000, was: 238000, emoji: "🧥" },
    { brand: "DAILYSTEP", name: "경량 러닝화", price: 118000, was: null, emoji: "👟" },
    { brand: "HOMEFIT", name: "스탠드 조명", price: 64000, was: 82000, emoji: "💡" },
    { brand: "PAPERCO", name: "2027 다이어리 위클리", price: 21000, was: null, emoji: "📒" },
    { brand: "GREENLAB", name: "공기정화 식물 3종", price: 33000, was: 39000, emoji: "🪴" }
];

const won = (n) => n.toLocaleString("ko-KR") + "원";

// 홈 상품 데이터 — 키가 home.html <article id="..."> 값과 같아야 함 [연결⑨]
const GOODS = {
    "goods-1": { brand: "SOUNDLAB",  name: "무선 노이즈캔슬링 헤드폰", price: 199000, was: 320000, emoji: "🎧" },
    "goods-2": { brand: "MODEWORK",  name: "오버사이즈 코튼 셔츠",     price: 31840,  was: 39800,  emoji: "👕" },
    "goods-3": { brand: "TECHFIT",   name: "스마트 워치 밴드 세트",    price: 50150,  was: 59000,  emoji: "⌚" },
    "goods-4": { brand: "DAILYSTEP", name: "데일리 백팩 20L",          price: 89000,  was: null,   emoji: "🎒" },
    "goods-5": { brand: "HOMEFIT",   name: "텀블러 500ml 2개 세트",    price: 31500,  was: 42000,  emoji: "🥤" },
    "goods-6": { brand: "MODEWORK",  name: "울 혼방 오버핏 코트",      price: 190400, was: 238000, emoji: "🧥" },
    "goods-7": { brand: "SOUNDLAB",  name: "블루투스 스피커 미니",     price: 79200,  was: 99000,  emoji: "🔊" },
    "goods-8": { brand: "DAILYSTEP", name: "경량 러닝화",              price: 118000, was: null,   emoji: "👟" },

    // 신상품 (new.html) — GOODS에 같이 두어야 장바구니·찜 페이지에서도 이름·가격을 찾을 수 있음
    "goods-9":  { brand: "TECHFIT",   name: "무선 충전 거치대 3in1",    price: 47200,  was: 59000,  emoji: "🔋" },
    "goods-10": { brand: "MODEWORK",  name: "캐시미어 블렌드 머플러",   price: 42000,  was: null,   emoji: "🧣" },
    "goods-11": { brand: "HOMEFIT",   name: "핸드드립 커피 세트",       price: 38400,  was: 48000,  emoji: "☕" },
    "goods-12": { brand: "DAILYSTEP", name: "방수 트레킹 부츠",         price: 129000, was: null,   emoji: "🥾" },
    "goods-13": { brand: "GLOWLAB",   name: "수분 진정 크림 50ml",      price: 25500,  was: 34000,  emoji: "🧴" },
    "goods-14": { brand: "SOUNDLAB",  name: "오픈형 무선 이어버드",     price: 89100,  was: 99000,  emoji: "🎵" },

    // 기획전 (exhibition.html) 전용 상품
    "goods-15": { brand: "MODEWORK",  name: "울 블렌드 니트 가디건",    price: 29700,  was: 99000,  emoji: "🧶" },
    "goods-16": { brand: "SOUNDLAB",  name: "홈시어터 사운드바",        price: 192500, was: 350000, emoji: "📻" },
    "goods-17": { brand: "HOMEFIT",   name: "무드 스탠드 조명",         price: 57400,  was: 82000,  emoji: "💡" },
    "goods-18": { brand: "HOMEFIT",   name: "세라믹 머그 2P 세트",      price: 22400,  was: 32000,  emoji: "🍵" }
};

// 장바구니 데이터
// 페이지를 옮기면 변수는 초기화되므로 localStorage에 저장해 home ↔ cart가 같은 목록을 씀
const CART_KEY = "shoply-cart";
const DEFAULT_CART = [
    { id: "goods-1", brand: "SOUNDLAB", name: "무선 노이즈캔슬링 헤드폰", opt: "미드나이트 블랙 / 단품", price: 199000, was: 320000, qty: 1, checked: true,  emoji: "🎧" },
    { id: "goods-2", brand: "MODEWORK", name: "오버사이즈 코튼 셔츠",     opt: "화이트 / M",            price: 31840,  was: 39800,  qty: 2, checked: true,  emoji: "👕" },
    { id: "goods-5", brand: "HOMEFIT",  name: "텀블러 500ml 2개 세트",    opt: "크림 + 세이지",         price: 31500,  was: 42000,  qty: 1, checked: false, emoji: "🥤" }
];

function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem(CART_KEY));  // 저장된 게 없으면 null
        if (Array.isArray(saved)) return saved;
    } catch (e) { /* 저장소를 못 쓰는 환경이면 기본값 사용 */ }
    return DEFAULT_CART;
}

function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(CART)); } catch (e) { }
}

const CART = loadCart();

// 실시간 랭킹 — "다른 고객이 담은 수"(기준값) + 내가 담기를 누른 횟수 = 담긴 수
// 기준값 차이를 작게 둬서, 몇 번만 담아도 순위가 바뀌는 게 보이도록 함
const RANK_BASE = {
    "goods-1": 9, "goods-4": 8, "goods-6": 7, "goods-8": 6,
    "goods-5": 5, "goods-2": 4, "goods-3": 3, "goods-7": 2
};

// 담기 횟수 — 장바구니(CART)와 따로 저장하므로, 장바구니에서 지워도 줄어들지 않음
// { "goods-1": 2, "goods-5": 1, ... } 형태
const ADDS_KEY = "shoply-adds";

function loadAdds() {
    try {
        const saved = JSON.parse(localStorage.getItem(ADDS_KEY));
        if (saved && typeof saved === "object") return saved;
    } catch (e) { }
    return {};
}

function saveAdds() {
    try { localStorage.setItem(ADDS_KEY, JSON.stringify(ADDS)); } catch (e) { }
}

const ADDS = loadAdds();

// 담기 1번 = 1회 증가 (common.js addToCart()가 부름)
function countAdd(id) {
    ADDS[id] = (ADDS[id] || 0) + 1;
    saveAdds();
}

// 담긴 수 많은 순으로 정렬한 랭킹 — [{ id, ...GOODS[id], base, mine, score, move }]
// move: 기준값만으로 매긴 순위와 비교해 몇 칸 올랐는지(+) 내려갔는지(-)
function getRanking() {
    const ids = Object.keys(RANK_BASE);
    const baseOrder = [...ids].sort((a, b) => RANK_BASE[b] - RANK_BASE[a]);

    return ids
        .map((id) => {
            const mine = ADDS[id] || 0;
            return { id, ...GOODS[id], base: RANK_BASE[id], mine, score: RANK_BASE[id] + mine };
        })
        .sort((a, b) => b.score - a.score || b.base - a.base)   // 점수가 같으면 기준값이 큰 쪽이 위
        .map((g, i) => ({ ...g, move: baseOrder.indexOf(g.id) - i }));
}

// 찜 데이터 — GOODS의 키("goods-N")만 저장 → home · best · wish가 같은 목록을 씀 [연결⑨]
// 상품 이름·가격은 GOODS에서 꺼내 쓰므로 id만 있으면 충분
const WISH_KEY = "shoply-wish";

function loadWish() {
    try {
        const saved = JSON.parse(localStorage.getItem(WISH_KEY));
        if (Array.isArray(saved)) return saved.filter((id) => GOODS[id]);  // 없는 상품 id는 버림
    } catch (e) { }
    return [];
}

function saveWish() {
    try { localStorage.setItem(WISH_KEY, JSON.stringify(WISH_IDS)); } catch (e) { }
}

const WISH_IDS = loadWish();

// 쿠폰 — "어떤 쿠폰인지(정보)"와 "내가 가진 쿠폰(보유)"을 나눠 둠
// 키 ↔ new.html의 data-coupon 값 (welcome · new10) [연결③]
// days: 받은 날부터 며칠 동안 쓸 수 있는지 / until: 정해진 만료일
const COUPON_INFO = {
    welcome:  { name: "신규 가입 감사 쿠폰",  value: "3,000", unit: "원 할인", cond: "30,000원 이상 구매 시",         days: 30 },
    new10:    { name: "신상품 10% 할인 쿠폰", value: "10",    unit: "% 할인",  cond: "최대 10,000원 · 신상품 전용",   days: 7 },
    vip10:    { name: "VIP 전용 할인 쿠폰",   value: "10",    unit: "% 할인",  cond: "최대 20,000원 할인",            until: "2026-10-09" },
    freeship: { name: "무료배송 쿠폰",        value: "무료",  unit: "배송",    cond: "금액 제한 없음",                until: "2026-10-31" },
    review:   { name: "리뷰 작성 보상 쿠폰",  value: "5,000", unit: "원 할인", cond: "50,000원 이상 구매 시",         until: "2026-11-15" },

    // membership.html에서 받는 쿠폰 — 키 ↔ GRADES의 coupons · birthday 값
    // 이달의 등급 쿠폰 (등급마다 다름)
    silver2000: { name: "SILVER 이달의 등급 쿠폰", value: "2,000",  unit: "원 할인", cond: "30,000원 이상 구매 시",       days: 30 },
    gold3000:   { name: "GOLD 이달의 등급 쿠폰",   value: "3,000",  unit: "원 할인", cond: "30,000원 이상 구매 시",       days: 30 },
    vip5000:    { name: "VIP 이달의 등급 쿠폰",    value: "5,000",  unit: "원 할인", cond: "50,000원 이상 구매 시",       days: 30 },
    vipShip:    { name: "VIP 무료배송 쿠폰",       value: "무료",   unit: "배송",    cond: "금액 제한 없음 · 등급 혜택",  days: 30 },
    vvip10000:  { name: "VVIP 이달의 등급 쿠폰",   value: "10,000", unit: "원 할인", cond: "70,000원 이상 구매 시",       days: 30 },
    vvipShip:   { name: "VVIP 무료배송 쿠폰",      value: "무료",   unit: "배송",    cond: "금액 제한 없음 · 등급 혜택",  days: 30 },
    // 생일 쿠폰 (등급마다 할인율이 다름 — 1년에 한 장만)
    bday10:     { name: "생일 축하 쿠폰",          value: "10",     unit: "% 할인",  cond: "최대 10,000원 할인",          days: 30 },
    bday15:     { name: "생일 축하 쿠폰",          value: "15",     unit: "% 할인",  cond: "최대 30,000원 할인",          days: 30 },
    bday20:     { name: "생일 축하 쿠폰",          value: "20",     unit: "% 할인",  cond: "최대 50,000원 할인",          days: 30 },

    // event.html 브랜드 위크 참여 쿠폰 — 키 ↔ BRAND_EVENTS의 coupon 값
    evGlowlab:   { name: "GLOWLAB 브랜드 위크 쿠폰",   value: "15", unit: "% 할인", cond: "GLOWLAB 상품 · 최대 10,000원",   days: 7 },
    evSoundlab:  { name: "SOUNDLAB 브랜드 위크 쿠폰",  value: "10", unit: "% 할인", cond: "SOUNDLAB 상품 · 최대 30,000원",  days: 7 },
    evModework:  { name: "MODEWORK 브랜드 위크 쿠폰",  value: "15", unit: "% 할인", cond: "MODEWORK 상품 · 최대 30,000원",  days: 7 },
    evHomefit:   { name: "HOMEFIT 브랜드 위크 쿠폰",   value: "12", unit: "% 할인", cond: "HOMEFIT 상품 · 최대 15,000원",   days: 7 },
    evTechfit:   { name: "TECHFIT 브랜드 위크 쿠폰",   value: "10", unit: "% 할인", cond: "TECHFIT 상품 · 최대 10,000원",   days: 7 },
    evDailystep: { name: "DAILYSTEP 브랜드 위크 쿠폰", value: "20", unit: "% 할인", cond: "DAILYSTEP 상품 · 최대 30,000원", days: 7 }
};

// 처음부터 가지고 있던 쿠폰 (원래 마이페이지 쿠폰함에 있던 것)
const BASE_COUPONS = ["vip10", "freeship", "review"];

// new.html에서 받은 쿠폰 — [{ key: "welcome", at: 받은 시각(ms) }]
const COUPON_KEY = "shoply-coupons";

function loadCoupons() {
    try {
        const saved = JSON.parse(localStorage.getItem(COUPON_KEY));
        if (Array.isArray(saved)) {
            return saved
                .map((c) => (typeof c === "string" ? { key: c, at: Date.now() } : c))  // 예전 형식("welcome")도 읽기
                .filter((c) => COUPON_INFO[c.key]);
        }
    } catch (e) { }
    return [];
}

function saveCoupons() {
    try { localStorage.setItem(COUPON_KEY, JSON.stringify(ISSUED_COUPONS)); } catch (e) { }
}

const ISSUED_COUPONS = loadCoupons();


// 멤버십 등급 — 최근 6개월 구매 금액(min) · 구매 건수(orders)를 "둘 다" 채워야 그 등급 [연결㉒]
// 키 ↔ membership.html의 data-grade · data-min 값 / rate: 구매 적립률(%)
// coupons: 이달의 등급 쿠폰 / birthday: 생일 쿠폰 (모두 COUPON_INFO 키)
const GRADES = [
    { key: "family", name: "FAMILY", emoji: "🌱", min: 0,       orders: 0,  rate: 1, coupons: [],                        birthday: "bday10" },
    { key: "silver", name: "SILVER", emoji: "🥈", min: 150000,  orders: 3,  rate: 2, coupons: ["silver2000"],            birthday: "bday10" },
    { key: "gold",   name: "GOLD",   emoji: "🥇", min: 300000,  orders: 5,  rate: 3, coupons: ["gold3000"],              birthday: "bday15" },
    { key: "vip",    name: "VIP",    emoji: "💎", min: 600000,  orders: 7,  rate: 4, coupons: ["vip5000", "vipShip"],    birthday: "bday15" },
    { key: "vvip",   name: "VVIP",   emoji: "👑", min: 1000000, orders: 10, rate: 5, coupons: ["vvip10000", "vvipShip"], birthday: "bday20" }
];

// 회원 정보 — 구매 금액 · 건수는 여기 적지 않고 ORDERS에서 계산함
const MEMBER = { name: "김지우", birthMonth: 10, birthDay: 21, joined: "2024-09-12" };

// "2026.09.22" → Date (내 컴퓨터 시간 0시 기준)
const orderDate = (o) => new Date(o.date.replace(/\./g, "-") + "T00:00:00");

// 등급 산정 시작일 = 오늘에서 6개월 전 (0시)
function gradeFrom() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setMonth(d.getMonth() - 6);
    return d;
}

// 주문 하나가 등급에 들어가는지 — "counted"(반영) · "pending"(구매확정 전) · "expired"(6개월 지남)
function gradeState(o) {
    if (orderDate(o) < gradeFrom()) return "expired";
    return o.status === "done" ? "counted" : "pending";
}

// 등급에 반영되는 금액 · 건수 = 최근 6개월 + 구매확정 주문만
function getGradeBase() {
    const counted = ORDERS.filter((o) => gradeState(o) === "counted");
    return {
        spent: counted.reduce((sum, o) => sum + o.price, 0),
        orders: counted.length
    };
}

// 금액 · 건수 → 조건을 모두 채운 가장 높은 등급의 번호(0~4)
function gradeIndexOf(spent, orders) {
    let idx = 0;
    GRADES.forEach((g, i) => {
        if (spent >= g.min && orders >= g.orders) idx = i;
    });
    return idx;
}

// 등급 현황 — mypage(다음 등급까지) · membership이 같은 값을 씀
// 값을 안 넘기면 ORDERS로 계산 / 시뮬레이터는 { spent, orders }를 직접 넘김
// { spent, orders, idx, grade, next, needAmount, needOrders, amountPct, orderPct } / 최고 등급이면 next = null
function getGradeStatus(base = getGradeBase()) {
    const { spent, orders } = base;
    const idx = gradeIndexOf(spent, orders);
    const next = GRADES[idx + 1] || null;
    return {
        spent,
        orders,
        idx,
        grade: GRADES[idx],
        next,
        needAmount: next ? Math.max(0, next.min - spent) : 0,
        needOrders: next ? Math.max(0, next.orders - orders) : 0,
        amountPct: next ? Math.min(100, Math.round((spent / next.min) * 100)) : 100,
        orderPct: next ? Math.min(100, Math.round((orders / next.orders) * 100)) : 100
    };
}


// 브랜드 — 키 ↔ GOODS의 brand 값 (대문자 그대로) [연결㉕]
// tone: 브랜드 색 (brand · event 페이지가 style.setProperty("--tone")으로 씀)
const BRANDS = {
    SOUNDLAB:  { ko: "사운드랩",   logo: "🎧", tone: "#7c3aed", cat: "오디오",          slogan: "귀로 느끼는 프리미엄",   desc: "노이즈캔슬링 헤드폰부터 홈시어터까지, 소리 하나에 진심인 오디오 브랜드예요." },
    MODEWORK:  { ko: "모드워크",   logo: "🧥", tone: "#ea580c", cat: "패션",            slogan: "매일 입고 싶은 기본",    desc: "좋은 소재와 편한 핏으로 오래 입는 기본 옷을 만드는 패션 브랜드예요." },
    HOMEFIT:   { ko: "홈핏",       logo: "🏠", tone: "#d97706", cat: "리빙 · 주방",     slogan: "집이 편해지는 물건",     desc: "텀블러, 커피 도구, 조명까지 집에서의 시간을 채워 주는 리빙 브랜드예요." },
    TECHFIT:   { ko: "테크핏",     logo: "⌚", tone: "#0284c7", cat: "디지털 액세서리", slogan: "기기에 꼭 맞는 한 조각", desc: "워치 밴드와 충전 거치대처럼 매일 쓰는 기기를 더 편하게 만드는 브랜드예요." },
    DAILYSTEP: { ko: "데일리스텝", logo: "👟", tone: "#16a34a", cat: "스포츠 · 아웃도어", slogan: "오늘도 한 걸음 더",     desc: "출퇴근 백팩부터 러닝화, 트레킹 부츠까지 걷는 날을 위한 브랜드예요." },
    GLOWLAB:   { ko: "글로우랩",   logo: "🧴", tone: "#db2777", cat: "뷰티",            slogan: "피부가 쉬는 시간",       desc: "자극 없이 순한 성분으로 피부 장벽을 지키는 스킨케어 브랜드예요." }
};

// 브랜드 위크 — 브랜드마다 7일(EVENT_DAYS)씩 이어지는 추가 할인 이벤트 (event · brand 페이지가 같이 씀)
// key ↔ event.html의 #soundlab 같은 주소 · data-ev 값 / rate: 추가 할인율(%) / base: 이미 신청한 다른 회원 수
const EVENT_DAYS = 7;
const BRAND_EVENTS = [
    { key: "glowlab",   brand: "GLOWLAB",   start: "2026-09-26", rate: 15, title: "글로우 스킨 위크",  base: 312, coupon: "evGlowlab",
      mission: "요즘 내 피부 고민을 댓글로 남겨 주세요.", prize: "추첨 10명 · 수분 진정 크림 정품" },
    { key: "soundlab",  brand: "SOUNDLAB",  start: "2026-10-01", rate: 10, title: "사운드 위크",       base: 248, coupon: "evSoundlab",
      mission: "갖고 싶은 SOUNDLAB 제품과 이유를 댓글로 남겨 주세요.", prize: "추첨 5명 · 10,000P / 1명 · 노이즈캔슬링 헤드폰" },
    { key: "modework",  brand: "MODEWORK",  start: "2026-10-03", rate: 15, title: "가을 아우터 위크",  base: 187, coupon: "evModework",
      mission: "올가을 입고 싶은 코디를 댓글로 소개해 주세요.", prize: "추첨 3명 · 울 혼방 오버핏 코트" },
    { key: "homefit",   brand: "HOMEFIT",   start: "2026-10-05", rate: 12, title: "홈카페 위크",       base: 41,  coupon: "evHomefit",
      mission: "나만의 홈카페 레시피나 집에서 쉬는 방법을 댓글로 알려 주세요.", prize: "추첨 7명 · 핸드드립 커피 세트" },
    { key: "techfit",   brand: "TECHFIT",   start: "2026-10-08", rate: 10, title: "스마트 기어 위크",  base: 0,   coupon: "evTechfit",
      mission: "책상 위 가장 아끼는 기기를 댓글로 자랑해 주세요.", prize: "추첨 5명 · 무선 충전 거치대 3in1" },
    { key: "dailystep", brand: "DAILYSTEP", start: "2026-10-12", rate: 20, title: "러닝 시즌 위크",    base: 0,   coupon: "evDailystep",
      mission: "이번 가을 걷고 싶은 길이나 러닝 코스를 댓글로 남겨 주세요.", prize: "추첨 3명 · 경량 러닝화" }
];

// 이벤트 하나의 기간 · 상태 계산
// status: "live"(진행 중) · "soon"(오픈 예정) · "ended"(종료) / day: 오늘이 며칠째인지(1~7)
function eventInfo(ev) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(ev.start + "T00:00:00");
    const end = new Date(start);
    end.setDate(end.getDate() + EVENT_DAYS - 1);              // 시작일 포함 7일 → 끝나는 날은 +6
    const dayMs = 24 * 60 * 60 * 1000;
    return {
        ...ev,
        start,
        end,
        status: today < start ? "soon" : today > end ? "ended" : "live",
        toStart: Math.round((start - today) / dayMs),          // 오픈까지 남은 날
        toEnd: Math.round((end - today) / dayMs),              // 마감까지 남은 날 (0 = 오늘 마감)
        day: Math.round((today - start) / dayMs) + 1
    };
}

// 브랜드의 이벤트 — 진행 중인 것이 있으면 그것, 없으면 가장 가까운 오픈 예정, 그것도 없으면 null
function brandEventOf(brand) {
    const list = BRAND_EVENTS.filter((ev) => ev.brand === brand).map(eventInfo);
    return list.find((e) => e.status === "live") || list.find((e) => e.status === "soon") || null;
}

// 이벤트가 — 100원 단위로 반올림
const eventPrice = (price, rate) => Math.round((price * (1 - rate / 100)) / 100) * 100;
