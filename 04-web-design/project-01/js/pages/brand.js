/* =====================================================
   pages/brand.js — 브랜드관: 브랜드 목록 · 선택한 브랜드 상품 · 브랜드 위크 할인가 · 정렬 · 찜 · 장바구니 담기
   상품은 data.js GOODS(홈 · 베스트 · 신상품 · 기획전에 올라간 상품)를 brand 값으로 묶어서 씀 [연결㉕]
   ===================================================== */
(function () {
    "use strict";

    // 상품이 올라간 페이지 — 각 페이지의 상품 목록과 같아야 함 [연결⑨]
    const PAGES = [
        { label: "홈",     href: "./home.html",       ids: ["goods-1", "goods-2", "goods-3", "goods-4", "goods-5", "goods-6", "goods-7", "goods-8"] },     // home.html <article id>
        { label: "베스트", href: "./best.html",       ids: ["goods-1", "goods-2", "goods-3", "goods-4", "goods-5", "goods-6", "goods-7", "goods-8"] },     // best.js BEST_META
        { label: "신상품", href: "./new.html",        ids: ["goods-9", "goods-10", "goods-11", "goods-12", "goods-13", "goods-14", "goods-2", "goods-6"] }, // new.js NEW_META
        { label: "기획전", href: "./exhibition.html", ids: ["goods-15", "goods-6", "goods-2", "goods-10", "goods-16", "goods-1", "goods-7", "goods-14",
                                                           "goods-17", "goods-18", "goods-5", "goods-11"] }                                            // exhibition.js EXHIBITS
    ];

    // GOODS → 배열 { id, order(추천순), brand, name, price, was, emoji, pages }
    const ITEMS = Object.keys(GOODS).map((id, i) => ({
        id,
        order: i,
        ...GOODS[id],
        pages: PAGES.filter((p) => p.ids.includes(id))
    }));

    // 상품이 1개 이상 있는 브랜드만, BRANDS에 적힌 순서대로
    const BRAND_KEYS = Object.keys(BRANDS).filter((b) => ITEMS.some((g) => g.brand === b));
    const itemsOf = (b) => ITEMS.filter((g) => g.brand === b);

    const pad = (n) => String(n).padStart(2, "0");
    const md = (d) => `${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
    const rateOf = (base, price) => (base > price ? Math.round((1 - price / base) * 100) : 0);

    // 가격 — 브랜드 위크가 진행 중이면 할인가에서 한 번 더 할인
    function priceOf(g, ev) {
        const live = !!ev && ev.status === "live";
        const price = live ? eventPrice(g.price, ev.rate) : g.price;
        const base = g.was || g.price;                    // 원래 가격 (정가)
        return { price, base, rate: rateOf(base, price), live };
    }

    // 이벤트 상태 글자
    function eventLabel(ev) {
        if (ev.status === "live") return ev.toEnd === 0 ? "오늘 마감" : `D-${ev.toEnd}`;
        return `${md(ev.start)} 오픈`;
    }

    let current = BRAND_KEYS[0];
    let sortKey = "pick";


    /* -- 머리 배너 -- */
    $("#brHeroGoods").textContent = ITEMS.length;                 // [연결①]
    $("#brHeroBrands").textContent = BRAND_KEYS.length;

    $("#brHeroLogos").innerHTML = BRAND_KEYS.map((b) =>
        `<span style="--tone: ${BRANDS[b].tone}">${BRANDS[b].logo}</span>`   // CSS가 var(--tone)으로 원 색을 칠함
    ).join("");

    const liveEvents = BRAND_EVENTS.map(eventInfo).filter((e) => e.status === "live");
    $("#brHeroLive").innerHTML = liveEvents.length
        ? `<span class="br-hero__live-label">🔥 지금 브랜드 위크</span>` + liveEvents.map((e) =>
            `<a class="br-live" href="./event.html#${e.key}" style="--tone: ${BRANDS[e.brand].tone}">${e.brand} +${e.rate}% · ${eventLabel(e)}</a>`
          ).join("")
        : "";
    // ↑ [연결⑦] href="./event.html#soundlab" → event.js가 주소의 #키를 읽고 그 이벤트를 펼침


    /* -- 브랜드 목록 -- */
    function renderList() {
        $("#brList").innerHTML = BRAND_KEYS.map((b) => {
            const info = BRANDS[b];
            const goods = itemsOf(b);
            const ev = brandEventOf(b);
            const evTag = !ev ? ""
                : ev.status === "live" ? `<span class="br-card__ev is-live">🔥 브랜드 위크 +${ev.rate}%</span>`
                : `<span class="br-card__ev">⏰ ${md(ev.start)} 브랜드 위크</span>`;
            return `
            <a class="br-card ${b === current ? "is-active" : ""}" href="#brDetail" data-brand="${b}" style="--tone: ${info.tone}">
                <span class="br-card__logo">${info.logo}</span>
                <div class="br-card__body">
                    <p class="br-card__name">${b} <small>${info.ko}</small></p>
                    <p class="br-card__slogan">${info.slogan}</p>
                    <p class="br-card__emojis">${goods.map((g) => g.emoji).join(" ")}</p>
                </div>
                <div class="br-card__side"><b>${goods.length}</b><small>상품</small></div>
                ${evTag}
            </a>`;
        }).join("");
        // ↑ [연결②] data-brand → 클릭하면 이 값으로 브랜드를 고름 / .is-active ↔ CSS
        // ↑ style="--tone: ..." → CSS가 카드 왼쪽 띠 · 로고 색을 브랜드 색으로
    }


    /* -- 선택한 브랜드 -- */
    const SORTERS = {                                      // [연결⑤] 키 ↔ HTML data-sort
        pick: (a, b) => a.order - b.order,                 // 추천순 = GOODS에 올라온 순서
        rate: (a, b) => b.p.rate - a.p.rate,
        low:  (a, b) => a.p.price - b.p.price
    };

    function renderDetail() {
        const info = BRANDS[current];
        const ev = brandEventOf(current);
        const goods = itemsOf(current).map((g) => ({ ...g, p: priceOf(g, ev) }));

        $("#brDetail").style.setProperty("--tone", info.tone);   // [연결③] CSS가 배너 · 강조색을 var(--tone)으로
        $("#brLogo").textContent = info.logo;
        $("#brCat").textContent = info.cat;
        $("#brName").textContent = current;
        $("#brKo").textContent = info.ko;
        $("#brDesc").textContent = info.desc;

        // 이 브랜드 상품이 올라간 페이지와 개수
        $("#brWhere").innerHTML = PAGES
            .map((p) => ({ ...p, n: goods.filter((g) => p.ids.includes(g.id)).length }))
            .filter((p) => p.n > 0)
            .map((p) => `<li><a href="${p.href}">${p.label} <b>${p.n}</b></a></li>`)
            .join("");

        $("#brCount").textContent = goods.length + "개";
        $("#brMaxRate").textContent = Math.max(...goods.map((g) => g.p.rate)) + "%";
        $("#brMinPrice").textContent = won(Math.min(...goods.map((g) => g.p.price)));

        // 브랜드 위크 안내 [연결④]
        const box = $("#brEvent");
        box.hidden = !ev;
        if (ev) {
            box.href = `./event.html#${ev.key}`;
            box.classList.toggle("is-live", ev.status === "live");
            $("#brEventBadge").textContent = ev.status === "live" ? `진행 중 · ${eventLabel(ev)}` : eventLabel(ev);
            $("#brEventText").innerHTML = `<b>${ev.title}</b> ${md(ev.start)} ~ ${md(ev.end)} · 전 상품 <b>추가 ${ev.rate}%</b> 할인` +
                (ev.status === "live" ? " 적용 중" : " 예정");
        }

        // 상품
        $("#brGoodsTitle").textContent = current;
        $("#brGoodsCount").textContent = goods.length;
        $("#brGoods").innerHTML = goods.sort(SORTERS[sortKey]).map((g) => {
            const liked = WISH_IDS.includes(g.id);
            const { price, base, rate, live } = g.p;
            return `
            <article class="goods-card br-item" id="${g.id}">
                <a class="goods-card__img" href="#">
                    <span class="g-emoji">${g.emoji}</span>
                    ${live ? `<span class="g-badge br-badge">WEEK +${ev.rate}%</span>` : ""}
                    <button class="g-like ${liked ? "is-liked" : ""}" type="button" aria-pressed="${liked}"
                        aria-label="${liked ? "찜 해제" : "찜하기"}">${liked ? "♥" : "♡"}</button>
                </a>
                <div class="goods-card__body">
                    <p class="g-brand">${g.brand}</p>
                    <a class="g-name" href="#">${g.name}</a>
                    ${rate ? `<p class="g-was">${won(base)}</p>` : ""}
                    <p class="g-price">${rate ? `<span class="g-rate">${rate}%</span>` : ""}<b>${won(price)}</b></p>
                    <p class="br-pages">${g.pages.map((p) => `<span>${p.label}</span>`).join("")}</p>
                </div>
            </article>`;
        }).join("");
        // ↑ id="goods-N" → 담기 · 찜에서 GOODS[card.id]로 찾음 [연결⑨]
        // ↑ br-pages: 이 상품이 올라간 페이지 (홈 · 베스트 · 신상품 · 기획전)
    }

    function setBrand(b) {
        current = b;
        $$("#brList .br-card").forEach((c) => c.classList.toggle("is-active", c.dataset.brand === b));   // [연결②]
        renderDetail();
        history.replaceState(null, "", "#" + b.toLowerCase());   // 주소에 #soundlab → 새로고침해도 같은 브랜드
    }


    /* -- 이벤트 연결 -- */
    $("#brList").addEventListener("click", (e) => {
        const card = e.target.closest(".br-card");
        if (!card) return;
        e.preventDefault();                                       // 주소가 #brDetail로 바뀌지 않게 막고
        setBrand(card.dataset.brand);
        $("#brDetail").scrollIntoView({ behavior: "smooth" });    // 스크롤은 직접 (CSS scroll-margin-top 적용됨)
    });

    $("#brSort").addEventListener("click", (e) => {
        const btn = e.target.closest(".seg__btn");
        if (!btn) return;
        $$("#brSort .seg__btn").forEach((b) => b.classList.toggle("is-active", b === btn));   // [연결⑤]
        sortKey = btn.dataset.sort;
        renderDetail();
    });

    // 상품 카드: 찜 / 장바구니 담기 (이벤트 위임 — 브랜드 · 정렬이 바뀔 때마다 카드를 새로 만들기 때문)
    $("#brGoods").addEventListener("click", (e) => {
        const card = e.target.closest(".goods-card");
        if (!card) return;
        e.preventDefault();                                       // <a href="#"> 이동 막기

        const like = e.target.closest(".g-like");
        if (like) {
            setLikeBtn(like, toggleWish(card.id));                // common.js: 저장 + 문구 + 헤더 찜 숫자
            return;
        }

        const goods = GOODS[card.id];
        const ev = brandEventOf(goods.brand);
        const live = ev && ev.status === "live";
        openConfirm("장바구니 담기", `<b>${goods.name}</b><br />상품을 장바구니에 담으시겠습니까?` +
            (live ? `<br /><small>브랜드 위크 추가 ${ev.rate}% 할인은 결제할 때 자동으로 적용돼요.</small>` : ""), () => {
            addToCart(card.id);                                   // common.js: 저장 + 담기 횟수 + 헤더 장바구니 숫자
            toast(`🛒 장바구니에 상품 넣기 : ${goods.name}`);
        });
    });


    /* -- 시작: 주소에 #soundlab 같은 브랜드가 있으면 그 브랜드로 -- */
    const fromHash = BRAND_KEYS.find((b) => "#" + b.toLowerCase() === location.hash.toLowerCase());
    if (fromHash) current = fromHash;

    renderList();
    renderDetail();
    if (fromHash) $("#brDetail").scrollIntoView();
})();
