/**
 * data/products.json 을 index.html 의 <script id="products-fallback"> 안에 주입합니다.
 * (file:// 로 열거나 fetch 가 막힌 환경에서도 상품이 보이도록 하는 빌드 단계)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = resolve(root, 'index.html');
const jsonPath = resolve(root, 'data/products.json');

const raw = readFileSync(jsonPath, 'utf8');
const data = JSON.parse(raw); // 유효성 검사 겸용
const compact = JSON.stringify(data).replace(/<\//g, '<\\/');

const html = readFileSync(htmlPath, 'utf8');
const MARKER = '/*__PRODUCTS_FALLBACK__*/';

if (!html.includes(MARKER)) {
  console.log('이미 주입되어 있습니다. (마커 없음) — 건너뜁니다.');
  process.exit(0);
}

writeFileSync(htmlPath, html.replace(MARKER, compact), 'utf8');
console.log(`폴백 데이터 주입 완료: 상품 ${data.length}개 -> index.html`);
