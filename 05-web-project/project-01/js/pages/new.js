/* =====================================================
   pages/new.js — 신상품: 입고 목록 렌더 · 기간 필터 · 찜 · 장바구니 담기 · 신규 쿠폰 받기
   ===================================================== */
(function () {
    "use strict";

    // 신상품 전용 정보 — 키는 data.js GOODS의 키와 같아야 함 [연결⑨]
    // days: 며칠 전에 입고됐는지 (0 = 오늘)
    const NEW_META = {
        "goods-9":  { days: 0 },
        "goods-10": { days: 0 },
        "goods-11": { days: 1 },
        "goods-12": { days: 2 },
        "goods-13": { days: 3 },
        "goods-14": { days: 4 },
        "goods-2":  { days: 5 },   // 홈에서 NEW 뱃지가 붙은 상품도 함께
        "goods-6":  { days: 6 }
    };

    // [연결④] 키 ↔ HTML data-period="..."
    const PERIODS = {
        all:     () => true,
        today:   (g) => g.days === 0,
        "3days": (g) => g.days <= 3
    };

    // GOODS + NEW_META → 최신 입고순 배열
    const ITEMS = Object.keys(NEW_META)
        .map((id) => ({ id, ...GOODS[id], ...NEW_META[id] }))
        .sort((a, b) => a.days - b.days);

    const saleRate = (g) => (g.was ? Math.round((1 - g.price / g.was) * 100) : 0);

    // 입고일 글자 — 오늘 날짜에서 days만큼 뺀 날짜 (예: "10.03 입고")
    function arrivedText(days) {
        if (days === 0) return "오늘 입고";
        const d = new Date();
        d.setDate(d.getDate() - days);
        return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, "0")} 입고`;
    }

    const list = $("#newList");         // [연결⑤]
    let period = "all";


    /* -- 신상품 목록 -- */
    function render() {
        const rows = ITEMS.filter(PERIODS[period]);

        list.innerHTML = rows.map((g) => {
            const liked = WISH_IDS.includes(g.id);
            return `
            <article class="goods-card new-card" id="${g.id}">
                <a class="goods-card__img" href="#">
                    <span class="g-emoji">${g.emoji}</span>
                    <span class="g-badge g-badge--new">NEW</span>
                    <button class="g-like ${liked ? "is-liked" : ""}" type="button" aria-pressed="${liked}"
                        aria-label="${liked ? "찜 해제" : "찜하기"}">${liked ? "♥" : "♡"}</button>
                </a>
                <div class="goods-card__body">
                    <p class="g-brand">${g.brand}</p>
                    <a class="g-name" href="#">${g.name}</a>
                    <p class="g-price">${g.was ? `<span class="g-rate">${saleRate(g)}%</span>` : ""}<b>${won(g.price)}</b></p>
                    <p class="g-meta"><span class="g-arrive ${g.days === 0 ? "is-today" : ""}">${arrivedText(g.days)}</span> · 무료배송</p>
                </div>
            </article>`;
        }).join("");
        // ↑ id="goods-N" → 담기 · 찜에서 GOODS[card.id]로 찾음 [연결⑨]
        // ↑ is-today → CSS .g-arrive.is-today (오늘 입고만 강조)

        $("#listCount").textContent = rows.length;   // [연결①]
        $("#newEmpty").hidden = rows.length > 0;
    }


    /* -- 기간 필터 (components.css .seg 재사용) -- */
    $("#periodSeg").addEventListener("click", (e) => {
        const btn = e.target.closest(".seg__btn");
        if (!btn) return;

        $$("#periodSeg .seg__btn").forEach((b) => b.classList.toggle("is-active", b === btn));  // [연결④]
        period = btn.dataset.period;
        render();
    });


    /* -- 카드 클릭: 찜 / 장바구니 담기 (이벤트 위임 — 필터 때마다 카드를 새로 만들기 때문) -- */
    list.addEventListener("click", (e) => {
        const card = e.target.closest(".goods-card");
        if (!card) return;
        e.preventDefault();                          // <a href="#"> 이동 막기

        const like = e.target.closest(".g-like");
        if (like) {
            setLikeBtn(like, toggleWish(card.id));   // common.js: 저장 + 문구 + 헤더 찜 숫자
            return;
        }

        const goods = GOODS[card.id];
        openConfirm("장바구니 담기", `<b>${goods.name}</b><br />상품을 장바구니에 담으시겠습니까?`, () => {
            addToCart(card.id);                      // common.js: 저장 + 담기 횟수 + 헤더 장바구니 숫자
            toast(`🛒 장바구니에 상품 넣기 : ${goods.name}`);
        });
    });


    /* -- 신규 쿠폰 받기 --
       받은 쿠폰은 data.js ISSUED_COUPONS(localStorage)에 저장 → 마이페이지 쿠폰함에 그대로 나타남 */
    const has = (key) => ISSUED_COUPONS.some((c) => c.key === key);

    const couponBtns = $$("[data-coupon]");           // [연결③] HTML data-coupon="welcome" / "new10" ↔ data.js COUPON_INFO 키

    function paintCoupons() {
        couponBtns.forEach((btn) => {
            const on = has(btn.dataset.coupon);
            btn.classList.toggle("is-got", on);       // [연결③] CSS .benefit__btn.is-got
            btn.disabled = on;
            btn.textContent = on ? "받기 완료 ✓" : "쿠폰 받기";
        });
        const allGot = couponBtns.every((b) => has(b.dataset.coupon));
        $("#couponAll").disabled = allGot;
        $("#couponAll").textContent = allGot ? "모두 받았어요 ✓" : "쿠폰 모두 받기";
    }

    function takeCoupon(key) {
        if (has(key)) return false;                   // 이미 받은 쿠폰은 건너뜀
        ISSUED_COUPONS.push({ key, at: Date.now() }); // 받은 시각 → 만료일 계산에 씀 (COUPON_INFO.days)
        return true;
    }

    function afterTake(msg) {
        saveCoupons();                                // localStorage에 저장 → mypage.html이 읽음
        renderCouponCount();
        paintCoupons();
        toast(msg);
    }

    $("#benefitRow").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-coupon]");
        if (!btn || !takeCoupon(btn.dataset.coupon)) return;
        afterTake(`🎟️ ${COUPON_INFO[btn.dataset.coupon].name}을 받았어요. 마이페이지 쿠폰함에서 확인하세요.`);
    });

    $("#couponAll").addEventListener("click", () => {
        const count = couponBtns.filter((b) => takeCoupon(b.dataset.coupon)).length;
        if (!count) return;
        afterTake(`🎟️ 쿠폰 ${count}장을 받았어요. 마이페이지 쿠폰함에서 확인하세요.`);
    });


    /* -- 시작 -- */
    $("#heroCount").textContent = ITEMS.length;     // [연결①]
    paintCoupons();
    render();
})();
