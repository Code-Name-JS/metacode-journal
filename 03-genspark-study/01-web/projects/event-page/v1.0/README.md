# 2026 가을 감사 페스티벌 — 이벤트 웹 페이지

HTML · CSS · TypeScript(원본) · JavaScript(컴파일 결과) · JSON(데이터) 로 구성된 단일 페이지 이벤트 사이트입니다.

## 폴더 구조

```
event-page/
├── index.html          # 마크업 (구조만 담당, 문구는 JS가 JSON에서 주입)
├── style.css           # 스타일 (반응형 + 다크 히어로 + 타임라인/아코디언/모달)
├── src/main.ts         # ★ TypeScript 원본 (타입 정의 + 렌더링 + 카운트다운 + 폼 검증)
├── js/main.js          # tsc 컴파일 결과 (브라우저가 실제로 실행하는 파일)
├── data/event.json     # 모든 문구·경품·일정·FAQ 데이터
├── tsconfig.json       # TypeScript 컴파일 설정
└── README.md
```

## 빌드 방법

```bash
npm install -g typescript   # 또는 npx 사용
npx tsc                     # src/main.ts → js/main.js 생성
```

`tsconfig.json` 의 `"module": "es2020"` + import/export 가 없는 단일 파일이기 때문에 결과물이 **일반 스크립트**로 떨어집니다.
(`<script type="module">` 이 아니라 `<script src="js/main.js" defer>` 로 로드 → `file://` 로 열어도 실행됩니다.)

## 실행 방법

### 방법 1 — 그냥 열기 (간편)
`index.html` 을 더블클릭합니다.

> ⚠️ `file://` 환경에서는 브라우저 보안 정책상 `fetch('data/event.json')` 이 차단됩니다.
> 이를 위해 `src/main.ts` 안에 **동일한 내용의 `FALLBACK_DATA`** 를 내장해 두었습니다.
> 페이지는 정상 렌더링되며, 콘솔에 대체 안내 로그만 남습니다.

### 방법 2 — 로컬 서버 (JSON 실제 로딩)
```bash
# Python
python3 -m http.server 5173

# 또는 Node
npx serve .
```
브라우저에서 `http://localhost:5173` 접속 → `data/event.json` 을 실제로 읽어옵니다.
이제 JSON만 수정하면 코드를 건드리지 않고 페이지 내용이 바뀝니다.

## 커스터마이즈

| 바꾸고 싶은 것 | 수정 위치 |
| --- | --- |
| 모든 문구·경품·일정·FAQ | `data/event.json` (+ `src/main.ts` 의 `FALLBACK_DATA`) |
| 색상·타이포그래피·간격 | `style.css` 최상단 `:root` 변수 |
| 카운트다운 종료 시각 | `event.json` → `hero.endDate` |
| 폼 검증 규칙 | `src/main.ts` → `validateField()` |

## 참고

- 응모 폼은 **데모**입니다. 실제 서버 전송 없이 0.6초 지연 후 성공 모달을 띄웁니다.
  실서비스에서는 `submitEntry()` 의 `setTimeout` 부분을 `fetch('/api/entry', {...})` 로 교체하세요.
- 페이지의 기업 정보·연락처는 모두 가상의 예시 값입니다.
