/* =====================================================
   data.js — 공유 데이터 · 포맷 함수 (모든 페이지가 먼저 불러옴)
   ===================================================== */
"use strict";

const ORDERS = [
    { id: "20261001-001", date: "2026.10.01", name: "무선 노이즈캔슬링 헤드폰", opt: "미드나이트 블랙/단품", price: 249000, status: "shipping", emoji: "🎧" },
    { id: "20260929-014", date: "2026.09.29", name: "오버사이즈 코튼 셔츠", opt: "화이트 / M", price: 39800, status: "shipping", emoji: "👕" },
    { id: "20260922-008", date: "2026.09.22", name: "스마트 워치 밴드 세트", opt: "실리콘 + 메탈 / 42mm", price: 59000, status: "done", emoji: "⌚" },
    { id: "20260915-031", date: "2026.09.15", name: "데일리 백팩 20L", opt: "차콜 그레이", price: 89000, status: "done", emoji: "🎒" },
    { id: "20260908-002", date: "2026.09.08", name: "텀블러 500ml 2개 세트", opt: "크림 + 세이지", price: 42000, status: "done", emoji: "🥤" }
];

const WISH = [
    { brand: "SOUNDLAB", name: "블루투스 스피커 미니", price: 79000, was: 99000, emoji: "🔊" },
    { brand: "MODEWORK", name: "울 혼방 오버핏 코트", price: 189000, was: 238000, emoji: "🧥" },
    { brand: "DAILYSTEP", name: "경량 러닝화", price: 118000, was: null, emoji: "👟" },
    { brand: "HOMEFIT", name: "스탠드 조명", price: 64000, was: 82000, emoji: "💡" },
    { brand: "PAPERCO", name: "2027 다이어리 위클리", price: 21000, was: null, emoji: "📒" },
    { brand: "GREENLAB", name: "공기정화 식물 3종", price: 33000, was: 39000, emoji: "🪴" }
];

const STATUS_TEXT = { shipping: "배송중", done: "구매확정", ready: "결제대기" };
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
    "goods-8": { brand: "DAILYSTEP", name: "경량 러닝화",              price: 118000, was: null,   emoji: "👟" }
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
