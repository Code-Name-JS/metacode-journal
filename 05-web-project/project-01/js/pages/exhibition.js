/* =====================================================
   pages/exhibition.js — 기획전: 마감 타이머 · 기획전 D-day · 기획전별 상품 필터 · 찜 · 장바구니 담기
   ===================================================== */
(function () {
    "use strict";

    // 기획전 정보 — 키 ↔ HTML data-ex="..." [연결④]
    // until: 마감일 / goods: 이 기획전 상품 (data.js GOODS의 키) [연결⑨]
    const EXHIBITS = {
        fall:   { name: "가을 패션 위크",  until: "2026-10-18", goods: ["goods-15", "goods-6", "goods-2", "goods-10"] },
        sound:  { name: "사운드 페스티벌", until: "2026-10-11", goods: ["goods-16", "goods-1", "goods-7", "goods-14"] },
        living: { name: "홈카페 & 리빙",   until: "2026-10-25", goods: ["goods-17", "goods-18", "goods-5", "goods-11"] }
    };

    // EXHIBITS → 상품 한 줄 배열 { id, ex, brand, name, price, was, emoji }
    const ITEMS = Object.keys(EXHIBITS).flatMap((ex) =>
        EXHIBITS[ex].goods.map((id) => ({ id, ex, ...GOODS[id] }))
    );

    const saleRate = (g) => (g.was ? Math.round((1 - g.price / g.was) * 100) : 0);

    const list = $("#exList");          // [연결⑥]
    let current = "all";


    /* -- 오늘의 특가 마감 타이머 (오늘 밤 12시까지) -- */
    const hour = $("#exHour"), min = $("#exMin"), sec = $("#exSec");   // [연결①]
    const pad = (n) => String(n).padStart(2, "0");

    function tick() {
        const now = new Date();
        const left = Math.floor((startOfDay(now).getTime() + DAY - now.getTime()) / 1000);  // 다음 자정까지 남은 초 (common.js startOfDay · DAY)
        hour.textContent = pad(Math.floor(left / 3600));
        min.textContent = pad(Math.floor(left / 60) % 60);
        sec.textContent = pad(left % 60);
    }
    tick();
    setInterval(tick, 1000);


    /* -- 기획전 카드: 남은 날짜 · 상품 수 -- */
    const cards = $$("#exRow .ex-card");

    cards.forEach((card) => {
        const ex = EXHIBITS[card.dataset.ex];   // [연결④]
        // "2026-10-18"만 넣으면 UTC 기준으로 읽혀 하루가 밀릴 수 있음 → 시각을 붙여 내 컴퓨터 시간 기준으로
        const left = Math.round((new Date(ex.until + "T00:00:00") - startOfDay(new Date())) / DAY);

        const dday = $(".ex-card__dday", card);  // [연결③]
        dday.textContent = left > 0 ? `D-${left}` : left === 0 ? "오늘 마감" : "종료";
        dday.classList.toggle("is-end", left < 0);   // [연결③] CSS .ex-card__dday.is-end

        $(".ex-card__count", card).textContent = ex.goods.length;
    });


    /* -- 기획전 상품 목록 -- */
    function render() {
        const rows = current === "all" ? ITEMS : ITEMS.filter((g) => g.ex === current);

        list.innerHTML = rows.map((g) => {
            const liked = WISH_IDS.includes(g.id);
            return `
            <article class="goods-card ex-item" id="${g.id}">
                <a class="goods-card__img" href="#">
                    <span class="g-emoji">${g.emoji}</span>
                    <span class="g-badge ex-badge ex-badge--${g.ex}">${EXHIBITS[g.ex].name}</span>
                    <button class="g-like ${liked ? "is-liked" : ""}" type="button" aria-pressed="${liked}"
                        aria-label="${liked ? "찜 해제" : "찜하기"}">${liked ? "♥" : "♡"}</button>
                </a>
                <div class="goods-card__body">
                    <p class="g-brand">${g.brand}</p>
                    <a class="g-name" href="#">${g.name}</a>
                    ${g.was ? `<p class="g-was">${won(g.was)}</p>` : ""}
                    <p class="g-price">${g.was ? `<span class="g-rate">${saleRate(g)}%</span>` : ""}<b>${won(g.price)}</b></p>
                    <p class="g-meta">${g.was ? "기획전 특가" : "기획전 단독"} · 무료배송</p>
                </div>
            </article>`;
        }).join("");
        // ↑ ex-badge--fall / sound / living → CSS가 기획전 색(--ex-color)을 고름 [연결④]
        // ↑ id="goods-N" → 담기 · 찜에서 GOODS[card.id]로 찾음 [연결⑨]

        $("#exTitle").textContent = current === "all" ? "전체 기획전 상품" : EXHIBITS[current].name;  // [연결①]
        $("#exCount").textContent = rows.length;                                                      // [연결①]
    }


    /* -- 필터 바꾸기: 위쪽 카드와 아래 버튼이 같은 값을 보여줌 -- */
    function setFilter(ex) {
        current = ex;
        $$("#exSeg .seg__btn").forEach((b) => b.classList.toggle("is-active", b.dataset.ex === ex));  // [연결④] components.css .seg__btn.is-active
        cards.forEach((c) => c.classList.toggle("is-active", c.dataset.ex === ex));                   // [연결④] CSS .ex-card.is-active
        render();
    }

    $("#exSeg").addEventListener("click", (e) => {
        const btn = e.target.closest(".seg__btn");
        if (btn) setFilter(btn.dataset.ex);
    });

    // 기획전 카드 · 배너 포스터는 <a href="#exGoods"> → 기본 동작(목록으로 스크롤)은 그대로 두고 필터만 바꿈
    ["#exRow", "#exPosters"].forEach((sel) =>
        $(sel).addEventListener("click", (e) => {
            const link = e.target.closest("[data-ex]");   // [연결④] .ex-card · .ex-poster 둘 다 data-ex를 가짐
            if (link) setFilter(link.dataset.ex);
        })
    );


    /* -- 카드 클릭: 찜 / 장바구니 담기 (이벤트 위임 — 필터 때마다 카드를 새로 만들기 때문) -- */
    list.addEventListener("click", (e) => {
        const card = e.target.closest(".goods-card");
        if (!card) return;
        e.preventDefault();                          // <a href="#"> 이동 막기

        const like = e.target.closest(".g-like");
        if (like) {
            setLikeBtn(like, toggleWish(card.id));   // common.js: 저장 + 문구 + 헤더 찜 숫자
            return;
        }

        const goods = GOODS[card.id];
        openConfirm("장바구니 담기", `<b>${goods.name}</b><br />상품을 장바구니에 담으시겠습니까?`, () => {
            addToCart(card.id);                      // common.js: 저장 + 담기 횟수 + 헤더 장바구니 숫자
            toast(`🛒 장바구니에 상품 넣기 : ${goods.name}`);
        });
    });


    /* -- 시작 --
       주소에 ?ex=sound가 있으면 그 기획전 버튼을 누른 것처럼 시작 (home.html 사운드 페스티벌 카드에서 넘어올 때)
       없거나 모르는 값이면 전체 */
    const fromURL = new URLSearchParams(location.search).get("ex");   // [연결⑤] ?ex= 값 ↔ EXHIBITS 키 · 버튼 data-ex
    if (EXHIBITS[fromURL]) setFilter(fromURL);                          // setFilter 안에서 render()까지 함
    else render();
})();
