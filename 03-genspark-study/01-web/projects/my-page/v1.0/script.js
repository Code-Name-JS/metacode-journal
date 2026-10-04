/* =====================================================
   script-v1.js  –  My-Page v1.0 Interactions
   ===================================================== */
(function () {
    "use strict";



/* -- 데이터 -- */
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



/* -- 유틸 -- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

let toastTimer = null;
function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-on"), 2200);
}



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



/* -- 탭 -- */
const tabs = $$(".tab");
const ink = $("#tabsInk");

function moveInk(el) {
    ink.style.width = el.offsetWidth + "px";
    ink.style.transform = `translateX(${el.offsetLeft}px)`;
}
function activateTab(name) {
    tabs.forEach((t) => {
        const on = t.dataset.tab === name;
        t.classList.toggle("is-active", on);
        if (on) moveInk(t);
    });
    $$(".tabpane").forEach((p) => p.classList.toggle("is-active", p.id === "pane-" + name));
}
tabs.forEach((t) => t.addEventListener("click", () => activateTab(t.dataset.tab)));

// 요약 카드 → 해당 탭 이동
$$("[data-tab-jump]").forEach((b) =>
    b.addEventListener("click", () => {
        const t = $('.tab[data-tab="' + b.dataset.tabJump + '"]');
        if (t) activateTab(t.dataset.tab);
    })
);



/* -- 주문 필터 -- */
$$("#orderFilter .seg__btn").forEach((b) => 
    b.addEventListener("click", () => {
        $$("#orderFilter .seg__btn").forEach((x) => x.classList.remove("is-active"));
        b.classList.add("is-active");
        renderOrders(b.dataset.filter);
    })
);



/* -- 주문 액션 + 모달 -- */
const modal = $("#modal");

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
function openConfirm(title, text, onOk) {
    $("#modalTitle").textContent = title;
    $("#modalBody").innerHTML = `<p>${text}</p>`;
    modal.hidden = false;
    $("#modalOk").onclick = () => {
        modal.hidden = true;
        onOk && onOk();
    };
}
function closeModal() { modal.hidden = true; }
$("#modalClose").addEventListener("click", closeModal);
$("#modalCancel").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

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



/* -- 폼 유효성 검사 -- */
const RULES = {
    required: (v) => (v.trim() ? "" : "이름을 입력해 주세요."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "올바른 이메일 형식이 아닙니다."),
    phone: (v) => (/^01[0-9]-?\d{3,4}-?\d{4}$/.test(v.replace(/\s/g, "")) ? "" : "010-0000-0000 형식으로 입력해 주세요."),
    password: (v) => (v === "" ? "" : /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v) ? "" : "영문 + 숫자 조합 8자 이상이어야 합니다.")
};
const form = $("#profileForm");

function validateField(input) {
    const rule = RULES[input.dataset.rule];
    if (!rule) return true;
    const msg = rule(input.value);
    const errEl = $(`[data-err-for="${input.id}"]`);
    input.classList.toggle("is-error", !!msg);
    if (errEl) errEl.textContent = msg;
    return !msg;
}
$$("[data-rule]", form).forEach((i) => {
    i.addEventListener("blur", () => validateField(i));
    i.addEventListener("input", () => { if (i.classList.contains("is-error")) validateField(i); });
});

// 비밀번호 강도 미터
const pw = $("#fPw"), meter = $("#pwMeter"), hint = $("#pwHint");
pw.addEventListener("input", () => {
    const v = pw.value;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Za-z]/.test(v) && /\d/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    const widths = ["0%", "34%", "67%", "100%"];
    const colors = ["#f43f5e", "#f59e0b", "#0ea5e9", "#10b981"];
    const labels = ["", "약함", "보통", "안전"];
    meter.style.width = v ? widths[score] : "0%";
    meter.style.background = colors[score];
    hint.textContent = v ? `비밀번호 강도: ${labels[score]}` : "변경하지 않으려면 비워 두세요.";
});

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = $$("[data-rule]", form).filter((i) => i.dataset.rule !== "password" || i.value !== "");
    const ok = fields.map(validateField).every(Boolean);
    if (!ok) {
        toast("입력값을 다시 확인해 주세요");
        const first = form.querySelector(".is-error");
        first && first.focus();
        return;
    }
    toast("변경사항을 저장했습니다 ✅");
});
$("#formReset").addEventListener("click", () => {
    form.reset();
    $$(".err", form).forEach((e) => (e.textContent=""));
    $$("input", form).forEach((i) => i.classList.remove("is-error"));
    meter.style.width = "0%";
    hint.textContent = "변경하지 않으려면 비워 두세요.";
    toast("입력값을 되돌렸습니다");
});



/* -- 회원 탈퇴 -- */
$("#withdrawBtn").addEventListener("click", () => openConfirm("회원 탈퇴", "정말 탈퇴하시겠어요? 포인트와 쿠폰이 모두 소멸되며 되돌릴 수 없습니다.", () => toast("탈퇴 요청이 접수되었습니다"))
);



/* -- 모바일 메뉴 -- */
const sidebar = $("#sidebar"), scrim = $("#scrim"), menuBtn = $("#menuToggle");
function toggleMenu(open) {
    sidebar.classList.toggle("is-open", open);
    scrim.classList.toggle("is-on", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
}
menuBtn.addEventListener("click", () => toggleMenu(!sidebar.classList.contains("is-open")));
scrim.addEventListener("click", () => toggleMenu(false));



/* -- 초기 실행 -- */
renderOrders();
renderWish();
window.addEventListener("load", () => {
    const active = $(".tab.is-active");
    active && moveInk(active);
});
window.addEventListener("resize", () => {
    const active = $(".tab.is-active");
    active && moveInk(active);
});
})();