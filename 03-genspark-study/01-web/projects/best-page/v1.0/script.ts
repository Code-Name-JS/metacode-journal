/* =========================================================
   MOMENT — 베스트 상품 페이지 시안 (script.ts)
   데이터 → 필터 → 정렬 → 렌더링 / 찜 · 장바구니 인터랙션
   ========================================================= */

/* -- 타입 정의 -- */

// [연결 1] HTML data-cat 값과 같아야 함
type Category = '의류' | '슈즈' | '뷰티' | '액세서리' | '라이프';
type CategoryFilter = '전체' | Category;

// [연결 2] HTML data-period 값과 같아야 함
type Period = 'realtime' | 'daily' | 'weekly' | 'monthly';

// [연결 3] HTML option value 값과 같아야 함
type SortKey = 'popular' | 'reviews' | 'discount' | 'priceAsc' | 'priceDesc';

// [연결 4] HTML에 있는 태그를 [number, string, Category]로 숫자인지, 문자이지, 카테고리인지 역할부여
interface Product {
    id: number;
    brand: string;
    name: string;
    cat: Category;
    price: number;
    origin: number;
    rating: number;
    reviews: number;
    sales: number;
    trend: number;
    seed: string;
}

interface PeriodMeta {
    label: string;
    time: string;
    k : number;
    trend: number;
}

interface State {
    period: Period;
    category: CategoryFilter;
    sort: SortKey;
    visible: number;
    step: number;
    wishlist: Set<number>;
    cart: number;
}



/* -- HTML에서 읽은 문자열이 허용된 값인지 검사 (타입 가드) -- */
const PERIODS: Period[] = ['realtime', 'daily', 'weekly', 'monthly'];
const SORT_KEYS: SortKey[] = ['popular', 'reviews', 'discount', 'priceAsc', 'priceDesc'];
const CATEGORY_FILTERS: CategoryFilter[] = ['전체', '의류', '슈즈', '뷰티', '액세서리', '라이프'];

function isOneOf<T extends string>(list: T[], value: string | undefined): value is T { return list.includes(value as T); }



/* -- 상품 데이터 (20개) -- */
const PRODUCTS: Product[] = [
    { id: 1, brand: '르네셀', name: '오버핏 코튼 트렌치 코트', cat: '의류', price: 89000, origin: 159000, rating: 4.9, reviews: 2841, sales: 9820, trend: 2, seed: 'moment-trench' },
    { id: 2,  brand: '데일리무드', name: '워시드 데님 와이드 팬츠',            cat: '의류',     price: 39000, origin: 62000,  rating: 4.8, reviews: 4120, sales: 9410, trend: 1,  seed: 'moment-denim' },
    { id: 3,  brand: '아르떼',   name: '소프트 램스울 니트 가디건',          cat: '의류',     price: 54000, origin: 98000,  rating: 4.9, reviews: 1976, sales: 9030, trend: -1, seed: 'moment-cardigan' },
    { id: 4,  brand: '몽드',     name: '클래식 레더 스니커즈',              cat: '슈즈',     price: 69000, origin: 119000, rating: 4.7, reviews: 3312, sales: 8770, trend: 3,  seed: 'moment-sneakers' },
    { id: 5,  brand: '뮤즈랩',   name: '벨벳 매트 립스틱 6colors',          cat: '뷰티',     price: 18900, origin: 26000,  rating: 4.8, reviews: 6890, sales: 8560, trend: 0,  seed: 'moment-lipstick' },
    { id: 6,  brand: '코코니',   name: '미니멀 골드 레이어드 목걸이',        cat: '액세서리', price: 24000, origin: 42000,  rating: 4.9, reviews: 2204, sales: 8120, trend: 2,  seed: 'moment-necklace' },
    { id: 7,  brand: '오브제홈', name: '아로마 디퓨저 200ml',              cat: '라이프',   price: 22000, origin: 33000,  rating: 4.6, reviews: 1543, sales: 7890, trend: -2, seed: 'moment-diffuser' },
    { id: 8,  brand: '베르사',   name: '린넨 블렌드 릴랙스 셔츠',            cat: '의류',     price: 45000, origin: 75000,  rating: 4.7, reviews: 2688, sales: 7640, trend: 1,  seed: 'moment-shirt' },
    { id: 9,  brand: '스킨포레', name: '수분 진정 토너 300ml',              cat: '뷰티',     price: 19800, origin: 28000,  rating: 4.8, reviews: 5240, sales: 7410, trend: 4,  seed: 'moment-toner' },
    { id: 10, brand: '그레이스', name: '스퀘어 토 메리제인 플랫',            cat: '슈즈',     price: 58000, origin: 89000,  rating: 4.6, reviews: 1188, sales: 7180, trend: 0,  seed: 'moment-flats' },
    { id: 11, brand: '어반핏',   name: '에어로 러닝 조거 팬츠',              cat: '의류',     price: 34000, origin: 59000,  rating: 4.7, reviews: 3905, sales: 6940, trend: -1, seed: 'moment-jogger' },
    { id: 12, brand: '루미에',   name: '글로우 쿠션 파운데이션 SPF50+',      cat: '뷰티',     price: 27000, origin: 38000,  rating: 4.9, reviews: 4471, sales: 6720, trend: 2,  seed: 'moment-cushion' },
    { id: 13, brand: '노트앤',   name: '미니 크로스 바디 백',                cat: '액세서리', price: 49000, origin: 79000,  rating: 4.5, reviews: 962,  sales: 6480, trend: 5,  seed: 'moment-bag' },
    { id: 14, brand: '포레스트', name: '워시드 린넨 커튼 2pc',               cat: '라이프',   price: 32000, origin: 55000,  rating: 4.6, reviews: 1337, sales: 6250, trend: 0,  seed: 'moment-curtain' },
    { id: 15, brand: '셀린',     name: '플리츠 미디 원피스',                cat: '의류',     price: 62000, origin: 108000, rating: 4.8, reviews: 1742, sales: 6010, trend: -2, seed: 'moment-dress' },
    { id: 16, brand: '볼드',     name: '첼시 앵클 부츠',                    cat: '슈즈',     price: 79000, origin: 139000, rating: 4.7, reviews: 2085, sales: 5780, trend: 1,  seed: 'moment-boots' },
    { id: 17, brand: '허브가든', name: '비건 핸드크림 3종 세트',             cat: '뷰티',     price: 15900, origin: 24000,  rating: 4.9, reviews: 3610, sales: 5540, trend: 3,  seed: 'moment-handcream' },
    { id: 18, brand: '미니멀리', name: '스퀘어 실버 메쉬 워치',              cat: '액세서리', price: 88000, origin: 145000, rating: 4.6, reviews: 741,  sales: 5310, trend: 0,  seed: 'moment-watch' },
    { id: 19, brand: '코지룸',   name: '워시드 코튼 이불 커버 세트',          cat: '라이프',   price: 59000, origin: 99000,  rating: 4.7, reviews: 1618, sales: 5080, trend: -1, seed: 'moment-bedding' },
    { id: 20, brand: '스텔라',   name: '캐시미어 블렌드 머플러',             cat: '액세서리', price: 42000, origin: 68000,  rating: 4.8, reviews: 2450, sales: 4840, trend: 2,  seed: 'moment-scarf' }
];



/* -- 상태 -- */
const state: State = {
    period: 'realtime',
    category: '전체',
    sort: 'popular',
    visible: 8,
    step: 8,
    wishlist: new Set([3, 7]),
    cart: 0
};

const PERIOD_META: Record<Period, PeriodMeta> = {
    realtime: { label: '실시간', time: '오늘 오전 09:00 기준', k: 0.42, trend: 800 },
    daily: { label: '일간', time: '오늘 오전 09:00 기준', k: 1, trend: 400 },
    weekly: { label: '주간', time: '이번 주 월요일 기준', k: 6.1, trend: 150 },
    monthly: { label: '월간', time: '이번 달 1일 기준', k: 24.5, trend: 0 }
};



/* -- 요소를 못 찾으면 바로 에러를 던져서, 이후 코드에서 null 걱정 없이 사용 -- */
function $<T extends HTMLElement>(selector: string): T {
    const el = document.querySelector<T>(selector);
    if (!el) throw new Error(`요소를 찾을 수 없습니다: ${selector}`);
    return el;
}

// HTML id="productGrid"
const grid = $<HTMLOListElement>('#productGrid');

// HTML id="emptyState"
const emptyState = $<HTMLParagraphElement>('#emptyState');

// HTML id="loadMore"
const loadMoreBtn = $<HTMLButtonElement>('#loadMore');

// HTML id="sortSelect"
const sortSelect = $<HTMLSelectElement>('#sortSelect');

// HTML id="toast"
const toastEl = $<HTMLDivElement>('#toast');

const won = (n: number): string => new Intl.NumberFormat('ko-KR').format(n);
const discountOf = (p: Product): number => Math.round((1 - p.price / p.origin) * 100);



/* -- 기간별 인기 점수 - 상품별로 결정적 (deterministic)으로 계산되어
      기간을 바꾸면 랭킹 순서가 실제로 달라집니다. -- */
function periodScore(p: Product, period: Period): number {
    const { k, trend } = PERIOD_META[period];
    const wobble = 0.82 + (((p.id * 137) % 23) / 23) * 0.36;
    return Math.round(p.sales * k * wobble + p.trend * trend);
}



/* -- 필터· 정렬 -- */
const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
    popular: (a, b) => periodScore(b, state.period) - periodScore(a, state.period),
    reviews: (a, b) => b.reviews - a.reviews,
    discount: (a, b) => discountOf(b) - discountOf(a),
    priceAsc: (a, b) => a.price - b.price,
    priceDesc: (a, b) => b.price - a.price
};

function getItems(): Product[] {
    return PRODUCTS
        .filter(p => state.category === '전체' || p.cat === state.category)
        .sort(sorters[state.sort]);
}



/* -- 렌더링 -- */
function trendMarkup(trend: number): string {
    // CSS .trend.new
    if (trend === 0) return '<span class="trend new">NEW</span>';
    
    // CSS .trend.up
    if (trend > 0) return `<span class="trend up">▲ ${trend}</span>`;

    // CSS .trend.down
    return `<span class="trend down">▼ ${Math.abs(trend)}</span>`;
}

function cardMarkup(p: Product, rank: number): string {
    // CSS .rank-1 ~ .rank-3
    const rankClass = rank <= 3 ? ` rank-${rank}` : '';

    // CSS .wish.on
    const wished = state.wishlist.has(p.id) ? ' on' : '';

    const img = `https://picsum.photos/seed/${p.seed}/600/750`;

    // 템플릿 HTML은 원본과 동일
    // data-wish / data-cart → 아래 이벤트 위임에서 closest('[data-wish]')로 찾음
    return `
    <li class="card" data-id="${p.id}">
        <div class="thumb">
            <a class="thumb-link" href="#" aria-label="${p.name} 상세 보기">
                <img src="${img}" alt="${p.brand} ${p.name}" width="600" height="750">
            </a>
            <span class="rank${rankClass}">${rank}</span>
            <button class="wish${wished}" type="button" data-wish="${p.id}" aria-label="${p.name} 찜하기" aria-pressed="${state.wishlist.has(p.id)}">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8.2a4.1 4.1 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20Z"
                    stroke="currentColor" stroke-width="1.7" fill="none" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
        <div class="body">
            <a class="brand" href="#">${p.brand}</a>
            <a class="name" href="#">${p.name}</a>
            <div class="price-row">
                <span class="rate">${discountOf(p)}%</span>
                <span class="price">${won(p.price)}<em>원</em></span>
            </div>
            <p class="origin">${won(p.origin)}원</p>
            <div class="meta">
                <span class="star" aria-hidden="true">★</span>
                <span class="rating">${p.rating.toFixed(1)}</span>
                <span class="dot" aria-hidden="true"></span>
                <span class="reviews">리뷰 ${won(p.reviews)}</span>
            </div>
            ${trendMarkup(p.trend)}
            <button class="cart" type="button" data-cart="${p.id}">장바구니 담기</button>
        </div>
    </li>`;
}

function render(): void {
    const items = getItems();
    const shown = items.slice(0, state.visible);

    grid.innerHTML = shown.map((p, i) => cardMarkup(p, i + 1)).join('');
    emptyState.hidden = items.length > 0;

    // textContent는 string 타입이라 숫자는 String()으로 변환
    $('#countNum').textContent = String(items.length);
    $('#updatedAt').textContent = PERIOD_META[state.period].time;

    const done = state.visible >= items.length;
    loadMoreBtn.disabled = done || items.length === 0;
    $('#moreCount').textContent = `(${Math.min(state.visible, items.length)}/${items.length})`;

    // 텍스트 노드 (null일 수 있음)
    const label = loadMoreBtn.firstChild;
    if (label) label.textContent = done ? '모든 상품을 확인했어요 ' : '베스트 상품 더보기 ';
}




/* -- 인터랙션 -- */
// 원본의 showToast._t 대신 변수로
let toastTimer: number | undefined;

function showToast(html: string): void {
    // CSS .toast.show
    toastEl.innerHTML = html;
    toastEl.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove('show'), 2200);
}

function syncHeader(): void {
    // HTML id="wishBadge"
    const wishBadge = $('#wishBadge');

    // CSS .badge.hide
    wishBadge.textContent = String(state.wishlist.size);
    wishBadge.classList.toggle('hide', state.wishlist.size === 0);

    // HTML id="cartBadge"
    const cartBadge = $('#cartBadge');
    cartBadge.textContent = state.cart > 99 ? '99+' : String(state.cart);
    cartBadge.classList.toggle('hide', state.cart === 0);
}



/* -- 기간 탭 -- */
// HTML class="period-btn"
const periodBtns = document.querySelectorAll<HTMLButtonElement>('.period-btn');
periodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.classList.contains('on')) return;
        
        // data-period → string | undefined
        const period = btn.dataset.period;

        // 이 줄을 지나면 period는 Period 타입
        if (!isOneOf(PERIODS, period)) return;

        periodBtns.forEach(b => {
            const on = b === btn;
            // CSS .period-btn.on
            b.classList.toggle('on', on);
            b.setAttribute('aria-selected', String(on));
        });
        state.period = period;
        state.visible = state.step;
        render();
    });
});



/* -- 카테고리 칩 -- */
// HTML class="chip"
const chips = document.querySelectorAll<HTMLButtonElement>('.chip');
chips.forEach(chip => {
    chip.addEventListener('click', () => {
        if (chip.classList.contains('on')) return;
        // data-cat
        const cat = chip.dataset.cat;
        if (!isOneOf(CATEGORY_FILTERS, cat)) return;

        chips.forEach(c => {
            const on = c === chip;
            c.classList.toggle('on', on);
            c.setAttribute('aria-selected', String(on));
        });
        state.category = cat;
        state.visible = state.step;
        render();
    });
});



/* -- 정렬 -- */
sortSelect.addEventListener('change', () => {
    // option value
    const value = sortSelect.value;
    if (!isOneOf(SORT_KEYS, value)) return;
    state.sort = value;
    state.visible = state.step;
    render();
});



/* -- 더보기 -- */
loadMoreBtn.addEventListener('click', () => {
    state.visible += state.step;
    render();
});



/* -- 찜 / 장바구니 (이벤트 위임) -- */
grid.addEventListener('click', (e: MouseEvent) => {
    // EventTarget | null 타입
    const target = e.target;
    
    // Element인지 확인해야 closest 사용 가능
    if (!(target instanceof Element)) return;

    // data-wish
    const wishBtn = target.closest<HTMLButtonElement>('[data-wish]');
    if (wishBtn) {
        const id = Number(wishBtn.dataset.wish);
        
        // Product | undefined
        const p = PRODUCTS.find(x => x.id === id);
        if (!p) return;

        if (state.wishlist.has(id)) {
            state.wishlist.delete(id);

            // CSS .wish.on 제거 → 빈 하트
            wishBtn.classList.remove('on');
            wishBtn.setAttribute('aria-pressed', 'false');
            showToast(`찜 목록에서 <b>${p.name}</b>을(를) 삭제했습니다.`);
        } else {
            state.wishlist.add(id);

            // CSS .wish.on 추가 → 빨간 하트
            wishBtn.classList.add('on');
            wishBtn.setAttribute('aria-pressed', 'true');
            showToast(`<span class="tk">♥</span> <b>${p.name}</b>을(를) 찜했습니다.`);
        }
        syncHeader();
        return;
    }

    // data-cart
    const cartBtn = target.closest<HTMLButtonElement>('[data-cart]');

    if (cartBtn) {
        const id = Number(cartBtn.dataset.cart);
        const p = PRODUCTS.find(x => x.id === id);
        if (!p) return;

        state.cart += 1;
        syncHeader();
        cartBtn.textContent = '담았어요 ✓';
        window.setTimeout(() => { cartBtn.textContent = '장바구니 담기'; }, 1400);
        showToast(`<span class="tk">✓</span> <b>${p.name}</b>을(를) 장바구니에 담았습니다.`);
    }
});



/* -- 초기 실행 -- */
syncHeader();
render();