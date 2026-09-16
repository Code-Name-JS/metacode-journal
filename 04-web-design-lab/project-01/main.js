/* ========================================
   SIXS MAIN JAVASCRIPT
======================================== */


/* ========================================
   1. SLIDER
======================================== */

const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");

let currentSlide = 0;
let slideTimer;


/* 특정 슬라이드 보여주기 */
function showSlider(index){
    slides.forEach((slide, i) => {
        slide.classList.toggle(
            "active", i === index
        );
    });

    dots.forEach((dot, i) => {
        dot.classList.toggle(
            "active", i === index
        );
    })

    currentSlide = index;
}


/* 다음 슬라이드 */
function nextSlide(){
    let nextIndex =
        currentSlide + 1;
    
    if(nextIndex >= slides.length){
        nextIndex = 0;
    }

    showSlide(nextIndex);
}


/* 자동 슬라이드 */
function startSlider(){
    slideTimer = setInterval(
        nextSlide, 4000
    );
}


/* 슬라이드 정지 */
function stopSlider(){
    clearInterval(slideTimer);
}


/* 점 클릭 */
dots.forEach((dot) => {
    dot.addEventListener(
        "click", function(){
            const slideIndex = Number(
                this.dataset.slide
            );

            showSlide(slideIndx);
            
            /* 사용자가 직접 클릭했으므로 자동 슬라이드를 다시 시작 */
            stopSlider();
            startSlider();
        }
    );
});


/* 초기 실행 */
if(slides.length > 0){
    showSlide(0);
    startSlider();
}


/* ========================================
   2. SEARCH
======================================== */
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");


/* 검색 실행 함수 */
function searchProduct(){
    const keyword = searchInput.value.trim();

    if(keyword === ""){
        alert("검색어를 입력해주세요.");
        searchInput.focus();
        return;
    }

    /* 실제 쇼핑몰에서는 여기에서

    Location.href = "./search.html?keyword=" + encodeURIComponent(keyword);
    
    와 같이 검색 페이지로 이동시키면 됩니다.
    */

    alert(`"${keyword}"검색을 준비 중입니다.`);
}


/* 검색 버튼 */
searchButton.addEventListener("click", searchProduct);


/* Enter 키 */
searchInput.addEventListener("keydown", function(event){
        if(event.key === "Enter"){searchProduct();}
    }
);


/* ========================================
   3. NAVIGATION
======================================== */
const navLinks = document.querySelectorAll(".main-nav a");

navLinks.forEach((link) => {
    link.addEventListener("click", function(event){
        event.preventDefault();

        /* 현재 active 메뉴 변경 */

        navLinks.forEach(item => item.classList.remove("active"));

        this.classList.add("active");

        console.log(`${this.textContent} 메뉴를 선택했습니다.`);
    });
});


/* ========================================
   4. CATEGORY
======================================== */
const categoryLinks = document.quertSelectorAll(".category-inner a");

categoryLinks.forEach((link) => {
    link.addEventListener("click", function(event){
        event.preventDefault();
        console.log(
            `카테고리 선택: ${this.textContent}`
        );
    });
});