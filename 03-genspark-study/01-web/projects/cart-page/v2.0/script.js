/* =====================================================
   main-v2.js  –  cart v2.0 Interactions
===================================================== */

const FREE_SHIPPING_THRESHOLD = 30000; // 무료배송 기준 금액
const BASE_SHIPPING = 3000; // 기본 배송비
const POINT_RATE = 0.01; // 적립률 1%



/* -- 상품 데이터 (썸네일은 이모지 + CSS 그라데이션으로 처리 ) -- */
const PRODUCTS = [
    { id: 'p1', brand: 'MONGLE BASIC', name: '오버핏 코튼 라운드 티셔츠 (5 color)', option: '아이보리/M', price: 19900, oldPrice: 29000, qty: 2, emoji: '👕' },
    { id: 'p2', brand: 'MONGLE DENIM', name: '와이드 원턱 데님 팬츠 - 워시드 블루', option: '블루/30', price: 42900, oldPrice: null, qty: 1, emoji: '👖' },
    { id: 'p3', brand: 'MONGLE ACC', name: '데일리 미니 크로스백 (가죽)', option: '브라운 / FREE', price: 35800, oldPrice: 45000, qty: 1, emoji: '👜' },
    { id: 'p4', brand: 'MONGLE SHOES', name: '클래식 스웨이드 스니커즈', option: '그레이/250', price: 59000, oldPrice: 79000, qty: 1, emoji: '👟' }    
];



/* -- 상태: 담긴 상품 목록 (checked = 선택됨) -- */
let cart = PRODUCTS.map(p => ({...p, checked: true}));



/* -- DOM -- */
const $ = (sel) => document.querySelector(sel);
const cartListEl = $('#cartList');
const cartLayoutEl = $('#cartLayout');
const emptyStateEl = $('#emptyState');
const selectAllEl = $('#selectAll');
const selectAllCountEl = $('#selectAllCount');
const cartSummaryTextEl = $('#cartSummaryText');

const sumltemsEl = $('#sumltems');
const sumDiscountEl = $('#sumDiscount');
const sumShippingEl = $('#sumShipping');
const sumTotalEl = $('#sumTotal');
const sumPointEl = $('#sumPoint');
const payButtonEl = $('#payButton');
const payButtonCountEl = $('#payButtonCount');
const freeShipBoxEl = $('#freeShipBox');
const freeShipTextEl = $('#freeShipText');
const freeShipFillEl = $('#freeShipFill');
const toastEl = $('#toast');



/* -- 유틸 -- */
const won = (n) => n.toLocaleString('ko-KR') + '원';
const wonShort = (n) => n.toLocaleString('ko-KR') + '원';

let toaseTimer = null;
function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 1800);
}



/* -- 렌더링 -- */
function renderCart() {
    // 빈 장바구니
    if (cart.length === 0) {
        cartLayoutEl.hidden = true;
        emptyStateEl.hidden = false;
        cartSummaryTextEl.textContent = '담긴 상품이 없습니다.';
        updateMobileBar(0,0);
        return;
    }

    cartLayoutEl.hidden = false;
    emptyStateEl.hidden = true;

    cartListEl.innerHTML = cart.map(item =>
        <li class="item" data-id="${item.id}">
            <label class="check item__check">
                 <input type="checkbox" class="item__checkbox" ${item.checked ? 'checked' : ''} aria-label="${item.name} 선택" />
            </label>
        </li>
    )
}