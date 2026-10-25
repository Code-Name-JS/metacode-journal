/* =====================================================
   pages/orders.js — 주문 목록 렌더 · 필터 · 상세 모달 · 재구매 · 구매확정(→ 멤버십 등급 반영)
   ===================================================== */
(function () {
    "use strict";

// 주문이 등급에 들어가는지 표시하는 글자 — 키 ↔ data.js gradeState() 결과 [연결㉒]
const GRADE_TAG = {
    counted: "✓ 등급 반영",
    pending: "구매확정 후 반영",
    expired: "6개월 지남 · 미반영"
};

let current = "all";   // 지금 선택된 필터 — 구매확정 뒤 같은 필터로 다시 그리기 위해 기억


/* -- 주문 목록 렌더 -- */
function renderOrders(filter = current) {
    current = filter;
    const list = $("#orderList");
    const data = filter === "all" ? ORDERS : ORDERS.filter((o) => o.status === filter);
    list.innerHTML = data
    .map ((o) => {
        const state = gradeState(o);
        return `
    <article class="order" data-id="${o.id}">
        <div class="thumb">${o.emoji}</div>
        <div class="order__info">
          <p class="order__date">${o.date} · 주문번호 ${o.id}</p>
          <p class="order__name">${o.name}</p>
          <p class="order__opt">${o.opt} <span class="order__grade order__grade--${state}">${GRADE_TAG[state]}</span></p>
        </div>
        <div class="order__side">
          <span class="status status--${o.status}">${STATUS_TEXT[o.status]}</span>
          <span class="order__price">${won(o.price)}</span>
          <div class="order__actions">
            <button class="mini" data-act="detail">상세보기</button>
            ${o.status === "shipping" ? `<button class="mini mini--confirm" data-act="confirm">구매확정</button>` : ""}
            <button class="mini mini--line" data-act="reorder">재구매</button>
          </div>
        </div>
      </article>`;
    })
      .join("");
      // ↑ [연결㉓] order__grade--counted / pending / expired → CSS가 색을 고름
      // ↑ 배송중 주문에만 구매확정 버튼 (data-act="confirm")
      $("#orderEmpty").hidden = data.length > 0;

      // 요약 카드 "배송 중 N건" — [연결㉔] HTML data-ship-count
      const shipping = ORDERS.filter((o) => o.status === "shipping").length;
      $$("[data-ship-count]").forEach((el) => (el.textContent = shipping));
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
    const state = gradeState(order);
    $("#modalTitle").textContent = "주문 상세";
    $("#modalBody").innerHTML = `
    <p><b>${order.name}</b> 주문 정보입니다.</p>
    <dl>
        <dt>주문번호</dt><dd>${order.id}</dd>
        <dt>주문일자</dt><dd>${order.date}</dd>
        <dt>옵션</dt><dd>${order.opt}</dd>
        <dt>결제금액</dt><dd>${won(order.price)}</dd>
        <dt>진행상태</dt><dd>${STATUS_TEXT[order.status]}</dd>
        <dt>멤버십 등급</dt><dd>${GRADE_TAG[state]}</dd>
    </dl>`;
    $("#modalOk").onclick = closeModal;
    modal.hidden = false;
}


/* -- 구매확정 → 등급 다시 계산 -- */
function confirmOrder(order) {
    const before = getGradeStatus();                // 바뀌기 전 등급 (승급했는지 비교용)

    order.status = "done";
    saveOrderStatus();                              // data.js → localStorage (membership.html도 같은 상태를 봄)
    renderOrders();
    renderGradeBox();                               // common.js — 프로필 "다음 등급까지" 다시 그림

    const after = getGradeStatus();
    if (after.idx > before.idx) {
        toast(`🎉 ${after.grade.name} 등급으로 올라갔어요! 멤버십 페이지에서 새 쿠폰을 받아 보세요.`);
    } else if (gradeState(order) === "counted") {
        toast(`✅ 구매확정 완료 · 멤버십 등급에 ${won(order.price)}이 반영됐어요.`);
    } else {
        toast("✅ 구매확정 완료 (6개월이 지난 주문이라 등급에는 들어가지 않아요)");
    }
}

$("#orderList").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const order = ORDERS.find((o) => o.id === btn.closest(".order").dataset.id);
    const act = btn.dataset.act;

    if (act === "detail") {
        openModal(order);
    } else if (act === "confirm") {
        openConfirm("구매확정", `<b>${order.name}</b><br />구매를 확정할까요? 확정하면 교환 · 반품 신청이 어려워지고, 멤버십 등급에 반영돼요.`, () => confirmOrder(order));
    } else {
        openConfirm("재구매 확인", `"${order.name}"을(를) 장바구니에 다시 담을까요?`, () => toast("장바구니에 담았습니다 🛒"));
    }
});


/* -- 다른 탭에서 구매확정하면 바로 반영 -- */
window.addEventListener("storage", (e) => {
    if (e.key !== ORDER_STATUS_KEY) return;
    applyOrderStatus();                             // data.js — 저장된 상태를 ORDERS에 다시 덮어씀
    renderOrders();
    renderGradeBox();
});


/* -- 초기 실행 -- */
renderOrders();

})();
