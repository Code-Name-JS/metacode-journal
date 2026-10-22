# Contrast Loop — Hyperframes 모션

어두운/밝은 반반 화면 위에서 두 원이 회전 → 합체 → 팽창 → 분리되는 6초 루프 모션입니다.
원이 경계선을 넘어가면 **넘어간 부분만** 색이 뒤집힙니다.

## 폴더 구조
```
v1.0/
├── index.html      # 컴포지션(data-* 규격) + 미리보기 컨트롤
├── styles.css      # 두 레이어 + clip-path, CSS 변수로 위치·크기 받기
├── tsconfig.json   # TypeScript 설정
├── src/script.ts   # 키프레임 트랙 · 타임라인(seek/play/pause) · 렌더 함수
└── dist/script.js  # tsc 컴파일 결과 (gitignore 대상)
```

## 실행
```bash
npx tsc -p tsconfig.json          # TS → dist/script.js
python -m http.server 5524        # http://localhost:5524
```

## 동작 원리
1. **화면 = 시간의 함수** — `render(t)`는 시간 t만 받아 원의 위치·크기를 계산합니다. 그래서 언제든 `seek(t)`로 원하는 장면에 갈 수 있습니다.
2. **두 레이어 트릭** — 같은 원을 "어두운 배경+밝은 원", "밝은 배경+어두운 원" 두 층에 그리고, 위층을 `clip-path`로 오른쪽 절반만 보여줍니다.
3. **Hyperframes 규격** — `data-composition-id / data-width / data-height / data-duration / data-fps`로 영상 규격을 선언하고, 타임라인을 `window.__timelines["contrast-loop"]`에 등록합니다.

콘솔에서 직접 조종해 보기:
```js
window.__timelines["contrast-loop"].pause();
window.__timelines["contrast-loop"].seek(3.7); // 가장 크게 부푼 순간
```

## 주요 수정 지점
- 색상 → `styles.css`의 `:root` (`--c-dark`, `--c-light`)
- 장면 타이밍·크기 → `src/script.ts`의 `TRACKS`, `BASE_R`, `BIG_R`
- 영상 길이·프레임 → `index.html`의 `data-duration`, `data-fps`
