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

// 목록 및 상태 영역
const listEl = $('itemList');
const emptyEl = $('emptyState');
const footEl = $('cartFoot') || null;
const toolbarEl = $('toolbar');

// 체크박스 및 카운트
const checkAllEl = $('checkAll');
const allCountEl = $('allCount');
const headCountEl = $('headCount');

// 금액 요약 영역
const sumSubEl = $('sumSubtotal');
const sumShipEl = $('sumShipping');
const sumTotalEl = $('sumTotal');

// 무료배송 안내 바 영역
const shipBoxEl = $('shipBox');
const shipTextEl = $('shipText');
const shipBarEl = $('shipBar');

// 주요 액션 버튼 (누락 보완)
const orderBtn = $('orderBtn');
const toastEl = $('toast');



/* -- 유틸 -- */
const won = n => Number(n).toLocaleString('ko-KR') + '원';

let toastTimer;
function toast(msg) {
    // 상단 변수가 비어있을 경우를 대비해 직접 DOM 탐색
    const el = toastEl || document.getElementById('toast');
    if (!el) return;

    el.textContent = msg;
    el.classList.add('is-on');
    
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        el.classList.remove('is-on');
    }, 1800);
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function findItem(id) { 
    return items.find(it => it.id === id); 
}

function updateCheckAllStatus() {
    if (!checkAllEl) return;
    checkAllEl.checked = items.length > 0 && items.every(it => it.checked);
}



/* -- 계산 -- */
function calc() {
    const selected = items.filter(it => it.checked);
    const subtotal = selected.reduce((sum, it) => sum + (it.price * it.qty), 0);
    
    // 상단 선언된 SHIPPING_FEE 변수와 일치시킴
    const shipping = subtotal >= FREE_SHIPPING || subtotal === 0 ? 0 : SHIPPING_FEE;
    const total = subtotal + shipping;

    return { selected, subtotal, shipping, total };
}



/* -- 렌더링 -- */
function render() {
    if (!listEl) return;

    const isEmpty = items.length === 0;



    /* -- 화면 요소 노출/숨김 상태 제어 -- */
if (emptyEl) emptyEl.hidden = !isEmpty;
if (listEl) listEl.hidden = isEmpty;
if (toolbarEl) toolbarEl.hidden = isEmpty;
if (footEl) footEl.hidden = isEmpty; // footEl이 없어도 에러 없이 통과



    /* -- 장바구니가 비었을 때 초기화 -- */
    if (isEmpty) {
        listEl.innerHTML = '';
        if (headCountEl) headCountEl.textContent = '0';
        if (allCountEl) allCountEl.textContent = '(0/0)';
        if (checkAllEl) {
            checkAllEl.checked = false;
            checkAllEl.indeterminate = false;
        }

        if (sumSubEl) sumSubEl.textContent = won(0);
        if (sumShipEl) sumShipEl.textContent = '0원';
        if (sumTotalEl) sumTotalEl.textContent = won(0);
        if (orderBtn) orderBtn.disabled = true;

        if (shipBarEl) shipBarEl.style.width = '0%';
        if (shipBoxEl) shipBoxEl.classList.remove('is-done');
        if (shipTextEl) {
            shipTextEl.innerHTML = '상품을 담으면 <b>무료배송</b> 여부를 알려드려요';
        }
        return;
    }



    /* -- 장바구니에 상품이 있을 때 계산 -- */
    const { selected, subtotal, shipping, total } = calc();
    const totalQty = items.reduce((s, it) => s + it.qty, 0);



    /* -- 상품 목록 DOM 생성 -- */
    listEl.innerHTML = items.map(it => `
        <li class="item" data-id="${it.id}">
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
                    <input type="text" data-role="qty" value="${it.qty}" readonly aria-label="수량" />
                    <button type="button" data-role="plus" aria-label="수량 증가"
                        ${it.qty >= MAX_QTY ? 'disabled' : ''}>+</button>
                </div>
                <button type="button" class="remove-btn" data-role="remove">삭제</button>
            </div>
        </li>
    `).join('');



    /* -- 카운터 및 전체 선택 체크박스 동기화 -- */
    if (headCountEl) headCountEl.textContent = totalQty;
    if (allCountEl) allCountEl.textContent = `(${selected.length}/${items.length})`;
    if (checkAllEl) {
        checkAllEl.checked = items.length > 0 && selected.length === items.length;
        checkAllEl.indeterminate = selected.length > 0 && selected.length < items.length;
    }



    /* -- 금액 및 주문 버튼 동기화 -- */
    if (sumSubEl) sumSubEl.textContent = won(subtotal);
    if (sumShipEl) {
        sumShipEl.textContent = shipping === 0
            ? (subtotal === 0 ? '0원' : '무료')
            : won(shipping);
    }
    if (sumTotalEl) sumTotalEl.textContent = won(total);
    if (orderBtn) orderBtn.disabled = selected.length === 0;



    /* -- 무료배송 프로그레스 바 동기화 -- */
    const remain = Math.max(0, FREE_SHIPPING - subtotal);
    const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING) * 100));

    if (shipBarEl) shipBarEl.style.width = pct + '%';
    if (shipBoxEl) shipBoxEl.classList.toggle('is-done', subtotal >= FREE_SHIPPING);
    if (shipTextEl) {
        shipTextEl.innerHTML = subtotal === 0
            ? '상품을 담으면 <b>무료배송</b> 여부를 알려드려요'
            : (remain === 0
                ? '<b>무료배송</b>이 적용되었어요 🎉'
                : `무료배송까지 <b>${won(remain)}</b> 남았어요`);
    }
}




/* -- 목록 클릭 이벤트 (수량 증감, 삭제) -- */
if (listEl) {
    listEl.addEventListener('click', e => {
        const li = e.target.closest('.item');
        if (!li) return;
        const it = findItem(li.dataset.id);
        if (!it) return;
        const role = e.target.dataset.role;

        if (role === 'plus') { 
            it.qty = Math.min(MAX_QTY, it.qty + 1); 
            render(); 
        }
        if (role === 'minus') { 
            it.qty = Math.max(1, it.qty - 1); 
            render(); 
        }
        if (role === 'remove') {
            li.classList.add('is-removing');
            setTimeout(() => {
                items = items.filter(x => x.id !== it.id);
                render();
                toast('상품을 삭제했어요');
            }, 180);
        }
    });



    /* -- 개별 체크박스 상태 변경 -- */
    listEl.addEventListener('change', e => {
        const li = e.target.closest('.item');
        if (!li) return;
        const it = findItem(li.dataset.id);
        if (!it) return;

        if (e.target.dataset.role === 'pick') {
            it.checked = e.target.checked;
            render();
        }
    });
}



/* -- 전체 선택 / 해제 -- */
if (checkAllEl) {
    checkAllEl.addEventListener('change', () => {
        const on = checkAllEl.checked;
        items.forEach(it => { it.checked = on; });
        render();
    });
}

/* -- 주문 버튼 클릭 -- */
if (orderBtn) {
    orderBtn.addEventListener('click', (e) => {
        e.preventDefault(); // 기본 submit 동작 차단

        const { selected, total } = calc();
        const selectedCount = selected.length;

        if (!selectedCount) {
            toast('주문할 상품을 선택해 주세요');
            return;
        }

        toast(`${selectedCount}개 상품 · ${won(total)} 결제 페이지로 이동합니다`);
    });
}

/* -- 툴바 액션 (선택 삭제, 전체 비우기, 샘플 복원 위임) -- */
document.addEventListener('click', e => {
    // 1. 선택 삭제
    if (e.target.closest('#deleteSelected')) {
        const count = items.filter(it => it.checked).length;
        if (count === 0) return toast('선택된 상품이 없어요');
        items = items.filter(it => !it.checked);
        render();
        toast(`${count}개 상품을 삭제했어요`);
        return;
    }

    // 2. 전체 비우기
    if (e.target.closest('#clearAll')) {
        if (!items.length) return;
        if (!confirm('장바구니를 모두 비울까요?')) return;
        items = [];
        render();
        toast('장바구니를 비웠어요');
        return;
    }

    // 3. 샘플 상품 복원
    if (e.target.closest('#restoreBtn')) {
        items = seed.map(it => ({ ...it, checked: true }));
        render();
        toast('샘플 상품을 담았어요');
        return;
    }
});



/* -- 초기화 실행 (1회 실행) -- */
function init() {
    render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}