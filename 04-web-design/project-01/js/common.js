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
