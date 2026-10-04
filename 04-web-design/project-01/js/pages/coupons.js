/* =====================================================
   pages/coupons.js — 마이페이지 쿠폰 탭: 보유 쿠폰 렌더 · 다른 탭에서 받은 쿠폰 반영
   보유 쿠폰 = data.js BASE_COUPONS + new.html에서 받은 ISSUED_COUPONS (common.js getMyCoupons)
   ===================================================== */
(function () {
    "use strict";

const list = $("#couponList");      // [연결㉑] HTML id="couponList"

// 날짜 → "2026.10.09"
const pad = (n) => String(n).padStart(2, "0");
const dateText = (d) => `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;


/* -- 쿠폰 목록 렌더 -- */
function renderCoupons() {
    const mine = getMyCoupons();

    list.innerHTML = mine.map((c) => {
        const soon = c.dday <= 7;   // 이번 주 안에 만료
        return `
        <li class="coupon-item ${c.isNew ? "is-new" : ""}" data-key="${c.key}">
            <div class="coupon-item__value">${c.value}<small>${c.unit}</small></div>
            <div class="coupon-item__info">
                <p class="coupon-item__name">${c.name}${c.isNew ? ` <span class="coupon-item__new">NEW</span>` : ""}</p>
                <p class="coupon-item__cond">${c.cond}</p>
                <p class="coupon-item__date ${soon ? "coupon-item__date--soon" : ""}">
                    ${dateText(c.end)} 만료${soon ? ` · ${c.dday === 0 ? "D-DAY" : "D-" + c.dday}` : ""}
                </p>
            </div>
        </li>`;
    }).join("");
    // ↑ is-new → CSS .coupon-item.is-new (new.html에서 받은 쿠폰 강조)
    // ↑ coupon-item__date--soon → CSS (7일 안에 만료되면 빨간 글씨)

    $("#couponEmpty").hidden = mine.length > 0;

    // 신규 쿠폰을 아직 다 안 받았을 때만 "받으러 가기" 버튼 보이기 — [연결⑳]
    const allGot = ["welcome", "new10"].every((key) => ISSUED_COUPONS.some((c) => c.key === key));
    $("#couponMore").hidden = allGot;

    renderCouponCount();            // [연결⑱][연결⑲] 요약 카드 · 탭 제목 · 사이드바 장수
}


/* -- 다른 탭(new.html)에서 쿠폰을 받으면 바로 반영 --
   ISSUED_COUPONS는 const 배열 → 다시 대입 대신 내용만 교체 */
window.addEventListener("storage", (e) => {
    if (e.key !== COUPON_KEY) return;
    ISSUED_COUPONS.splice(0, ISSUED_COUPONS.length, ...loadCoupons());
    renderCoupons();
});


/* -- 초기 실행 -- */
renderCoupons();

})();
