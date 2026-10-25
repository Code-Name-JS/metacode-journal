/* =====================================================
   pages/wishlist.js — 찜 페이지 (wish.html)
   찜 목록 렌더 · 정렬 · 찜 해제 · 장바구니 담기 · 추천 상품
   ※ 마이페이지의 찜 탭은 pages/wish.js가 따로 담당
   ===================================================== */
(function () {
    "use strict";

    const list = $("#wishList");        // [연결③]
    const reco = $("#recoList");        // [연결⑤]
    const sortSelect = $("#sortSelect");// [연결②]
    const cartCount = $("#cartCount");  // [연결⑦]

    const saleRate = (g) => (g.was ? Math.round((1 - g.price / g.was) * 100) : 0);

    // [연결②] 키 ↔ HTML <option value="...">
    // WISH_IDS는 찜한 순서대로 쌓이므로 "최근 찜한순"은 뒤집기만 하면 됨
    const SORTERS = {
        recent: (items) => items.reverse(),
        low:    (items) => items.sort((a, b) => a.price - b.price),
        rate:   (items) => items.sort((a, b) => saleRate(b) - saleRate(a))
    };

    // id 배열 → 상품 정보 배열 (GOODS에서 꺼냄) [연결⑨]
    const toItems = (ids) => ids.map((id) => ({ id, ...GOODS[id] }));


    /* -- 카드 한 장 (home.html .goods-card와 같은 구조) -- */
    function cardHTML(g, liked) {
        return `
            <article class="goods-card wish-card" id="${g.id}">
                <a class="goods-card__img" href="#">
                    <span class="g-emoji">${g.emoji}</span>
                    ${g.was ? `<span class="g-badge g-badge--sale">${saleRate(g)}% OFF</span>` : ""}
                    <button class="g-like ${liked ? "is-liked" : ""}" type="button" data-act="like"
                        aria-pressed="${liked}" aria-label="${liked ? "찜 해제" : "찜하기"}">${liked ? "♥" : "♡"}</button>
                </a>
                <div class="goods-card__body">
                    <p class="g-brand">${g.brand}</p>
                    <a class="g-name" href="#">${g.name}</a>
                    <p class="g-price">${g.was ? `<span class="g-rate">${saleRate(g)}%</span>` : ""}<b>${won(g.price)}</b></p>
                    <p class="g-meta">${g.was ? `<del>${won(g.was)}</del> · ` : ""}무료배송</p>
                    ${liked ? `<button class="wish-card__cart" type="button" data-act="cart">🛒 장바구니 담기</button>` : ""}
                </div>
            </article>`;
        // ↑ data-act → 아래 클릭 이벤트에서 dataset.act로 어떤 버튼인지 구분
    }


    /* -- 찜 목록 + 요약 숫자 -- */
    function renderWish() {
        const items = SORTERS[sortSelect.value](toItems(WISH_IDS));
        list.innerHTML = items.map((g) => cardHTML(g, true)).join("");

        const total = items.reduce((sum, g) => sum + g.price, 0);
        const save  = items.reduce((sum, g) => sum + (g.was ? g.was - g.price : 0), 0);

        // [연결①] 찜한 개수가 여러 곳에 똑같이 보이도록 한 번에 갱신
        $("#statCount").textContent = items.length;
        $("#listCount").textContent = items.length;
        $("#statPrice").textContent = won(total);
        $("#statSave").textContent  = won(save);

        const empty = items.length === 0;
        $("#wishEmpty").hidden = !empty;            // [연결④]
        $("#wishTools").hidden = empty;             // 비었으면 정렬·전체 버튼도 숨김
    }


    /* -- 추천 (찜 안 한 상품 최대 4개) -- */
    function renderReco() {
        const ids = Object.keys(GOODS).filter((id) => !WISH_IDS.includes(id)).slice(0, 4);
        reco.innerHTML = toItems(ids).map((g) => cardHTML(g, false)).join("");
        $("#recoSection").hidden = ids.length === 0; // 전부 찜했으면 추천 칸 숨김
    }

    function renderAll() {
        renderWish();
        renderReco();
    }


    // 장바구니 담기는 common.js addToCart() — 저장 + 담기 횟수 +1(홈 실시간 랭킹) + 헤더 숫자


    /* -- 카드 클릭 (찜 목록 · 추천 둘 다) --
       카드는 render 때마다 새로 만들어지므로 부모에 이벤트를 한 번만 검 (이벤트 위임) */
    function onCardClick(e) {
        const card = e.target.closest(".goods-card");
        if (!card) return;
        e.preventDefault();                         // <a href="#"> 이동 막기

        const btn = e.target.closest("[data-act]");
        if (!btn) return;                           // 버튼 말고 카드 빈 곳 클릭은 무시

        if (btn.dataset.act === "like") {
            const on = toggleWish(card.id);         // common.js: 저장 + 문구 + 헤더 숫자
            setLikeBtn(btn, on);

            if (!on) {
                card.classList.add("is-removing");  // [연결⑥] CSS .wish-card.is-removing → 흐려지며 작아짐
                setTimeout(renderAll, 220);
            } else {
                renderAll();                        // 추천에서 찜 → 위 목록으로 이동
            }
        }

        if (btn.dataset.act === "cart") {
            addToCart(card.id);
            toast(`🛒 장바구니에 상품 넣기 : ${GOODS[card.id].name}`);
        }
    }
    list.addEventListener("click", onCardClick);
    reco.addEventListener("click", onCardClick);


    /* -- 정렬 · 전체 담기 · 전체 삭제 -- */
    sortSelect.addEventListener("change", renderWish);

    $("#cartAll").addEventListener("click", () => {
        openConfirm("전체 담기", `찜한 상품 <b>${WISH_IDS.length}개</b>를 모두 장바구니에 담을까요?`, () => {
            WISH_IDS.forEach((id) => addToCart(id));   // 상품마다 담기 횟수도 1씩 올라감
            toast(`🛒 찜한 상품 ${WISH_IDS.length}개를 장바구니에 담았어요.`);
        });
    });

    $("#wishClear").addEventListener("click", () => {
        openConfirm("전체 삭제", "찜한 상품을 모두 삭제할까요?", () => {
            WISH_IDS.length = 0;                    // const 배열은 다시 대입 못 함 → 길이를 0으로 비움
            saveWish();
            renderWishCount();
            renderAll();
            toast("🤍 찜 목록을 비웠어요.");
        });
    });


    /* -- 시작 -- */
    cartCount.textContent = CART.length;
    renderAll();
})();
