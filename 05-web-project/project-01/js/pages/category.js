/* =====================================================
   pages/category.js — 카테고리: 주소의 ?cat= 읽기 · 카테고리 탭 · 브랜드 칩 필터 · 정렬 · 찜 · 장바구니 담기
   상품의 카테고리는 data.js GOODS의 cats, 카테고리 정보는 CATEGORIES [연결㉖]
   ===================================================== */
(function () {
    "use strict";

    const KEYS = Object.keys(CATEGORIES);
    const ALL = { name: "전체", icon: "🛍️", tone: "#4f46e5", desc: "SHOPLY의 모든 상품을 한곳에서 둘러보세요" };

    // 주소 읽기 — category.html?cat=digital → "digital" / 없거나 모르는 값이면 "all"
    function catFromURL() {
        const value = new URLSearchParams(location.search).get("cat");   // [연결①] 메뉴 링크 href="./category.html?cat=digital"
        return KEYS.includes(value) ? value : "all";
    }

    let cat = catFromURL();
    let brand = "";              // 브랜드 칩 필터 ("" = 모든 브랜드)
    let sortKey = "pick";
    const PAGE = 20;             // 한 번에 보여줄 상품 수
    let shown = PAGE;            // 지금 보여주는 수 — 카테고리 · 브랜드 · 정렬이 바뀌면 다시 20개부터

    // GOODS → 배열 { id, order(추천순), brand, name, price, was, emoji, cats }
    const ITEMS = Object.keys(GOODS).map((id, i) => ({ id, order: i, ...GOODS[id] }));

    // 가격 — 브랜드 위크가 진행 중이면 한 번 더 할인 (brand.js와 같은 계산)
    function priceOf(g) {
        const ev = brandEventOf(g.brand);                  // data.js — PAPERCO처럼 이벤트가 없으면 null
        const live = !!ev && ev.status === "live";
        const price = live ? eventPrice(g.price, ev.rate) : g.price;
        const base = g.was || g.price;
        return { price, base, rate: base > price ? Math.round((1 - price / base) * 100) : 0, ev: live ? ev : null };
    }

    const SORTERS = {                                      // [연결④] 키 ↔ HTML data-sort
        pick: (a, b) => a.order - b.order,
        rate: (a, b) => b.p.rate - a.p.rate,
        low:  (a, b) => a.p.price - b.p.price,
        high: (a, b) => b.p.price - a.p.price
    };


    /* -- 카테고리 탭 (한 번만 만듦) -- */
    $("#ctTabs").innerHTML = [["all", ALL], ...KEYS.map((k) => [k, CATEGORIES[k]])].map(([key, c]) =>
        `<button class="ct-tab" type="button" data-cat="${key}" style="--tone: ${c.tone}">
            <span class="ct-tab__ic">${c.icon}</span>${c.name}<b>${goodsIn(key).length}</b>
         </button>`
    ).join("");
    // ↑ [연결①] data-cat ↔ CATEGORIES 키 / goodsIn(): data.js — 그 카테고리 상품 id 목록


    /* -- 그리기 -- */
    function render() {
        const info = cat === "all" ? ALL : CATEGORIES[cat];
        const inCat = ITEMS.filter((g) => cat === "all" || g.cats.includes(cat)).map((g) => ({ ...g, p: priceOf(g) }));

        // 머리 배너
        $("#ctHero").style.setProperty("--tone", info.tone);          // [연결②] CSS가 var(--tone)으로 칠함
        $("#ctIcon").textContent = info.icon;
        $("#ctName").textContent = info.name;
        $("#ctDesc").textContent = info.desc;
        document.title = `${info.name} | SHOPLY`;

        const brands = [...new Set(inCat.map((g) => g.brand))];       // 중복 없는 브랜드 목록
        $("#ctCount").textContent = inCat.length + "개";
        $("#ctMaxRate").textContent = Math.max(0, ...inCat.map((g) => g.p.rate)) + "%";
        $("#ctBrands").textContent = brands.length + "개";

        // 탭 · 메뉴에서 지금 카테고리 표시
        $$("#ctTabs .ct-tab").forEach((t) => t.classList.toggle("is-active", t.dataset.cat === cat));
        // 좁은 화면에서 탭 줄이 옆으로 길면, 고른 탭이 가운데 보이도록 옆으로 스크롤
        const tabs = $("#ctTabs"), on = $(".ct-tab.is-active", tabs);
        tabs.scrollTo({ left: on.offsetLeft - (tabs.clientWidth - on.offsetWidth) / 2, behavior: "smooth" });
        $$(".gnb__menu-link").forEach((a) => a.classList.toggle("is-active", a.dataset.cat === cat));   // [연결③] 전체 카테고리 메뉴

        // 브랜드 칩
        if (!brands.includes(brand)) brand = "";                       // 카테고리가 바뀌어 그 브랜드가 없으면 해제
        $("#ctBrandChips").innerHTML = brands.map((b) => {
            const n = inCat.filter((g) => g.brand === b).length;
            const tone = BRANDS[b] ? BRANDS[b].tone : "#64748b";
            return `<button class="ct-brand ${b === brand ? "is-active" : ""}" type="button" data-brand="${b}" style="--tone: ${tone}">${b} <b>${n}</b></button>`;
        }).join("");
        // ↑ [연결⑤] data-brand → 누르면 그 브랜드만 / .is-active ↔ CSS

        // 상품
        const rows = inCat.filter((g) => !brand || g.brand === brand).sort(SORTERS[sortKey]);
        $("#ctListTitle").textContent = brand ? `${info.name} · ${brand}` : info.name;
        $("#ctListCount").textContent = rows.length;
        $("#ctEmpty").hidden = rows.length > 0;

        // 더 보기 — 앞에서부터 shown개만 그림 [연결⑦]
        const more = $("#ctMore");
        more.hidden = rows.length <= shown;
        more.innerHTML = `더 보기 <b>${Math.min(shown, rows.length)}</b> / ${rows.length}`;

        $("#ctGoods").innerHTML = rows.slice(0, shown).map((g) => {
            const liked = WISH_IDS.includes(g.id);
            const { price, base, rate, ev } = g.p;
            return `
            <article class="goods-card ct-item" id="${g.id}">
                <a class="goods-card__img" href="#">
                    <span class="g-emoji">${g.emoji}</span>
                    ${ev ? `<span class="g-badge ct-badge" style="--tone: ${BRANDS[g.brand].tone}">WEEK +${ev.rate}%</span>` : ""}
                    <button class="g-like ${liked ? "is-liked" : ""}" type="button" aria-pressed="${liked}"
                        aria-label="${liked ? "찜 해제" : "찜하기"}">${liked ? "♥" : "♡"}</button>
                </a>
                <div class="goods-card__body">
                    <p class="g-brand">${g.brand}</p>
                    <a class="g-name" href="#">${g.name}</a>
                    ${rate ? `<p class="g-was">${won(base)}</p>` : ""}
                    <p class="g-price">${rate ? `<span class="g-rate">${rate}%</span>` : ""}<b>${won(price)}</b></p>
                    <p class="ct-tags">${g.cats.map((c) => `<span class="${c === cat ? "is-now" : ""}">${CATEGORIES[c].name}</span>`).join("")}</p>
                </div>
            </article>`;
        }).join("");
        // ↑ ct-tags: 이 상품이 들어간 카테고리 전부 (지금 보는 카테고리는 .is-now)
        // ↑ id="goods-N" → 담기 · 찜에서 GOODS[card.id]로 찾음 [연결⑨]
    }


    /* -- 카테고리 바꾸기 — 새로고침 없이 주소만 바꿈 -- */
    function setCat(key) {
        if (key === cat) return;
        cat = key;
        brand = "";
        shown = PAGE;
        // pushState: 주소를 바꾸고 방문 기록에도 남김 → 브라우저 "뒤로"로 이전 카테고리에 돌아감
        history.pushState(null, "", key === "all" ? "category.html" : `category.html?cat=${key}`);
        render();
    }

    // 뒤로 · 앞으로 가기 → 주소가 바뀌면 다시 읽어서 그리기
    window.addEventListener("popstate", () => {
        cat = catFromURL();
        brand = "";
        shown = PAGE;
        render();
    });

    $("#ctTabs").addEventListener("click", (e) => {
        const tab = e.target.closest(".ct-tab");
        if (tab) setCat(tab.dataset.cat);
    });

    // 이 페이지 안의 전체 카테고리 메뉴 — 페이지를 다시 불러오지 않고 바로 바꿈
    $("#gnbAllMenu").addEventListener("click", (e) => {
        const link = e.target.closest(".gnb__menu-link");
        if (!link) return;
        e.preventDefault();
        setCat(link.dataset.cat);
        toggleAllMenu(false);                              // common.js — 메뉴 닫기
    });

    $("#ctBrandChips").addEventListener("click", (e) => {
        const chip = e.target.closest(".ct-brand");
        if (!chip) return;
        brand = brand === chip.dataset.brand ? "" : chip.dataset.brand;   // 같은 칩을 또 누르면 해제
        shown = PAGE;
        render();
    });

    $("#ctSort").addEventListener("click", (e) => {
        const btn = e.target.closest(".seg__btn");
        if (!btn) return;
        $$("#ctSort .seg__btn").forEach((b) => b.classList.toggle("is-active", b === btn));   // [연결④]
        sortKey = btn.dataset.sort;
        shown = PAGE;
        render();
    });

    // 더 보기 — 20개 더 [연결⑦]
    $("#ctMore").addEventListener("click", () => {
        shown += PAGE;
        render();
    });


    /* -- 상품 카드: 찜 / 장바구니 담기 (이벤트 위임 — 다시 그릴 때마다 카드를 새로 만들기 때문) -- */
    $("#ctGoods").addEventListener("click", (e) => {
        const card = e.target.closest(".goods-card");
        if (!card) return;
        e.preventDefault();                                // <a href="#"> 이동 막기

        const like = e.target.closest(".g-like");
        if (like) {
            setLikeBtn(like, toggleWish(card.id));         // common.js: 저장 + 문구 + 헤더 찜 숫자
            return;
        }

        const goods = GOODS[card.id];
        openConfirm("장바구니 담기", `<b>${goods.name}</b><br />상품을 장바구니에 담으시겠습니까?`, () => {
            addToCart(card.id);                            // common.js: 저장 + 담기 횟수 + 헤더 장바구니 숫자
            toast(`🛒 장바구니에 상품 넣기 : ${goods.name}`);
        });
    });


    /* -- 시작 -- */
    render();
})();
