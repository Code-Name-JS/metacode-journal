/* =====================================================
   pages/wish.js — 마이페이지 찜 탭: 찜 목록 렌더 · 담기/해제 · 전체 삭제
   찜 목록은 data.js WISH_IDS(localStorage)를 씀 → home · best · wish.html과 같은 목록
   ===================================================== */
(function () {
    "use strict";

const list = $("#wishList");    // [연결①] HTML id="wishList"


/* -- 찜 목록 렌더 -- */
function renderWish() {
    const items = WISH_IDS.map((id) => ({ id, ...GOODS[id] })).reverse();  // 최근 찜한 것이 앞으로 [연결⑨]

    list.innerHTML = items.map(
        (w) => `
        <figure class="wish-item" data-id="${w.id}">
            <div class="wish-item__img">${w.emoji}
                <button class="wish-item__like" data-act="unlike" aria-label="찜 해제">❤️</button>
            </div>
            <figcaption class="wish-item__body">
                <p class="wish-item__brand">${w.brand}</p>
                <p class="wish-item__name">${w.name}</p>
                <div class="wish-item__row">
                    <span class="wish-item__price">${won(w.price)}${w.was ? `<del>${won(w.was)}</del>` : ""}</span>
                    <button class="wish-item__cart" data-act="cart">담기</button>
                </div>
            </figcaption>
        </figure>`
    ).join("");
    // ↑ [연결②] data-id → 아래 이벤트에서 dataset.id로 읽음 / data-act → 어떤 버튼인지 구분

    // 요약 카드의 "할인 중인 상품" — [연결⑮]
    $("#wishSaleCount").textContent = items.filter((w) => w.was).length + "개";

    const empty = items.length === 0;
    $("#wishEmpty").hidden = !empty;        // [연결⑰]
    $("#wishClear").hidden = empty;         // 비었으면 전체 삭제 버튼 숨김
}


/* -- 찜 액션 -- */
list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const item = btn.closest(".wish-item");
    const id = item.dataset.id;             // [연결②]

    if (btn.dataset.act === "cart") {
        addToCart(id);                      // common.js: 저장 + 담기 횟수 +1 + [연결⑭] 사이드바 장바구니 숫자
        toast(`🛒 "${GOODS[id].name}"을(를) 장바구니에 담았습니다`);
    } else {
        item.classList.add("is-removing");  // CSS .wish-item.is-removing → 흐려지며 사라짐
        setTimeout(() => {
            toggleWish(id);                 // common.js: 저장 + "찜을 해제했어요." 문구 + 숫자 갱신
            renderWish();
        }, 180);
    }
});

$("#wishClear").addEventListener("click", () => {
    openConfirm("전체 삭제", "찜한 상품을 모두 삭제할까요?", () => {
        WISH_IDS.length = 0;                // const 배열은 다시 대입 못 함 → 길이를 0으로 비움
        saveWish();
        renderWishCount();                  // [연결⑫] 사이드바 · 요약 카드 · 탭 제목 숫자
        renderWish();
        toast("찜 목록을 비웠습니다");
    });
});


/* -- 초기 실행 -- */
renderWish();

})();
