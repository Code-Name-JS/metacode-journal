# SICP JS 1장 핵심 개념 지도

학습자의 Notion 노트 위치와 절별 핵심 개념이다. 노트가 이 요약보다 최신일 수 있으니, Notion을 읽을 수 있으면 노트를 우선한다.

- 상위 페이지: [자바스크립트로 배우는 SICP](https://app.notion.com/p/3ea1ff876e79805f8507d21debb90d7b)

## 1.1 프로그래밍의 기본 요소

노트: [프로그래밍의 기본 요소](https://app.notion.com/p/3ea1ff876e7980bf9b2ef2742954ac24) (하위: 질문에 대한 상세 답변, 핵심 필수 정리)

| 절 | 핵심 개념 | 대표 코드 |
|---|---|---|
| 언어의 세 메커니즘 | 원시 표현식, 조합 수단, 추상화 수단 | |
| 표현식 | 연산자 조합, 중위 표기법, 우선순위, 왼쪽 결합, REPL | `(3 * 5) + (10 - 6);` |
| 이름 붙이기와 환경 | `const` 선언 = 가장 단순한 추상화, 환경 = 이름-값 쌍을 저장하는 메모리 | `const pi = 3.14159;` |
| 연산자 조합의 평가 | 평가 규칙은 재귀적, 트리 누산, 선언은 조합이 아님 | `(2 + 4 * 6) * (3 + 12);` |
| 복합 함수 | 함수 선언 = 복합 연산에 이름 붙이기 | `square`, `sum_of_squares`, `f` |
| 치환 모형 | 매개변수를 인수로 치환해서 반환 표현식 평가. 실제 해석기 동작이 아닌 이해용 모형 | `f(5)` → `136` |
| 인수 우선 vs 정상 순서 | 먼저 평가 후 적용 vs 완전히 전개 후 축약. JS는 인수 우선 | |
| 조건부 표현식과 술어 | `술어 ? 귀결 : 대안`, 오른쪽 결합, `&&` `\|\|`는 구문형, `!`는 연산자 | `abs` |
| 블랙박스 추상 | 함수적 추상, 묶인 이름 vs 자유 이름, 범위(scope), 블록 구조, 어휘순 범위 적용 | `sqrt` 내부 선언 |

## 1.2 함수와 과정

노트: [함수와 과정(함수가 생성하는)](https://app.notion.com/p/3eb1ff876e79801a9aaee87be610d71d)

| 절 | 핵심 개념 | 대표 코드 |
|---|---|---|
| 선형 재귀와 반복 | 지연된 연산의 사슬 = 재귀적 과정, 상태 변수만으로 서술 = 반복적 과정, 꼬리 재귀 | `factorial`, `fact_iter`, `plus` 두 버전 |
| 트리 재귀 | 호출마다 두 갈래, 단계 수는 노드 수, 공간은 최대 깊이에 비례 | `fib`, `fib_iter` |
| 잔돈 만들기 | 첫 동전을 안 쓰는 경우 + 쓰는 경우로 분할, 퇴화 사례 3가지 | `count_change(100)` → `292` |
| 증가 차수 | Θ(f(n)): k₁f(n) ≤ R(n) ≤ k₂f(n) | |
| 거듭제곱 | 선형 재귀 Θ(n) → 반복 Θ(1) 공간 → 연속제곱 Θ(log n) | `expt`, `fast_expt`, `is_even` |
| 최대공약수 | 유클리드 호제법, 라메의 정리, Θ(log n) | `gcd` |
| 소수 판정 | 약수 찾기 Θ(√n), 페르마 판정법 Θ(log n), 확률적 알고리즘 | `smallest_divisor`, `expmod`, `fermat_test`, `fast_is_prime` |

## 1.3 고차 함수를 이용한 추상의 정식화

노트: [고차 함수를 이용한 추상의 정식화](https://app.notion.com/p/3f61ff876e7980598483ce14cc39ca20)

하위 노트:
- [`sum_integers(a, b)` 계산 과정](https://app.notion.com/p/3f71ff876e7980b19befd0abf0ecf50e)
- [sum_cubes(a, b) 계산 과정](https://app.notion.com/p/3f71ff876e79804da1e5ee35a48ff10d)
- [`pi_sum`을 sum으로 계산하기](https://app.notion.com/p/3f71ff876e7980d685a5f9acc40f6b78)
- [시그마 표기법과 sum 함수의 대응](https://app.notion.com/p/3f71ff876e7980dab2b3eec91de39642)
- [고차 함수(Higher-Order Function) 패턴](https://app.notion.com/p/3f81ff876e7980918a8de18023dd07b9)
- [라이프니츠 공식(Leibniz formula) 고계 함수](https://app.notion.com/p/3f91ff876e7980f5ab9dc341128e2e66)
- [f의 정적분에 관한 수치적 근사하는 공식](https://app.notion.com/p/3f91ff876e79807cb164cc3ec0bce9ee)
- [람다 표현식(화살표 함수) 기본 원리](https://app.notion.com/p/3f91ff876e7980c997cdd55f38b0372f)

| 절 | 핵심 개념 | 대표 코드 |
|---|---|---|
| 함수를 받는 함수 | 공통 패턴의 슬롯을 매개변수로 바꾸면 추상이 된다. 시그마 표기법 ↔ `sum` | `sum(term, a, next, b)`, `sum_cubes`, `sum_integers`, `pi_sum`, `integral` |
| 람다 표현식 | 이름 없는 함수를 그 자리에서 만들기 | `x => x + 4`, `x => 1 / (x * (x + 2))` |

### `sum` 추상의 슬롯 대응

```
function 이름(a, b) {
    return a > b
           ? 0
           : 항(a) + 이름(다음(a), b);
}
```

| 함수 | term (항) | next (다음) |
|---|---|---|
| `sum_integers` | `identity` | `inc` |
| `sum_cubes` | `cube` | `inc` |
| `pi_sum` | `x => 1 / (x * (x + 2))` | `x => x + 4` |
| `integral` | `f` | `x => x + dx` (시작값 `a + dx / 2`, 결과에 `* dx`) |
