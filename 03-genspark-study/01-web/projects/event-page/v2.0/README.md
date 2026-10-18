# NOVA 런칭 페스티벌 — 이벤트 랜딩 페이지

HTML + CSS + JavaScript + TypeScript 로 만든 반응형 이벤트 페이지입니다.

## 폴더 구조
```
nova-event/
├── index.html        # 마크업 (dist/script.js 로드)
├── styles.css        # 모바일 우선 반응형 스타일
├── preview.html      # CSS/JS 인라인 단일 파일 (미리보기·공유용)
├── tsconfig.json     # TypeScript 설정
├── src/script.ts       # TypeScript 원본 소스
└── dist/script.js      # tsc 로 컴파일된 JavaScript
```

## 실행
```bash
npm install typescript --save-dev   # 최초 1회
npx tsc -p tsconfig.json            # TS → dist/script.js 컴파일
npx serve .                         # 또는 python3 -m http.server 8000
```

## 주요 수정 지점
- 이벤트 마감일·목표 인원·쿠폰 접두어 → `src/script.ts` 의 `CONFIG`
- 색상·간격·라운드 → `styles.css` 의 `:root` 디자인 토큰
- 문구·혜택·FAQ → `index.html`
