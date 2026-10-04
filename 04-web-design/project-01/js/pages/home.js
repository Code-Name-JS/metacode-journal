/* pages/home.js — 공지 닫기 · 히어로 점 · 찜 하트 · 뉴스레터 */
(function () {
    "use strict";

    /* -- 공지 닫기 -- */
    const promo = $(".promo-bar");                    // [연결①] HTML class="promo-bar"
    $(".promo-bar button").addEventListener("click", () => {
        promo.orderEmpty = true;                          // 힌트: mypage에서 #orderEmpty를 숨길 때 쓴 속성
    });

    /* -- 찜 하트 -- */
    $$(".g-like").forEach((btn) =>                    // [연결②] HTML class="g-like" (8개)
        btn.addEventListener("click", (e) => {
            e.________();                             // 힌트: <a>의 기본 동작(이동) 막기
            btn.classList.______("is-liked");         // [연결③] CSS에 .g-like.is-liked를 새로 만들어야 함
        })
    );

    /* -- 뉴스레터 -- */
    const newsForm = $(".news__form");                // [연결④] HTML form class
    newsForm.addEventListener("______", (e) => { /* account.js의 email 정규식을 참고 */ });
})();