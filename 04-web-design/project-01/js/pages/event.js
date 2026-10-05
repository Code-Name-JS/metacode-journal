/* =====================================================
   pages/event.js — 브랜드 위크: 일정표 · 이벤트 목록/필터 · 참여 내용 · 신청 댓글(작성 · 삭제) · 참여 쿠폰
   이벤트 정보(BRAND_EVENTS · eventInfo)와 브랜드(BRANDS)는 data.js에 있음 [연결㉕]
   ===================================================== */
(function () {
    "use strict";

    const EVENTS = BRAND_EVENTS.map(eventInfo);          // data.js — 기간 · 상태(live · soon · ended)까지 계산된 목록
    const evOf = (key) => EVENTS.find((e) => e.key === key);

    const now = new Date();
    const today = startOfDay(now);                        // common.js
    const W = ["일", "월", "화", "수", "목", "금", "토"];
    const pad = (n) => String(n).padStart(2, "0");
    const md = (d) => `${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
    const mdw = (d) => `${md(d)}(${W[d.getDay()]})`;
    const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

    // 사용자가 쓴 글을 innerHTML에 넣기 전에 꼭 바꿔 줌 — "<b>" 같은 글자가 태그로 실행되지 않도록
    const escapeHTML = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

    // 이름 가운데 가리기 — "김지우" → "김*우"
    const mask = (name) => (name.length <= 2 ? name[0] + "*" : name[0] + "*".repeat(name.length - 2) + name.at(-1));

    function statusText(e) {
        if (e.status === "live") return e.toEnd === 0 ? "진행 중 · 오늘 마감" : `진행 중 · D-${e.toEnd}`;
        if (e.status === "soon") return `오픈 D-${e.toStart}`;
        return "종료";
    }


    /* ==========================================
       신청 댓글 저장소
       ========================================== */
    // 다른 회원 댓글 (미리 넣어 둔 예시) — h: 이벤트 시작 후 몇 시간 뒤에 쓴 글인지
    const SEEDS = {
        glowlab:  [{ name: "박서연", h: 30,  text: "환절기라 볼이 자꾸 붉어져요. 진정 크림 꼭 써 보고 싶어요!" },
                   { name: "이도윤", h: 75,  text: "속건조가 심해서 수분 크림만 세 개째 바꾸는 중이에요 😢" }],
        soundlab: [{ name: "최하준", h: 9,   text: "출퇴근 지하철 소음 때문에 노이즈캔슬링 헤드폰이 너무 갖고 싶어요." },
                   { name: "정유나", h: 50,  text: "홈시어터 사운드바로 주말 영화관 만들고 싶어요! 🎬" },
                   { name: "한지호", h: 80,  text: "러닝할 때 쓸 오픈형 이어버드요. 귀가 안 아픈 게 최고!" }],
        modework: [{ name: "윤채원", h: 6,   text: "카멜 코트에 오트밀 니트, 흰 운동화로 꾸안꾸 가을 코디 하고 싶어요." },
                   { name: "강민재", h: 40,  text: "오버사이즈 셔츠 하나로 출근룩 · 주말룩 다 해결하는 중이에요." }],
        homefit:  [{ name: "서지안", h: 1,   text: "주말 아침엔 핸드드립으로 천천히 커피 내리는 게 제 휴식이에요 ☕" }],
        techfit:  [],
        dailystep: []
    };

    // 내가 쓴 댓글 — { soundlab: [{ id, text, at }] } 형태로 localStorage에 저장
    const TALK_KEY = "shoply-event-comments";

    function loadMine() {
        try {
            const saved = JSON.parse(localStorage.getItem(TALK_KEY));
            if (saved && typeof saved === "object") return saved;
        } catch (e) { }
        return {};
    }
    const MINE = loadMine();
    const saveMine = () => { try { localStorage.setItem(TALK_KEY, JSON.stringify(MINE)); } catch (e) { } };
    const mineOf = (key) => MINE[key] || [];
    const joined = (key) => mineOf(key).length > 0;      // 이 이벤트에 신청했는지


    /* ==========================================
       머리 배너 숫자
       ========================================== */
    function renderStats() {
        $("#evLiveCount").textContent = EVENTS.filter((e) => e.status === "live").length;   // [연결①]
        $("#evSoonCount").textContent = EVENTS.filter((e) => e.status === "soon").length;
        $("#evMineCount").textContent = EVENTS.filter((e) => joined(e.key)).length;
    }


    /* ==========================================
       일정표 — CSS grid: 첫 칸은 브랜드 이름, 그 뒤로 하루에 한 칸
       ========================================== */
    function renderTimeline() {
        const first = new Date(Math.min(...EVENTS.map((e) => e.start)));
        const last = new Date(Math.max(...EVENTS.map((e) => e.end)));
        const total = Math.round((last - first) / DAY) + 1;            // 전체 날짜 수
        const col = (d) => Math.round((d - first) / DAY) + 2;          // 날짜 → grid 칸 번호 (1번 칸은 이름)

        const tl = $("#evTimeline");
        tl.style.setProperty("--days", total);                         // [연결②] CSS repeat(var(--days), ...)

        let html = `<div class="ev-tl__corner">브랜드</div>`;
        for (let i = 0; i < total; i++) {
            const d = addDays(first, i);
            const cls = [+d === +today ? "is-today" : "", d.getDay() === 0 ? "is-sun" : ""].join(" ");
            html += `<div class="ev-tl__day ${cls}" style="grid-column: ${i + 2}">
                        <small>${i === 0 || d.getDate() === 1 ? d.getMonth() + 1 + "월" : "&nbsp;"}</small>${d.getDate()}<em>${W[d.getDay()]}</em>
                     </div>`;
        }

        // 오늘 세로 줄 — 막대보다 먼저 넣고 CSS z-index로 뒤에 깔림
        if (today >= first && today <= last) {
            html += `<span class="ev-tl__now" style="grid-row: 1 / ${EVENTS.length + 2}; grid-column: ${col(today)}"></span>`;
        }

        EVENTS.forEach((e, i) => {
            const b = BRANDS[e.brand];
            const row = i + 2;
            html += `<div class="ev-tl__label" style="grid-row: ${row}">${b.logo} ${e.brand}</div>
                     <a class="ev-tl__bar is-${e.status}" href="#evDetail" data-ev="${e.key}"
                        style="grid-row: ${row}; grid-column: ${col(e.start)} / span ${EVENT_DAYS}; --tone: ${b.tone}">
                        <span>${e.title}</span><b>+${e.rate}%</b>
                     </a>`;
        });
        // ↑ grid-column: 시작칸 / span 7 → 막대가 7칸(7일)을 차지 / is-live · is-soon · is-ended ↔ CSS
        tl.innerHTML = html;

        // 좁은 화면에서 일정표가 옆으로 길면, 오늘 줄이 가운데 오도록 미리 옆으로 스크롤
        const nowLine = $(".ev-tl__now", tl);
        if (nowLine) {
            const wrap = tl.parentElement;
            wrap.scrollLeft = nowLine.offsetLeft - (wrap.clientWidth - nowLine.offsetWidth) / 2;
        }
    }


    /* ==========================================
       이벤트 목록
       ========================================== */
    let filter = "all";
    let current = (EVENTS.find((e) => e.status === "live") || EVENTS[0]).key;   // 처음엔 진행 중인 첫 이벤트

    function renderList() {
        const rows = filter === "all" ? EVENTS : EVENTS.filter((e) => e.status === filter);

        $("#evList").innerHTML = rows.map((e) => {
            const b = BRANDS[e.brand];
            const pct = e.status === "ended" ? 100 : e.status === "soon" ? 0 : Math.round((e.day / EVENT_DAYS) * 100);
            const people = e.base + mineOf(e.key).length;
            return `
            <a class="ev-card is-${e.status} ${e.key === current ? "is-active" : ""}" href="#evDetail" data-ev="${e.key}" style="--tone: ${b.tone}">
                <div class="ev-card__top">
                    <span class="ev-card__logo">${b.logo}</span>
                    <span class="ev-chip ev-chip--${e.status}">${statusText(e)}</span>
                </div>
                <p class="ev-card__brand">${e.brand}</p>
                <h3>${e.title}</h3>
                <p class="ev-card__rate">전 상품 <b>+${e.rate}%</b></p>
                <p class="ev-card__period">${mdw(e.start)} ~ ${mdw(e.end)}</p>
                <div class="ev-card__bar"><i style="--p: ${pct}%"></i></div>
                <p class="ev-card__foot">
                    <span>👥 ${people.toLocaleString("ko-KR")}명 참여</span>
                    ${joined(e.key) ? `<span class="ev-card__mine">✓ 신청 완료</span>` : ""}
                </p>
            </a>`;
        }).join("");
        // ↑ [연결④] data-ev → 클릭하면 이 값으로 이벤트를 고름 / --tone → 브랜드 색 / --p → 7일 중 지난 비율

        $("#evEmpty").hidden = rows.length > 0;
    }


    /* ==========================================
       선택한 이벤트 — 참여 내용
       ========================================== */
    function renderInfo() {
        const e = evOf(current);
        const b = BRANDS[e.brand];
        const coupon = COUPON_INFO[e.coupon];
        const announce = addDays(e.end, 3);                             // 당첨 발표 = 종료 3일 뒤

        $("#evDetail").style.setProperty("--tone", b.tone);            // [연결⑤] CSS가 강조색을 var(--tone)으로

        // 7일 동그라미 — 지난 날 · 오늘 · 남은 날
        const days = Array.from({ length: EVENT_DAYS }, (_, i) => {
            const state = e.status === "ended" || (e.status === "live" && i < e.day - 1) ? "is-done"
                : e.status === "live" && i === e.day - 1 ? "is-today" : "";
            return `<li class="${state}"><b>${i + 1}일</b><small>${md(addDays(e.start, i))}</small></li>`;
        }).join("");

        $("#evInfo").innerHTML = `
            <div class="ev-info__head">
                <span class="ev-info__logo">${b.logo}</span>
                <div>
                    <p class="ev-info__brand">${e.brand} · ${b.ko}</p>
                    <h3>${e.title}</h3>
                </div>
                <span class="ev-chip ev-chip--${e.status}">${statusText(e)}</span>
            </div>
            <p class="ev-info__period">📅 ${mdw(e.start)} ~ ${mdw(e.end)} · ${EVENT_DAYS}일간</p>
            <ol class="ev-days">${days}</ol>

            <h4>참여 방법</h4>
            <ol class="ev-steps">
                <li><b>브랜드관</b>에서 ${e.brand} 상품을 둘러봐요.</li>
                <li>${e.mission}</li>
                <li>신청하면 <b>${coupon.name}</b>이 바로 쿠폰함에 들어가요.</li>
            </ol>

            <h4>이벤트 혜택</h4>
            <ul class="ev-benefits">
                <li><span>🏷️</span><p>기간 중 ${e.brand} 전 상품 <b>추가 ${e.rate}% 할인</b> · 결제할 때 자동 적용</p></li>
                <li><span>🎟️</span><p>신청 즉시 <b>${coupon.value}% 쿠폰</b> · ${coupon.cond} · ${coupon.days}일 동안 사용</p></li>
                <li><span>🎁</span><p>${e.prize} · <b>${mdw(announce)} 발표</b></p></li>
            </ul>

            <h4>유의사항</h4>
            <ul class="ev-notes">
                <li>1인 1회 신청할 수 있어요. 댓글을 지우면 다시 신청할 수 있어요.</li>
                <li>참여 쿠폰은 이벤트마다 한 번만 드려요.</li>
                <li>이벤트와 관계없는 댓글은 당첨에서 빠질 수 있어요.</li>
            </ul>

            <a class="ev-info__go" href="./brand.html#${e.brand.toLowerCase()}">${b.logo} ${e.brand} 브랜드관 가기 →</a>`;
        // ↑ href="./brand.html#soundlab" → brand.js가 주소의 #키를 읽고 그 브랜드를 보여줌
    }


    /* ==========================================
       선택한 이벤트 — 신청 댓글
       ========================================== */
    function timeText(at) {
        const min = Math.floor((now - at) / 60000);
        if (min < 1) return "방금 전";
        if (min < 60) return `${min}분 전`;
        if (min < 60 * 24) return `${Math.floor(min / 60)}시간 전`;
        return md(new Date(at));
    }

    function renderTalk() {
        const e = evOf(current);
        const mine = mineOf(e.key).map((c) => ({ ...c, name: MEMBER.name, mine: true }));
        const seeds = (SEEDS[e.key] || [])
            .map((s, i) => ({ id: "seed-" + i, name: s.name, text: s.text, at: +e.start + s.h * 3600000 }))
            .filter((s) => s.at <= +now);                                // 아직 안 온 시간의 예시 댓글은 숨김
        const list = [...mine, ...seeds].sort((a, b) => b.at - a.at);   // 최신순

        $("#evTalkCount").textContent = list.length;
        $("#evTalkSub").textContent = `지금까지 ${(e.base + mine.length).toLocaleString("ko-KR")}명이 신청했어요`;

        $("#evComments").innerHTML = list.length ? list.map((c) => `
            <li class="ev-comment ${c.mine ? "is-mine" : ""}" data-id="${c.id}">
                <span class="ev-avatar">${c.name[0]}</span>
                <div class="ev-comment__body">
                    <p class="ev-comment__meta">
                        <b>${mask(c.name)}</b>${c.mine ? `<span class="ev-comment__me">내 신청</span>` : ""}
                        <span>${timeText(c.at)}</span>
                    </p>
                    <p class="ev-comment__text">${escapeHTML(c.text)}</p>
                </div>
                ${c.mine ? `<button class="ev-comment__del" type="button" data-del="${c.id}" aria-label="내 댓글 삭제">삭제</button>` : ""}
            </li>`).join("")
            : `<li class="ev-comments__empty">${e.status === "soon" ? "오픈하면 첫 번째로 신청해 보세요!" : "아직 댓글이 없어요."}</li>`;
        // ↑ escapeHTML — 내가 쓴 글은 반드시 바꿔서 넣기 / is-mine ↔ CSS (내 댓글 강조)

        // 폼 · 안내 — 진행 중이고 아직 신청 전일 때만 폼을 보여줌
        const form = $("#evForm"), notice = $("#evNotice");
        const canWrite = e.status === "live" && !joined(e.key);
        form.hidden = !canWrite;
        notice.hidden = canWrite;
        notice.className = "ev-notice" + (joined(e.key) ? " is-done" : "");
        if (joined(e.key)) notice.innerHTML = `✓ 신청 완료! <b>${COUPON_INFO[e.coupon].name}</b>은 마이페이지 쿠폰함에서 확인하세요.`;
        else if (e.status === "soon") notice.innerHTML = `⏰ <b>${mdw(e.start)}</b>에 오픈하면 신청할 수 있어요.`;
        else if (e.status === "ended") notice.innerHTML = `종료된 이벤트예요 · 당첨자는 <b>${mdw(addDays(e.end, 3))}</b>에 발표해요.`;
    }

    function renderDetail() {
        renderInfo();
        renderTalk();
    }


    /* -- 이벤트 고르기 (카드 · 일정표 막대) -- */
    function selectEvent(key, scroll) {
        current = key;
        $$("#evList .ev-card").forEach((c) => c.classList.toggle("is-active", c.dataset.ev === key));       // [연결④]
        $$("#evTimeline .ev-tl__bar").forEach((c) => c.classList.toggle("is-active", c.dataset.ev === key));
        clearForm();
        renderDetail();
        history.replaceState(null, "", "#" + key);                      // 주소에 #soundlab → 새로고침 · 링크 공유해도 같은 이벤트
        if (scroll) $("#evDetail").scrollIntoView({ behavior: "smooth" });
    }

    function onPick(e) {
        const el = e.target.closest("[data-ev]");
        if (!el) return;
        e.preventDefault();                                             // 주소가 #evDetail로 바뀌지 않게
        selectEvent(el.dataset.ev, true);
    }
    $("#evList").addEventListener("click", onPick);
    $("#evTimeline").addEventListener("click", onPick);

    $("#evFilter").addEventListener("click", (e) => {
        const btn = e.target.closest(".seg__btn");
        if (!btn) return;
        $$("#evFilter .seg__btn").forEach((b) => b.classList.toggle("is-active", b === btn));   // [연결③]
        filter = btn.dataset.filter;
        renderList();
    });


    /* ==========================================
       신청 폼
       ========================================== */
    const text = $("#evText"), agree = $("#evAgree"), err = $("#evErr");
    const MIN_LEN = 10;

    $("#evWho").textContent = mask(MEMBER.name);
    $("#evAvatar").textContent = MEMBER.name[0];

    function paintLen() {
        const n = text.value.trim().length;
        $("#evLen").textContent = text.value.length;
        $("#evLenBox").classList.toggle("is-short", n > 0 && n < MIN_LEN);   // [연결⑦] CSS .ev-form__len.is-short
    }
    text.addEventListener("input", () => {
        paintLen();
        if (err.textContent) { err.textContent = ""; text.classList.remove("is-error"); }
    });

    function clearForm() {
        text.value = "";
        agree.checked = false;
        err.textContent = "";
        text.classList.remove("is-error");
        paintLen();
    }

    $("#evForm").addEventListener("submit", (ev) => {
        ev.preventDefault();                                            // 새로고침(페이지 이동) 막기 [연결⑥]
        const e = evOf(current);
        const value = text.value.trim();

        // 확인 순서: 글자 수 → 동의 체크
        if (value.length < MIN_LEN) {
            err.textContent = `댓글을 ${MIN_LEN}자 이상 적어 주세요. (지금 ${value.length}자)`;
            text.classList.add("is-error");                             // components.css .form input.is-error와 같은 느낌
            text.focus();
            return;
        }
        if (!agree.checked) {
            err.textContent = "유의사항 확인에 체크해 주세요.";
            agree.focus();
            return;
        }

        MINE[e.key] = [...mineOf(e.key), { id: "my-" + Date.now(), text: value, at: Date.now() }];
        saveMine();

        // 참여 쿠폰 — 이벤트마다 한 번만 (data.js ISSUED_COUPONS → 마이페이지 쿠폰함)
        const gotCoupon = !ISSUED_COUPONS.some((c) => c.key === e.coupon);
        if (gotCoupon) {
            ISSUED_COUPONS.push({ key: e.coupon, at: Date.now() });
            saveCoupons();
            renderCouponCount();
        }

        clearForm();
        renderAll();
        toast(gotCoupon ? `🎉 신청 완료! ${COUPON_INFO[e.coupon].name}이 쿠폰함에 들어갔어요.` : "🎉 신청 완료! (참여 쿠폰은 이미 받았어요)");
    });

    // 내 댓글 삭제 = 신청 취소 (쿠폰은 그대로)
    $("#evComments").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-del]");
        if (!btn) return;
        openConfirm("신청 취소", "댓글을 지우면 신청이 취소돼요.<br />이미 받은 쿠폰은 그대로 남아요.", () => {
            MINE[current] = mineOf(current).filter((c) => c.id !== btn.dataset.del);
            saveMine();
            renderAll();
            toast("댓글을 지웠어요. 다시 신청할 수 있어요.");
        });
    });


    /* -- 전부 그리기 -- */
    function renderAll() {
        renderStats();
        renderList();
        renderDetail();
    }

    // 주소에 #soundlab 같은 이벤트가 있으면 그 이벤트로 (brand.html에서 넘어올 때)
    const fromHash = evOf(location.hash.slice(1));
    if (fromHash) current = fromHash.key;

    renderTimeline();
    renderAll();
    $$("#evTimeline .ev-tl__bar").forEach((c) => c.classList.toggle("is-active", c.dataset.ev === current));
    if (fromHash) $("#evDetail").scrollIntoView();

    // 다른 탭에서 신청 · 삭제하면 바로 반영
    window.addEventListener("storage", (e) => {
        if (e.key !== TALK_KEY) return;
        Object.keys(MINE).forEach((k) => delete MINE[k]);
        Object.assign(MINE, loadMine());
        renderAll();
    });
})();
