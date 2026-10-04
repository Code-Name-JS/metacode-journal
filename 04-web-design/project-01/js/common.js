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

if (modal) {
    $("#modalClose").addEventListener("click", closeModal);
    $("#modalCancel").addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });
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
