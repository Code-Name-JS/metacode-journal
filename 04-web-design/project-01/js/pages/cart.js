/* =====================================================
   pages/cart.js — 장바구니 렌더 · 수량 · 선택 · 삭제 · 합계
   ===================================================== */
(function () {
    "use strict";

const SHIP_FEE = 3000;    // 기본 배송비
const FREE_LINE = 30000;  // 무료배송 기준 (home.html 배너와 같은 3만원)

const list = $("#cartList");      // [연결①] HTML id="cartList"
const checkAll = $("#checkAll");  // [연결⑤] HTML id="checkAll"

// data-id(문자열)로 CART 배열에서 상품 찾기
function findItem(id) {
    return CART.find((c) => c.id === id);
}


/* -- 목록 렌더 -- */
function render() {
    list.innerHTML = CART.map((c) => `
        <li class="cart-item ${c.checked ? "" : "is-off"}" data-id="${c.id}">
            <label class="check cart-item__check">
                <input type="checkbox" data-act="check" ${c.checked ? "checked" : ""} aria-label="${c.name} 선택" />
            </label>
            <div class="cart-item__img">${c.emoji}</div>
            <div class="cart-item__info">
                <p class="cart-item__brand">${c.brand}</p>
                <p class="cart-item__name">${c.name}</p>
                <p class="cart-item__opt">${c.opt}</p>
            </div>
            <div class="qty">
                <button class="qty__btn" data-act="minus" aria-label="수량 빼기" ${c.qty <= 1 ? "disabled" : ""}>−</button>
                <span class="qty__num">${c.qty}</span>
                <button class="qty__btn" data-act="plus" aria-label="수량 더하기">+</button>
            </div>
            <p class="cart-item__price">
                ${won(c.price * c.qty)}
                ${c.was ? `<del>${won(c.was * c.qty)}</del>` : ""}
            </p>
            <button class="cart-item__del" data-act="del" aria-label="삭제">✕</button>
        </li>`
    ).join("");
    // ↑ [연결②] data-id / data-act → 아래 이벤트에서 dataset.id / dataset.act로 읽음
    // ↑ [연결③] is-off → CSS .cart-item.is-off

    $("#cartEmpty").hidden = CART.length > 0;  // [연결⑨] 비었을 때만 안내 보이기
    updateSummary();
    saveCart();                                 // 바뀐 목록을 저장 → home.html에서도 같은 장바구니
}


/* -- 합계 · 상태 갱신 -- */
function updateSummary() {
    const picked = CART.filter((c) => c.checked);

    const price = picked.reduce((sum, c) => sum + (c.was || c.price) * c.qty, 0);  // 정가 합
    const sale  = picked.reduce((sum, c) => sum + (c.was ? (c.was - c.price) * c.qty : 0), 0);
    const pay   = price - sale;
    const ship  = pay === 0 || pay >= FREE_LINE ? 0 : SHIP_FEE;

    // [연결⑦] HTML sum* id
    $("#sumPrice").textContent = won(price);
    $("#sumSale").textContent  = "-" + won(sale);
    $("#sumShip").textContent  = ship ? won(ship) : "무료";
    $("#sumTotal").textContent = won(pay + ship);

    // 무료배송 진행바
    const pct = Math.min((pay / FREE_LINE) * 100, 100);
    const freeShip = $("#freeShip");
    freeShip.style.setProperty("--progress", pct);       // [연결④] CSS 변수 --progress
    freeShip.classList.toggle("is-done", pct >= 100);    // [연결④] CSS .free-ship.is-done
    $("#freeShipText").innerHTML = pct >= 100
        ? "🎉 <b>무료배송</b> 조건을 채웠어요!"
        : `<b>${won(FREE_LINE - pay)}</b> 더 담으면 무료배송`;

    // 전체 선택 체크박스 · 선택 개수
    checkAll.checked = CART.length > 0 && picked.length === CART.length;
    $("#checkCount").textContent = `${picked.length}/${CART.length}`;

    // 주문 버튼
    const orderBtn = $("#orderBtn");
    orderBtn.textContent = `${picked.length}개 상품 주문하기`;
    orderBtn.disabled = picked.length === 0;             // [연결⑦] CSS :disabled

    $("#cartCount").textContent = CART.length;           // [연결⑧] 헤더 장바구니 숫자
}


/* -- 버튼 : 수량 + / − · 삭제 (이벤트 위임) -- */
list.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");   // [연결②] 체크박스는 제외하고 버튼만
    if (!btn) return;

    const item = findItem(btn.closest(".cart-item").dataset.id);
    const act = btn.dataset.act;

    if (act === "plus") item.qty++;
    else if (act === "minus" && item.qty > 1) item.qty--;
    else if (act === "del") {
        CART.splice(CART.indexOf(item), 1);
        toast(`"${item.name}"을(를) 삭제했습니다`);
    }
    render();
});


/* -- 체크박스 : 개별 선택 -- */
list.addEventListener("change", (e) => {
    if (e.target.dataset.act !== "check") return;        // [연결②]
    findItem(e.target.closest(".cart-item").dataset.id).checked = e.target.checked;
    render();
});


/* -- 전체 선택 -- */
checkAll.addEventListener("change", () => {
    CART.forEach((c) => (c.checked = checkAll.checked));
    render();
});


/* -- 선택 삭제 -- */
$("#delSelected").addEventListener("click", () => {      // [연결⑥]
    const count = CART.filter((c) => c.checked).length;
    if (count === 0) return toast("삭제할 상품을 선택해 주세요");

    openConfirm("선택 삭제", `선택한 상품 ${count}개를 삭제할까요?`, () => {
        // 뒤에서부터 지워야 splice 후 인덱스가 밀리지 않음
        for (let i = CART.length - 1; i >= 0; i--) {
            if (CART[i].checked) CART.splice(i, 1);
        }
        render();
        toast("선택한 상품을 삭제했습니다");
    });
});


/* -- 주문하기 -- */
$("#orderBtn").addEventListener("click", () => {
    const count = CART.filter((c) => c.checked).length;
    toast(`${count}개 상품의 주문서로 이동합니다`);
});


/* -- 초기 실행 -- */
render();

})();