/* =====================================================
   pages/orders.js — 주문 목록 렌더 · 필터 · 상세 모달 · 재구매
   ===================================================== */
(function () {
    "use strict";

/* -- 주문 목록 렌더 -- */
function renderOrders(filter="all") {
    const list = $("#orderList");
    const data = filter === "all" ? ORDERS : ORDERS.filter((o) => o.status === filter);
    list.innerHTML = data
    .map ((o) => `
    <article class="order" data-id="${o.id}">
        <div class="thumb">${o.emoji}</div>
        <div class="order__info">
          <p class="order__date">${o.date} · 주문번호 ${o.id}</p>
          <p class="order__name">${o.name}</p>
          <p class="order__opt">${o.opt}</p>
        </div>
        <div class="order__side">
          <span class="status status--${o.status}">${STATUS_TEXT[o.status]}</span>
          <span class="order__price">${won(o.price)}</span>
          <div class="order__actions">
            <button class="mini" data-act="detail">상세보기</button>
            <button class="mini mini--line" data-act="reorder">재구매</button>
          </div>
        </div>
      </article>`
      )
      .join("");
      $("#orderEmpty").hidden = data.length > 0;
}


/* -- 주문 필터 -- */
$$("#orderFilter .seg__btn").forEach((b) => 
    b.addEventListener("click", () => {
        $$("#orderFilter .seg__btn").forEach((x) => x.classList.remove("is-active"));
        b.classList.add("is-active");
        renderOrders(b.dataset.filter);
    })
);


/* -- 주문 상세 모달 (주문 전용) -- */
function openModal(order) {
    $("#modalTitle").textContent = "주문 상세";
    $("#modalBody").innerHTML = `
    <p><b>${order.name}</b> 주문 정보입니다.</p>
    <dl>
        <dt>주문번호</dt><dd>${order.id}</dd>
        <dt>주문일자</dt><dd>${order.date}</dd>
        <dt>옵션</dt><dd>${order.opt}</dd>
        <dt>결제금액</dt><dd>${won(order.price)}</dd>
        <dt>진행상태</dt><dd>${STATUS_TEXT[order.status]}</dd>
    </dl>`;
    $("#modalOk").onclick = closeModal;
    modal.hidden = false;
}

$("#orderList").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const order = ORDERS.find((o) => o.id === btn.closest(".order").dataset.id);
    if (btn.dataset.act === "detail") {
        openModal(order);
    } else {
        openConfirm("재구매 확인", `"${order.name}"을(를) 장바구니에 다시 담을까요?`, () => toast("장바구니에 담았습니다 🛒"));
    }
});

/* -- 초기 실행 -- */
renderOrders();

})();
