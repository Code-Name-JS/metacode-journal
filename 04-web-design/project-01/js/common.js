/* =====================================================
   common.js — 유틸 · 토스트 · 모달 · 모바일 메뉴 (data.js 다음에 불러옴)
   ===================================================== */
"use strict";


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


/* -- 모달 (확인창) -- */
// 이 페이지에 #modal 이 없으면 null → 아래 코드가 에러 나지 않도록 가드
const modal = $("#modal");

// 버튼 글자 — HTML에 처음 적힌 글자(Yes/No, 확인/닫기 등)를 기본값으로 기억해 둠
const modalOkBtn = $("#modalOk"), modalCancelBtn = $("#modalCancel");
const MODAL_LABELS = modal ? { ok: modalOkBtn.textContent, cancel: modalCancelBtn.textContent } : null;

function setModalLabels(labels = MODAL_LABELS) {
    modalOkBtn.textContent = labels.ok;
    modalCancelBtn.textContent = labels.cancel;
}

// labels를 넘기면 그때만 버튼 글자를 바꿈 — 예: { ok: "Yes", cancel: "No" }
function openConfirm(title, text, onOk, labels) {
    $("#modalTitle").textContent = title;
    $("#modalBody").innerHTML = `<p>${text}</p>`;
    setModalLabels(labels || MODAL_LABELS);
    modal.hidden = false;
    $("#modalOk").onclick = () => {
        closeModal();
        onOk && onOk();
    };
}
// 닫을 때마다 버튼 글자를 처음 것으로 되돌림 → 다음에 여는 창(주문 상세 등)이 영향을 안 받음
function closeModal() {
    modal.hidden = true;
    setModalLabels();
}

if (modal) {
    $("#modalClose").addEventListener("click", closeModal);
    $("#modalCancel").addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });
}


/* -- 로그아웃 확인 (mypage · membership 사이드바) -- */
// [연결㉗] HTML <a data-logout> → 확인창에서 Yes를 눌렀을 때만 로그아웃
const logoutLink = $("[data-logout]");
if (logoutLink && modal) {
    logoutLink.addEventListener("click", (e) => {
        e.preventDefault();                         // href="#" → 맨 위로 튀지 않게
        openConfirm("로그아웃",
            `로그아웃 하시겠습니까?<small class="modal__warn">⚠️ 주의: 한 번 로그아웃하면 로그인할 수 없습니다.</small>`,   // [연결㉘] CSS .modal__warn
            () => {
            toast("👋 로그아웃되었습니다. 홈으로 이동할게요.");
            setTimeout(() => (location.href = "./home.html"), 1200);   // 안내 문구를 읽을 시간을 준 뒤 이동
        }, { ok: "Yes", cancel: "No" });
        // No · ✕ · 바깥 클릭 · Esc → closeModal()이 창만 닫음 (페이지 그대로)
    });
}


/* -- 숫자 표시 (home · best · wish · cart · mypage 공통) -- */
// id는 한 페이지에 하나뿐이라, 같은 숫자가 여러 곳에 있으면(마이페이지) data-* 속성으로 모두 찾음
// 해당 요소가 없는 페이지에서는 빈 배열 → 아무것도 안 함
function renderWishCount() {
    $$("#wishCount, [data-wish-count]")             // [연결⑫] <b id="wishCount"> · data-wish-count
        .forEach((el) => (el.textContent = WISH_IDS.length));
}
function renderCartCount() {
    $$("#cartCount, [data-cart-count]")             // [연결⑭] <b id="cartCount"> · data-cart-count
        .forEach((el) => (el.textContent = CART.length));
}

// 하트 버튼 모양 바꾸기 — 채워진 ♥ / 빈 ♡
function setLikeBtn(btn, on) {
    btn.classList.toggle("is-liked", on);           // [연결⑬] CSS .g-like.is-liked
    btn.textContent = on ? "♥" : "♡";
    btn.setAttribute("aria-pressed", String(on));
    btn.setAttribute("aria-label", on ? "찜 해제" : "찜하기");
}

// 찜 넣기/빼기 → 저장 · 헤더 숫자 · 안내 문구까지 한 번에. 찜 상태가 되면 true를 돌려줌
function toggleWish(id) {
    const i = WISH_IDS.indexOf(id);
    if (i === -1) WISH_IDS.push(id);
    else WISH_IDS.splice(i, 1);

    saveWish();                                     // localStorage에 저장 → wish.html이 읽음
    renderWishCount();
    const on = i === -1;
    toast(on ? "❤️ 찜 목록에 담았어요." : "🤍 찜을 해제했어요.");
    return on;
}

renderWishCount();
renderCartCount();


/* -- 쿠폰 (new · mypage 공통) -- */
const DAY = 24 * 60 * 60 * 1000;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// 지금 쓸 수 있는 내 쿠폰 = 기본 쿠폰 + 받은 쿠폰 (만료된 건 빼고, 만료 임박 순)
// [{ key, name, value, unit, cond, end(만료일), dday(남은 날), isNew(new.html에서 받음) }]
function getMyCoupons() {
    const today = startOfDay(new Date());

    // "2026-10-09"만 넣으면 UTC 기준으로 읽혀 하루가 밀릴 수 있음 → 시각을 붙여 내 컴퓨터 시간 기준으로
    const base = BASE_COUPONS.map((key) => ({ key, end: new Date(COUPON_INFO[key].until + "T00:00:00"), isNew: false }));
    const issued = ISSUED_COUPONS.map((c) => ({ key: c.key, end: startOfDay(new Date(c.at + COUPON_INFO[c.key].days * DAY)), isNew: true }));

    return [...base, ...issued]
        .map((c) => ({ ...COUPON_INFO[c.key], ...c, dday: Math.round((startOfDay(c.end) - today) / DAY) }))
        .filter((c) => c.dday >= 0)
        .sort((a, b) => a.end - b.end);
}

// 쿠폰 장수 — 마이페이지 요약 카드 · 쿠폰 탭 제목 · 사이드바가 같은 숫자를 보여줌
function renderCouponCount() {
    const mine = getMyCoupons();
    $$("[data-coupon-count]").forEach((el) => (el.textContent = mine.length));                          // [연결⑱] 보유 장수
    $$("[data-coupon-soon]").forEach((el) => (el.textContent = mine.filter((c) => c.dday <= 7).length)); // [연결⑲] 7일 안에 만료
}

renderCouponCount();


/* -- 멤버십 등급 박스 (mypage 프로필 오른쪽) --
   주문내역에서 구매확정하면 orders.js가 다시 불러 바로 반영 / 박스가 없는 페이지에서는 아무것도 안 함 */
function renderGradeBox() {
    const need = $("#gradeNeed");                   // [연결㉒] mypage.html id="gradeNeed"
    if (!need) return;

    const me = getGradeStatus();                    // data.js — ORDERS(최근 6개월 · 구매확정)로 계산
    $("#gradeChip").textContent = me.grade.name;

    if (me.next) {
        const left = [];
        if (me.needAmount) left.push(won(me.needAmount));
        if (me.needOrders) left.push(me.needOrders + "건");
        need.textContent = left.join(" · ");
        $("#gradeBar").style.width = me.amountPct + "%";
        $("#gradeNote").textContent = `${me.next.name}까지 금액 ${me.amountPct}% · ${me.orders}/${me.next.orders}건`;
    } else {
        need.textContent = "최고 등급";
        $("#gradeBar").style.width = "100%";
        $("#gradeNote").textContent = `${me.grade.name} 유지 중 · 6개월 ${won(me.spent)}`;
    }
}

renderGradeBox();


/* -- 장바구니 담기 (home · best · wish · mypage 공통) -- */
// 이미 담긴 상품이면 수량 +1, 없으면 새로 추가 → 저장 · 담기 횟수 +1 · 헤더 숫자
// 담기 횟수(ADDS)는 장바구니와 따로 저장 → cart.html에서 지워도 랭킹 숫자는 그대로
function addToCart(id) {
    const item = CART.find((c) => c.id === id);
    if (item) item.qty++;
    else CART.push({ id, ...GOODS[id], opt: "기본 옵션", qty: 1, checked: true });

    saveCart();                                     // localStorage에 저장 → cart.html이 읽음
    countAdd(id);                                   // data.js: 실시간 랭킹용 담기 횟수
    renderCartCount();                              // [연결⑭] 헤더 · 사이드바 장바구니 숫자
}


/* -- 전체 카테고리 (home · best · new 공통) -- */
const allBtn = $("#gnbAllBtn");                     // [연결①] HTML id="gnbAllBtn"
const allMenu = $("#gnbAllMenu");                   // [연결②] HTML id="gnbAllMenu"

function toggleAllMenu(open) {
    allMenu.classList.toggle("is-open", open);      // [연결③] CSS .gnb__menu.is-open → 목록 보임
    allBtn.setAttribute("aria-expanded", String(open));
}

if (allBtn && allMenu) {                            // 버튼이 없는 페이지(cart 등)에서 에러가 안 나도록
    allBtn.addEventListener("click", () => {
        toggleAllMenu(!allMenu.classList.contains("is-open"));  // 열려 있으면 닫고, 닫혀 있으면 열기
    });

    // 목록 바깥을 누르면 닫기 — 버튼·목록 안쪽 클릭은 제외
    document.addEventListener("click", (e) => {
        if (!e.target.closest("#gnbAllBtn, #gnbAllMenu")) toggleAllMenu(false);
    });

    // Esc 키로 닫기 (모달이 열려 있을 때와 같은 규칙)
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") toggleAllMenu(false);
    });
}


/* -- 모바일 메뉴 -- */
const sidebar = $("#sidebar"), scrim = $("#scrim"), menuBtn = $("#menuToggle");

function toggleMenu(open) {
    sidebar.classList.toggle("is-open", open);
    scrim.classList.toggle("is-on", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
}
if (sidebar && scrim && menuBtn) {
    menuBtn.addEventListener("click", () => toggleMenu(!sidebar.classList.contains("is-open")));
    scrim.addEventListener("click", () => toggleMenu(false));
}
