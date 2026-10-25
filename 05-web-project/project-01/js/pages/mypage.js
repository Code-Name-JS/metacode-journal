/* =====================================================
   pages/mypage.js — 탭 전환 · 요약 카드 이동 · 탭 잉크 위치
   ===================================================== */
(function () {
    "use strict";

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

/* -- 탭 잉크 위치 -- */
window.addEventListener("load", () => {
    const active = $(".tab.is-active");
    active && moveInk(active);
});
window.addEventListener("resize", () => {
    const active = $(".tab.is-active");
    active && moveInk(active);
});

})();
