
/* =============================================
   NOTICE BOARD – main.js
   ============================================= */


   'use strict';


   /* ── 상태 ── */
   let allNotices    = [];
   let filteredList  = [];
   let currentCat    = '전체';
   let currentPage   = 1;
   const PAGE_SIZE   = 5;
   let currentIdx    = -1;   // 모달에서 보고 있는 항목 index (filteredList 기준)   
   let searchQuery   = '';



   /* ── DOM 참조 ── */
   const pinnedArea   = document.getElementById('pinnedArea');
   const noticeBody   = document.getElementById('noticeBody');
   const pagination   = document.getElementById('pagination');
   const filterTabs   = document.getElementById('filterTabs');
   const sortSelect   = document.getElementById('sortSelect');
   const searchInput  = document.getElementById('searchInput');

   const detailModal  = document.getElementById('detailModal');
   const writeModal   = document.getElementById('writeModal');



/* ============================================================
   1. 데이터 로드
   ============================================================ */

   async function loadNotices() {
      try {
         const res  = await fetch('tables/notices?limit=100&sort=date');
         const json = await res.json();
         allNotices = json.data || [];
         updateStats();
         applyFilterAndSort();
      }  catch (e) {
            console.error('공지사항 로드 실패:', e);
            showToast('데이터를 불러오는 데 실패했습니다.', 'error');
         }
   }



/* ============================================================
   2. 통계 업데이트
   ============================================================ */
   
   function updateStats() {
      const total     = allNotices.length;
      const pinned    = allNotices.filter(n => n.is_pinned).length;
      const important = allNotices.filter(n => n.is_important).length;
      const views     = allNotices.reduce((s, n) => s + (n.view_count || 0), 0);

      animateCount('statTotal',     total);
      animateCount('statPinned',    pinned);
      animateCount('statImportant', important);
      animateCount('statViews',     views);
   }

   function animateCount(id, target) {
      const el = document.getElementById(id);
      let cur = 0;
      const step = Math.ceil(target / 40);
      const timer = setInterval(() => {
         cur = Math.min(cur + step, target);
         el.textContent = cur.toLocaleString();
         if (cur >= target) clearInterval(timer);
      }, 30);
   }



/* ============================================================
   3. 필터 & 정렬 & 검색
   ============================================================ */

   function applyFilterAndSort() {
      let list = [...allNotices];

      // 검색
      if (searchQuery.trim()) {
         const q = searchQuery.trim().toLowerCase();
         list = list.filter(n =>
         n.title.toLowerCase().includes(q) ||
         (n.content && n.content.toLowerCase().includes(q))
         );
      }

      // 카테고리 필터
      if (currentCat !== '전체') {
         list = list.filter(n => n.category === currentCat);
      }

      // 정렬
      const sort = sortSelect.value;
      if (sort === 'newest') {
         list.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (sort === 'oldest') {
      list.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else if (sort === 'views') {
      list.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
      }

      filteredList = list;
      currentPage = 1;
      renderList();
   }



/* ============================================================
   4. 목록 렌더링
   ============================================================ */
   function renderList() {
      renderPinned();
      renderTable();
      renderPagination();
   }

   /* ── 고정 공지 카드 ── */
   function renderPinned() {
      const pins = filteredList.filter(n => n.is_pinned);
      if (!pins.length || currentCat !== '전체' || searchQuery) {
         pinnedArea.innerHTML = '';
         return;
      }

      pinnedArea.innerHTML = `
         <div class="pinned-wrap">
            <p class="pinned-label"><i class="fa-solid fa-thumbtack"></i> 고정 공지</p>
            <div class="pinned-cards">
               ${pins.map(n => `
                  <article class="pinned-card" onclick="openDetail('${n.id}')">
                     <span class="pin-badge"><i class="fa-solid fa-thumbtack"></i> 고정</span>
                        <p class="pc-cat">${n.category}</p>
                        <p class="pc-title">${escHtml(n.title)}</p>
                           <div class="pc-footer">
                              <span>${escHtml(n.author)}</span>
                              <span>${n.date}</span>
                           </div>
                  </article>
               `).join('')}
            </div>
         </div>
      `;
   }



   /* ── 테이블 ── */
   function renderTable() {
      // 고정 공지 제외한 나머지 페이징
      const nonPinned = filteredList.filter(n => !n.is_pinned || currentCat !== '전체' || searchQuery);
      const total     = nonPinned.length;
      const start     = (currentPage - 1) * PAGE_SIZE;
      const slice     = nonPinned.slice(start, start + PAGE_SIZE);

   if (!slice.length && !filteredList.length) {
      noticeBody.innerHTML = `
         <tr class="empty-row">
            <td colspan="6">
               <span class="empty-icon">🔍</span>
               검색 결과가 없습니다.
            </td>
         </tr>`;
      return;
   }



   noticeBody.innerHTML = slice.map((n, i) => {
      const rowNum = total - start - i;
      return `
         <tr onclick="openDetail('${n.id}')" tabindex="0" onkeydown="if(event.key==='Enter')openDetail('${n.id}')">
            <td class="td-num">${rowNum}</td>
            <td><span class="badge badge-${n.category}">${n.category}</span></td>
            <td>
               <div class="title-wrap">
                  <span class="title-text">${escHtml(n.title)}</span>
                  ${n.is_important ? '<span class="badge-important"><i class="fa-solid fa-circle-exclamation"></i> 중요</span>' : ''}
               </div>
            </td>
            <td class="td-author">${escHtml(n.author)}</td>
            <td class="td-date">${n.date}</td>
            <td class="td-view"><i class="fa-regular fa-eye" style="font-size:.8rem;margin-right:4px;"></i>${(n.view_count || 0).toLocaleString()}</td>
         </tr>
      `;
      }).join('');
   }



   /* ── 페이지네이션 ── */
   function renderPagination() {
      const nonPinned = filteredList.filter(n => !n.is_pinned || currentCat !== '전체' || searchQuery);
      const totalPages = Math.ceil(nonPinned.length / PAGE_SIZE);
      if (totalPages <= 1) { pagination.innerHTML = ''; return; }

      let html = '';

      // 이전 버튼
      html += `<button class="page-btn" onclick="goPage(${currentPage-1})" ${currentPage===1?'disabled':''}><i class="fa-solid fa-chevron-left"></i></button>`;

      // 페이지 번호
      const maxShow = 5;
      let sPage = Math.max(1, currentPage - Math.floor(maxShow/2));
      let ePage  = Math.min(totalPages, sPage + maxShow - 1);
      if (ePage - sPage < maxShow - 1) sPage = Math.max(1, ePage - maxShow + 1);

      if (sPage > 1) {
         html += `<button class="page-btn" onclick="goPage(1)">1</button>`;
         if (sPage > 2) html += `<span style="color:var(--text-muted);padding:0 4px">…</span>`;
      }
      for (let p = sPage; p <= ePage; p++) {
         html += `<button class="page-btn ${p===currentPage?'active':''}" onclick="goPage(${p})">${p}</button>`;
      }
      if (ePage < totalPages) {
         if (ePage < totalPages - 1) html += `<span style="color:var(--text-muted);padding:0 4px">…</span>`;
         html += `<button class="page-btn" onclick="goPage(${totalPages})">${totalPages}</button>`;
      }

      // 다음 버튼
      html += `<button class="page-btn" onclick="goPage(${currentPage+1})" ${currentPage===totalPages?'disabled':''}><i class="fa-solid fa-chevron-right"></i></button>`;

      pagination.innerHTML = html;
   }

   function goPage(p) {
      const nonPinned  = filteredList.filter(n => !n.is_pinned || currentCat !== '전체' || searchQuery);
      const totalPages = Math.ceil(nonPinned.length / PAGE_SIZE);
      if (p < 1 || p > totalPages) return;
      currentPage = p;
      renderTable();
      renderPagination();
      document.querySelector('.notice-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
   } 



/* ============================================================
   5. 상세 모달
   ============================================================ */
   function openDetail(id) {
      const notice = allNotices.find(n => n.id === id);
      if (!notice) return;

      // filteredList에서 index 찾기
      currentIdx = filteredList.findIndex(n => n.id === id);

      // 조회수 UI 즉시 +1
      notice.view_count = (notice.view_count || 0) + 1;

      // 모달 채우기
      const catEl = document.getElementById('modalCategory');
      catEl.textContent = notice.category;
      catEl.className = `modal-category badge badge-${notice.category}`;

      const impEl = document.getElementById('modalImportant');
      impEl.style.display = notice.is_important ? 'inline-flex' : 'none';

      document.getElementById('modalTitle').textContent   = notice.title;
      document.getElementById('modalAuthor').textContent  = notice.author;
      document.getElementById('modalDate').textContent    = notice.date;
      document.getElementById('modalViews').textContent   = notice.view_count.toLocaleString() + '회';
      document.getElementById('modalContent').innerHTML   = notice.content
         ? notice.content.replace(/\n/g, '<br>') : '';

         // 이전/다음 버튼
         document.getElementById('btnPrev').disabled = currentIdx <= 0;
         document.getElementById('btnNext').disabled = currentIdx >= filteredList.length - 1;

         openModal('detailModal');

         // 서버 조회수 업데이트 (비동기, 실패해도 무방)
         fetch(`tables/notices/${notice.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ view_count: notice.view_count })
         }).catch(() => {});
   }

   function closeModal() {
      detailModal.classList.remove('open');
      document.body.style.overflow = '';
   }

   /* 이전 글 */
   document.getElementById('btnPrev').addEventListener('click', () => {
      if (currentIdx > 0) openDetail(filteredList[currentIdx - 1].id);
   });
   /* 다음 글 */
   document.getElementById('btnNext').addEventListener('click', () => {
      if (currentIdx < filteredList.length - 1) openDetail(filteredList[currentIdx + 1].id);
   });



/* ============================================================
   6. 글쓰기 모달
   ============================================================ */
   document.getElementById('btnOpenModal').addEventListener('click', () => {
      openModal('writeModal');
   });

   function closeWriteModal() {
      writeModal.classList.remove('open');
      document.body.style.overflow = '';
      document.getElementById('writeForm').reset();
      document.getElementById('titleCount').textContent = '0 / 100';
   }

   document.getElementById('formTitle').addEventListener('input', function () {
      document.getElementById('titleCount').textContent = `${this.value.length} / 100`;
   });

   async function submitNotice() {
      const title   = document.getElementById('formTitle').value.trim();
      const content = document.getElementById('formContent').value.trim();
      if (!title)   { showToast('제목을 입력해 주세요.', 'error'); return; }
      if (!content) { showToast('내용을 입력해 주세요.', 'error'); return; }

      const payload = {
         category:     document.getElementById('formCategory').value,
         title,
         content,
         author:       document.getElementById('formAuthor').value.trim() || '관리자',
         is_pinned:    document.getElementById('formPinned').checked,
         is_important: document.getElementById('formImportant').checked,
         view_count:   0,
         date:         new Date().toISOString().slice(0, 10)
      };

      const btn = document.querySelector('.btn-submit');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 등록 중...';

      try {
         const res = await fetch('tables/notices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         });
         if (!res.ok) throw new Error('서버 오류');
         showToast('공지사항이 등록되었습니다!', 'success');
         closeWriteModal();
         await loadNotices();
      } catch (e) {
         showToast('등록에 실패했습니다.', 'error');
      } finally {
         btn.disabled = false;
         btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> 등록하기';
      }
   }



/* ============================================================
   7. 필터 탭 이벤트
   ============================================================ */
   filterTabs.addEventListener('click', e => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      filterTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCat = btn.dataset.cat;
      applyFilterAndSort();
   });



/* ============================================================
   8. 검색
   ============================================================ */
   function doSearch() {
      searchQuery = searchInput.value;
      applyFilterAndSort();
   }

   searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') doSearch();
   });



/* ============================================================
   9. 모달 헬퍼
   ============================================================ */
   function openModal(id) {
      document.getElementById(id).classList.add('open');
      document.body.style.overflow = 'hidden';
   }

   // 오버레이 클릭 시 닫기
   detailModal.addEventListener('click', e => {
      if (e.target === detailModal) closeModal();
   });
   writeModal.addEventListener('click', e => {
      if (e.target === writeModal) closeWriteModal();
   });

   document.getElementById('modalClose').addEventListener('click', closeModal);
   document.getElementById('writeModalClose').addEventListener('click', closeWriteModal);

   // ESC 키
   document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
         if (detailModal.classList.contains('open')) closeModal();
         if (writeModal.classList.contains('open'))  closeWriteModal();
      }
   });


  
/* ============================================================
   10. Toast
   ============================================================ */
   function showToast(msg, type = 'info') {
      const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
      const wrap  = document.getElementById('toastWrap');
      const div   = document.createElement('div');
      div.className = `toast ${type}`;
      div.innerHTML = `<i class="fa-solid ${icons[type]}"></i>${escHtml(msg)}`;
      wrap.appendChild(div);
      setTimeout(() => {
         div.classList.add('hide');
         div.addEventListener('animationend', () => div.remove());
      }, 3000);
   }



/* ============================================================
   11. 유틸
   ============================================================ */
   function escHtml(str) {
      return String(str)
         .replace(/&/g,'&amp;').replace(/</g,'&lt;')
         .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
   }

   /* ── 초기 실행 ── */
   loadNotices();
