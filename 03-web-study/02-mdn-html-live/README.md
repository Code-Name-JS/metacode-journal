# MDN HTML 라이브 스터디

MDN Web Docs 문서를 노션에 필사하면서 HTML 뼈대를 공부하는 유튜브 라이브 기록입니다.
지금은 HTML 뼈대(로그인 · 회원가입)에 집중하고, 다음 단계로 피그마 디자인을 보고 CSS를 작성합니다. 그 뒤에 JavaScript와 API 공부를 이어 갑니다.

> 출처: [MDN Web Docs](https://developer.mozilla.org/ko/) — 본문은 CC-BY-SA 2.5, 코드 예제는 CC0 라이선스를 따릅니다.

## 회차표

| 회차 | 날짜 | 필사한 MDN 문서 | 작업 폴더 | VOD | 커밋 |
|---|---|---|---|---|---|
| ep01 | 2026-__-__ | | `ep01-document-structure/` | | |
| ep02 | 2026-__-__ | | `ep02-forms-basics/` | | |
| ep03 | 2026-__-__ | | `projects/login-page/` | | |
| ep04 | 2026-__-__ | | `projects/signup-page/` | | |

## 이름 규칙 (CSS · JS · API 연결 지점)

뼈대 단계에서 정한 이름은 나중에 CSS 선택자, JS 이벤트, API 전송 키로 그대로 쓰입니다.

| 속성 | 나중에 만나는 곳 | 규칙 |
|---|---|---|
| `id` | JS `getElementById`, `label for` | 예: `userEmail` |
| `class` | CSS 선택자, JS `classList` | 예: `login-form`, `field`, `field__input` |
| `name` | 서버(API)로 보내는 데이터의 키 | 예: `email`, `password` |

## 회차 진행 순서

1. 오늘 필사할 MDN 문서 소개 (5분)
2. 노션에 필사
3. VSCode에 직접 적용
4. 깨뜨려 보기 실험 1개
5. [W3C Validator](https://validator.w3.org/)로 검사 → 커밋하고 마무리

커밋 형식: `feat(html): 로그인 페이지 뼈대 작성 (live ep03)`

## 폴더 구조

```
02-mdn-html-live/
├── README.md                  # 이 파일 (회차표)
├── ep01-document-structure/   # HTML 기본 구조, 시맨틱 태그
├── ep02-forms-basics/         # form, label, input
├── projects/
│   ├── login-page/
│   └── signup-page/
└── design/                    # (나중에) 피그마 캡처 + CSS 단계
```

비교용 이전 버전: [`../01-genspark/projects/login-page/`](../01-genspark/projects/login-page/), [`../01-genspark/projects/signup-page/`](../01-genspark/projects/signup-page/)
