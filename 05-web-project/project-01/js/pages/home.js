/* pages/home.js — 공지 닫기 · 히어로 점 · 찜 하트 · 장바구니 담기 · 뉴스레터 */
(function () {
    "use strict";

    /* -- 공지 닫기 -- */
    const promo = $(".promo-bar");                    // [연결①] HTML class="promo-bar"
    $(".promo-bar button").addEventListener("click", () => {
        promo.orderEmpty = true;                          // 힌트: mypage에서 #orderEmpty를 숨길 때 쓴 속성
    });

    /* -- 찜 하트 -- */
    $$(".g-like").forEach((btn) => {                  // [연결②] HTML class="g-like" (8개)
        const id = btn.closest(".goods-card").id;     // [연결⑨] 부모 article의 id = GOODS 키
        setLikeBtn(btn, WISH_IDS.includes(id));       // 이미 찜한 상품이면 처음부터 ♥로 시작

        btn.addEventListener("click", (e) => {
            e.preventDefault();                       // <a> 안의 버튼 → 링크 이동(맨 위로 튐) 막기
            setLikeBtn(btn, toggleWish(id));          // [연결③] common.js: 저장 + 문구 + 헤더 숫자 / CSS .g-like.is-liked
        });
    });

    /* -- 장바구니 담기 -- */
    const cartCount = $("#cartCount");                // [연결⑤] HTML id="cartCount" (헤더 숫자)
    cartCount.textContent = CART.length;              // 저장된 장바구니 개수로 시작

    $$(".goods-card").forEach((card) =>               // [연결⑥] HTML <article class="goods-card" id="goods-N">
        card.addEventListener("click", (e) => {
            if (e.target.closest(".g-like")) return;  // [연결②] 하트 클릭은 찜 기능만 → 담기 제외
            if (!e.target.closest(".goods-card__img, .goods-card__body")) return;  // [연결⑦] 이미지·본문 영역만
            e.preventDefault();                       // <a href="#">가 맨 위로 튀지 않게

            const goods = GOODS[card.id];             // [연결⑨] article id ↔ data.js GOODS의 키
            if (!goods) return;

            // [연결⑩] common.js openConfirm → #modal 열기 / Yes(#modalOk)를 눌렀을 때만 아래 함수 실행
            openConfirm("장바구니 담기", `<b>${goods.name}</b><br />상품을 장바구니에 담으시겠습니까?`, () => {
                addToCart(card.id);                   // common.js: 장바구니 저장 + 담기 횟수 +1 + 헤더 숫자
                renderRank();                         // 담자마자 랭킹에 반영
                toast(`🛒 장바구니에 상품 넣기 : ${goods.name}`);  // [연결⑧] common.js toast → #toast.is-on
            });
            // No(#modalCancel) · ✕ · 바깥 클릭 · Esc → common.js가 창만 닫음 (CART는 그대로)
        })
    );

    /* -- 실시간 랭킹 (담긴 수 = 기준값 + 내가 담기를 누른 횟수) -- */
    const rankList = $("#rankList");                  // [연결⑪] HTML <ol id="rankList">

    function moveTag(move) {                          // [연결⑫] CSS .rank__up / __down / __same
        if (move > 0) return `<b class="rank__up">▲ ${move}</b>`;
        if (move < 0) return `<b class="rank__down">▼ ${-move}</b>`;
        return `<b class="rank__same">-</b>`;
    }

    function renderRank() {
        rankList.innerHTML = getRanking().slice(0, 5).map((g, i) => `
            <li class="${g.mine ? "is-mine" : ""}">
                <span class="rank__no">${i + 1}</span><span class="rank__ic">${g.emoji}</span>
                <div>
                    <p>${g.name}</p>
                    <small>${won(g.price)} · 🛒 ${g.score}번 담김${g.mine ? ` <em class="rank__mine">내가 ${g.mine}번</em>` : ""}</small>
                </div>
                ${moveTag(g.move)}
            </li>`
        ).join("");
        // ↑ [연결⑬] is-mine → CSS .rank__list li.is-mine (내가 담은 적 있는 상품 강조)
    }
    renderRank();

    // 다른 탭(best · wish · mypage · cart)에서 저장값이 바뀌면 storage 이벤트가 이 탭에 도착함
    // CART · ADDS는 const라 다시 대입 못 함 → 내용만 새 값으로 갈아 끼움
    window.addEventListener("storage", (e) => {
        if (e.key === ADDS_KEY) {                     // 다른 탭에서 담기 → 랭킹 갱신
            Object.assign(ADDS, loadAdds());          // 담기 횟수는 늘기만 하므로 덮어쓰기로 충분
            renderRank();
        }
        if (e.key === CART_KEY) {                     // 장바구니 변경 → 헤더 숫자만 (랭킹은 그대로)
            CART.splice(0, CART.length, ...loadCart());
            cartCount.textContent = CART.length;
        }
    });

    /* -- 뉴스레터 -- */
    const newsForm = $(".news__form");                // [연결④] HTML form class
    const newsInput = $(".news__form input");
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;    // account.js rules.email과 같은 정규식 (공백 없이 ○@○.○)

    // 잘못 입력했을 때 — 빨간 테두리 + 입력칸으로 커서 + 안내 메시지
    function newsError(msg) {
        newsInput.classList.add("is-error");          // [연결⑭] CSS .news__form input.is-error
        newsInput.focus();
        toast(msg);
    }

    // 구독하기 버튼(type="submit")을 누르거나, 입력칸에서 Enter → form의 submit 이벤트
    newsForm.addEventListener("submit", (e) => {
        e.preventDefault();                           // 폼 전송(페이지 새로고침) 막기
        const email = newsInput.value.trim();         // 앞뒤 공백 제거

        if (!email) return newsError("📧 이메일 주소를 입력해 주세요.");
        if (!EMAIL_RE.test(email)) return newsError("이메일 형식을 확인해 주세요. (예: name@example.com)");

        newsInput.classList.remove("is-error");
        toast(`📮 구독 완료! 매주 목요일 ${email} 주소로 새 상품 소식을 보내드릴게요.`);   // common.js toast → #toast ("주소로" — 이메일 끝 글자와 상관없이 자연스러운 조사)
        newsForm.reset();                             // 입력칸 비우기
    });

    // 다시 입력하기 시작하면 빨간 테두리 지우기
    newsInput.addEventListener("input", () => newsInput.classList.remove("is-error"));
})();