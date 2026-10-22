/* ==========================================================================
   Contrast Loop — Hyperframes 방식 모션 (TypeScript)
   컴파일:  npx tsc -p tsconfig.json  →  dist/script.js

   핵심 아이디어: "화면 = 시간의 함수"
   - render(t) 는 시간 t(초)만 받으면 언제나 같은 장면을 그린다.
   - 그래서 재생·정지·되감기·프레임 단위 이동(seek)이 전부 가능하고,
     프레임을 하나씩 찍어서 영상으로 렌더링할 수도 있다.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. 이징(Easing) 함수 — 0~1 진행률을 "느낌 있는" 0~1 로 바꿔준다
   -------------------------------------------------------------------------- */
type Ease = (p: number) => number;

const linear: Ease = (p) => p;

const easeInOutCubic: Ease = (p) =>
    p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

/** 목표를 살짝 지나쳤다가 돌아오는 이징 (원이 "톡" 튕겨 나가는 느낌) */
const easeOutBack: Ease = (p) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
};



/* --------------------------------------------------------------------------
   2. 키프레임 트랙 — "몇 초에 어떤 값" 목록에서 t 시점 값을 계산
   -------------------------------------------------------------------------- */
// ※ 이름을 Keyframe 으로 지으면 브라우저 내장 타입(Web Animations API)과 합쳐져 에러가 난다
interface KeyPoint {
    /** 시점(초) */
    at: number;
    /** 그 시점의 값 */
    value: number;
    /** 이전 키프레임 → 이 키프레임 구간에 쓸 이징 */
    ease?: Ease;
}

const lerp = (from: number, to: number, p: number): number => from + (to - from) * p;

const clamp = (n: number, min: number, max: number): number => Math.min(max, Math.max(min, n));

function sample(track: KeyPoint[], t: number): number {
    if (t <= track[0].at) return track[0].value;

    for (let i = 1; i < track.length; i++) {
        const prev = track[i - 1];
        const next = track[i];
        if (t <= next.at) {
            const span = next.at - prev.at;
            const p = span === 0 ? 1 : (t - prev.at) / span;
            return lerp(prev.value, next.value, (next.ease ?? linear)(p));
        }
    }

    return track[track.length - 1].value;
}



/* --------------------------------------------------------------------------
   3. 장면 설계 (6초 루프)
      0.0 ─ 0.5  참고 이미지 그대로 정지
      0.5 ─ 1.7  두 원이 중심을 축으로 180° 회전하며 자리 바꿈
      2.1 ─ 2.9  두 원이 가운데로 모여 하나로 겹침
      2.9 ─ 3.7  겹친 원이 크게 부풀어 오름
      4.0 ─ 4.8  다시 원래 크기로 줄어듦
      4.8 ─ 5.6  두 원이 튕기듯 갈라져 처음 자리로
   -------------------------------------------------------------------------- */
const BASE_R = 56;      // 원 반지름 (컴포지션 px)
const BASE_GAP = 56;    // 중심에서 각 원 중심까지 거리 → 두 원이 정확히 맞닿음
const BIG_R = 150;

const TRACKS = {
    /** 두 원을 잇는 선의 회전각 (라디안) */
    angle: [
        { at: 0.5, value: 0 },
        { at: 1.7, value: Math.PI, ease: easeInOutCubic },
    ] as KeyPoint[],

    /** 중심에서 각 원까지 거리 */
    gap: [
        { at: 2.1, value: BASE_GAP },
        { at: 2.9, value: 0, ease: easeInOutCubic },
        { at: 4.8, value: 0 },
        { at: 5.6, value: BASE_GAP, ease: easeOutBack },
    ] as KeyPoint[],

    /** 원 반지름 */
    radius: [
        { at: 2.9, value: BASE_R },
        { at: 3.7, value: BIG_R, ease: easeInOutCubic },
        { at: 4.0, value: BIG_R },
        { at: 4.8, value: BASE_R, ease: easeInOutCubic },
    ] as KeyPoint[],
};



/* --------------------------------------------------------------------------
   4. 타임라인 — seek / play / pause 를 가진 재생기
      Hyperframes 처럼 window.__timelines[컴포지션 id] 에 등록해 두면
      외부(렌더러, 콘솔)에서도 timeline.seek(2.5) 처럼 조종할 수 있다.
   -------------------------------------------------------------------------- */
class Timeline {
    private current = 0;
    private playing = false;
    private lastNow = 0;
    private rafId = 0;
    private listeners: Array<(t: number) => void> = [];

    constructor(
        private readonly total: number,
        private readonly render: (t: number) => void,
    ) {}

    duration(): number {
        return this.total;
    }

    time(): number {
        return this.current;
    }

    isPlaying(): boolean {
        return this.playing;
    }

    /** t 초 시점으로 이동해서 그 장면을 그린다 */
    seek(t: number): void {
        this.current = clamp(t, 0, this.total);
        this.render(this.current);
        this.listeners.forEach((fn) => fn(this.current));
    }

    play(): void {
        if (this.playing) return;
        this.playing = true;
        this.lastNow = performance.now();
        this.rafId = requestAnimationFrame(this.tick);
        this.listeners.forEach((fn) => fn(this.current));
    }

    pause(): void {
        this.playing = false;
        cancelAnimationFrame(this.rafId);
        this.listeners.forEach((fn) => fn(this.current));
    }

    /** 시간이 바뀔 때마다 호출될 함수 등록 (컨트롤 UI 갱신용) */
    onUpdate(fn: (t: number) => void): void {
        this.listeners.push(fn);
    }

    private tick = (now: number): void => {
        const dt = (now - this.lastNow) / 1000;
        this.lastNow = now;
        // 끝에 도달하면 0초로 돌아가 무한 반복 (% 연산)
        this.seek((this.current + dt) % this.total);
        if (this.playing) this.rafId = requestAnimationFrame(this.tick);
    };
}

interface Window {
    __timelines?: Record<string, Timeline>;
}



/* --------------------------------------------------------------------------
   5. 초기화 — HTML(data-*) 읽기 → 렌더 함수 → 컨트롤 연결
   -------------------------------------------------------------------------- */
function init(): void {
    const stage = document.getElementById("stage");                         // [연결①] HTML id="stage"
    const playBtn = document.getElementById("playBtn") as HTMLButtonElement | null;           // [연결⑤]
    const scrubber = document.getElementById("scrubber") as HTMLInputElement | null;          // [연결⑥]
    const frameLabel = document.getElementById("frameLabel") as HTMLOutputElement | null;     // [연결⑦]
    if (!stage || !playBtn || !scrubber || !frameLabel) return;

    // [연결②③] data-* 속성 → dataset (data-composition-id → dataset.compositionId)
    const id = stage.dataset.compositionId ?? "main";
    const width = Number(stage.dataset.width ?? 500);
    const height = Number(stage.dataset.height ?? 500);
    const duration = Number(stage.dataset.duration ?? 6);
    const fps = Number(stage.dataset.fps ?? 30);
    const totalFrames = Math.round(duration * fps);

    stage.style.setProperty("--comp-w", String(width));                     // [연결②] CSS --comp-w
    stage.style.setProperty("--comp-h", String(height));                    // [연결②] CSS --comp-h

    const cx = width / 2;
    const cy = height / 2;

    /** 시간 t → 장면. 같은 t 를 넣으면 언제나 같은 결과 */
    const render = (t: number): void => {
        const angle = sample(TRACKS.angle, t);
        const gap = sample(TRACKS.gap, t);
        const r = sample(TRACKS.radius, t);

        const dx = Math.cos(angle) * gap;
        const dy = Math.sin(angle) * gap;

        // [연결⑧] CSS 변수 이름과 문자열이 정확히 같아야 함
        stage.style.setProperty("--a-x", (cx - dx).toFixed(2));
        stage.style.setProperty("--a-y", (cy - dy).toFixed(2));
        stage.style.setProperty("--b-x", (cx + dx).toFixed(2));
        stage.style.setProperty("--b-y", (cy + dy).toFixed(2));
        stage.style.setProperty("--r", r.toFixed(2));
    };

    const timeline = new Timeline(duration, render);
    window.__timelines = window.__timelines ?? {};
    window.__timelines[id] = timeline;

    // ── 컨트롤 UI ─────────────────────────────────────────
    scrubber.max = String(totalFrames);

    const pad3 = (n: number): string => String(n).padStart(3, "0");

    timeline.onUpdate((t) => {
        const frame = Math.round(t * fps);
        scrubber.value = String(frame);
        frameLabel.textContent = `${pad3(frame)} / ${totalFrames}`;

        const playing = timeline.isPlaying();
        playBtn.classList.toggle("is-playing", playing);                    // [연결⑨] CSS .is-playing
        playBtn.setAttribute("aria-pressed", String(playing));
        const label = playBtn.querySelector(".controls__label");
        if (label) label.textContent = playing ? "정지" : "재생";
    });

    const togglePlay = (): void => {
        if (timeline.isPlaying()) timeline.pause();
        else timeline.play();
    };

    const stepFrame = (delta: number): void => {
        timeline.pause();
        const frame = clamp(Math.round(timeline.time() * fps) + delta, 0, totalFrames);
        timeline.seek(frame / fps);
    };

    playBtn.addEventListener("click", togglePlay);                          // [연결⑤]

    scrubber.addEventListener("input", () => {                              // [연결⑥]
        timeline.pause();
        timeline.seek(Number(scrubber.value) / fps);
    });

    document.addEventListener("keydown", (e) => {
        if (e.target instanceof HTMLInputElement && e.key !== " ") return;  // 슬라이더 자체 방향키 동작은 그대로 둠
        if (e.key === " ") {
            e.preventDefault();
            togglePlay();
        } else if (e.key === "ArrowRight") {
            stepFrame(1);
        } else if (e.key === "ArrowLeft") {
            stepFrame(-1);
        }
    });

    timeline.seek(0);

    // 움직임 줄이기 설정을 켠 사용자에게는 자동 재생하지 않음
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) timeline.play();
}

init();
