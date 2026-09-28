/* =====================================================
   script-v3.js  –  board v3.0 Interactions
===================================================== */

'use strict';



const $ = (s, c = document) => c.querySelector(s);



/* -- 더미 데이터 -- */
const posts = [
    { id: 1, category: '공지', title: '[필독] 게시판 이용 규칙 및 운영방침 안내', author: '운영팀', date: '2026-09-14', views: 342, isNotice: true, body: '안녕하세요, 운영팀입니다.\n\n새 게시판이 오픈되었습니다! 원활한 소통을 위해 아래 규칙을 지켜주세요.\n\n1. 상호 존중하는 언어를 사용해 주세요.\n2. 광고성 글은 사전 승인 없이 삭제될 수 있습니다.\n3. 개인정보가 포함된 게시물은 금지합니다.\n\n감사합니다.', comments: [{ name: '김민준', date: '2026-09-14', text: '규칙 잘 확인했습니다!' }, { name: '이서연', date: '2026-09-15', text: '새 게시판 예쁘네요. 좋은 소통 부탁드려요 :)' },
    ]},
    { id: 2, category: '공지', title: '서버 정기 점검 안내 (9/20 새벽 2시~4시)', author: '운영팀', date: '2026-09-13', views: 218, isNotice: true, body: '서버 안정화를 위한 정기 점검이 진행됩니다.\n\n- 일시: 9월 20일(토) 02:00 ~ 04:00\n- 내용: DB 백업 및 캐시 서버 교체\n\n점검 시간 동안 서비스 이용이 일시 중단될 수 있습니다.', comments: [
    ]},
    { id: 3, category: '이벤트', title: '신규 회원 이벤트 🎉 선물 챙겨가세요!', author: '강시우', date: '2026-09-12', views: 512, isNotice: false, body: '신규 회원 이벤트를 진행합니다!\n\n첫 글을 남기시면 모두에게 커피 쿠폰을 드립니다.\n많은 참여 부탁드려요 ☕', comments: [{ name: '박도윤', date: '2026-09-12', text: '이벤트 기간이 궁금해요!' }, { name: '강시우', date: '2026-09-12', text: '9월 말까지 진행됩니다 :)'},
    ]},
    { id: 4, category: '질문', title: '반응형 테이블이 모바일에서 카도로 바뀌는 원리가 뭔가요?', author: '최지우', date: '2026-09-11', views: 97, isNotice: false, body: 'CSS 미디어 쿼리에서 thead를 숨기고 tr을 block으로 바꾸만 되더라고요.\n혹시 접근성 측면에서 주의할 점이 있을까요?', comments: [{ name: '정하은', date: '2026-09-11', text: 'role 속성 유지가 중요합니다. 스크린리더 사용성을 꼭 테스트해 보세요.'}
    ]},
    { id: 5, category: '일반', title: '다크 모드 색상 조합 추천 부탁드립니다', author: '이서연', date: '2026-09-10', views: 156, isNotice: false, body: '배경 #0f1420 계열에서 primary 색을 뭘 쓰시나요?\n인디고 계열은 대비가 약간 아쉬운 느낌입니다.', comments: [
    ]},
    { id: 6, category: '일반', title: '게시글 조회수 중복 카운트는 어떻게 막나요?', author: '정하은', date: '2026-09-08', views: 64, isNotice: false, body: '차박 좋은 곳 발견했어요. 사진 첨부드립니다.\n\n(더미 본문입니다) 주말 나들이 코스로 강력 추천!', comments: [{ name: '최지우', date: '2026-09-09', text: '가을에 다녀와야겠네요 🍂'},
    ]},
    { id: 7, category: '질문', title: '게시글 조회수 중복 카운트는 어떻게 막나요?', author: '정하은', date: '2026-09-08', views: 64, isNotice: false, body: '새로고침할 때마다 조회수가 올라가는데, 쿠기나 세션 외에 좋은 방법이 있을까요?', comments: [
    ]},
    { id: 8, category: '이벤트', title: '9월 사진 콘텐스트 "가을의 시작" 접수 안내', author: '김민준', date: '2026-09-07', views: 203, isNotice: false, body: '테마: 가을의 시작\n접수 기간: 9/7 ~ 9/30\n\n여러분의 멋진 사진 기다립니다 📷', comments: [
    ]},
    { id: 9, category: '일반', title: '오늘 날씨가 정말 좋네요. 다들 점심 드셨나요?', author: '강시우', date: '2026-09-06', views: 45, isNotice: false, body: '잡담성 게시글입니다. 다들 즐거운 하루 보내세요!', comments: [{ name: '이서연', date: '2026-09-06', text: '아직이요 ㅎㅎ 뭐 드실지 고민 중'},
    ]},
    { id: 10, category: '일반', title: '이전 버전 게시판과 비교 후기 (디자인 관점)', author: '최지우', date: '2026-09-05', views: 132, isNotice: false, body: '카드 레이아웃이 도입되면서 가독성이 확실히 좋아졌어요.\n다만 테이블 헤더의 정보 밀도가 아쉽습니다.', comments: [
    ]},
    { id: 11, category: '질문', title: '페이지네이션 한 페이지당 게시글 수 변경 가능할까요?', author: '박도윤', date: '2026-09-04', views: 71, isNotice: false, body: '설정에서 바꿀 수 있게 해달라고 요청 드리고 싶습니다.', comments: [
    ]},
    { id: 12, category: '일반', title: '신규 입사자 인사드립니다! 반갑습니다 :)', author: '정하은', date: '2026-09-03', views: 189, isNotice: false, body: '디자인팀에 합류하게 된 정하은입니다.\n잘 부탁드립니다!', comments: [{ name: '김민준', date: '2026-09-03', text: '환영합니다!! 🎊'}, { name: '박도윤', date: '2026-09-04', text: '반가워요~' },
    ]},
];



/* -- 상태 & 상수 -- */
const PAGE_SIZE = 8;
let currentPage = 1;
let currentPostId = null;
let nextId = Math.max(...posts.map(p => p.id)) + 1;



/* -- 목록 렌더링 -- */
function getFiltered() {
    const q = $('#searchInput')?.value.trim().toLowerCase() || '';
    const cat = $('#categoryFilter')?.value || 'all';
    return posts
        .filter(p => cat === 'all' || p.category === cat)
        .filter(p => !q || p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q))
        .sort((a, b) => (Number(b.isNotice) - Number(a.isNotice)) || b.date.localeCompare(a.date)); 
}

function renderList() {
    const filtered = getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    const tbody = $('#tableBody');
    if (!tbody) return;

    if (!pageItems.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-row">등록된 게시글이 없습니다 🍃</td></tr>`;
    } else {
        tbody.innerHTML = pageItems.map(p => {
            
            const no = p.isNotice ? '📢' : filtered.indexOf(p) + 1;
            
            return `<tr data-id="${p.id}" class="${p.isNotice ? 'notice' : ''}" tabindex="0">
                <td class="col-no">${no}</td>
                <td class="col-cat"><span class="badge ${p.isNotice ? 'notice' : 'cat'}">${p.category}</span></td>
                <td class="title-cell">${escapeHtml(p.title)}${p.comments.length ? ` <span class="comment-count">💬${p.comments.length}</span>` : ''}
                    <div class="mobile-meta"><span>${p.author}</span><span>조회 ${p.views}</span></div>
                </td>
                <td class="col-author">${p.author}</td>
                <td class="col-date">${p.date}</td>
                <td class="col-views">${p.views}</td>
            </tr>`;
        }).join('');
    }



    /* -- 페이지네이션 -- */
    const pg = $('#pagination');
    if (!pg) return;
    pg.innerHTML = '';

    const prev = document.createElement('button');
    prev.className = 'page-btn';
    prev.textContent = '‹';
    prev.disabled = currentPage === 1;
    prev.onclick = () => { currentPage--; renderList(); };
    pg.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
        const b = document.createElement('button');
        b.className = 'page-btn' + (i === currentPage ? ' active' : '');
        b.textContent = i;
        b.onclick = () => { currentPage = i; renderList(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
        pg.appendChild(b);
    }

    const next = document.createElement('button');
    next.className = 'page-btn';
    next.textContent = '›';
    next.disabled = currentPage === totalPages;
    next.onclick = () => { currentPage++; renderList(); };
    pg.appendChild(next);
}



function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}



/* -- 상세 뷰 -- */
function openDetail(id, increaseView = true) {
    const p = posts.find(x => x.id === id);
    if (!p) return;
    currentPostId = id;

    if (increaseView) {
        p.views++; // 조회수 증가
    }

    $('#detailBadges').innerHTML =
    `<span class="badge ${p.isNotice ? 'notice' : 'cat'}">${p.category}</span>`;
    $('#detailTitle').textContent = p.title;
    $('#detailAuthor').textContent = `✍️ ${p.author}`;
    $('#detailDate').textContent = `🕐 ${p.date}`;
    $('#detailViews').textContent = `👁 조회 ${p.views}`;
    $('#detailBody').textContent = p.body;
    renderComments(p);

    $('#listView').style.display = 'none';
    $('#detailView').style.display = 'block';
    window.scrollTo({ top: 0 });
}

function renderComments(p) {
    $('#commentCount').textContent = `댓글 ${p.comments.length}`;
    $('#commentList').innerHTML = p.comments.length
        ? p.comments.map(c => `<div class="comment">
            <div class="avatar">${escapeHtml(c.name[0])}</div>
            <div class="c-body">
                <span class="c-name">${escapeHtml(c.name)}</span><span class="c-date">${c.date}</span>
                <div class="c-text">${escapeHtml(c.text)}</div>
            </div>
        </div>`).join('')  // </div> 로 정상 수정
        : `<p style="color:var(--text-sub); font-size: 14px; padding: 8px 0;">첫 댓글의 주인공이 되어보세요 ✨</p>`;
}

function showList(updateHistory = true) {
    $('#detailView').style.display = 'none';
    $('#listView').style.display = 'block';
    currentPostId = null;

    if (updateHistory) {
        history.pushState({ page: 'list', postId: null, currentPage }, '', location.pathname);
    }
    renderList();
}



/* -- 이벤트 바인딩 -- */
const postButton = document.querySelector('#postButton');
postButton?.addEventListener('click', () => {
    if (posts.length) {
        posts[0].views += 1;
        renderList();
    }
});



/* -- 목록으로 돌아가기 버튼 대응 -- */
$('#backToList')?.addEventListener('click', () => showList());
$('#backBtn')?.addEventListener('click', () => showList());



/* -- 게시판 클릭 & 키보드 이동 -- */
function handlePostSelect(target) {
    const tr = target.closest('tr[data-id]');
    if (tr) {
        const postId = Number(tr.dataset.id);
        history.pushState({ page: 'detail', postId, currentPage }, '', `?post=${postId}`);
        openDetail(postId);
    }
}

$('#tableBody')?.addEventListener('click', e => handlePostSelect(e.target));
$('#tableBody')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handlePostSelect(e.target);
});



/* -- 검색 및 필터 -- */
$('#searchInput')?.addEventListener('input', () => { currentPage = 1; renderList(); });
$('#categoryFilter')?.addEventListener('change', () => { currentPage = 1; renderList(); });



/* -- 댓글 작성 -- */
$('#commentForm').addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#commentInput');
    const text = input.value.trim();
    if (!text || !currentPostId) return;

    const p = posts.find(x => x.id === currentPostId);
    if (p) {
        p.comments.push({ name: '나', date: '2026-09-16', text });
        input.value = '';
        renderComments(p);
    }
});



/* -- 브라우저 히스토리 -- */
history.replaceState({ page: 'list', postId: null, currentPage }, '', location.href);

window.addEventListener('popstate', event => {
    const state = event.state;

    // 게시글 상세
    if (state?.page === 'detail' && state.postId != null) {
        if (state.currentPage != null) currentPage = state.currentPage;
        openDetail(state.postId, false); // 뒤로가기 이동 시 불필요한 조회수 중복 증가 방지
        return;
    }

    if (state?.currentPage != null) {
        currentPage = state.currentPage;
    }
    showList(false);
});



/* -- 글쓰기 모달 -- */
function closeModal() { $('#writeModal')?.classList.remove('open'); }

$('#writeBtn')?.addEventListener('click', () => $('#writeModal')?.classList.add('open'));
$('#writeModal')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });

$('#writeForm').addEventListener('submit', e => {
    e.preventDefault();
    const title = $('#wTitle').value.trim();
    const body = $('#wBody').value.trim();
    if (!title || !body) return;

    posts.unshift({
        id: nextId++, category: $('#wCategory').value, title, body, author: '나', date: '2026-09-16', views: 0, isNotice: false, comments: []
    });

    closeModal();
    $('#wTitle').value = '';
    $('#wBody').value = '';
    currentPage = 1;
    showList();
});



/* -- 다크 모드 -- */
$('#themeToggle')?.addEventListener('click', () => {
    const root = document.documentElement;
    const dark = root.dataset.theme === 'dark';
    root.dataset.theme = dark ? 'light' : 'dark';
    $('#themeToggle').textContent = dark ? '🌙' : '☀️';
});



/* -- 초기 렌더 -- */
const urlParams = new URLSearchParams(window.location.search);
const initPostId = Number(urlParams.get('post'));

if (initPostId && posts.some(p => p.id === initPostId)) {
    openDetail(initPostId);
} else {
    renderList();
}