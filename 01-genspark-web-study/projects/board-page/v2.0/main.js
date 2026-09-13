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
const POSTS = [
   { id: 1, category: '공지', title: '[공지] 9월 커뮤니티 이용 안내 및 운영 규칙', author: '관리자', date: daysAgo(0), views: 3421, content: '안녕하세요, 커뮤니티 관리자입니다.\n\n모든 이용자분들이 편안하게 이용하실 수 있도록 아래 이용 규칙을 안내드립니다.\n\n1) 타인을 존중하는 언어 사용\n2) 광고성 게시글 및 스팸 게시글 금지\n3)타인의 개인정보 무단 수집 금지\n4)욕설 · 비방 · 혐오 표현 금지\n\n위 규칙을 지켜 주시면 감사하겠습니다.', files: [{name: '운영규칙_2026.pdf', size: '245KB'}, {name:'커뮤니티_가이드라인.pdf', size: '1.2MB'}], comments: [{author: '서연', text: '확인했습니다! 감사합니다', date:daysAgo(0)}] },
   { id: 2, category: '공지', title: '[공지] 게시판 리뉴얼 오픈 기념 이벤트 안네', author: '관리자', date: daysAgo(1), views: 2810, content: '게시판이 새롭게 리뉴얼되었습니다. 🎉\n\n리뉴얼 오픈을 기념하여 댓글을 남겨주신 분들 중 추첨을 통해 소정의 선물을 드립니다.\n\n이벤트 기간: 9월 12일 ~ 9월 30일\n참여 방법: 아무 게시글에 댓글 작성', files: [{name: '이벤트 _배너.png', size: '512KB'}], comments: [{author: '민서', text: '와 리뉴얼 축하드려요!', date: daysAgo(1)}, {author: '지훈', text: '이벤트 참여합니다!', date: daysAgo(0)}] },
   { id: 3, category: '일반', title: '새로 가입했어요, 잘 부탁드립니다!', author: '민서', date: daysAgo(2), views: 187, content:'안녕하세요! 오늘 가입한 새내기입니다.\n\n평소에 관심 있던 주제로 이야기 나눌 수 있는 곳을 찾다가 들어오게 됐어요. 잘 부탁드립니다!', comments: [{author: '소민', text:'반가워요! 환영합니다 🎉', date: daysAgo(2)}, {author: '태윤', text: '어서오세요~', date: daysAgo(1)}] },
   { id: 4, category: '일반', title: '다들 주말에 뭐 하세요?', author: '지훈', date: daysAgo(3), views: 312, content: '요즘 주말마다 특별한 계획 없이 흘러보내는 것 같아서요.\n\n다들 주말에 보통 어떻게 시간을 보내시는지 궁금합니다!', comments: [{author: '하은', text: '저는 홈트하고 카페 가는 게 루틴이에요', date: daysAgo(3)}, {author: '도윤', text: '산책 + 독서로 보냅니다 ㅎㅎ', date: daysAgo(2)}] },
   { id: 5, category: '일반', title: '오늘 처음으로 홈트 시작했어요 💪', author: '하은', date: daysAgo(4), views: 258, content: '드디어 결심하고 오늘부터 홈트를 시작했습니다.\n\n10분이면 끝난다고 해서 시작했는데 생각보다 힘드네요... 그래도 꾸준히 해보려고요!', comments:[{author: '유진', text: '화이팅입니다! 꾸준함이 답이에요', date: daysAgo(4)}] },
   { id: 6, category: '일반', title: '회사 근처 맛집 추천 받습니다.', author:'준호', date: daysAgo(5), views: 421, content: '이직 후 회사 근처 맛집을 아직 못 찾았어요.\n\n점심 먹을 곳 추천 부탁드립니다. 국물 위주면 더 좋아요!', comments:[{author: '도윤', text: '저도 추천 부탁드려요 🙏', date: daysAgo(5)}, {author: '하은', text: '회사 앞 골목에 있는 국수집 강추합니다!', date: daysAgo(4)}, {author: '서연', text: '건물 2층 칼국수집도 좋아요', date: daysAgo(3)}] },
   { id: 7, category: '일반', title: '요즘 날씨에 딱 맞는 카페 발견했어요', author: '서연', date: daysAgo(6), views: 164, content: '걷다 보니 분위기좋은 카페를 발견했어요.\n\n창밖으로 정원이 보이는 구조라서 커피 마시며 쉬기 좋더라고요. 위치가 궁금하신 분들은 댓글 주세요!', comments: [] },
   { id: 8, category: '일반', title: '퇴근 후 운동 루틴 공유해요', author: '도윤', date: daysAgo(7), views: 236, content: '저는 퇴근 후 이렇게 운동합니다.\n\n1) 가벼운 스트레칭 10분 → 2) 유산소 30분 → 3) 근력 20분 → 4) 샤워\n\n다들 루틴 어떻게 되시는지 궁금해요!', comments: [{author: '건우', text: '유산소 30분이면 체력 좋으시네요!', date: daysAgo(6)}] },
   { id: 9, category: '일반', title: '이번 주말 등산 코스 추천 부탁드려요', author: '유진', date: daysAgo(8), views: 198, content: '날씨가 선선해져서 주말에 등산을 가보려고 합니다.\n\n초보도 무난하게 다녀올 수 있는 코스 추천 부탁드려요!', comments: [{author: '시우', text: '북한산 백운대 코스가 경치 좋아요', date: daysAgo(7)}, {author: '유진', text: '오 감사합니다! 참고할게요', date: daysAgo(7)}] },
   { id: 10, category: '일반', title: '독서 모임 하실 분 계신가요?', author: '시우', date: daysAgo(9), view: 145, content: '매주 한 권씩 책을 읽고 의견을 나누는 소모임을 만들고 싶습니다.\n\n관심 있으신 분은 댓글 남겨주세요! 장르는 가볍게 소설 위주로 시작할까 합니다.', comments: [{author: '나은', text: '저요! 참여하고 싶어요', date: daysAgo(9)}, {author: '다은', text: '소설 좋아합니다!', date: daysAgo(8)}] },
   { id: 11, category: '질문', title: '처음 시작하는 사람에게 추천하는 운동은?', author: '은우', date: daysAgo(10), views: 532, content: '운동을 한 번도 제대로 해본 적이 없는데, 이번에 시작해보려고 합니다.\n\n가볍게 시작할 수 있는 운동이나 유튜브 채널 추천 부탁드려요!', comments: [{author: '현우', text: '걷기부터 시작하세요! 무리 없이 꾸준히가 중요해요', date: daysAgo(10)}, {author: '예린', text: '홈트 채널 추천드려요. 초보자 프로그램 많아요', date: daysAgo(9)}, {author: '지우', text: '수영도 좋아요. 전신운동+ 부상 위험 낮음', date: daysAgo(8)}] },
   { id: 12, category: '질문', title: '블루투스 이어폰 추천 부탁드립니다', author: '하윤', date: daysAgo(11), views: 467, content: '운동할 때 쓸 블루투스 이어폰을 찾고 있어요.\n\n우선순위는 1) 착용감 2) 배터리 3) 가성비입니다. 예산은 15만 원 안쪽으로 생각하고 있어요.', comments: [{author: '태윤', text: '요즘 나오는 제품들은 다 괜찮아요. 매장에서 착용해보고 고르세요', date: daysAgo(11)}] },
   { id: 13, category: '질문', title: '집에서 만들기 쉬운 요리 있을까요?', author: '지안', date: daysAgo(12), views: 289, content: '요리를 거의 안 해봤는데, 자취를 시작하면서 한두 개는 만들어 먹고 싶어요.\n\n정말 쉬운 요리 추천 부탁드립니다!', comments: [{author: '소민', text: '계란 볶음밥 + 아보카도 토스트 추천!', date: daysAgo(12)}] },
   { id: 14, category: '질문', title: '재택근무할 때 집중 잘 되는 팁 알려주세요', author: '수아', date: daysAgo(13), views: 355, content: '재택근무를 시작했는데 집중이 잘 안 돼서 고민입니다.\n\n다들 어떤 방식으로 업무 집중력을 유지하시나요?', comments: [{author: '시우', text: '폼포도로 25분/5분 루틴 써봐요. 효과 좋아요', date: daysAgo(13)}, {author: '건우', text: '저는 집이 아닌 카페로 나가요. 환경 전환이 중요해요', date: daysAgo(12)}] },
   { id: 15, category: '질문', title: '사진 보정은 어떤 앱 쓰시나요?', author: '건우', date: daysAgo(14), views: 174, content: '최근에 사진 찍는 게 취미가 됐는데, 보정은 아직 어렵네요.\n\n초보에게 괜찮은 보정 앱이나 방법 추천 부탁드려요.', comments: [] },
   { id: 16, category: '질문', title: '자취 시작하는데 필요한 물품이 뭘까요?', author: '다은', date: daysAgo(15), views: 398, content: '다음 달부터 자취를 시작합니다!\n\n꼭 필요한 물품 리스트를 알고 싶어요. 선배님들의 조언 부탁드립니다 🙏', comments: [{author: '태윤', text: '전기포트 + 밥솥 + 후라이팬이면 일단 시작 가능해요', date: daysAgo(15)}, {author: '나은', text: '구비서류(계약서, 신분증 사본) 챙기세요!', date: daysAgo(14)}] },
   
]