/* =====================================================
   pages/wish.js — 찜 목록 렌더 · 담기/해제 · 전체 삭제
   ===================================================== */
(function () {
    "use strict";

/* -- 찜 목록 렌더 -- */
function renderWish() {
    $('#wishList').innerHTML = WISH.map(
        (w, i) => `
        <figure class="wish-item" data-i="${i}">
            <div class="wish-item__img">${w.emoji}
                <button class="wish-item__like" data-act="unlike" aria-label="찜 해제">❤️</button>
            </div>
            <figcaption class="wish-item__body">
                <p class="wish-item__brand">${w.brand}</p>
                <p class="wish-item__name">${w.name}</p>
                <div class="wish-item__row">
                    <span class="wish-item__price">${won(w.price)}${w.was ? `<del>${won(w.was)}</del>`: ""}</span>
                    <button class="wish-item__cart" data-act="cart">담기</button>
                </div>
            </figcaption>
        </figure>`
    ).join("");
}


/* -- 찜 액션 -- */
$("#wishList").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const item = btn.closest(".wish-item");
    const name = WISH[item.dataset.i].name;
    if (btn.dataset.act === "cart") {
        toast(`"${name}"을(를) 장바구니에 담았습니다`);
    } else {
        item.style.opacity = ".4";
        setTimeout(() => item.remove(), 180);
        toast("찜 목록에서 삭제했습니다");
    }
});
$("#wishClear").addEventListener("click", () => {
    openConfirm("전체 삭제", "찜한 상품을 모두 삭제할까요?", () => {
        $("#wishList").innerHTML = "";
        toast("찜 목록을 비웠습니다");
    });
});

/* -- 초기 실행 -- */
renderWish();

})();
