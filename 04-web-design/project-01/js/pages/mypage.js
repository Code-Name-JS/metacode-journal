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

/* -- 프로필: 다음 등급까지 (membership.html과 같은 계산) -- */
const me = getGradeStatus();                        // [연결㉒] data.js
$("#gradeChip").textContent = me.grade.name;
if (me.next) {
    const need = [];
    if (me.needAmount) need.push(won(me.needAmount));
    if (me.needOrders) need.push(me.needOrders + "건");
    $("#gradeNeed").textContent = need.join(" · ");
    $("#gradeBar").style.width = me.amountPct + "%";
    $("#gradeNote").textContent = `${me.next.name}까지 금액 ${me.amountPct}% 달성`;
} else {
    $("#gradeNeed").textContent = "최고 등급";
    $("#gradeBar").style.width = "100%";
    $("#gradeNote").textContent = "VVIP 유지 중";
}

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
