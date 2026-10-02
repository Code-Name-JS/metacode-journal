/* =====================================================
   script-v1.js  –  cart v1.0 Interactions
===================================================== */

"use strict";



/* -- 유틸 규칙 -- */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];



/* -- 상태 & 상수 설정 -- */
const SHIPPING_FEE = 3000; // 기본 배송비
const FREE_SHIPPING_MIN = 50000; // 무료배송 기준 금액
const QTY_MIN = 1, QTY_MAX = 99;
const STORAGE_KEY = 'cart-page-demo-v1';

const COUPONS = {
    none: { calc: () => 0 },
    pct10: { calc: sub => Math.min(Math.floor(sub * 0.1), 30000) },
    save5000: {calc: sub => (sub >= 50000 ? 5000 : 0) },
};



/* -- 샘플 데이터 (썸네일은 그라디언트 + 이모지) -- */
const DEMO_ITEMS = [
    { id: 'p1', name: '무선 노이즈캔슬링 헤드폰', option: '미드나잇 블랙', price: 189000, qty: 1, checked: true, emoji: '🎧', bg: 'linear-gradient(135deg,#c2b6f6,#8fb8f5)' },
    { id: 'p2', naem: '스마트워치 시리즈 9', option: '45mm 스타라이트', price: 429000, qty: 1, checked: false, emoji: '⌚', bg: 'linear-gradient(135deg,#ffd8a8,#ffa8a8)' },
    { id: 'p3', name: '러닝 슈즈 에어플로우', option: '화이트 / 270mm', price: 89000, qty: 1, checked: false, emoji: '👟', bg: 'linear-gradient(135deg,#b8f2d8,#8fe3f0)' },
    { id: 'p4', name: '캠핑 미니 화로대', option: '스테인리 스틸', price: 45000, qty: 1, checked: true, emoji: '🏕️', bg: 'linear-gradient(135deg,#ffe3a3,#ffc4a3)' },
];



/* -- 상태 -- */
let state = load() || JSON.parse(JSON.stringify({ items: DEMO_ITEMS, coupon: 'none' }));



/* -- 유틸 -- */
const fmtNum = n => n.toLocaleString('ko-KR');
const fmt = n => `${fmtNum(n)}원`;

const ICONS = {
    minus: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    plus: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 3.5v9M3.5 8h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6"/></svg>',
}



/* -- 저장 / 복원 (localStorage) -- */
function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* 저장 실패 무시 */ }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.items)) return null;
    data.items = data.items.filter(i =>
      i && typeof i.id === 'string' && typeof i.name === 'string' &&
      typeof i.price === 'number' && typeof i.qty === 'number'
    );
    if (!COUPONS[data.coupon]) data.coupon = 'none';
    return data;
  } catch (e) { return null; }
}



/* -- 렌더링 -- */
function itemHTML(it) {
    return `<li class="item" data-id="${it.id}">
    <div class="cell-check">
      <input type="checkbox" class="cb item-check" id="chk-${it.id}" data-id="${it.id}" ${it.checked ? 'checked' : ''} aria-label="${it.name} 선택">
    </div>
    <div class="cell-thumb" style="background:${it.bg}" aria-hidden="true"><span>${it.emoji}</span></div>
    <div class="cell-info">
      <p class="item-name">${it.name}</p>
      <p class="item-meta">${it.option} · ${fmt(it.price)}</p>
    </div>
    <div class="cell-qty">
      <div class="qty" role="group" aria-label="${it.name} 수량 조절">
        <button type="button" class="qty-btn" data-action="dec" data-id="${it.id}" aria-label="${it.name} 수량 감소" ${it.qty <= QTY_MIN ? 'disabled' : ''}>${ICONS.minus}</button>
        <input type="number" class="qty-input" data-id="${it.id}" value="${it.qty}" min="${QTY_MIN}" max="${QTY_MAX}" inputmode="numeric" aria-label="${it.name} 수량 직접 입력">
        <button type="button" class="qty-btn" data-action="inc" data-id="${it.id}" aria-label="${it.name} 수량 증가" ${it.qty >= QTY_MAX ? 'disabled' : ''}>${ICONS.plus}</button>
      </div>
    </div>
    <div class="cell-right">
      <p class="line-total" data-line="${it.id}">${fmt(it.price * it.qty)}</p>
      <button type="button" class="remove-btn" data-action="remove" data-id="${it.id}" aria-label="${it.name} 삭제">${ICONS.trash}<span>삭제</span></button>
    </div>
  </li>`;
}

function renderList() {
    const has = state.items.length > 0;
    $('#listWrap').hidden = !has;
    $('#emptyState').hidden = has;
    $('#mobileBar').hidden = !has;
    $('#cartList').innerHTML = state.items.map(itemHTML).join('');
    $('#headCount').textContent = state.items.length;

    const checked = state.items.filter(i => i.checked).length;
    const ca = $('#checkAll');
    ca.checked = state.items.length > 0 && checked === state.items.length;
    ca.indeterminate = checked > 0 && checked < state.items.length;
    $('#selCount').textContent = `(${checked}/${state.items.length})`;
}

function renderSummary() {
    const sel = state.items.filter(i => i.checked);
    const subtotal = sel.reduce((s, i) => s + i.price * i.qty, 0);
    
    const rawDiscount = COUPONS[state.coupon]?.calc?.(subtotal) ?? 0;
    const discount = Math.min(subtotal, Math.max(0, rawDiscount));

    const ship = sel.length === 0 ? 0 : (subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE);
    const total = subtotal - discount + ship;
    const points = Math.floor((subtotal - discount) * 0.01);

    $('#sumSubtotal').textContent = fmt(subtotal);
    $('#sumDiscount').textContent = discount > 0 ? `-${fmtNum(discount)}원` : '0원';
    $('#sumShip').innerHTML = (sel.length > 0 && ship === 0)
        ? `<s>${fmt(SHIPPING_FEE)}</s><b class="free">무료</b>`
        : fmt(ship);
    $('#sumTotal').textContent = fmt(total);
    $('#mbTotal').textContent = fmt(total);
    $('#checkoutCount').textContent = sel.length;
    $('#sumPoints').textContent = points > 0 ? `${fmtNum(points)}P 적립 예상` : '';

    // 무료배송 진행바
    const pct = Math.min(100, (subtotal / FREE_SHIPPING_MIN) * 100);
    $('#shipFill').style.width = `${pct}%`;
    $('#shipProgress').setAttribute('aria-valuenow', String(Math.round(pct)));
    const label = $('#shipLabel');
    if (subtotal >= FREE_SHIPPING_MIN) {
        label.textContent = `🎉 ${fmt(FREE_SHIPPING_MIN)} 이상 — 무료배송!`;
        label.classList.add('done');
    } else if (subtotal > 0) {
        label.textContent = `${fmt(FREE_SHIPPING_MIN - subtotal)} 더 담으면 무료배송`;
        label.classList.remove('done');
    } else {
        label.textContent = `${fmt(FREE_SHIPPING_MIN)} 이상 주문 시 무료배송`;
        label.classList.remove('done');
    }
}

function renderAll() { renderList(); renderSummary(); }



/* -- 토스트 -- */
let toastTimer = null;
function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}



/* -- 이벤트 -- */
$('#cartList').addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const item = state.items.find(i => i.id === btn.dataset.id);
    if (!item) return;

    switch (btn.dataset.action) {
        case 'inc': item.qty = Math.min(QTY_MAX, item.qty + 1); break;
        case 'dec': item.qty = Math.max(QTY_MIN, item.qty - 1); break;
        case 'remove':
            state.items = state.items.filter(i => i.id !== item.id);
            toast(`‘${item.name}’ 상품을 삭제했습니다`);
            break;
    }
    save();
    renderAll();
});

$('#cartList').addEventListener('change', e => {
    const t = e.target;
    const id = t.closest('[data-id]')?.dataset.id;
    const item = state.items.find(i => String(i.id) === id);
    if (!item) return;

    console.log(t.dataset.id, state.items.map(i => i.id));

    if (t.classList.contains('item-check')) {
        item.checked = t.checked;
    } else if (t.classList.contains('qty-input')) {
        let v = parseInt(t.value, 10);
        if (Number.isNaN(v)) v = QTY_MIN;
        item.qty = Math.min(QTY_MAX, Math.max(QTY_MIN, v));
    }
    save();
    renderAll();
});

$('#checkAll').addEventListener('change', e => {
    state.items.forEach(i => { i.checked = e.target.checked; });
    save();
    renderAll();
});

$('#deleteSelected').addEventListener('click', () => {
    const n = state.items.filter(i => i.checked).length;
    if (!n) { toast('선택된 상품이 없습니다'); return; }
    state.items = state.items.filter(i => !i.checked);
    toast(`선택한 ${n}개 상품을 삭제했습니다`);
    save();
    renderAll();
});

$('#couponSelect').addEventListener('change', e => {
    state.coupon = e.target.value;
    save();
    renderAll();
    if (state.coupon !== 'none') toast('쿠폰이 적용되었습니다');
});

const checkout = () => {
    const n = state.items.filter(i => i.checked).length;
    if (!n) { toast('주문할 상품을 선택해 주세요'); return; }
    toast(`${n}개 상품 주문을 진행합니다 (데모 페이지)`);
};
$('#checkoutBtn').addEventListener('click', checkout);
$('#mobileCheckout').addEventListener('click', checkout);

const reset = () => {
    state = JSON.parse(JSON.stringify({ items: DEMO_ITEMS, coupon: 'none' }));
    $('#couponSelect').value = 'none';
    save();
    renderAll();
    toast('샘플 상품으로 초기화했습니다');
};
$('#resetBtn').addEventListener('click', reset);
$('#emptyReset').addEventListener('click', reset);



/* -- 초기화 -- */
$('#couponSelect').value = state.coupon;
renderAll();