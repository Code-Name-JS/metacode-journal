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
    clearTimeout(toaseTimer);
    toaseTimer = setTimeout(() => toastEl.classList.remove('is-show'), 1800);
}



/* -- 렌더링 -- */
function renderCart() {
    // 빈 장바구니 분기 처리
    if (cart.length === 0) {
        cartLayoutEl.hidden = true;
        emptyStateEl.hidden = false;

        // 기존 장바구니 DOM 비우기
        cartListEl.innerHTML = '';

        if (cartSummaryTextEl) {
            cartSummaryTextEl.textContent = '담긴 상품이 없습니다.';
        }

        // 금액, 전체선택 체크박스, 모바일 바 등 상태 초기화
        updateTotals();
        updateSelectAllState();
        if (typeof updateMobileBar === 'function') {
            updateMobileBar(0, 0);
        }
        return;
    }

    // 상품이 있을 때 레이아웃 노출
    cartLayoutEl.hidden = false;
    emptyStateEl.hidden = true;

    // 상품 목록 렌더링
    cartListEl.innerHTML = cart.map((item) =>
        `<li class="item" data-id="${item.id}">
            <label class="check item__check">
                <input type="checkbox" class="item__checkbox" ${item.checked ? 'checked' : ''} aria-label="${item.name} 선택" />
                <span class="check__box"></span>
            </label>

            <div class="item__thumb" aria-hidden="true">${item.emoji}</div>

            <div class="item__info">
                <div class="item__brand">${item.brand}</div>
                <h3 class="item__name">${item.name}</h3>
                <span class="item__opt">옵션 · ${item.option}</span>
                <div class="item__price">
                    ${won(item.price)}
                    ${item.oldPrice ? `<span class="old">${won(item.oldPrice)}</span>` : ''}
                </div>
                ${item.oldPrice ? `<div class="item__each">개당 ${won(item.price)} ·${Math.round((1 - item.price / item.oldPrice) * 100)}% 할인 </div>` : ''}
            </div>

            <div class="item__side">
                <div class="qty" role="group" aria-label="수량 변경">
                    <button class="qty__btn" type="button" data-act="dec" ${item.qty <= 1 ? 'disabled' : ''} aria-label="수량 감소">-</button>
                    <span class="qty__num" aria-live="polite">${item.qty}</span>
                    <button class="qty__btn" type="button" data-act="inc" aria-label="수량 증가">+</button>
                </div>
                <button class="delbtn" type="button" data-act="del">삭제</button>
            </div>
        </li>`
    ).join('');

    // 합계 및 선택 상태 갱신
    updateTotals();
    updateSelectAllState();
}



/* -- 합계 계산 -- */
function calc() {
    const selected = cart.filter(i => i.checked);

    const itemsTotal = selected.reduce((s, i) => s + i.price * i.qty, 0);
    // 정가 대비 할인액
    const discount = selected.reduce((s, i) => s + (i.oldPrice ? (i.oldPrice - i.price) * i.qty: 0), 0);
    const shipping = (selected.length === 0 || itemsTotal >= FREE_SHIPPING_THRESHOLD) ? 0 : BASE_SHIPPING;

    return { itemsTotal, discount, shipping, total: itemsTotal + shipping, count: selected.length, qty: selected.reduce((s, i) => s + i.qty, 0)};
}

function updateTotals() {
    const c = calc();

    sumltemsEl.textContent = won(c.itemsTotal);
    sumDiscountEl.textContent = '-' + won(c.discount);
    sumShippingEl.textContent = c.shipping === 0 ? (c.itemsTotal > 0 ? '무료' : '0원' ) : won(c.shipping);
    sumTotalEl.textContent = won(c.total);
    sumPointEl.textContent = Math.floor(c.total * POINT_RATE).toLocaleString('ko-KR') + 'P';
    payButtonCountEl.textContent = c.count;
    payButtonEl.disabled = c.count === 0;

    // 요약 문구
    cartSummaryTextEl.textContent = c.count > 0 ? `총${c.count}개 상품 · ${c.qty}개 수량을 선택했어요.` : '주문할 상품을 선택해 주세요.';

    // 무료배송 진행바
    const remain = FREE_SHIPPING_THRESHOLD - c.itemsTotal;
    const pct = Math.min(100, Math.round((c.itemsTotal / FREE_SHIPPING_THRESHOLD) * 100));
    freeShipFillEl.style.width = (c.itemsTotal > 0 ? Math.max(pct, 4) : 0) + '%';

    if (c.itemsTotal >= FREE_SHIPPING_THRESHOLD) {
        freeShipBoxEl.classList.add('is-free');
        freeShipTextEl.innerHTML = '무료배송 조건 달성! 🎉 배송비 0원';
    } else {
        freeShipBoxEl.classList.remove('is-free');
        freeShipTextEl.innerHTML = `무료배송까지<b>${wonShort(Math.max(remain, 0))}</b> 남았어요`;
    }
}

function updateSelectAllState() {
    const all = cart.length > 0 && cart.every(i => i.checked);
    selectAllEl.checked = all;
    const checkedCount = cart.filter(i => i.checked).length;
    selectAllCountEl.textContent = `(${checkedCount}/${cart.length})`;

    // 모바일 하단바
    const c = calc();
    updateMobileBar(c.total, c.count);
}



/* -- 모바일 하단 바 -- */
function ensureMobileBar() {
    if(document.querySelector('.mbar')) return;
    const bar = document.createElement('div');
    bar.className = 'mbar';
    bar.innerHTML = `
    <div class="mbar__info">
        <div class="mbar__label">결제 예상 금액</div>
        <div class="mbar__total" id="mbarTotal">0원</div>
    </div>
    <button class="mbar__btn" id="mbarBtn" type="button">주문하기</button>
    `;
    document.body.appendChild(bar);
    bar.querySelector('#mbarBtn').addEventListener('click', () => payButtonEl.click());
}

function updateMobileBar(total, count) {
    const t = document.querySelector('#mbarTotal');
    const b = document.querySelector('#mbarBtn');
    if (!t||!b) return;
    t.textContent = won(total);
    b.disabled = count === 0;
    b.textContent = count > 0 ? `${count}개 주문하기` : '주문하기';
    const bar = document.querySelector('.mbar');
    if (bar) bar.style.display = (cart.length === 0) ? 'none' : '';
}



/* -- 이벤트 -- */
// 개별 체크박스 / 수량 / 삭제 (이벤트 위임)
cartListEl.addEventListener('change', (e) => {
    const li = e.target.closest('.item');
    if (!li) return;

    const item = cart.find(i => String(i.id) === li.dataset.id);
    if (!item) return;

    if(e.target.classList.contains('item__checkbox')) {
        item.checked = e.target.checked;
        updateTotals();
        updateSelectAllState();
    }
});

cartListEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const li = e.target.closest('.item');
    const item = cart.find(i => String(i.id) === li.dataset.id);
    if (!item) return;

    const act = btn.dataset.act;

    if (act === 'inc') {
        if (item.qty >= 99) { toast('최대 99개까지 담을 수 있어요,'); return; }
        item.qty += 1;
    } else if (act === 'dec') {
        if (item.qty <= 1) return;
        item.qty -=1;
    } else if (act === 'del') {
        cart = cart.filter(i => i.id !== item.id);
        toast(`'${item.name}'을(를) 삭제했어요.`);
        renderCart();
        updateTotals(); // 삭제 후 합계 갱신
        updateSelectAllState(); // 삭제 후 전체 선택 상태 갱신
        return;
    }
        
    // 수량 변경 → DOM 최소 갱신
    li.querySelector('.qty__num').textContent = item.qty;
    li.querySelector('[data-act="dec"]').disabled = item.qty <= 1;
    updateTotals();
    updateSelectAllState();
});



// 전체 선택
selectAllEl.addEventListener('change', () => {
    const on = selectAllEl.checked;
    cart.forEach(i => i.checked = on);
    cartListEl.querySelectorAll('.item__checkbox').forEach(cb => cb.checked = on);
    updateTotals();
    updateSelectAllState();
});



// 선택 삭제
$('#removeSelected').addEventListener('click', () => {
    const removed = cart.filter(i => i.checked).length;
    if (removed === 0) {toast('선택된 상품이 없어요.'); return; }
    cart = cart.filter(i => !i.checked);
    toast(`선택한 ${removed}개 상품을 삭제했어요.`);
    renderCart();
});



// 장바구니 비우기
$('#clearCart').addEventListener('click', () => {
    if (cart.length === 0) {toast('이미 비어있는 장바구니예요.'); retrun;}
    cart = [];
    toast('장바구니를 비웠어요.');
    renderCart();
});



// 추천 상품 담기 (빈 상태 → 복원)
$('#restoreltems').addEventListener('click', () => {
    cart = PRODUCTS.map(p => ({...p, checked: true}));
    toast('추천 상품을 담았어요!');
    renderCart();
});



// 주문하기
function onPay() {
    const c = calc();
    if (c.count === 0) {toast('주문할 상품을 선택해 주세요.'); return; }
    toast(`결제 예상 금액 ${won(c.total)} · 주문서로 이동합니다.`);
}
payButtonEl.addEventListener('click', onPay);



/* -- 초기 실행 -- */
ensureMobileBar();
renderCart();
window.addEventListener('resize', () => {
    const c = calc();
    updateMobileBar(c.total, c.count);
});