# Genspark 웹사이트 구현 및 개발 학습 프로젝트

## 프로젝트 소개

이 프로젝트는 Genspark를 활용하여 생성된 웹페이지를 웹 개발 구조에 대해 단계적으로 학습하기 위한 실습 저장소입니다. 생성된 HTML/CSS/JavaScript를 분석하고, 직접 수정 및 재구성하면서 웹 개발의 구조와 동작 원리를 학습하는 것이 목표입니다. 단순히 생성된 결과물을 사용하는 것에 그치지 않고, 각 버전의 코드를 비교하며 변경 사항과 개발 과정을 기록합니다.

---

## 학습 목표

이 프로젝트는 단순한 웹사이트 제작을 넘어, **HTML → CSS → JavaScript → 서버/API → 데이터베이스**로 이어지는 웹 개발의 구조를 이해하기 위한 기반으로 만들어지는 것입니다.

특히 프론트엔드 개발 과정에서 자주 사용하는 **DOM 조작, 이벤트 처리, 상태 관리, 동적 렌더링, CRUD UI**를 직접 구현하는 데 초점을 맞추어 공부합니다.

---

## 개발 과정

각 프로젝트는 다음과 같은 과정으로 발전시킵니다.

1. Genspark를 활용한 초기 웹페이지 디자인 생성
2. 생성된 HTML/CSS/JavaScript 구조 분석
3. HTML 구조 및 CSS 스타일 수정
4. JavaScript를 통한 사용자 인터랙션 구현
5. 기존 코드와 수정 코드 비교
6. 새로운 버전으로 기록
7. 개발 과정과 학습 내용을 README에 정리

---

## 프로젝트 구조

각 프로젝트는 v1.0, v2.0, v3.0과 같은 버전으로 관리합니다.

- **v1.0, v2.0, v3.0**: Genspark를 통해 생성된 새로운 디자인 시안을 분석하고 학습하는 버전
- **v1.1, v1.2, v2.1, v2.2**: 기준 버전을 기반으로 직접 수정하고 기능을 추가한 버전

```plaintext
projects/
├── best-page/      ← 베스트 상품 랭킹 (v1.0 ~ v3.0, TypeScript)
├── board-page/     ← 게시판 (v1.0 ~ v3.0)
├── cart-page/      ← 장바구니 (v1.0 ~ v3.0)
├── event-page/     ← 이벤트 프로모션 (v1.0, TypeScript + JSON)
├── login-page/     ← 로그인 (v1.0 ~ v3.0)
├── my-page/        ← 마이페이지 (v1.0 ~ v2.0)
└── signup-page/    ← 회원가입 (v1.0 ~ v3.0)
```

모든 프로젝트 폴더는 아래 구성을 따릅니다.

```plaintext
<project>-page/
├── README.md       ← 시안 이미지 · 버전 비교 · 주요 기능 · 학습 기록
├── img/            ← 시안 캡처 (preview-<버전>.png)
├── v1.0/
│   ├── index.html
│   ├── style.css
│   └── main.js (또는 script.js / script.ts)
├── v2.0/
└── v3.0/
```

---

## 버전 관리

아래 표는 프로젝트의 일반적인 버전 관리 예시입니다.

| 버전 | 주요 특징 | 개발 접근법 | 학습 목표 |
| --- | --- | --- | --- |
| **v1.0** | 기본 페이지 구현 | HTML/CSS 구조 분석 | 웹페이지 구조 이해 |
| **v1.1** | 디자인 수정 | CSS 및 JS 수정 | 코드 수정 능력 |
| **v1.2** | 기능 추가 | DOM / Event 처리 | JavaScript 학습 |
| **v2.0** | 새로운 디자인 | 새로운 구조 분석 | UI 설계 비교 |

---

## 프로젝트 목록

| 프로젝트 | 버전 | 핵심 학습 포인트 |
| --- | --- | --- |
| [best-page](./projects/best-page/README.md) | v1.0 ~ v3.0 | TypeScript 타입 정의, 필터 · 정렬 · 검색, JSON 데이터 fetch |
| [board-page](./projects/board-page/README.md) | v1.0 ~ v3.0 | 게시글 CRUD, 페이지네이션, `history.pushState` 화면 전환 |
| [cart-page](./projects/cart-page/README.md) | v1.0 ~ v3.0 | 수량 · 선택 상태 관리, 금액 계산, 체크박스 동기화 |
| [event-page](./projects/event-page/README.md) | v1.0 | JSON 기반 렌더링, 카운트다운, 응모 폼 검사 |
| [login-page](./projects/login-page/README.md) | v1.0 ~ v3.0 | 폼 유효성 검사, 로딩 · 에러 피드백, localStorage |
| [my-page](./projects/my-page/README.md) | v1.0 ~ v2.0 | 탭 · 모달 · 필터, 다크 모드, 접근성 |
| [signup-page](./projects/signup-page/README.md) | v1.0 ~ v3.0 | 비밀번호 강도 검사, 약관 동의, 서버 전송 구조 |

---

## 학습 기술

- HTML (시맨틱 태그, `data-*` 속성, ARIA)
- CSS (CSS 변수, Flexbox · Grid, 미디어 쿼리, 애니메이션)
- JavaScript (ES6+)
- TypeScript (best-page, event-page)
- DOM Manipulation
- Event Handling
- localStorage · JSON · fetch
- Playwright 자동 검증 (일부 프로젝트)

---

## 향후 계획

- 각 프로젝트의 기준 버전(v1.0 ~ v3.0)을 직접 수정한 v1.1 · v2.1 버전 제작
- event-page v2.0 ~ v3.0 시안 추가
- my-page v3.0 시안 추가
- 추후 페이지 시안이 추가되면 계속 수정될 예정입니다.

---

## 저작권 (Copyright)

© 2026 Gi So Jeong. All rights reserved.

- 이 저장소는 **학습 및 포트폴리오 목적**으로 공개합니다. 코드와 문서는 자유롭게 열람하고 참고할 수 있지만, **복제 · 수정 · 재배포 · 상업적 이용**은 저작권자의 사전 허락이 필요합니다.
- 일부 코드와 디자인 시안은 **Genspark(AI)로 생성한 결과물을 바탕으로** 직접 분석하고 수정했습니다. 저작권 주장은 직접 작성 · 수정한 부분에 한하며, Genspark 생성물의 이용은 Genspark 이용약관을 따릅니다.
- 외부 라이브러리, 폰트, 이미지(예: `picsum.photos`) 등 제3자 자산은 각 원저작자의 라이선스를 따릅니다.
- 이전에 MIT / CC BY 4.0 라이선스가 적용되어 있던 시점의 커밋에는 해당 시점의 라이선스 조건이 그대로 유지됩니다.

문의: GitHub [Issues](https://github.com/Code-Name-JS/metacode-journal/issues)
