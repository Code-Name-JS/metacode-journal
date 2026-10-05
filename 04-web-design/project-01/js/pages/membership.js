/* =====================================================
   pages/membership.js — 멤버십 등급: 내 등급 카드 · 다음 등급까지 · 등급 안내 · 등급 쿠폰 받기
                         · 등급 시뮬레이터 · 혜택 표/특별 혜택 표시
   등급 기준(GRADES) · 회원 정보(MEMBER) · 계산(getGradeStatus)은 data.js에 있음 [연결㉒]
   ===================================================== */
(function () {
    "use strict";

    const me = getGradeStatus();          // { idx, grade, next, needAmount, needOrders, amountPct, orderPct }
    const today = startOfDay(new Date()); // common.js
    const pad = (n) => String(n).padStart(2, "0");
    const dot = (d) => `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;


    /* -- 내 등급 카드 -- */
    $("#msCard").dataset.grade = me.grade.key;         // [연결①] data-grade → CSS가 카드 색을 고름
    $("#msEmoji").textContent = me.grade.emoji;
    $("#msGrade").textContent = me.grade.name;
    $("#msRate").textContent = me.grade.rate + "%";
    $("#msName").textContent = MEMBER.name;

    const joined = new Date(MEMBER.joined + "T00:00:00");
    // 함께한 햇수 — 올해 가입 기념일이 아직 안 지났으면 1년 덜 셈 (mypage "가입 2년차"와 같은 기준)
    const anniv = new Date(today.getFullYear(), joined.getMonth(), joined.getDate());
    const years = today.getFullYear() - joined.getFullYear() - (today < anniv ? 1 : 0);
    $("#msSince").textContent = `SINCE ${joined.getFullYear()}.${pad(joined.getMonth() + 1)} · ${years}년차`;


    /* -- 다음 등급까지 -- */
    if (me.next) {
        $("#msNextName").textContent = me.next.name;
        // 이미 채운 조건은 빼고, 남은 것만 보여줌
        const need = [];
        if (me.needAmount) need.push(won(me.needAmount));
        if (me.needOrders) need.push(me.needOrders + "건");
        $("#msNeed").textContent = need.join(" · ");
        $("#msAmountText").textContent = `${MEMBER.spent.toLocaleString("ko-KR")} / ${won(me.next.min)}`;
        $("#msOrderText").textContent = `${MEMBER.orders} / ${me.next.orders}건`;
    } else {
        $(".ms-progress__label").textContent = "가장 높은 등급이에요";
        $("#msNeed").textContent = "👑 VVIP 유지 중";
    }

    // 막대 길이 — 처음엔 0%로 그려진 뒤 늘어나도록 한 박자 늦게 넣음 (CSS transition)
    requestAnimationFrame(() => {
        $("#msAmountBar").style.setProperty("--p", me.amountPct + "%");   // [연결②] CSS width: var(--p)
        $("#msOrderBar").style.setProperty("--p", me.orderPct + "%");
    });

    // 산정 기간: 6개월 전 ~ 오늘 / 다음 산정일: 다음 달 1일
    const from = new Date(today);
    from.setMonth(from.getMonth() - 6);
    $("#msPeriod").textContent = `${dot(from)} ~ ${dot(today)}`;

    const evalDay = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const evalLeft = Math.round((evalDay - today) / DAY);
    $("#msEval").textContent = `${pad(evalDay.getMonth() + 1)}.01 (D-${evalLeft})`;


    /* -- 등급 안내 (data.js GRADES로 만듦) -- */
    $("#msLadder").innerHTML = GRADES.map((g, i) => {
        const state = i < me.idx ? "is-done" : i === me.idx ? "is-current" : i === me.idx + 1 ? "is-next" : "";
        const cond = g.min ? `${g.min / 10000}만원 · ${g.orders}건 이상` : "가입 즉시";
        return `
        <li class="ms-tier ${state}" data-grade="${g.key}">
            <span class="ms-tier__ic">${g.emoji}</span>
            <p class="ms-tier__name">${g.name}</p>
            <p class="ms-tier__cond">${cond}</p>
            <span class="ms-tier__rate">적립 ${g.rate}%</span>
        </li>`;
    }).join("");
    // ↑ [연결③] is-done / is-current / is-next → CSS가 체크 · "현재 등급" · "다음 목표" 이름표를 붙임
    // ↑ [연결①] data-grade → CSS가 아이콘 원 색(--g1 · --g2)을 고름


    /* -- 등급별 혜택 표: 내 등급 열 칠하기 --
       각 줄의 0번 칸은 제목 → 등급 칸은 (번호 + 1)번째 */
    $$("#msTable tr").forEach((tr) => tr.children[me.idx + 1].classList.add("is-current"));   // [연결⑦]

    // 좁은 화면에서 표가 옆으로 길면, 내 등급 열이 가운데 보이도록 미리 옆으로 스크롤
    const tableWrap = $(".ms-table-wrap");
    const myCol = $("#msTable thead .is-current");
    tableWrap.scrollLeft = myCol.offsetLeft - (tableWrap.clientWidth - myCol.offsetWidth) / 2;


    /* -- 특별 혜택: 내 등급에서 쓸 수 있는지 -- */
    const gradeIdx = (key) => GRADES.findIndex((g) => g.key === key);

    $$("#msPerks .ms-perk").forEach((card) => {
        const min = gradeIdx(card.dataset.min);       // [연결⑧] data-min="gold" → 2
        const on = me.idx >= min;
        card.classList.toggle("is-on", on);
        $(".ms-perk__state", card).textContent = on ? "✓ 이용 중" : `${GRADES[min].name}부터`;
    });


    /* -- 이번 달 등급 쿠폰 · 생일 쿠폰 --
       받은 쿠폰은 data.js ISSUED_COUPONS(localStorage)에 저장 → 마이페이지 쿠폰함에 그대로 나타남 (new.js와 같은 방식) */
    $("#msCouponGrade").textContent = me.grade.name;

    // 생일 달인지 확인
    const isBirthMonth = today.getMonth() + 1 === MEMBER.birthMonth;
    const birthday = new Date(today.getFullYear(), MEMBER.birthMonth - 1, MEMBER.birthDay);
    const birthLeft = Math.round((birthday - today) / DAY);
    const birthLabel = `${MEMBER.birthMonth}월 ${MEMBER.birthDay}일`;

    $("#msBirthdayText").textContent = !isBirthMonth
        ? `${birthLabel} 생일 · 생일 달에 받을 수 있어요`
        : birthLeft > 0 ? `${birthLabel} 생일까지 D-${birthLeft} · 미리 축하드려요!`
        : birthLeft === 0 ? "오늘 생일 축하드려요! 🎉" : `${birthLabel} 생일 축하드려요!`;

    const has = (key) => ISSUED_COUPONS.some((c) => c.key === key);
    const couponBtns = $$("#msCoupons [data-coupon]");      // [연결④]
    const canTake = (btn) => btn.dataset.coupon !== "birthday" || isBirthMonth;

    function paintCoupons() {
        couponBtns.forEach((btn) => {
            const got = has(btn.dataset.coupon);
            const locked = !canTake(btn);
            btn.classList.toggle("is-got", got);                          // [연결④] CSS .ms-coupon__btn.is-got
            btn.closest(".ms-coupon").classList.toggle("is-locked", locked);   // [연결⑤] CSS .ms-coupon.is-locked
            btn.disabled = got || locked;
            btn.textContent = got ? "받음 ✓" : locked ? "잠김" : "받기";
        });

        const left = couponBtns.filter((b) => canTake(b) && !has(b.dataset.coupon)).length;
        $("#msCouponAll").disabled = left === 0;
        $("#msCouponAll").textContent = left === 0 ? "모두 받았어요 ✓" : `쿠폰 모두 받기 (${left})`;
    }

    function takeCoupon(key) {
        if (has(key)) return false;
        ISSUED_COUPONS.push({ key, at: Date.now() });     // 받은 시각 → 만료일 계산 (COUPON_INFO.days)
        return true;
    }

    function afterTake(msg) {
        saveCoupons();                                    // localStorage → mypage.html 쿠폰함이 읽음
        renderCouponCount();
        paintCoupons();
        toast(msg);
    }

    $("#msCoupons").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-coupon]");
        if (!btn || btn.disabled || !takeCoupon(btn.dataset.coupon)) return;
        afterTake(`🎟️ ${COUPON_INFO[btn.dataset.coupon].name}을 받았어요. 마이페이지 쿠폰함에서 확인하세요.`);
    });

    $("#msCouponAll").addEventListener("click", () => {
        const count = couponBtns.filter((b) => canTake(b) && takeCoupon(b.dataset.coupon)).length;
        if (count) afterTake(`🎟️ 쿠폰 ${count}장을 받았어요. 마이페이지 쿠폰함에서 확인하세요.`);
    });

    paintCoupons();


    /* -- 등급 시뮬레이터 -- */
    const simAmount = $("#simAmount"), simOrders = $("#simOrders");   // [연결⑥]
    const simResult = $("#simResult"), simGrade = $("#simGrade");
    let lastKey = "";

    // 막대의 채워진 비율 → CSS 변수 --fill
    function paintRange(input) {
        const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
        input.style.setProperty("--fill", pct + "%");      // [연결⑥] CSS linear-gradient(... var(--fill) ...)
    }

    function simulate() {
        const addAmount = Number(simAmount.value);       // input 값은 항상 문자열 → 숫자로 바꿔야 더하기가 됨
        const addOrders = Number(simOrders.value);
        const spent = MEMBER.spent + addAmount;
        const orders = MEMBER.orders + addOrders;
        const s = getGradeStatus(spent, orders);         // data.js — 같은 계산 함수를 다른 값으로 재사용

        $("#simAmountText").textContent = won(addAmount);
        $("#simOrdersText").textContent = addOrders + "건";
        $("#simSpent").textContent = won(spent);
        $("#simCount").textContent = orders + "건";
        $("#simPoint").textContent = Math.floor(addAmount * me.grade.rate / 100).toLocaleString("ko-KR") + "P";  // 지금 등급 적립률로

        simResult.dataset.grade = s.grade.key;           // [연결①] 결과 상자 색 바꾸기
        simGrade.textContent = `${s.grade.emoji} ${s.grade.name}`;

        // 등급이 바뀌었을 때만 튀어 오르는 애니메이션 — 클래스를 뺐다가 다시 붙여야 매번 재생됨
        if (lastKey && lastKey !== s.grade.key) {
            simGrade.classList.remove("is-pop");
            void simGrade.offsetWidth;                   // 브라우저가 "빠졌다"는 걸 알아채도록 한 번 계산시킴
            simGrade.classList.add("is-pop");
        }
        lastKey = s.grade.key;

        let msg;
        if (s.idx > me.idx) msg = `지금보다 한 단계 위, <b>${s.grade.name}</b> 등급이 돼요! 🎉`;
        else if (!s.next) msg = "가장 높은 등급을 유지해요 👑";
        else {
            const need = [];
            if (s.needAmount) need.push(won(s.needAmount));
            if (s.needOrders) need.push(s.needOrders + "건");
            msg = `${s.next.name}까지 <b>${need.join(" · ")}</b> 더 필요해요`;
        }
        $("#simMsg").innerHTML = msg;

        paintRange(simAmount);
        paintRange(simOrders);
    }

    simAmount.addEventListener("input", simulate);       // [연결⑥] 막대를 움직이는 동안 계속 실행
    simOrders.addEventListener("input", simulate);
    simulate();


    /* -- 다른 탭(new.html · mypage)에서 쿠폰을 받으면 바로 반영 -- */
    window.addEventListener("storage", (e) => {
        if (e.key !== COUPON_KEY) return;
        ISSUED_COUPONS.splice(0, ISSUED_COUPONS.length, ...loadCoupons());
        paintCoupons();
    });
})();
