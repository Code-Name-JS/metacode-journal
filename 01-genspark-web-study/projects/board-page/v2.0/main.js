/* =====================================================
   main-v2.js  –  board v2.0 Interactions
===================================================== */
console.log("main.js 연결 성공!");

'use strict';



/* -- 유틸 -- */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate = (t) => `${t.getFullYear()}.${String(t.getMonth()+1).padStart(2, '0')}.${String(t.getDate()).padStart(2, '0')}`;
const daysAgo = (n) => { const t = new Date(); t.setDate(t.getDate()-n); return fmtDate(t); };
const nf = (n) => Number(n).toLocaleString('ko-KR');
const AVATAR_COLORS = ['#4F6BF5', '#7C3AED', '#E5483D', '#12A594', '#F59E0B', '#D6409F', '#0EA5E9', '#65A30D'];
const avatarColor = (name) => AVATAR_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
const avatarHTML = (name) => `<span class="avatar" style="background:${avatarColor(name)}">${esc(name.charAt(0))}</span>`;



/* -- 더미 데이터 (데모용) -- */
