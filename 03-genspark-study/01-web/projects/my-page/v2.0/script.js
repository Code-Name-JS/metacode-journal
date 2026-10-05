/* ============================================================
   AURORA 마이페이지 시안 — script.js
   ============================================================ */
(function () {
    "use strict";

var $ = function (sel, root) { return (root || document).querySelector(sel); };
var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };



/* -- 토스트 -- */
var toastEl = $("#toast");
var toastTimer = null;
function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
        toastEl.classList.remove("is-show");
    }, 2200);
}



/* -- 테마 토글 -- */
var themeToggle = $("#themeToggle");
var root = document.documentElement;
try {
   var saved = localStorage.getltem("aurora-theme");
   if (saved) root.setAttribute("data-theme", saved);
} catch (e) { /* localStorage 미지원 환경 무시 */ }

if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try { localStorage.setltem("aurora-theme", next);} catch (e) {}
        toast(next === "dark" ? "다크 모드로 전환했습니다" : "라이트 모드로 전환했습니다");
    });
}



/* -- 숫자 카운트업 -- */
var counted = false;
function countUp() {
    if (counted) return;
    counted = true;
    $$(".stat-value").forEach(function (el) {
        var target = parselnt(el.getAttribute("data-count"), 10) || 0;
        var start = performance.now();
        var dur = 1100;
        function step(now) {
            var p = Math.min((now - start)/dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased).toLocaleString("ko-KR");
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    });
}
if ("IntersectionObserver" in window) {
    var statsEl = $(".stats");
    if (statsEl) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if(en.isIntersecting) { countUp(); io.disconnect(); }
            });
        }, { threshold: 0.25 });
        io.observe(statsEl);
    }
} else {
    countUp();
}
setTimeout(countUp, 1400); // 안전장치



/* -- 탭 전환 -- */
var tabs = $$(".tab");
function activateTab(name) {
    tabs.forEach(function (t) {
        var on = t.getAttribute("data-tab") === name;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById("panel-" + t.getAttribute("data-tab"));
        if (panel) {
            panel.classList.toggle("is-active", on);
            if (on) { panel.removeAttribute("hidden");                
            } else {
                panel.setAttribute("hidden", "");}
            }
        });
    }
    tabs.forEach(function (t) {
        t.addEventListener("click", function () {
            activateTab(t.getAttribute("data-tab"));
        });
        t.addEventListener("keydown", function (e) {
            var i = tabs.indexOf(t);
            var next = null;
            if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
            if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
            if (next) {e.preventDefault(); next.focus(); activateTab(next.getAttribute("data-tab")); }
        });
    });



    /* -- 주문 필터 -- */
})