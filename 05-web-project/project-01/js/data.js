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
// cats: 상품이 들어가는 카테고리 (CATEGORIES 키) — 한 상품이 여러 카테고리에 들어갈 수 있음 [연결㉖]
const GOODS = {
    "goods-1": { brand: "SOUNDLAB",  name: "무선 노이즈캔슬링 헤드폰", price: 199000, was: 320000, emoji: "🎧", cats: ["digital", "gift"] },
    "goods-2": { brand: "MODEWORK",  name: "오버사이즈 코튼 셔츠",     price: 31840,  was: 39800,  emoji: "👕", cats: ["fashion"] },
    "goods-3": { brand: "TECHFIT",   name: "스마트 워치 밴드 세트",    price: 50150,  was: 59000,  emoji: "⌚", cats: ["digital"] },
    "goods-4": { brand: "DAILYSTEP", name: "데일리 백팩 20L",          price: 89000,  was: null,   emoji: "🎒", cats: ["sports", "fashion"] },
    "goods-5": { brand: "HOMEFIT",   name: "텀블러 500ml 2개 세트",    price: 31500,  was: 42000,  emoji: "🥤", cats: ["kitchen", "living"] },
    "goods-6": { brand: "MODEWORK",  name: "울 혼방 오버핏 코트",      price: 190400, was: 238000, emoji: "🧥", cats: ["fashion"] },
    "goods-7": { brand: "SOUNDLAB",  name: "블루투스 스피커 미니",     price: 79200,  was: 99000,  emoji: "🔊", cats: ["digital", "gift"] },
    "goods-8": { brand: "DAILYSTEP", name: "경량 러닝화",              price: 118000, was: null,   emoji: "👟", cats: ["sports"] },

    // 신상품 (new.html) — GOODS에 같이 두어야 장바구니·찜 페이지에서도 이름·가격을 찾을 수 있음
    "goods-9":  { brand: "TECHFIT",   name: "무선 충전 거치대 3in1",    price: 47200,  was: 59000,  emoji: "🔋", cats: ["digital"] },
    "goods-10": { brand: "MODEWORK",  name: "캐시미어 블렌드 머플러",   price: 42000,  was: null,   emoji: "🧣", cats: ["fashion", "gift"] },
    "goods-11": { brand: "HOMEFIT",   name: "핸드드립 커피 세트",       price: 38400,  was: 48000,  emoji: "☕", cats: ["kitchen", "gift"] },
    "goods-12": { brand: "DAILYSTEP", name: "방수 트레킹 부츠",         price: 129000, was: null,   emoji: "🥾", cats: ["sports"] },
    "goods-13": { brand: "GLOWLAB",   name: "수분 진정 크림 50ml",      price: 25500,  was: 34000,  emoji: "🧴", cats: ["beauty"] },
    "goods-14": { brand: "SOUNDLAB",  name: "오픈형 무선 이어버드",     price: 89100,  was: 99000,  emoji: "🎵", cats: ["digital", "sports"] },

    // 기획전 (exhibition.html) 전용 상품
    "goods-15": { brand: "MODEWORK",  name: "울 블렌드 니트 가디건",    price: 29700,  was: 99000,  emoji: "🧶", cats: ["fashion"] },
    "goods-16": { brand: "SOUNDLAB",  name: "홈시어터 사운드바",        price: 192500, was: 350000, emoji: "📻", cats: ["digital", "living"] },
    "goods-17": { brand: "HOMEFIT",   name: "무드 스탠드 조명",         price: 57400,  was: 82000,  emoji: "💡", cats: ["living"] },
    "goods-18": { brand: "HOMEFIT",   name: "세라믹 머그 2P 세트",      price: 22400,  was: 32000,  emoji: "🍵", cats: ["kitchen", "gift"] },

    // 카테고리 페이지(category.html)용으로 더한 상품 — 도서 · 뷰티 · 리빙이 비거나 적어서
    "goods-19": { brand: "PAPERCO",   name: "2027 다이어리 위클리",     price: 21000,  was: null,   emoji: "📒", cats: ["book", "gift"] },
    "goods-20": { brand: "PAPERCO",   name: "에세이 『오늘의 쉼표』",     price: 15120,  was: 16800,  emoji: "📖", cats: ["book"] },
    "goods-21": { brand: "PAPERCO",   name: "집에서 즐기는 홈카페 레시피북", price: 19800, was: 22000, emoji: "📚", cats: ["book", "kitchen"] },
    "goods-22": { brand: "GLOWLAB",   name: "마일드 선크림 SPF50+",     price: 18900,  was: 27000,  emoji: "🌞", cats: ["beauty"] },
    "goods-23": { brand: "GLOWLAB",   name: "립 & 핸드 기프트 세트",    price: 29900,  was: 35000,  emoji: "💝", cats: ["beauty", "gift"] },
    "goods-24": { brand: "HOMEFIT",   name: "극세사 소파 블랭킷",       price: 34200,  was: 38000,  emoji: "🛋️", cats: ["living", "gift"] }
};

// 카테고리별로 더한 상품 — 카테고리마다 21개씩
// [이름, 브랜드, 판매가, 정가(할인 없으면 null), 이모지, 함께 들어갈 카테고리]
// 아래 반복문이 GOODS에 "goods-25"부터 이어서 넣음 → 찜 · 장바구니 · 브랜드 · 카테고리 페이지가 모두 같은 상품을 씀 [연결㉖]
const MORE_GOODS = {
    digital: [
        ["무선 저소음 마우스",          "TECHFIT",  24900,  32000,  "🖱️"],
        ["기계식 키보드 텐키리스",      "TECHFIT",  89000,  119000, "⌨️"],
        ["USB-C 멀티 허브 7in1",        "TECHFIT",  39800,  49000,  "🔌"],
        ["고속 충전기 65W",             "TECHFIT",  35900,  45000,  "⚡"],
        ["보조배터리 10000mAh",         "TECHFIT",  29900,  null,   "🔋"],
        ["노트북 거치대 알루미늄",      "TECHFIT",  32000,  42000,  "💻"],
        ["태블릿 펜슬 2세대",           "TECHFIT",  45000,  59000,  "✏️"],
        ["웹캠 FHD 오토포커스",         "TECHFIT",  54000,  69000,  "📷"],
        ["스마트 체중계",               "TECHFIT",  39000,  49000,  "⚖️", ["living"]],
        ["블루투스 분실방지 트래커 2개", "TECHFIT", 33000,  null,   "📍", ["gift"]],
        ["무선 게이밍 헤드셋",          "SOUNDLAB", 129000, 159000, "🎮"],
        ["넥밴드 블루투스 이어폰",      "SOUNDLAB", 49000,  65000,  "🎶"],
        ["방수 휴대용 스피커",          "SOUNDLAB", 69000,  89000,  "🔉", ["sports"]],
        ["블루투스 턴테이블",           "SOUNDLAB", 189000, 239000, "💿", ["gift"]],
        ["USB 콘덴서 마이크",           "SOUNDLAB", 79000,  99000,  "🎙️"],
        ["4K 액션캠",                   "TECHFIT",  219000, 279000, "📹", ["sports"]],
        ["전자책 리더기 6인치",         "TECHFIT",  139000, 159000, "📱", ["book"]],
        ["스마트 전구 2개입",           "TECHFIT",  25900,  32000,  "💡", ["living"]],
        ["무선 충전 패드 15W",          "TECHFIT",  19900,  25000,  "🪫"],
        ["미니 빔프로젝터",             "TECHFIT",  249000, 329000, "📽️", ["living"]],
        ["디지털 액자 10인치",          "TECHFIT",  99000,  129000, "🖼️", ["gift"]]
    ],
    fashion: [
        ["스트라이프 긴팔 티셔츠",      "MODEWORK", 25900,  32000,  "👕"],
        ["와이드 데님 팬츠",            "MODEWORK", 49000,  65000,  "👖"],
        ["플리츠 미디 스커트",          "MODEWORK", 45000,  59000,  "👗"],
        ["경량 패딩 조끼",              "MODEWORK", 59000,  79000,  "🦺"],
        ["코듀로이 셔츠 재킷",          "MODEWORK", 69000,  89000,  "🧥"],
        ["울 볼캡",                     "MODEWORK", 29000,  null,   "🧢"],
        ["레더 미니 크로스백",          "MODEWORK", 79000,  99000,  "👜", ["gift"]],
        ["캔버스 토트백",               "MODEWORK", 32000,  null,   "🛍️"],
        ["실크 스카프",                 "MODEWORK", 39000,  49000,  "🧣", ["gift"]],
        ["옥스퍼드 셔츠 블루",          "MODEWORK", 42000,  52000,  "👔"],
        ["클래식 로퍼",                 "MODEWORK", 89000,  119000, "👞"],
        ["스웨이드 첼시 부츠",          "MODEWORK", 129000, 159000, "🥾"],
        ["하이웨이스트 슬랙스",         "MODEWORK", 49000,  59000,  "👖"],
        ["니트 원피스",                 "MODEWORK", 69000,  89000,  "👗"],
        ["후드 스웨트셔츠",             "MODEWORK", 45000,  null,   "👕"],
        ["컬러 양말 5족 세트",          "MODEWORK", 15900,  19900,  "🧦", ["gift"]],
        ["라운드 선글라스",             "MODEWORK", 59000,  79000,  "🕶️"],
        ["양가죽 장갑",                 "MODEWORK", 39000,  49000,  "🧤", ["gift"]],
        ["코튼 파자마 세트",            "MODEWORK", 49000,  65000,  "👘", ["gift"]],
        ["더블 트렌치코트",             "MODEWORK", 159000, 199000, "🧥"],
        ["캔버스 스니커즈",             "DAILYSTEP", 59000, 69000,  "👟", ["sports"]]
    ],
    beauty: [
        ["저자극 클렌징 폼",            "GLOWLAB",  12900,  16000,  "🧼"],
        ["비타민C 세럼 30ml",           "GLOWLAB",  29000,  39000,  "💧"],
        ["히알루론 수분 토너",          "GLOWLAB",  18000,  24000,  "🧴"],
        ["시카 진정 패드 60매",         "GLOWLAB",  21000,  28000,  "🌿"],
        ["수분 시트 마스크 10매",       "GLOWLAB",  15000,  20000,  "🎭"],
        ["레티놀 나이트 크림",          "GLOWLAB",  39000,  52000,  "🌙"],
        ["탄력 아이 크림",              "GLOWLAB",  32000,  42000,  "👁️"],
        ["톤업 선 쿠션",                "GLOWLAB",  26000,  34000,  "☀️"],
        ["물광 립 틴트 4색",            "GLOWLAB",  14900,  19000,  "💋"],
        ["보습 립밤 3개 세트",          "GLOWLAB",  11900,  15000,  "💄", ["gift"]],
        ["아이섀도 팔레트 9색",         "GLOWLAB",  29000,  38000,  "🎨"],
        ["롱래쉬 볼륨 마스카라",        "GLOWLAB",  16000,  21000,  "🖌️"],
        ["커버 쿠션 파운데이션",        "GLOWLAB",  32000,  42000,  "🪞"],
        ["핸드크림 3종 세트",           "GLOWLAB",  19000,  25000,  "🤲", ["gift"]],
        ["퍼퓸 바디 미스트",            "GLOWLAB",  22000,  29000,  "🌸", ["gift"]],
        ["오드퍼퓸 50ml",               "GLOWLAB",  79000,  99000,  "🌷", ["gift"]],
        ["실크 헤어 에센스",            "GLOWLAB",  15000,  19000,  "💆"],
        ["두피 스케일링 샴푸",          "GLOWLAB",  18000,  24000,  "🫧"],
        ["대용량 바디 로션 500ml",      "GLOWLAB",  16900,  22000,  "🧴"],
        ["네일 컬러 5종 세트",          "GLOWLAB",  19900,  26000,  "💅", ["gift"]],
        ["남성 올인원 로션",            "GLOWLAB",  23000,  30000,  "🧔"]
    ],
    living: [
        ["메모리폼 경추 베개",          "HOMEFIT",  39000,  52000,  "🛏️"],
        ["60수 차렵이불 퀸",            "HOMEFIT",  89000,  119000, "🛌"],
        ["호텔 수건 5장 세트",          "HOMEFIT",  29000,  39000,  "🧺", ["gift"]],
        ["실내 디퓨저 200ml",           "HOMEFIT",  25000,  32000,  "🌼", ["gift"]],
        ["소이 캔들 2개 세트",          "HOMEFIT",  22000,  28000,  "🕯️", ["gift"]],
        ["원목 수납 선반 3단",          "HOMEFIT",  69000,  89000,  "🗄️"],
        ["접이식 빨래 건조대",          "HOMEFIT",  35000,  45000,  "🌬️"],
        ["북유럽 패턴 러그",            "HOMEFIT",  79000,  99000,  "🧶"],
        ["암막 커튼 2장",               "HOMEFIT",  49000,  65000,  "🪟"],
        ["초음파 가습기 3L",            "HOMEFIT",  45000,  59000,  "💨", ["digital"]],
        ["소형 공기청정기",             "HOMEFIT",  129000, 159000, "🌀", ["digital"]],
        ["몬스테라 화분",               "HOMEFIT",  32000,  null,   "🪴", ["gift"]],
        ["무소음 벽시계",               "HOMEFIT",  25000,  32000,  "🕰️"],
        ["탁상 미니 선풍기",            "HOMEFIT",  19900,  25000,  "🎐", ["digital"]],
        ["수납 바구니 3개 세트",        "HOMEFIT",  27000,  35000,  "🧺"],
        ["규조토 욕실 매트",            "HOMEFIT",  18000,  24000,  "🛁"],
        ["전신 거울 스탠드",            "HOMEFIT",  59000,  79000,  "🪞"],
        ["버섯 무드등",                 "HOMEFIT",  29000,  38000,  "🍄", ["gift"]],
        ["패브릭 쿠션 커버 2개",        "HOMEFIT",  19900,  26000,  "🛋️"],
        ["원목 사이드 테이블",          "HOMEFIT",  59000,  79000,  "🪵"],
        ["아로마 오일 3종 세트",        "HOMEFIT",  24000,  31000,  "🌿", ["gift"]]
    ],
    kitchen: [
        ["스테인리스 프라이팬 28cm",    "HOMEFIT",  39000,  52000,  "🍳"],
        ["무쇠 냄비 22cm",              "HOMEFIT",  89000,  119000, "🍲"],
        ["주방 칼 5종 세트",            "HOMEFIT",  69000,  89000,  "🔪"],
        ["원목 도마 대형",              "HOMEFIT",  29000,  38000,  "🪵"],
        ["전기 포트 1.7L",              "HOMEFIT",  35000,  45000,  "🫖", ["digital"]],
        ["전동 커피 그라인더",          "HOMEFIT",  49000,  65000,  "⚙️"],
        ["모카포트 3인용",              "HOMEFIT",  32000,  42000,  "☕"],
        ["유리 밀폐 용기 10종",         "HOMEFIT",  29900,  39000,  "🥡"],
        ["실리콘 조리도구 6종",         "HOMEFIT",  24000,  32000,  "🥄"],
        ["와인잔 2P 세트",              "HOMEFIT",  29000,  38000,  "🍷", ["gift"]],
        ["유리 티팟 & 컵 세트",         "HOMEFIT",  35000,  45000,  "🍵", ["gift"]],
        ["핸드 블렌더",                 "HOMEFIT",  59000,  79000,  "🥤", ["digital"]],
        ["2구 토스터",                  "HOMEFIT",  45000,  59000,  "🍞", ["digital"]],
        ["에어프라이어 종이호일 100매", "HOMEFIT",  9900,   null,   "🧻"],
        ["유기 수저 4인 세트",          "HOMEFIT",  32000,  42000,  "🥢", ["gift"]],
        ["도자기 접시 6P 세트",         "HOMEFIT",  49000,  65000,  "🍽️", ["gift"]],
        ["냉장고 정리 트레이 4개",      "HOMEFIT",  19900,  25000,  "🧊"],
        ["와플 메이커",                 "HOMEFIT",  39000,  49000,  "🧇", ["digital"]],
        ["원목 식빵 보관함",            "HOMEFIT",  22000,  28000,  "🥖"],
        ["콜드브루 보틀 1L",            "HOMEFIT",  19900,  26000,  "🧋"],
        ["린넨 앞치마",                 "HOMEFIT",  25000,  32000,  "🧑‍🍳"]
    ],
    sports: [
        ["요가 매트 8mm",               "DAILYSTEP", 29000, 39000,  "🧘"],
        ["폼롤러 45cm",                 "DAILYSTEP", 19900, 25000,  "🌀"],
        ["덤벨 2kg 2개 세트",           "DAILYSTEP", 25000, 32000,  "🏋️"],
        ["러닝 암밴드",                 "DAILYSTEP", 15000, 19000,  "💪"],
        ["트레일 러닝 베스트",          "DAILYSTEP", 69000, 89000,  "🎽"],
        ["기능성 반팔 티셔츠",          "DAILYSTEP", 25000, 32000,  "🎽", ["fashion"]],
        ["러닝 쇼츠",                   "DAILYSTEP", 29000, 38000,  "🩳", ["fashion"]],
        ["하이웨이스트 레깅스",         "DAILYSTEP", 39000, 52000,  "🩱", ["fashion"]],
        ["접이식 등산 스틱 2개",        "DAILYSTEP", 49000, 65000,  "🏔️"],
        ["경량 캠핑 의자",              "DAILYSTEP", 59000, 79000,  "🪑"],
        ["원터치 텐트 2인용",           "DAILYSTEP", 129000, 169000, "⛺"],
        ["보온 보냉 물병 750ml",        "DAILYSTEP", 25000, 32000,  "🍶", ["kitchen"]],
        ["자전거 헬멧",                 "DAILYSTEP", 59000, 79000,  "🚴"],
        ["김서림 방지 수영 고글",       "DAILYSTEP", 19900, 26000,  "🥽"],
        ["배드민턴 라켓 2개 세트",      "DAILYSTEP", 39000, 52000,  "🏸"],
        ["테니스공 4개",                "DAILYSTEP", 12000, null,   "🎾"],
        ["축구공 5호",                  "DAILYSTEP", 29000, null,   "⚽"],
        ["스포츠 무릎 보호대",          "DAILYSTEP", 19000, 25000,  "🦵"],
        ["카운터 줄넘기",               "DAILYSTEP", 15000, 19000,  "🪢"],
        ["피트니스 스마트 밴드",        "DAILYSTEP", 59000, 79000,  "⌚", ["digital"]],
        ["등산 배낭 30L",               "DAILYSTEP", 89000, 119000, "🎒"]
    ],
    book: [
        ["장편소설 『여름의 끝에서』",           "PAPERCO", 14400, 16000, "📕"],
        ["에세이 『천천히 걷는 법』",            "PAPERCO", 13500, 15000, "📗"],
        ["시집 『바람이 머문 자리』",            "PAPERCO", 9000,  10000, "📘"],
        ["자기계발 『작은 습관의 힘』",          "PAPERCO", 16200, 18000, "📙"],
        ["경제 『돈의 흐름 읽기』",              "PAPERCO", 17100, 19000, "📈"],
        ["과학 『우주는 어떻게 시작됐을까』",    "PAPERCO", 18000, 20000, "🔭"],
        ["역사 『한 권으로 읽는 세계사』",       "PAPERCO", 19800, 22000, "🏛️"],
        ["그림책 『달님 안녕』",                 "PAPERCO", 11700, 13000, "🌙"],
        ["창작 동화 5권 세트",                   "PAPERCO", 45000, 50000, "🧸", ["gift"]],
        ["요리책 『한 그릇 집밥』",              "PAPERCO", 16200, 18000, "🍚", ["kitchen"]],
        ["여행 에세이 『제주 한 달 살기』",      "PAPERCO", 15300, 17000, "🏝️"],
        ["『처음 배우는 HTML · CSS · JS』",      "PAPERCO", 25200, 28000, "💻"],
        ["『30일 영어 회화』",                   "PAPERCO", 16200, 18000, "🗣️"],
        ["가죽 만년 다이어리",                   "PAPERCO", 32000, null,  "📔", ["gift"]],
        ["무지 노트 3권 세트",                   "PAPERCO", 9900,  12000, "📓"],
        ["만년필 입문 세트",                     "PAPERCO", 39000, 49000, "🖋️", ["gift"]],
        ["원목 독서대",                          "PAPERCO", 29000, 38000, "📖"],
        ["클립형 북 라이트",                     "PAPERCO", 15900, 19900, "🔦", ["digital"]],
        ["컬러링북 『숲의 시간』",               "PAPERCO", 12600, 14000, "🖍️"],
        ["웹툰 단행본 1~3권 세트",               "PAPERCO", 32400, 36000, "💬"],
        ["북커버 & 북마크 세트",                 "PAPERCO", 14000, 18000, "🔖", ["gift"]]
    ],
    gift: [
        ["수제 쿠키 선물 상자",         "HOMEFIT",  25000,  32000,  "🍪", ["kitchen"]],
        ["스페셜티 원두 선물 세트",     "HOMEFIT",  35000,  45000,  "☕", ["kitchen"]],
        ["프리저브드 꽃다발",           "HOMEFIT",  49000,  65000,  "💐", ["living"]],
        ["포근한 곰인형 50cm",          "HOMEFIT",  39000,  49000,  "🧸"],
        ["미니어처 향수 5종 세트",      "GLOWLAB",  45000,  59000,  "🌺", ["beauty"]],
        ["스킨케어 3종 기프트",         "GLOWLAB",  59000,  79000,  "🎁", ["beauty"]],
        ["커플 머그 세트",              "HOMEFIT",  29000,  38000,  "💑", ["kitchen"]],
        ["디저트 와인 & 잔 세트",       "HOMEFIT",  69000,  89000,  "🥂", ["kitchen"]],
        ["축하 풍선 & 가랜드 세트",     "PAPERCO",  19900,  25000,  "🎈"],
        ["손편지 카드 10장 세트",       "PAPERCO",  9900,   12000,  "✉️", ["book"]],
        ["가죽 포토 앨범",              "PAPERCO",  35000,  45000,  "📸"],
        ["이름 각인 볼펜 세트",         "PAPERCO",  29000,  38000,  "🖊️", ["book"]],
        ["무선 이어폰 기프트 에디션",   "SOUNDLAB", 99000,  129000, "🎀", ["digital"]],
        ["스마트워치 선물 세트",        "TECHFIT",  199000, 249000, "⌚", ["digital"]],
        ["캐시미어 머플러 & 장갑 세트", "MODEWORK", 89000,  119000, "🧣", ["fashion"]],
        ["커플 잠옷 세트",              "MODEWORK", 79000,  99000,  "👫", ["fashion"]],
        ["러너 기프트 박스",            "DAILYSTEP", 49000, 65000,  "🏃", ["sports"]],
        ["홈카페 기프트 박스",          "HOMEFIT",  59000,  79000,  "🧁", ["kitchen"]],
        ["아기 첫 선물 세트",           "MODEWORK", 69000,  89000,  "🍼", ["fashion"]],
        ["반려동물 간식 & 장난감 세트", "HOMEFIT",  29000,  38000,  "🐶", ["living"]],
        ["감사 인사 떡 선물 세트",      "HOMEFIT",  39000,  48000,  "🍡", ["kitchen"]]
    ]
};

// MORE_GOODS → GOODS에 넣기 (goods-25, goods-26, ...)
// [이름, 브랜드, ...]처럼 순서대로 적은 배열을 "구조 분해"로 이름 붙여 꺼냄
let nextNo = Object.keys(GOODS).length + 1;
Object.entries(MORE_GOODS).forEach(([cat, list]) => {
    list.forEach(([name, brand, price, was, emoji, extra = []]) => {
        GOODS["goods-" + nextNo++] = { brand, name, price, was, emoji, cats: [cat, ...extra] };
    });
});

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
    GLOWLAB:   { ko: "글로우랩",   logo: "🧴", tone: "#db2777", cat: "뷰티",            slogan: "피부가 쉬는 시간",       desc: "자극 없이 순한 성분으로 피부 장벽을 지키는 스킨케어 브랜드예요." },
    PAPERCO:   { ko: "페이퍼코",   logo: "📚", tone: "#0f766e", cat: "도서 · 문구",     slogan: "기록하고 읽는 즐거움",   desc: "다이어리와 책으로 하루를 정리하고 쉬어 가는 시간을 만드는 브랜드예요." }
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


// 카테고리 — 키 ↔ GOODS의 cats 값 · category.html?cat=digital 주소 [연결㉖]
// 순서 = 전체 카테고리 메뉴 · 홈 카테고리 아이콘 순서
const CATEGORIES = {
    digital: { name: "디지털", icon: "📱", tone: "#4f46e5", desc: "헤드폰 · 스피커부터 충전 · 워치 액세서리까지" },
    fashion: { name: "패션",   icon: "👕", tone: "#ea580c", desc: "매일 입는 셔츠 · 니트부터 가을 아우터까지" },
    beauty:  { name: "뷰티",   icon: "💄", tone: "#db2777", desc: "순한 스킨케어와 선물하기 좋은 뷰티 세트" },
    living:  { name: "리빙",   icon: "🏠", tone: "#d97706", desc: "조명 · 블랭킷처럼 집을 편하게 만드는 물건" },
    kitchen: { name: "주방",   icon: "🍳", tone: "#0d9488", desc: "텀블러 · 머그 · 핸드드립, 홈카페를 위한 도구" },
    sports:  { name: "스포츠", icon: "👟", tone: "#16a34a", desc: "러닝화 · 트레킹 부츠 · 데일리 백팩" },
    book:    { name: "도서",   icon: "📚", tone: "#0284c7", desc: "다이어리 · 에세이 · 레시피북" },
    gift:    { name: "선물",   icon: "🎁", tone: "#e11d48", desc: "받는 사람이 좋아할 만한 선물 모음" }
};

// 카테고리의 상품 id 목록 — "all"이면 전체
const goodsIn = (cat) => Object.keys(GOODS).filter((id) => cat === "all" || GOODS[id].cats.includes(cat));
