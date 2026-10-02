/* =====================================================
   script-v3.js  –  cart v3.0 Interactions
===================================================== */



/* =========================================================
   장바구니 시안 - 상태 관리 + 렌더링
   ========================================================= */
const FREE_SHIPPING = 30000; // 무료배송 기준 금액
const SHIPPING_FEE = 3000; // 기본 배송비
const MAX_QTY = 99;



/* -- 샘플 데이터(실제 서비스에서는 서버 응답으로 대체) -- */
const seed = [
    { id: 'p1', name: '데일리 코튼 오버핏 셔츠', option: '화이트 / M', price: 24900, qty: 1, badge: '베스트', color: '#6c8cff', label: 'SH' },
    { id: 'p2', name: '라이트 웨이트 니트 가디건', option: '오트밀 / L', price: 39800, qty: 1, badge: '신상품', color: '#f2a65a', label: 'CD' },
    { id: 'p3', name: '소프트 스트라이프 머플러', option: '그레이 / FREE', price: 12900, qty: 2, badge: '', color: '#4bc0a3', label: 'MF' }
];

let items = seed.map(it => ({...it, checked: true}));



/* -- DOM -- */
const $ = id => document.getElementById(id);
const listEl = $('itemList');
const emptyEl = $('emptyState');
const footEl = $('cartFoot');
const toolbarEl = $('toolbar');
const checkAllEl = $('checkAll');
const allCountEl = $('allCount');
const headCountEl = $('headCount');
const sumSubEl = $('sumSubtotal');
const sumShipEl = $('sumShipping');
const sumTotalEl = $('sumTotal');
const shipBoxEl = $('shipBox');
const shipTextEl = $('shipText');
const shipBarEl = $('shipBar');
const orderBtn = $('orderBtn');
const toastEl = $('toast');



/* -- 유틸 -- */
const won = n => n.toLocaleString('ko-KR') + '원';

let toastTimer;
function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 1800);
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}



/* -- 계산 -- */
function calc() {
    const selected = items.filter(it => it.checked);
    const subtotal = selected.reduce((s, it) => s + it.price * it.qty, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE;
    return { selected, subtotal, shipping, total: subtotal + shipping };
}



/* -- 렌더링 -- */
function render() {
    const { selected, subtotal, shipping, total } = calc();
    const totalQty = items.reduce((s, it) => s + it.qty, 0);

    /* -- 목록 -- */
    listEl.innerHTML = items.map(it => 
        `<li class="item" data-id="${it.id}">
            <label class="check item__check">
                <input type="checkbox" data-role="pick" ${it.checked ? 'checked' : ''}
                    aria-label="${escapeHtml(it.name)} 선택" />
            </label>

        <div class="thumb" style="background:${it.color}" aria-hidden="true">${it.label}</div>

        <div class="item__body">
            ${it.badge ? `<span class="badge">${escapeHtml(it.badge)}</span>` : ''}
            <h3 class="item__name">${escapeHtml(it.name)}</h3>
            <p class="item__opt">옵션 : ${escapeHtml(it.option)}</p>
            <p class="item__price">${won(it.price * it.qty)}
                <small>(${won(it.price)} × ${it.qty}개)</small>
            </p>
        </div>

        <div class="item__side">
            <div class="qty">
                <button type="button" data-role="minus" aria-label="수량 감소"
                    ${it.qty <= 1 ? 'disabled' : ''}>−</button>
                <input type="number" data-role="qty" value="${it.qty}" min="1" max="${MAX_QTY}"
                    aria-label="수량" />
                <button type="button" data-role="plus" aria-label="수량 증가"
                    ${it.qty >= MAX_QTY ? 'disabled' : ''}>+</button>
            </div>
            <button type="button" class="remove-btn" data-role="remove">삭제</button>
        </div>
    </li>
    `).join('');
    
    /* -- 빈 상태 -- */
    const isEmpty = items.length === 0;
    emptyEl.hidden = !isEmpty;
    listEl.hidden = isEmpty;
    toolbarEl.hidden = isEmpty;
    footEl.hidden = isEmpty;

    /* -- 카운터 -- */
    headCountEl.textContent = totalQty;
    allCountEl.textContent = `(${selected.length}/${items.length})`;
    checkAllEl.checked = items.length > 0 && selected.length === items.length;
    checkAllEl.indeterminate = selected.length > 0 && selected.length < items.length;

    /* -- 금액 -- */
    sumSubEl.textContent = won(subtotal);
    sumShipEl.textContent = shipping === 0
     ? (subtotal === 0 ? '원' : '무료')
     : won(shipping);
    sumTotalEl.textContent = won(total);
    orderBtn.disabled = selected.length === 0;

    /* -- 무료배송 진행바 -- */
    const remain = Math.max(0, FREE_SHIPPING - subtotal);
    const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING) * 100));
    shipBarEl.style.width = pct + '%';
    shipBoxEl.classList.toggle('is-done', subtotal >= FREE_SHIPPING);
    shipTextEl.innerHTML = subtotal === 0
     ? '상품을 담으면 <b>무료배송</b> 여부를 알려드려요'
     :(remain === 0
        ? '<b>무료배송</b>이 적용되었어요 🎉'
        : `무료배송까지 <b>${won(remain)}</b> 남았어요`);
}



