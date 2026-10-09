/* =========================================================================
 * BESTPICK — 베스트 상품 랭킹 페이지 (TypeScript)
 * 데이터: data/products.json (fetch 실패 시 index.html 내장 JSON 폴백)
 * ========================================================================= */

/* -- 타입 정의 -- */
type CategoryKey = 'all' | 'digital' | 'fashion' | 'beauty' | 'living' | 'food';
type SortKey = 'rank' | 'priceAsc' | 'priceDesc' | 'rating' | 'reviews' | 'discount';

interface Product {
    id: string;
    rank: number;
    name: string;
    brand: string;
    category: Exclude<CategoryKey, 'all'>;
    price: number;
    originalPrice: number;
    rating: number;
    reviews: number;
    badge: string;
    tags: string[];
    image: string;
    trend: number; // 순위 변동 (양수=상승, 음수=하락, 0=유지)
}

interface CartLine {
    id: string;
    qty: number;
}

interface CategoryMeta {
    key: CategoryKey;
    label: string;
}

interface SortMeta {
    key: SortKey;
    label: string;
}

interface AppState {
    products: Product[];
    category: CategoryKey;
    sort: SortKey;
    query: string;
    wishOnly: boolean;
    wishlist: Set<string>;
    cart: Map<string, number>;
}



/* -- 상수 -- */
const CATEGORIES: CategoryMeta[] = [
    { key: 'all', label: '전체' },
    { key: 'digital', label: '디지털' },
    { key: 'fashion', label: '패션' },
    { key: 'beauty', label: '뷰터' },
    { key: 'living', label: '리빙' },
    { key: 'food', label: '푸드' },
];

const SORTS: SortMeta[] = [
    { key: 'rank', label: '랭킹순' },
    { key: 'rating', label: '평점 높은순' },
    { key: 'reviews', label: '리뷰 많은순' },
    { key: 'discount', label: '할인율 높은순' },
    { key: 'priceAsc', label: '낮은 가격순' },
    { key: 'priceDesc', label: '높은 가격순' },
];

const STORE_KEYS = { wish: 'bestpick.wishlist.v1', cart: 'bestpick.cart.v1' } as const;



/* -- DOM 헬퍼 -- */
function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`#${id} 요소를 찾을 수 없습니다.`);
  return node as T;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const won = (value: number): string => `${Math.round(value).toLocaleString('ko-KR')}원`;
const discountRate = (p: Product): number =>
    p.originalPrice > p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;



/* -- 상태 -- */
const state: AppState = {
    products: [],
    category: 'all',
    sort: 'rank',
    query: '',
    wishOnly: false,
    wishlist: new Set<string>(),
    cart: new Map<string, number>(),
};



/* -- 저장소 -- */
function loadStore(): void {
    try {
        const rawWish = localStorage.getItem(STORE_KEYS.wish);
        if (rawWish) (JSON.parse(rawWish) as string[]).forEach((id) => state.wishlist.add(id));

        const rawCart = localStorage.getItem(STORE_KEYS.cart);
        if (rawCart) {
            (JSON.parse(rawCart) as CartLine[]).forEach((line) => {
                if (typeof line.id === 'string' && typeof line.qty === 'number') state.cart.set(line.id, line.qty);
            });
        }
    } catch {
        /* 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)은 무시하고 진행 */
    }
}

function persist(): void {
    try {
        localStorage.setItem(STORE_KEYS.wish, JSON.stringify([...state.wishlist]));
        localStorage.setItem(
            STORE_KEYS.cart,
            JSON.stringify([...state.cart.entries()].map(([id, qty]) => ({ id, qty }))),
        );
    } catch {
        /* 저장 실패는 조용히 무시 */
    }
}



/* -- 데이터 로딩 -- */
function readFallback(): Product[] {
    const node = document.getElementById('products-fallback');
    if (!node || !node.textContent) return [];
    try {
        return JSON.parse(node.textContent) as Product[];
    } catch {
        return [];
    }
}

async function loadProducts(): Promise<Product[]> {
    try {
        const res = await fetch('data/products.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as Product[];
    } catch {
        // file:// 로 열었거나 fetch가 막힌 경우 내장 데이터로 폴백
        return readFallback();
    }
}



/* -- 필터 / 정렬 -- */
function matchesQuery(p: Product, query: string): boolean {
    if (!query) return true;
    const haystack = [p.name, p.brand, p.badge, ...p.tags].join(' ').toLowerCase();
    return query
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .every((token) => haystack.includes(token));
}

function visibleProducts(): Product[] {
    const list = state.products.filter((p) => {
        if (state.category !== 'all' && p.category !== state.category) return false;
        if (state.wishOnly && !state.wishlist.has(p.id)) return false;
        return matchesQuery(p, state.query);
    });

    const bySort: Record<SortKey, (a: Product, b: Product) => number> = {
        rank: (a, b) => a.rank - b.rank,
        priceAsc: (a, b) => a.price - b.price,
        priceDesc: (a, b) => b.price - a.price,
        rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
        reviews: (a, b) => b.reviews = a.reviews,
        discount: (a, b) => discountRate(b) - discountRate(a),
    };

    return list.sort(bySort[state.sort]);
}



/* -- 렌더링 -- */
function trendMarkup(trend: number): string {
    if (trend > 0) return `<span class="trend up">▲ ${trend}</span>`;
    if (trend < 0) return `<span class="trend down">▼ ${Math.abs(trend)}</span>`;
    return '<span class="trend same">- 0</span>';
}

function cardMarkup(p: Product): string {
    const rate = discountRate(p);
    const wished = state.wishlist.has(p.id);
    const rankClass = p.rank === 1 ? 'top1' : p.rank === 2 ? 'top2' : p.rank === 3 ? 'top3' : '';

    return `
        <article class="card" data-id="${p.id}">
            <div class="card-thumb">
                <span class="rank-badge ${rankClass}">${p.rank}</span>
                <button class="wish-btn ${wished ? 'is-on' : ''}" type="button"
                    data-action="wish" data-id="${p.id}"
                    aria-pressed="${wished}" aria-label="${escapeHtml(p.name)} 찜하기">
                    ${wished ? '♥' : '♡'}
                </button>
                <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy" />
            </div>
            <div class="card-body">
                <div class="card-top">
                    <span class="chip">${escapeHtml(CATEGORIES.find((c) => c.key === p.category)?.label ?? p.category)}</span>
                    <span class="badge">${escapeHtml(p.badge)}</span>
                    ${trendMarkup(p.trend)}
                </div>
                <p class="brand-name">${escapeHtml(p.brand)}</p>
                <h3 class="card-title">${escapeHtml(p.name)}</h3>
                <div class="rating-row">
                    <span class="star">★</span>
                    <b>${p.rating.toFixed(1)}</b>
                    <span class="reviews">리뷰 ${p.reviews.toLocaleString('ko-KR')}개</span>
                </div>
                <div class="price-row">
                    ${rate > 0 ? `<span class="discount">${rate}%</span>` : ''}
                    <span class="price">${won(p.price)}</span>
                    ${rate > 0 ? `<span class="origin">${won(p.originalPrice)}</span>` : ''}
                </div>
                <div calss="card-actions">
                    <button class="primary-btn" type="button" data-action="add" data-id="${p.id}">장바구니 담기</button>
                    <button class="ghost-btn" type="button" data-action="detail" data-id="${p.id}">상세</button>
                </div>
            </div>
        </article>`;
}

function render<T extends HTMLElement>(target: T, html: string): void {
    target.innerHTML = html;
}

function renderSkeleton(count: number): void {
    const card = `<div class="skeleton"><div class="sk-thumb"></div>
        <div class="sk-line short"></div><div class="sk-line tall"></div>
        <div class="sk-line"></div><div class="sk-line short"></div>`;
    render(el('product-grid'), card.repeat(count));
}

function renderTabs(): void {
    const html = CATEGORIES.map((c) => {
        const count = c.key === 'all' ? state.products.length : state.products.filter((p) => p.category === c.key).length;
        const active = state.category === c.key ? 'is-active' : '';
        return `<button class="tab ${active}" type="button" role="tab" aria-selected="${state.category === c.key}"
            data-category="${c.key}">${c.label}<span class="tab-count">${count}</span></button>`;
    }).join('');
    render(el('category-tabs'), html);
}

function renderSortOptions(): void {
    const select = el<HTMLSelectElement>('sort-select');
    select.innerHTML = SORTS.map((s) => `<option value="${s.key}">${s.label}</option>`).join('');
    select.value = state.sort;
}

function renderProdusts(): void {
    const list = visibleProducts();
    const grid = el('product-grid');
    const empty = el('empty-state');

    el('result-count').textContent = `전체 ${list.length}개`;

    if (list.length === 0) {
        grid.innerHTML = '';
        empty.hidden = false;
        return;
    }

    empty.hidden = true;
    render(grid, list.map(cardMarkup).join(''));
}

function renderHeroStats(): void {
    const categories = new Set(state.products.map((p) => p.category));
    el('stat-count').textContent = String(state.products.length);
    el('stat-category').textContent = String(categories.size);
    const now = new Date();
    el('stat-updated').textContent = `${String(now.getHours()).padStart(2, '0')}"${String(now.getMinutes()).padStart(2, '0')}`;
}

function renderCart(): void {
    const lines = [...state.cart.entries()]
        .map(([id, qty]) => ({ product: state.products.find((p) => p.id === id), qty}))
        .filter((line): line is { product: Product; qty: number } => Boolean(line.product));

    const totalQty = lines.reduce((sum, line) => sum + line.qty, 0);
    const totalPrice = lines.reduce((sum, line) => sum + line.product.price * line.qty, 0);
 
    el('cart-count').textContent = String(totalQty);
    el('cart-qty').textContent = String(totalQty);
    el('cart-total').textContent = won(totalPrice);
    el<HTMLButtonElement>('checkout-btn').disabled = totalQty === 0;

    if (lines.length === 0) {
        render(el('cart-lines'), '<p class="cart-empty">장바구니가 비어 있습니다.<br />마음에 드는 상품을 담아보세요.</p>');
        return;
    }

    render(
    el('cart-lines'),
    lines
      .map(
        ({ product, qty }) => `
      <div class="cart-line">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" />
        <div class="cl-info">
          <p class="cl-name">${escapeHtml(product.name)}</p>
          <span class="cl-price">${won(product.price * qty)}</span>
          <div class="qty-box">
            <button type="button" data-action="dec" data-id="${product.id}" aria-label="수량 감소">−</button>
            <span>${qty}</span>
            <button type="button" data-action="inc" data-id="${product.id}" aria-label="수량 증가">+</button>
          </div>
        </div>
        <button class="cl-remove" type="button" data-action="remove" data-id="${product.id}">삭제</button>
      </div>`,
      )
      .join(''),
  );
}