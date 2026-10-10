/* =====================================================
   pages/membership.js — 멤버십 등급: 내 등급 카드 · 다음 등급까지 · 등급 산정 내역 · 등급 안내
                         · 등급 쿠폰 받기 · 등급 시뮬레이터 · 혜택 표/특별 혜택 표시
   등급은 data.js ORDERS(마이페이지 주문내역)에서 "최근 6개월 + 구매확정" 주문으로 계산 [연결㉒]
   ===================================================== */
(function () {
    "use strict";

    const today = startOfDay(new Date());   // common.js
    const pad = (n) => String(n).padStart(2, "0");
    const dot = (d) => `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
    const needText = (s) => [s.needAmount ? won(s.needAmount) : "", s.needOrders ? s.needOrders + "건" : ""].filter(Boolean).join(" · ");

    let me = getGradeStatus();              // 주문 상태가 바뀌면 render()에서 다시 계산


    /* ==========================================
       바뀌지 않는 부분 (한 번만)
       ========================================== */
    $("#msName").textContent = MEMBER.name;

    // 함께한 햇수 — 올해 가입 기념일이 아직 안 지났으면 1년 덜 셈 (mypage "가입 2년차"와 같은 기준)
    const joined = new Date(MEMBER.joined + "T00:00:00");
    const anniv = new Date(today.getFullYear(), joined.getMonth(), joined.getDate());
    const years = today.getFullYear() - joined.getFullYear() - (today < anniv ? 1 : 0);
    $("#msSince").textContent = `SINCE ${joined.getFullYear()}.${pad(joined.getMonth() + 1)} · ${years}년차`;

    // 산정 기간 · 다음 산정일
    $("#msPeriod").textContent = `${dot(gradeFrom())} ~ ${dot(today)}`;     // data.js gradeFrom()
    const evalDay = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    $("#msEval").textContent = `${pad(evalDay.getMonth() + 1)}.01 (D-${Math.round((evalDay - today) / DAY)})`;

    // 생일
    const isBirthMonth = today.getMonth() + 1 === MEMBER.birthMonth;
    const birthday = new Date(today.getFullYear(), MEMBER.birthMonth - 1, MEMBER.birthDay);
    const birthLeft = Math.round((birthday - today) / DAY);
    const birthLabel = `${MEMBER.birthMonth}월 ${MEMBER.birthDay}일`;
    const birthText = !isBirthMonth ? `${birthLabel} 생일 · 생일 달에 받을 수 있어요`
        : birthLeft > 0 ? `${birthLabel} 생일까지 D-${birthLeft} · 미리 축하드려요!`
        : birthLeft === 0 ? "오늘 생일 축하드려요! 🎉" : `${birthLabel} 생일 축하드려요!`;


    /* ==========================================
       내 등급에 따라 바뀌는 부분 — render()
       ========================================== */

    /* -- 내 등급 카드 · 다음 등급까지 -- */
    function renderCard() {
        $("#msCard").dataset.grade = me.grade.key;     // [연결①] data-grade → CSS가 카드 색을 고름
        $("#msEmoji").textContent = me.grade.emoji;
        $("#msGrade").textContent = me.grade.name;
        $("#msRate").textContent = me.grade.rate + "%";

        const label = $(".ms-progress__label");
        if (me.next) {
            label.innerHTML = `<b>${me.next.name}</b>까지 남은 조건`;
            $("#msNeed").textContent = needText(me);
            $("#msAmountText").textContent = `${me.spent.toLocaleString("ko-KR")} / ${won(me.next.min)}`;
            $("#msOrderText").textContent = `${me.orders} / ${me.next.orders}건`;
        } else {
            label.textContent = "가장 높은 등급이에요";
            $("#msNeed").textContent = `👑 ${me.grade.name} 달성`;
            $("#msAmountText").textContent = won(me.spent);
            $("#msOrderText").textContent = me.orders + "건";
        }

        // 막대 길이 — 한 박자 늦게 넣어야 0%에서 늘어나는 애니메이션이 보임 (CSS transition)
        requestAnimationFrame(() => {
            $("#msAmountBar").style.setProperty("--p", me.amountPct + "%");   // [연결②] CSS width: var(--p)
            $("#msOrderBar").style.setProperty("--p", me.orderPct + "%");
        });

        // [연결⑨] 배송중 주문을 모두 구매확정하면? — 같은 계산 함수에 금액 · 건수를 더해서 넣어 봄
        const pending = ORDERS.filter((o) => gradeState(o) === "pending");
        const tip = $("#msTip");
        tip.hidden = pending.length === 0;
        if (pending.length) {
            const sum = pending.reduce((s, o) => s + o.price, 0);
            const after = getGradeStatus({ spent: me.spent + sum, orders: me.orders + pending.length });
            tip.innerHTML = after.idx > me.idx
                ? `💡 배송중인 ${pending.length}건(${won(sum)})을 구매확정하면 <b>${after.grade.name}</b>가 돼요!`
                : `💡 배송중인 ${pending.length}건(${won(sum)})은 구매확정하면 등급에 반영돼요.`;
        }
    }


    /* -- 등급 산정 내역 (ORDERS) -- */
    const ORDER_TAG = { counted: "✓ 반영", pending: "구매확정 후 반영", expired: "6개월 지남" };

    function renderOrders() {
        $("#msOrders").innerHTML = ORDERS.map((o) => {
            const state = gradeState(o);                 // data.js — counted · pending · expired
            return `
            <li class="ms-order is-${state}">
                <span class="ms-order__ic">${o.emoji}</span>
                <div class="ms-order__info">
                    <p class="ms-order__name">${o.name}</p>
                    <p class="ms-order__date">${o.date} · ${STATUS_TEXT[o.status]}</p>
                </div>
                <b class="ms-order__price">${won(o.price)}</b>
                <span class="ms-order__tag">${ORDER_TAG[state]}</span>
            </li>`;
        }).join("");
        // ↑ [연결⑩] is-counted / is-pending / is-expired → CSS가 글자 색 · 흐림을 정함

        $("#msOrderSum").textContent = `${me.orders}건 · ${won(me.spent)}`;
    }


    /* -- 등급 안내 (data.js GRADES로 만듦) -- */
    function renderLadder() {
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
    }


    /* -- 등급별 혜택 표 · 특별 혜택 -- */
    const tableWrap = $(".ms-table-wrap");
    const gradeIdx = (key) => GRADES.findIndex((g) => g.key === key);

    function renderTable() {
        // 각 줄의 0번 칸은 제목 → 등급 칸은 (번호 + 1)번째. 예전 표시는 먼저 지움
        $$("#msTable tr").forEach((tr) =>
            [...tr.children].forEach((cell, i) => cell.classList.toggle("is-current", i === me.idx + 1))   // [연결⑦]
        );
        // 좁은 화면에서 표가 옆으로 길면, 내 등급 열이 가운데 보이도록 미리 옆으로 스크롤
        const myCol = $("#msTable thead .is-current");
        tableWrap.scrollLeft = myCol.offsetLeft - (tableWrap.clientWidth - myCol.offsetWidth) / 2;

        $$("#msPerks .ms-perk").forEach((card) => {
            const min = gradeIdx(card.dataset.min);       // [연결⑧] data-min="gold" → 2
            const on = me.idx >= min;
            card.classList.toggle("is-on", on);
            $(".ms-perk__state", card).textContent = on ? "✓ 이용 중" : `${GRADES[min].name}부터`;
        });
    }


    /* -- 이번 달 등급 쿠폰 · 생일 쿠폰 --
       받은 쿠폰은 data.js ISSUED_COUPONS(localStorage)에 저장 → 마이페이지 쿠폰함에 그대로 나타남 */
    const has = (key) => ISSUED_COUPONS.some((c) => c.key === key);
    const hasBirthday = () => ISSUED_COUPONS.some((c) => c.key.startsWith("bday"));   // 생일 쿠폰은 등급과 상관없이 1년에 한 장
    const isTaken = (key) => (key.startsWith("bday") ? hasBirthday() : has(key));
    const canTake = (key) => !key.startsWith("bday") || isBirthMonth;

    function couponHTML(key) {
        const c = COUPON_INFO[key];
        const bday = key.startsWith("bday");
        const taken = isTaken(key), locked = !canTake(key);
        return `
        <li class="coupon-item ms-coupon ${bday ? "ms-coupon--birthday" : ""} ${locked ? "is-locked" : ""}">
            <div class="coupon-item__value">${c.value}${c.unit.startsWith("%") ? "%" : ""}<small>${c.unit.replace("% ", "")}</small></div>
            <div class="coupon-item__info">
                <p class="coupon-item__name">${bday ? "🎂 " : ""}${c.name}</p>
                <p class="coupon-item__cond">${bday ? birthText : `${c.cond} · 받은 날부터 ${c.days}일`}</p>
            </div>
            <button class="ms-coupon__btn ${taken ? "is-got" : ""}" type="button" data-coupon="${key}"
                ${taken || locked ? "disabled" : ""}>${taken ? "받음 ✓" : locked ? "잠김" : "받기"}</button>
        </li>`;
        // ↑ [연결④] is-got → CSS .ms-coupon__btn.is-got / [연결⑤] is-locked → CSS .ms-coupon.is-locked
    }

    function myCouponKeys() {
        return [...me.grade.coupons, me.grade.birthday];   // data.js GRADES — 등급이 바뀌면 쿠폰도 바뀜
    }

    function renderCoupons() {
        $("#msCouponGrade").textContent = me.grade.name;
        const keys = myCouponKeys();
        $("#msCoupons").innerHTML = keys.map(couponHTML).join("");

        const left = keys.filter((k) => canTake(k) && !isTaken(k)).length;
        $("#msCouponAll").disabled = left === 0;
        $("#msCouponAll").textContent = left === 0 ? "모두 받았어요 ✓" : `쿠폰 모두 받기 (${left})`;
    }

    function takeCoupon(key) {
        if (!canTake(key) || isTaken(key)) return false;
        ISSUED_COUPONS.push({ key, at: Date.now() });     // 받은 시각 → 만료일 계산 (COUPON_INFO.days)
        return true;
    }

    function afterTake(msg) {
        saveCoupons();                                    // localStorage → mypage.html 쿠폰함이 읽음
        renderCouponCount();
        renderCoupons();
        toast(msg);
    }

    // 쿠폰 목록은 다시 그려지므로 ul 하나에 이벤트를 걸어 둠 (이벤트 위임)
    $("#msCoupons").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-coupon]");
        if (!btn || btn.disabled || !takeCoupon(btn.dataset.coupon)) return;
        afterTake(`🎟️ ${COUPON_INFO[btn.dataset.coupon].name}을 받았어요. 마이페이지 쿠폰함에서 확인하세요.`);
    });

    $("#msCouponAll").addEventListener("click", () => {
        const count = myCouponKeys().filter(takeCoupon).length;
        if (count) afterTake(`🎟️ 쿠폰 ${count}장을 받았어요. 마이페이지 쿠폰함에서 확인하세요.`);
    });


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
        const s = getGradeStatus({ spent: me.spent + addAmount, orders: me.orders + addOrders });   // 같은 계산 함수를 다른 값으로 재사용

        $("#simAmountText").textContent = won(addAmount);
        $("#simOrdersText").textContent = addOrders + "건";
        $("#simSpent").textContent = won(s.spent);
        $("#simCount").textContent = s.orders + "건";
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
        if (s.idx > me.idx) msg = `지금보다 높은 <b>${s.grade.name}</b> 등급이 돼요! 🎉`;
        else if (!s.next) msg = "가장 높은 등급을 유지해요 👑";
        else msg = `${s.next.name}까지 <b>${needText(s)}</b> 더 필요해요`;
        $("#simMsg").innerHTML = msg;

        paintRange(simAmount);
        paintRange(simOrders);
    }

    simAmount.addEventListener("input", simulate);       // [연결⑥] 막대를 움직이는 동안 계속 실행
    simOrders.addEventListener("input", simulate);


    /* -- 전부 다시 그리기 -- */
    function render() {
        me = getGradeStatus();                           // data.js — ORDERS로 다시 계산
        renderCard();
        renderOrders();
        renderLadder();
        renderTable();
        renderCoupons();
        simulate();
    }
    render();


    /* -- 다른 탭(mypage · new)에서 구매확정하거나 쿠폰을 받으면 바로 반영 -- */
    window.addEventListener("storage", (e) => {
        if (e.key === ORDER_STATUS_KEY) {
            applyOrderStatus();                          // data.js — 저장된 주문 상태를 ORDERS에 다시 덮어씀
            render();
        }
        if (e.key === COUPON_KEY) {
            ISSUED_COUPONS.splice(0, ISSUED_COUPONS.length, ...loadCoupons());
            renderCoupons();
        }
    });
})();
