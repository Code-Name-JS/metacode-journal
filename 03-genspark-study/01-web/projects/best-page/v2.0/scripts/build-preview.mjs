import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let html = readFileSync(resolve(root, 'index.html'), 'utf8');
const css = readFileSync(resolve(root, 'styles.css'), 'utf8');
const js = readFileSync(resolve(root, 'dist/main.js'), 'utf8');

html = html.replace(
  '<link rel="stylesheet" href="styles.css" />',
  '<style>\n' + css + '\n</style>'
);
html = html.replace(
  '<script type="module" src="dist/main.js"></script>',
  '<script>\n' + js.replace(/<\/script>/g, '<\\/script>') + '\n</script>'
);
if (html.includes('<link rel="stylesheet"') || html.includes('src="dist/main.js"')) {
  throw new Error('인라인 치환 실패: 미치환 참조가 남아 있습니다.');
}
writeFileSync(resolve(root, 'preview.html'), html, 'utf8');
console.log('preview.html 생성 완료 (' + html.length + ' bytes)');
