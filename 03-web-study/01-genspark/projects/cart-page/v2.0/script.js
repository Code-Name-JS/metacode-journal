/* =====================================================
   script-v2.js  –  cart v2.0 Interactions
===================================================== */

/* -- 기본 설정 -- */
const FREE_SHIPPING_THRESHOLD = 30000; // 무료배송 기준 금액
const BASE_SHIPPING = 3000; // 기본 배송비
const POINT_RATE = 0.01; // 적립률 1%



/* -- 유틸 -- */
const won = (num) => Number(num).toLocaleString('ko-KR') + '원';
const wonShort = (num) => Number(num).toLocaleString('ko-KR') + '원';

let toaseTimer = null;
function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toaseTimer);
    toaseTimer = setTimeout(() => toastEl.classList.remove('is-show'), 1800);
}



/* -- 상품 데이터 (썸네일은 이모지 + CSS 그라데이션으로 처리 ) -- */
const PRODUCTS = [
    { id: 'p1', brand: 'MONGLE BASIC', name: '오버핏 코튼 라운드 티셔츠 (5 color)', option: '아이보리/M', price: 19900, oldPrice: 29000, discountRate: 31, qty: 2, emoji: '👕' },
    { id: 'p2', brand: 'MONGLE DENIM', name: '와이드 원턱 데님 팬츠 - 워시드 블루', option: '블루/30', price: 42900, oldPrice: null, discountRate: 0, qty: 1, emoji: '👖' },
    { id: 'p3', brand: 'MONGLE ACC', name: '데일리 미니 크로스백 (가죽)', option: '브라운 / FREE', price: 35800, oldPrice: 45000, discountRate: 20, qty: 1, emoji: '👜' },
    { id: 'p4', brand: 'MONGLE SHOES', name: '클래식 스웨이드 스니커즈', option: '그레이/250', price: 59000, oldPrice: 79000, discountRate: 25, qty: 1, emoji: '👟' }    
];



/* -- 상태: 담긴 상품 목록 (checked = 선택됨) -- */
let cart = PRODUCTS.map(p => ({...p, checked: true}));



/* -- DOM 요소 -- */
const $ = (sel) => document.querySelector(sel);

const cartListEl = $('#cartList');
const cartLayoutEl = $('#cartLayout');
const emptyStateEl = $('#emptyState');
const selectAllEl = $('#selectAll');
const selectAllCountEl = $('#selectAllCount');
const cartSummaryTextEl = $('#cartSummaryText');

const sumItemsEl = $('#sumItems') || $('#sumltems');
const sumDiscountEl = $('#sumDiscount');
const sumShippingEl = document.querySelector('#sumShipping') || document.querySelector('.sumShipping');
const sumTotalEl = $('#sumTotal');
const sumPointEl = $('#sumPoint');
const payButtonEl = $('#payButton');
const payButtonCountEl = $('#payButtonCount');
const freeShipBoxEl = $('#freeShipBox');
const freeShipTextEl = $('#freeShipText');
const freeShipFillEl = $('#freeShipFill');
const toastEl = $('#toast');



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
                
                <!-- 수량이 곱해진 판매가와 정가 -->
                <div class="item__price">
                    ${won(item.price * item.qty)}
                    ${item.oldPrice ? `<span class="old">${won(item.oldPrice * item.qty)}</span>` : ''}
                </div>

                <!-- 개당 단가 및 고유 할인율(31%, 20%, 25%) 동적 표시 -->
                ${item.oldPrice && item.discountRate > 0 ? `
                    <div class="item__each">개당 ${won(item.price)} ·${item.discountRate}% 할인</div>
                ` : ''}
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



// 상품을 장바구니에 추가할 때
function addToCart(product, qty = 1) {
    const originalPrice = Number(product.price); // 정가
    const isDiscounted = product.discountRate === 31; // 또는 31% 할인 조건

    // 31% 할인 적용 단가 계산 (소수점 처리: 반올림 또는 절사)
    const salePrice = isDiscounted
        ? Math.round(originalPrice * (1 - 0.31))
        : originalPrice;

    const existingItem = cart.find(i => i.id === product.id);

    if (existingItem) {
        //이미 담긴 상품이면 수량만 증가 (단가는 절대 변경하지 않음)
        existingItem.qty += Number(qty);
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            oldPrice: isDiscounted ? originalPrice : null, // 정가
            price: salePrice, // 31% 할인가
            qty: Number(qty), // 수량은 항상 Number 타입
            checked: true
        });
    }

    updateTotals();
}

// 수량 변경 함수
function changeQuantity(productId, newQty) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    // 수량은 반드시 1 이상의 정수(Number)로 유지
    const parsedQty = parseInt(newQty, 10);
    item.qty = isNan(parsedQty) || parsedQty < 1 ? 1 : parsedQty;

    // 수량 변경 후 즉시 화면 갱신
    updateTotals();
}

/* -- 합계 계산 -- */
function calc() {
    const selected = cart.filter(i => i.checked);

    // 실제 결제 대상 총액
    const itemsTotal = selected.reduce((s, i) => s + i.price * i.qty, 0);
    
    // 정가 대비 할인애 계산
    const discount = selected.reduce((s, i) => s + (i.oldPrice ? (i.oldPrice - i.price) * i.qty : 0), 0);

    // [수정] 30,000원 이상( >= )일 때 무료(0원), 미만일 때 기본 배송비(3,000원)
    const shipping = (selected.length === 0 || itemsTotal >= FREE_SHIPPING_THRESHOLD) ? 0 : BASE_SHIPPING;

    return {
        itemsTotal,
        discount,
        shipping,
        total: itemsTotal + shipping,
        count: selected.length,
        qty: selected.reduce((s, i) => s + i.qty, 0)
    };
}



/* -- 화면 합계 업데이트 - */
function updateTotals() {
    const c = calc();

    // 주문 금액 및 할인 표시
    if (sumItemsEl) sumItemsEl.textContent = won(c.itemsTotal);
    if (sumDiscountEl) sumDiscountEl.textContent = (c.discount > 0 ? '-' : '') + won(c.discount);
    
    // 배송비 표시 수정 (3만원 초과 시 무료, 3만원 이하 시 3,000원, 미선택 시 0원)
    if (sumShippingEl) {
        if (c.count === 0) {
            sumShippingEl.textContent = '0원';
        } else {
            sumShippingEl.textContent = c.shipping === 0 ? '무료' : won(c.shipping);
        }
    }

    // 결제 총액 및 포인트
    if (sumTotalEl) sumTotalEl.textContent = won(c.total);
    if (sumPointEl) sumPointEl.textContent = Math.floor(c.total * POINT_RATE).toLocaleString('ko-KR') + 'P';

    // 주문 버튼 및 요약 문구
    if (payButtonCountEl) payButtonCountEl.textContent = c.count;
    if (payButtonEl) payButtonEl.disabled = c.count === 0;

    if (cartSummaryTextEl) {
        cartSummaryTextEl.textContent = c.count > 0 
            ? `총 ${c.count}개 상품 · ${c.qty}개 수량을 선택했어요.` 
            : '주문할 상품을 선택해 주세요.';
    }

    // 무료배송 프로그레스 바 & 달성 문구 수정
    if (freeShipFillEl && freeShipBoxEl && freeShipTextEl) {
        
        // 남은 금액 계산 (30,000원 초과 기준이므로 남은 금액이 0원 이하일 때 달성)
        const remain = FREE_SHIPPING_THRESHOLD - c.itemsTotal;
        const pct = Math.min(100, Math.round((c.itemsTotal / FREE_SHIPPING_THRESHOLD) * 100));
        
        freeShipFillEl.style.width = (c.itemsTotal > 0 ? Math.max(pct, 4) : 0) + '%';

        // 30,000원 "초과( > )"일 때 무료배송 달성
        if (c.itemsTotal >= FREE_SHIPPING_THRESHOLD) {
            freeShipBoxEl.classList.add('is-free');
            freeShipTextEl.innerHTML = '무료배송 조건 달성! 🎉 배송비 0원';
        } else {
            freeShipBoxEl.classList.remove('is-free');

            // 아직 달성 전이면 남은 금액 표시 (정확히 30,000원일 때는 1원 이상 더 담아야 하므로 최소 1원 이상 표시)
            const neededAmount = Math.max(remain, 0);
            freeShipTextEl.innerHTML = `무료배송까지 <b>${wonShort(neededAmount)}</b> 남았어요`;
        }
    }
}



/* -- 수량 변경 처리 함수 -- */
function changeQuantity(id, diff) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    const nextQty = item.qty + diff;
    if (nextQty < 1) return; // 최소 1개 유지

    item.qty = nextQty;

    // 해당 아이템의 화면 수량 및 개별 금액 갱신
    const rowEl = document.querySelector(`[data-id="${id}"]`);
    if (rowEl) {

        // 수량 표시 업데이트
        const qtyEl = rowEl.querySelector('.qty__num');
        if (qtyEl) qtyEl.textContent = item.qty;

        // 수량이 1개일 때 '_' 버튼 disabled 처리
        const decBtnEl = rowEl.querySelector('[data-act="dec"]');
        if (decBtnEl) {
            decBtnEl.disabled = item.qty <= 1;
        }

        // 수량이 반영된 판매가 및 정가 갱신 (.item__price)
        const priceBoxEl = rowEl.querySelector('.item__price');
        if (priceBoxEl) {
            const totalPrice = won(item.price * item.qty);
            const totalOldPrice = item.oldPrice ? `<span class="old">${won(item.oldPrice * item.qty)}</span>` : '';
            
            // 기존 렌더링 형식과 동일하게 주입
            priceBoxEl.innerHTML = `\n${totalPrice}\n${totalOldPrice}\n`;
        }
    }

    // 하단 결제 예상 금액 및 총합 재계산
    updateTotals();
}



/* -- 31% 할인 신규 상품 추가 함수 -- */
function add31PercentDiscountProduct(originalProduct) {
    const originalPrice = Number(originalProduct.price);
    // 31% 할인 적용 가격 (10원 단위 반올림)
    const salePrice = Math.round((originalPrice * (1 - 0.31)) / 10) * 10;

    const existing = cart.find(i => i.id === originalProduct.id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            id: originalProduct.id,
            brand: originalProduct.brand || 'MONGLE',
            name: originalProduct.name,
            option: originalProduct.option || '기본',
            price: salePrice,             // 31% 할인된 실 결제 단가
            oldPrice: originalPrice,     // 원래 정가
            qty: 1,
            emoji: originalProduct.emoji || '🎁',
            checked: true
        });
    }

    // 렌더링 함수가 있다면 호출 (예: renderCart())
    if (typeof renderCart === 'function') renderCart();
    updateTotals();
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

    // [추가된 부분] 수량이 적용된 개별 상품 금액(.item__price) 즉시 갱신
    const priceBoxEl = li.querySelector('.item__price');
    if (priceBoxEl) {
        const totalPrice = won(item.price * item.qty);
        const totalOldPrice = item.oldPrice ? `<span class="old">${won(item.oldPrice * item.qty)}</span>` : '';
        priceBoxEl.innerHTML = `\n            ${totalPrice}\n            ${totalOldPrice}\n        `;
    }

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