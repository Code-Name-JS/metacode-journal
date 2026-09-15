"use strict";

/* ════════════════════════════════════════════
   게시판 시안 — 더미 데이터
════════════════════════════════════════════ */
const POSTS = [
  { id: 1,  category: "공지",   isNotice: true,  title: "홈페이지 리뉴얼 오픈 안내",                                  writer: "운영팀",   date: "2026-09-05", hits: 482,  content: "안녕하세요, 샘플컴퍼니입니다.\n\n보다 나은 서비스 제공을 위해 홈페이지를 전면 리뉴얼하였습니다.\n새로워진 디자인과 개선된 기능을 확인해 보세요.\n\n- 반응형 웹 지원 (모바일/태블릿 최적화)\n- 게시판 및 고객지원 기능 개선\n- 웹 접근성 강화 (키보드 탐색 지원)\n\n이용 중 불편한 점은 고객지원을 통해 알려주세요.\n감사합니다.", attachments: [{ name: "리뉴얼_안내문.pdf", size: "1.2MB" }] },
  { id: 2,  category: "공지",   isNotice: true,  title: "추석 연휴 고객센터 운영 안내",                                writer: "고객지원팀", date: "2026-09-04", hits: 317,  content: "추석 연휴 기간 고객센터 운영 안내입니다.\n\n- 휴무일: 9월 25일(금) ~ 9월 28일(월)\n- 정상 운영: 9월 29일(화) 09:00부터\n\n연휴 중 문의사항은 1:1 문의 게시판에 남겨주시면 순차적으로 답변드리겠습니다.", attachments: [] },
  { id: 3,  category: "이벤트", isNotice: false, title: "9월 신규회원 이벤트 — 스타벅스 기프티콘 증정",                writer: "마케팅팀", date: "2026-09-03", hits: 1245, content: "9월 신규회원 이벤트 안내!\n\n기간: 9월 1일 ~ 9월 30일\n대상: 9월 내 회원가입한 신규 회원 전원\n혜택: 스타벅스 아메리카노 기프티콘\n\n이벤트 페이지에서 지금 바로 참여하세요!", attachments: [] },
  { id: 4,  category: "소식",   isNotice: false, title: "2026 상반기 신제품 출시 소식",                                writer: "기획팀",   date: "2026-09-01", hits: 658,  content: "2026년 상반기 신제품이 출시되었습니다.\n\n더욱 가벼워진 무게와 개선된 배터리 효율로 돌아왔습니다.\n자세한 사양은 서비스 페이지에서 확인해 주세요.", attachments: [{ name: "신제품_카탈로그.pdf", size: "4.8MB" }, { name: "제품_이미지.zip", size: "12.3MB" }] },
  { id: 5,  category: "채용",   isNotice: false, title: "[채용] 2026년 하반기 신입/경력 직원 모집",                    writer: "인사팀",   date: "2026-08-28", hits: 890,  content: "샘플컴퍼니와 함께 성장할 인재를 찾습니다.\n\n모집부문\n- 프론트엔드 개발자 (경력 3년 이상)\n- UI/UX 디자이너 (경력 무관)\n- 영업지원 (신입)\n\n지원방법: 채용 페이지에서 입사지원\n접수기간: 9월 10일까지", attachments: [] },
  { id: 6,  category: "소식",   isNotice: false, title: "서비스 점검 안내 (9/7 새벽 2시~5시)",                          writer: "개발팀",   date: "2026-08-25", hits: 203,  content: "서비스 안정화를 위한 정기 점검이 진행됩니다.\n\n점검 시간: 9월 7일 새벽 02:00 ~ 05:00 (3시간)\n점검 내용: 서버 인프라 업그레이드\n\n해당 시간 동안 서비스 이용이 일시 중단됩니다.\n양해 부탁드립니다.", attachments: [] },
  { id: 7,  category: "이벤트", isNotice: false, title: "리뷰 작성 이벤트 — 최대 5,000P 적립",                          writer: "마케팅팀", date: "2026-08-20", hits: 734,  content: "상품 리뷰를 작성하면 포인트를 드립니다!\n\n- 사진 리뷰: 5,000P\n- 텍스트 리뷰: 1,000P\n\n포인트는 리뷰 확인 후 3일 이내 적립됩니다.", attachments: [] },
  { id: 8,  category: "공지",   isNotice: false, title: "개인정보처리방침 개정 안내 (9/1 시행)",                        writer: "운영팀",   date: "2026-08-15", hits: 156,  content: "개인정보처리방침이 아래와 같이 개정되어 안내드립니다.\n\n시행일: 2026년 9월 1일\n주요 변경사항: 고객 문의 응대 목적의 개인정보 보유 기기 항목 추가\n\n개정된 전문은 하단 개인정보처리방침 페이지에서 확인하실 수 있습니다.", attachments: [] },
  { id: 9,  category: "소식",   isNotice: false, title: "제휴사 온라인 세미나 개최 안내",                              writer: "전략팀",   date: "2026-08-10", hits: 241,  content: "제휴사와 함께하는 온라인 세미나를 개최합니다.\n\n주제: 디지털 전환 시대의 고객 경험 설계\n일시: 9월 15일 오후 2시\n장소: 온라인(ZOOM)\n\n사전 신청자에 한해 참여 링크를 발송해 드립니다.", attachments: [{ name: "세미나_기획서.hwp", size: "860KB" }] },
  { id: 10, category: "이벤트", isNotice: false, title: "친구초대 이벤트 재오픈!",                                     writer: "마케팅팀", date: "2026-08-05", hits: 1120, content: "많은 성원에 힘입어 친구초대 이벤트가 재오픈되었습니다.\n\n친구 1명 초대 시 회원님과 친구 모두 3,000P 적립!\n지금 마이페이지 > 초대하기에서 확인하세요.", attachments: [] },
  { id: 11, category: "채용",   isNotice: false, title: "[채용] 하반기 인턴십 프로그램 모집",                          writer: "인사팀",   date: "2026-08-01", hits: 445,  content: "2026년 하반기 인턴십 프로그램 참가자를 모집합니다.\n\n- 모집 인원: 각 부문 2명\n- 근무 형태: 정규직 전환형 인턴 (6개월)\n- 접수 기간: 8월 30일까지\n\n많은 지원 바랍니다.", attachments: [] },
  { id: 12, category: "소식",   isNotice: false, title: "A/S 센터 신규 오픈 (분당점)",                                 writer: "고객지원팀", date: "2026-07-28", hits: 189,  content: "분당 지역 고객님들을 위한 A/S 센터가 새롭게 오픈했습니다.\n\n주소: 성남시 분당구 ○○로 123, 2층\n운영시간: 평일 09:00 ~ 18:00\n\n방문 전 미리 예약해 주시면 더욱 빠른 응대가 가능합니다.", attachments: [] },
  { id: 13, category: "공지",   isNotice: false, title: "회원 등급제 개편 안내",                                       writer: "운영팀",   date: "2026-07-20", hits: 512,  content: "9월 1일부터 회원 등급제가 개편됩니다.\n\n기존 구매 금액 기준에서 활동 점수 기준으로 변경됩니다.\n리뷰, 이벤트 참여 등의 활동도 등급 산정에 포함되니 많은 이용 바랍니다.", attachments: [] },
  { id: 14, category: "이벤트", isNotice: false, title: "설문조사 참여하고 커피쿠폰 받아가세요",                       writer: "전략팀",   date: "2026-07-15", hits: 623,  content: "서비스 만족도 설문조사에 참여해 주세요.\n\n소요 시간: 약 3분\n혜택: 참여자 전원 커피 쿠폰 증정\n기간: 7월 31일까지", attachments: [] },
  { id: 15, category: "소식",   isNotice: false, title: "ESG 경영보고서 발간 안내",                                    writer: "경영지원팀", date: "2026-07-10", hits: 98,   content: "2026년 ESG 경영보고서가 발간되었습니다.\n\n환경·사회·지배구조 전 분야의 활동과 성과를 담았습니다.\n첨부파일에서 전문을 확인하실 수 있습니다.", attachments: [{ name: "ESG_경영보고서_2026.pdf", size: "6.5MB" }] },
];

/* -- 더미 댓글 (특정 샘플 글에만 연결) -- */
// 예: ID가 1인 샘플 게시글에만 기본 더미 댓글
const COMMENTS = [
  { id: 1, writer: "김민준", date: "2026-09-05 14:20", text: "리뉴얼 축하드려요! 정말 깔끔하고 보기 좋네요 👍" },
  { id: 2, writer: "이서연", date: "2026-09-05 15:02", text: "모바일에서도 훨씬 편해진 것 같습니다. 좋은 소식 감사합니다." },
];

const PAGE_SIZE = 8;            // 한 페이지 게시글 수
const PAGE_GROUP = 5;           // 페이지네이션 블록 단위
const TODAY = "2026-09-08";     // NEW 배지 기준일(시안 기준)

/* 상태 */
const state = {
  page: 1,
  category: "전체",
  keyword: "",
  sortDesc: true,               // 최신순
  currentPost: null,
  editingId: null,              // 수정 모드에서 대상 글 id
  comments: [...COMMENTS],
};

const $ = (selector) => document.querySelector(selector);

/* ══════════ 유틸 ══════════ */
function esc(str) {
  const div = document.createElement("div");
  div.textContent = String(str ?? "");
  return div.innerHTML;
}

function showToast(msg) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

function isNew(dateStr) {
  const diff = (new Date(TODAY) - new Date(dateStr)) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff < 3;
}

function views() {
  return {
    list: $("#view-list"),
    detail: $("#view-detail"),
    form: $("#view-form"),
  };
}

function switchView(name) {
  Object.entries(views()).forEach(([key, el]) => {
    if (el) el.hidden = key !== name;
  });
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

/* ══════════ 목록 렌더링 ══════════ */
function getFilteredPosts() {
  let posts = [...POSTS];

  if (state.category !== "전체") {
    posts = posts.filter((p) => p.category === state.category);
  }

  if (state.keyword.trim()) {
    const kw = state.keyword.trim().toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(kw) ||
        p.writer.toLowerCase().includes(kw) ||
        p.content.toLowerCase().includes(kw)
    );
  }

  // 상단 고정 공지 → 최신순
  posts.sort((a, b) => {
    if (a.isNotice !== b.isNotice) return a.isNotice ? -1 : 1;
    return state.sortDesc
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date);
  });

  // 번호 부여 (공지 제외, 필터링된 목록 기준 내림차순)
  let no = posts.filter((p) => !p.isNotice).length;
  return posts.map((p) => (p.isNotice ? { ...p, _no: "" } : { ...p, _no: no-- }));
}


// 함수명을 renderList로 통일하여 호출 오류 해결
function renderList() {
  const posts = getFilteredPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  if (state.page > totalPages) state.page = totalPages;

  const start = (state.page - 1) * PAGE_SIZE;
  const pagePosts = posts.slice(start, start + PAGE_SIZE);

  const tbody = $("#boardBody");
  if (!tbody) return;

  tbody.innerHTML = pagePosts
    .map((p) => {
      const commentCount = (state.comments || []).filter(
        (c) => c.postId === p.id
      ).length;

      return `
      <tr class="${p.isNotice ? "is-notice" : ""}">
        <td class="col-no td-no">
          ${p.isNotice ? '<span class="pin-icon" title="상단 고정">📌</span>' : esc(p._no)}
        </td>
        <td class="td-cat">
          <span class="badge badge-${p.category}">${p.category}</span>
        </td>
        <td class="td-title col-title">
          <a href="#" data-id="${p.id}">${p.isNotice ? "[공지] " : ""}${esc(p.title)}</a>
          ${isNew(p.date) ? '<span class="new-badge">NEW</span>' : ""}
          <span class="comment-count">💬 ${commentCount}</span>
        </td>
        <td class="col-writer">${esc(p.writer)}</td>
        <td class="col-date td-date">${p.date}</td>
        <td class="col-hit">${p.hits}</td>
      </tr>
    `;
    })
    .join("");

  const emptyMsg = $("#emptyMsg");
  if (emptyMsg) emptyMsg.hidden = pagePosts.length > 0;

  tbody.querySelectorAll(".td-title a").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      openDetail(Number(a.dataset.id));
    });
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const el = $("#pagination");
  if (!el) return;

  const current = Number(state.page) || 1; // 타입 안전을 위해 Number 변환 권장
  const groupStart = Math.floor((current - 1) / PAGE_GROUP) * PAGE_GROUP + 1;
  const groupEnd = Math.min(groupStart + PAGE_GROUP - 1, totalPages);

  const btn = (label, page, { disabled = false, current: isCurrent = false, aria = "" } = {}) => `
    <button type="button" class="page-btn ${isCurrent ? "is-current" : ""}"
      data-page="${page}" ${disabled ? "disabled" : ""}
      ${aria ? `aria-label="${aria}"` : ""}>${label}</button>
  `;

  let html = "";
  html += btn("‹‹", Math.max(1, groupStart - PAGE_GROUP), { disabled: groupStart === 1, aria: "첫 블록" });
  html += btn("‹", Math.max(1, current - 1), { disabled: current === 1, aria: "이전 페이지" });
  for (let i = groupStart; i <= groupEnd; i++) {
    html += btn(i, i, { current: i === current, aria: `${i}페이지` });
  }
  html += btn("›", Math.min(totalPages, current + 1), { disabled: current === totalPages, aria: "다음 페이지" });
  html += btn("››", Math.min(totalPages, groupEnd + 1), { disabled: groupEnd === totalPages, aria: "다음 블록" });

  el.innerHTML = html;

  el.querySelectorAll(".page-btn").forEach((b) => {
    b.addEventListener("click", () => {
      const targetPage = Number(b.dataset.page);
      
      // 이미 보고 있는 페이지를 다시 누르면 기록이 중복 생성되지 않도록 방지
      if (state.page === targetPage) return;

      state.page = targetPage;

      // 브라우저 히스토리에 새 페이지 기록 추가 (?page = 숫자 형태로 URL 변경)
      history.pushState({ page: state.page }, "", `?page=${state.page}`);
      
      // 화면 리스트 갱신
      renderList();
    });
  });
}


/* ══════════ 2. 상세 화면 ══════════ */
// push 기본값을 true로 설정하여 일반 클릭과 popstate(뒤로가기) 호출을 구분
function openDetail(id, push = true) {
  const post = POSTS.find((p) => p.id === id);
  if (!post) {
    switchView("list");
    renderList();
    return;
  }

  post.hits += 1;
  state.currentPost = post;

  const head = $("#detailHead");
  if (head) {
    head.innerHTML = `
      <div class="detail-meta">
        <span class="badge badge-${post.category}">${post.category}</span>
        <span>작성자 <strong>${esc(post.writer)}</strong></span>
        <span>작성일 ${post.date}</span>
        <span>조회 ${post.hits}</span>
      </div>
      <h3>${esc(post.title)}</h3>
    `;
  }

  const body = $("#detailBody");
  if (body) body.textContent = post.content;

  const attach = $("#detailAttach");
  if (attach) {
    attach.innerHTML = post.attachments?.length
      ? `<p class="form-hint" style="margin-bottom:8px">첨부파일</p>` +
        post.attachments.map((f) => `
          <a href="#" class="attach-item" onclick="return false;">📎 ${esc(f.name)} <span>(${f.size})</span></a>
        `).join("")
      : "";
  }

  // 이전 글에서 작성 중이던 댓글 입력창 초기화
  const commentInput = $("#commentInput");
  if (commentInput) commentInput.value = "";

  renderComments();
  renderDetailNav(post);
  switchView("detail");

  // [핵심 수정] 사용자가 직접 클릭해 열었을 때만 히스토리 기록 추가 (뒤로가기/초기 접속 시에는 push 하지 않음)
  if (push) {
    history.pushState({ view: "detail", id: post.id }, "", `?id=${post.id}`);
  }
}

function renderComments() {
  const commentList = $("#commentList");
  if (!commentList) return;

  if (!state.currentPost) {
    commentList.innerHTML = "";
    return;
  }

  const postComments = (state.comments || []).filter(
    (c) => c.postId === state.currentPost.id
  );

  const sortedComments = [...postComments].sort((a, b) => {
    if (a.isAuthor === b.isAuthor) return 0;
    return a.isAuthor ? -1 : 1;
  });

  if (sortedComments.length === 0) {
    commentList.innerHTML = `<li class="no-comment" style="padding:16px; text-align:center; color: #888;">등록된 댓글이 없습니다.</li>`;
    return;
  }

  commentList.innerHTML = sortedComments.map((c) => `
    <li class="comment-item ${c.isAuthor ? "pinned-comment" : ""}">
      <div class="header">
        <strong>${esc(c.writer)}</strong>
        ${c.isAuthor ? '<span class="badge-author">작성자</span>' : ""}
        <span class="date">${c.date}</span>
      </div>
      <p class="text">${esc(c.text)}</p>
    </li>
  `).join("");
}

function renderDetailNav(post) {
  const sorted = getSortedForNav();
  const idx = sorted.findIndex((p) => p.id === post.id);
  const prev = sorted[idx - 1];
  const next = sorted[idx + 1];

  const nav = $("#detailNav");
  if (!nav) return;

  nav.innerHTML = `
    <a href="#" class="${prev ? "" : "is-disabled"}" data-id="${prev?.id ?? ""}">
      <span class="nav-label">▲ 이전글</span>
      <span class="nav-title">${prev ? esc(prev.title) : "이전글이 없습니다."}</span>
      <span class="col-date">${prev?.date ?? ""}</span>
    </a>
    <a href="#" class="${next ? "" : "is-disabled"}" data-id="${next?.id ?? ""}">
      <span class="nav-label">▼ 다음글</span>
      <span class="nav-title">${next ? esc(next.title) : "다음글이 없습니다."}</span>
      <span class="col-date">${next?.date ?? ""}</span>
    </a>
  `;

  nav.querySelectorAll("a[data-id]:not(.is-disabled)").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      openDetail(Number(a.dataset.id));
    });
  });
}

function getSortedForNav() {
  return [...POSTS].sort((a, b) =>
    a.isNotice !== b.isNotice ? (a.isNotice ? -1 : 1) : new Date(b.date) - new Date(a.date)
  );
}

// 브라우저 뒤로 가기 / 앞으로 가기 감지
window.addEventListener("popstate", (e) => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");

  if (postId) {
    // 상세 글 URL이면 상세 화면 렌더링 (push=false로 중복 방지)
    openDetail(Number(postId), false);
  } else {
    // ?id가 없으면 첫 화면(목록)으로 복구
    state.page = Number(urlParams.get("page")) || 1;
    state.currentPost = null;
    state.editingId = null;
    
    switchView("list");
    renderList();
  }
});

/* ══════════ 3. 글쓰기 / 수정 ══════════ */
function openWriteForm(editId = null) {
  state.editingId = editId;
  const titleEl = $("#formTitle");
  const submitBtn = $("#btnSubmit");
  if (titleEl) titleEl.textContent = editId ? "글수정" : "글쓰기";
  if (submitBtn) submitBtn.textContent = editId ? "수정완료" : "등록";

  if (editId) {
    const post = POSTS.find((p) => p.id === editId);
    if (post) {
      $("#fCategory").value = post.category;
      $("#fNotice").checked = post.isNotice;
      $("#fTitle").value = post.title;
      $("#fWriter").value = post.writer;
      $("#fContent").value = post.content;
    }
  } else {
    $("#writeForm").reset();
  }
  switchView("form");
}

function submitForm(e) {
  e.preventDefault();
  const title = $("#fTitle").value.trim();
  const writer = $("#fWriter").value.trim();
  const content = $("#fContent").value.trim();

  if (!title) { showToast("제목을 입력해 주세요."); $("#fTitle").focus(); return; }
  if (!writer) { showToast("작성자를 입력해 주세요."); $("#fWriter").focus(); return; }
  if (!content) { showToast("내용을 입력해 주세요."); $("#fContent").focus(); return; }

  const data = {
    category: $("#fCategory").value,
    isNotice: $("#fNotice").checked,
    title, writer, content,
    attachments: [],
  };

  if (state.editingId) {
    const post = POSTS.find((p) => p.id === state.editingId);
    if (post) Object.assign(post, data);
    showToast("수정되었습니다.");
    openDetail(state.editingId);
  } else {
    const newId = POSTS.length > 0 ? Math.max(...POSTS.map((p) => p.id)) + 1 : 1;
    POSTS.push({ id: newId, date: TODAY, hits: 0, ...data });
    showToast("등록되었습니다.");
    state.category = "전체";
    state.page = 1;
    document.querySelectorAll(".chip").forEach((c) =>
      c.classList.toggle("is-active", c.dataset.category === "전체"));
    renderList();
    switchView("list");
  }
}

/* ══════════ 이벤트 바인딩 ══════════ */
function bindEvents() {
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");

      state.category = chip.dataset.category;
      state.page = 1;
      state.keyword = "";

      const searchInput = $("#searchInput");
      if (searchInput) searchInput.value = "";

      switchView("list");
      renderList();
    });
  });

  const searchForm = $("#searchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      state.keyword = $("#searchInput").value;
      state.page = 1;
      renderList();
    });
  }

  $("#btnWrite")?.addEventListener("click", () => openWriteForm());
  $("#btnToList")?.addEventListener("click", () => {
    history.pushState(null, "", window.location.pathname);
    renderList();
    switchView("list");
  });

  $("#btnEdit")?.addEventListener("click", () => {
    if (state.currentPost) openWriteForm(state.currentPost.id);
  });

  $("#btnDelete")?.addEventListener("click", () => {
    if (!state.currentPost) return;
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const idx = POSTS.findIndex((p) => p.id === state.currentPost.id);
    if (idx > -1) POSTS.splice(idx, 1);
    showToast("삭제되었습니다.");
    renderList();
    switchView("list");
  });

  $("#writeForm")?.addEventListener("submit", submitForm);
  $("#btnCancel")?.addEventListener("click", () => {
    if (state.editingId) openDetail(state.editingId);
    else { renderList(); switchView("list"); }
  });

  // 댓글 등록
  const commentForm = $("#commentForm");
  if (commentForm) {
    commentForm.onsubmit = function (e) {
      e.preventDefault();
      if (!state.currentPost) return;

      const input = $("#commentInput");
      const text = input.value.trim();
      if (!text) return;

      const newComment = {
        id: Date.now(),
        postId: state.currentPost.id,
        writer: "작성자",
        date: TODAY + " (방금)",
        text,
        isAuthor: true,
      };

      state.comments.push(newComment);
      input.value = "";

      renderComments();
      renderList(); // 목록의 댓글 수도 함께 실시간 반영
      showToast("댓글이 등록되었습니다.");
    };
  }
}

/* ══════════ 초기화 ══════════ */
document.addEventListener("DOMContentLoaded", () => {
  bindEvents();

  $("#btnToList")?.addEventListener("click", () => {
  // 주소창 파라미터를 지우고 첫 목록 상태로 기록
  history.pushState({ view: "list", page: state.page }, "", window.location.pathname);
  state.currentPost = null;
  switchView("list");
  renderList();
});

  // URL의 ?id 또는 ?page 확인 후 알맞은 뷰 오픈
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");

  if (postId) {
    openDetail(Number(postId), false);
  } else {
    state.page = Number(urlParams.get("page")) || 1;
    history.replaceState({ view: "list", page: state.page }, "", window.location.href);
  
    switchView("list");
    renderList();
  }
});