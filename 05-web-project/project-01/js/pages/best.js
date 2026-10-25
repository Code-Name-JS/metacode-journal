/* =====================================================
   pages/best.js — 베스트 랭킹 렌더 · 카테고리 필터 · 정렬 · 찜 · 장바구니 담기
   ===================================================== */
(function () {
    "use strict";

    // 베스트 전용 정보 — 키는 data.js GOODS의 키("goods-N")와 같아야 함 [연결⑨]
    // 상품 이름·가격은 GOODS에서 가져오고, 여기엔 랭킹에 필요한 값만 둠
    const BEST_META = {
        "goods-1": { cat: "digital", sold: 4820, rating: 4.8, reviews: 2341, move: 2 },
        "goods-2": { cat: "fashion", sold: 2140, rating: 4.6, reviews: 890,  move: 0 },
        "goods-3": { cat: "digital", sold: 1980, rating: 4.7, reviews: 1204, move: -1 },
        "goods-4": { cat: "sports",  sold: 4310, rating: 4.9, reviews: 3118, move: 1 },
        "goods-5": { cat: "living",  sold: 2760, rating: 4.5, reviews: 642,  move: 4 },
        "goods-6": { cat: "fashion", sold: 3950, rating: 4.8, reviews: 410,  move: -1 },
        "goods-7": { cat: "digital", sold: 1420, rating: 4.4, reviews: 288,  move: -2 },
        "goods-8": { cat: "sports",  sold: 3020, rating: 4.7, reviews: 1530, move: 0 }
    };

    const CAT_TEXT = { all: "전체", digital: "디지털", fashion: "패션", living: "리빙", sports: "스포츠" };

    // GOODS + BEST_META를 합쳐 한 배열로 → { id, brand, name, price, was, emoji, cat, sold, ... }
    const ITEMS = Object.keys(BEST_META).map((id) => ({ id, ...GOODS[id], ...BEST_META[id] }));

    const saleRate = (g) => (g.was ? Math.round((1 - g.price / g.was) * 100) : 0);

    // [연결④] 키 ↔ HTML <option value="...">
    const SORTERS = {
        sold:   (a, b) => b.sold - a.sold,
        review: (a, b) => b.reviews - a.reviews,
        rate:   (a, b) => saleRate(b) - saleRate(a),
        low:    (a, b) => a.price - b.price
    };

    const state = { cat: "all", sort: "sold" };
    // 찜 상태는 data.js WISH_IDS(localStorage)에 있음 → 다시 그려도, 다른 페이지에 가도 유지

    const list = $("#bestList");        // [연결⑥]
    const chips = $("#catChips");       // [연결③]
    const sortSelect = $("#sortSelect");// [연결④]
    const cartCount = $("#cartCount");  // [연결⑦]


    /* -- 기준 시각 -- */
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    $("#bestTime").textContent =        // [연결①]
        `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ${pad(now.getHours())}:00`;


    /* -- 순위 변동 표시 (홈 랭킹의 rank__up / down / same 재사용) -- */
    function moveTag(move) {
        if (move > 0) return `<b class="rank__up">▲ ${move}</b>`;
        if (move < 0) return `<b class="rank__down">▼ ${-move}</b>`;
        return `<b class="rank__same">-</b>`;
    }


    /* -- TOP 3 시상대 (전체 판매량 기준, 필터와 상관없이 고정) -- */
    function renderPodium() {
        const top3 = [...ITEMS].sort(SORTERS.sold).slice(0, 3);
        $("#podium").innerHTML = top3.map((g, i) => `
            <li class="podium" data-rank="${i + 1}">
                <span class="podium__no">${i + 1}</span>
                <span class="podium__ic">${g.emoji}</span>
                <b class="podium__name">${g.name}</b>
                <small>${won(g.price)}</small>
            </li>`
        ).join("");
        // ↑ [연결②] data-rank → CSS .podium[data-rank="1"] 로 금·은·동 색 구분
    }


    /* -- 랭킹 목록 -- */
    function render() {
        const rows = ITEMS
            .filter((g) => state.cat === "all" || g.cat === state.cat)
            .sort(SORTERS[state.sort]);

        list.innerHTML = rows.map((g, i) => `
            <article class="goods-card best-card" id="${g.id}" data-rank="${i + 1}">
                <a class="goods-card__img" href="#">
                    <span class="g-emoji">${g.emoji}</span>
                    <span class="g-rank">${i + 1}</span>
                    <button class="g-like ${WISH_IDS.includes(g.id) ? "is-liked" : ""}" type="button" aria-label="찜하기">${WISH_IDS.includes(g.id) ? "♥" : "♡"}</button>
                </a>
                <div class="goods-card__body">
                    <p class="g-brand">${g.brand}</p>
                    <a class="g-name" href="#">${g.name}</a>
                    <p class="g-price">${g.was ? `<span class="g-rate">${saleRate(g)}%</span>` : ""}<b>${won(g.price)}</b></p>
                    <p class="g-meta">★ ${g.rating} (${g.reviews.toLocaleString("ko-KR")}) · ${moveTag(g.move)}</p>
                    <p class="g-sold">🔥 ${g.sold.toLocaleString("ko-KR")}개 구매</p>
                </div>
            </article>`
        ).join("");
        // ↑ id="goods-N" → 장바구니 담기에서 GOODS[card.id]로 다시 찾음 [연결⑨]
        // ↑ data-rank → CSS .best-card[data-rank="1"] .g-rank 로 1~3위 강조

        $("#listTitle").textContent = `${CAT_TEXT[state.cat]} 베스트`;  // [연결⑤]
        $("#listCount").textContent = rows.length;
        $("#bestEmpty").hidden = rows.length > 0;
    }


    /* -- 카테고리 칩 -- */
    chips.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (!chip) return;

        $$(".chip", chips).forEach((c) => c.classList.toggle("is-active", c === chip));  // [연결③] CSS .chip.is-active
        state.cat = chip.dataset.cat;   // [연결③] data-cat → dataset.cat
        render();
    });


    /* -- 정렬 -- */
    sortSelect.addEventListener("change", () => {
        state.sort = sortSelect.value;  // [연결④]
        render();
    });


    /* -- 카드 클릭: 찜 / 장바구니 담기 --
       카드는 render()가 매번 새로 만들기 때문에 카드마다 이벤트를 달면 사라짐
       → 바뀌지 않는 부모 #bestList 하나에 이벤트를 달고 e.target으로 구분 (이벤트 위임) */
    list.addEventListener("click", (e) => {
        const card = e.target.closest(".goods-card");
        if (!card) return;
        e.preventDefault();             // <a href="#">가 맨 위로 튀지 않게

        // 1) 하트
        const like = e.target.closest(".g-like");
        if (like) {
            setLikeBtn(like, toggleWish(card.id));          // [연결⑧] common.js → CSS .g-like.is-liked
            return;
        }

        // 2) 장바구니 담기 (home.js와 같은 흐름)
        if (!e.target.closest(".goods-card__img, .goods-card__body")) return;
        const goods = GOODS[card.id];   // [연결⑨]
        if (!goods) return;

        openConfirm("장바구니 담기", `<b>${goods.name}</b><br />상품을 장바구니에 담으시겠습니까?`, () => {
            addToCart(card.id);         // common.js: 장바구니 저장 + 담기 횟수 +1(홈 실시간 랭킹) + 헤더 숫자
            toast(`🛒 장바구니에 상품 넣기 : ${goods.name}`);
        });
    });


    /* -- 시작 -- */
    cartCount.textContent = CART.length;
    renderPodium();
    render();
})();
