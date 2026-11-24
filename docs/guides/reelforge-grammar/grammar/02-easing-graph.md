# 키프레임 텐션·그래프 에디터 (Keyframe Tension & Graph Editor)

> 이 문서의 코드 스케치는 렌더 대상이 아니다 — 검증 실물은 references/gallery/fragments/, 이 파일은 통째 로딩 금지(배정 기법 섹션만 부분 로딩).

AE 그래프 에디터(Speed/Value Graph, Keyframe Velocity, Easy Ease/Hold)의 텐션 제어를 HyperFrames 계약(단일 paused timeline, seek-safe, GSAP 코어 전용) 위에서 재현하는 13기법 레퍼런스. "곡선의 모양 = 감정의 모양"이라는 사고방식이 공통 골격이다.

**vendor 전제**: `/vendor/gsap/3.14.2/`에는 gsap.min.js(코어)만 존재한다(실측). 코어 등록 이즈 — power0~4, sine, expo, circ, back(N), elastic(a,p), bounce, steps(N), none — 만 사용하라. CustomEase·EasePack(RoughEase/SlowMo)·MotionPathPlugin 등 외부 플러그인은 없다 — 문자열로 호출하면 렌더가 죽는다. 임의 곡선은 `(p)=>number` 순수 함수로 authored(코어 네이티브 지원).

**하우스 독트린 전제**: 엔트런스는 `fromTo`만(seek-back 재생 안정), house 기본 이즈는 `power3.out`, 오버슈트/스프링은 드문 예외이며 opacity에는 절대 걸지 않는다 — → hyperframes-animation `adapters/gsap-easing-and-stagger.md`, `rules/spring-pop-entrance.md` 참조.

## Contents

1. [speed-graph-power-family — 스피드 그래프 봉우리 → power 이즈 패밀리](#speed-graph-power-family--스피드-그래프-봉우리--power-이즈-패밀리)
2. [value-graph-overshoot-settle — 밸류 그래프 오버슈트 → back/spring 정착](#value-graph-overshoot-settle--밸류-그래프-오버슈트--backspring-정착)
3. [keyframe-velocity-to-cubic-bezier — Keyframe Velocity → cubic-bezier 4점 제어](#keyframe-velocity-to-cubic-bezier--keyframe-velocity--cubic-bezier-4점-제어)
4. [easy-ease-linear-hold-usage — Easy Ease vs Linear vs Hold 삼분법](#easy-ease-linear-hold-usage--easy-ease-vs-linear-vs-hold-삼분법)
5. [custom-function-ease — 커스텀 함수 이즈](#custom-function-ease--커스텀-함수-이즈)
6. [anticipation-windup-chain — 안티시페이션 윈드업 체인](#anticipation-windup-chain--안티시페이션-윈드업-체인)
7. [rolling-tension-chain — 롤링 텐션 체인](#rolling-tension-chain--롤링-텐션-체인)
8. [elastic-amplitude-period — 엘라스틱 진폭·주기 파라미터](#elastic-amplitude-period--엘라스틱-진폭주기-파라미터)
9. [bounce-drop-physics — 바운스 낙하 물리](#bounce-drop-physics--바운스-낙하-물리)
10. [weighted-deceleration-mass — 감속 곡선으로 질량감 표현](#weighted-deceleration-mass--감속-곡선으로-질량감-표현)
11. [hold-keyframe-stepped-values — Hold 키프레임 → steps() 스냅](#hold-keyframe-stepped-values--hold-키프레임--steps-스냅)
12. [separate-dimensions-axis-ease — 축별 다른 이즈로 아크 궤적](#separate-dimensions-axis-ease--축별-다른-이즈로-아크-궤적)
13. [scene-boundary-tangent-handoff — 씬 경계 접선 핸드오프](#scene-boundary-tangent-handoff--씬-경계-접선-핸드오프)

---

## speed-graph-power-family — 스피드 그래프 봉우리 → power 이즈 패밀리

AE Speed Graph는 속도(px/s)를 종 모양 곡선으로 그린다 — 봉우리가 넓고 완만할수록 부드럽고, 좁고 뾰족할수록 급격하다(Easy Ease가 이 종형 곡선을 자동 생성).

**구현** — GSAP power1~power4가 이 '봉우리 폭'의 이산 단계다. `.out`은 봉우리가 앞쪽(빠른 출발→긴 감속), `.in`은 반대, `.inOut`은 대칭. house 기본값 power3.out 위에서 위계별로만 변주하라.

```js
// 보조 요소: 완만한 봉우리
tl.fromTo('#card', { y: 40, opacity: 0 },
  { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.2);
// 주인공: 급격한 봉우리
tl.fromTo('#hero', { scale: 0.85, opacity: 0 },
  { scale: 1, opacity: 1, duration: 0.6, ease: 'power4.out' }, 0.2);
```

단조 이즈라 opacity 결합 안전. duration 0.5~0.6s는 등장창(0.4s)을 넘지만 주인공/보조 위계 연출 의도로 허용 범위.

→ hyperframes-animation Easing 참조

- intensity: 40-70
- pairs: `weighted-deceleration-mass`, `separate-dimensions-axis-ease`

---

## value-graph-overshoot-settle — 밸류 그래프 오버슈트 → back/spring 정착

AE Value Graph에서 마지막 키프레임 값을 정지값 너머로 밀었다가 되돌아오는 여분 키프레임으로 '오버슈트'를 만든다.

**구현** — GSAP은 여분 키프레임 없이 `back.out(N)` 하나로 같은 곡선을 계산한다 — N이 곧 '얼마나 넘었다 돌아오는지'. 파라미터 범위·독트린(스무스가 기본, 오버슈트는 드문 예외, N≤2, opacity 금지)은 재도출하지 않는다 — → hyperframes-animation `adapters/gsap-easing-and-stagger.md` §Spring Eases, `rules/spring-pop-entrance.md` 참조.

```js
// 드문 '명시적으로 장난스러운' 예외에서만 — opacity는 반드시 별도 단조 트윈
tl.fromTo('#icon', { scale: 0 },
  { scale: 1, duration: 0.5, ease: 'back.out(1.6)' }, 0.2);
tl.fromTo('#icon', { opacity: 0 },
  { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.2);
```

back.out은 종점에서 1을 초과 — opacity에 걸면 순간 >1로 하우스 독트린 위반(검증 fix 반영: opacity 분리).

**선택지**

| 파라미터 | 옵션 |
|---|---|
| N(back 강도) | ≤2 |
| dampingFraction | 0.6-0.85 (springEase 대안) |
| 대상 | scale / x / y / rotation만 |

**쓸 때**: 명시적으로 장난스러운/소비자 브랜드 톤의 순간에만(독트린상 드묾).
**피할 때**: 제품/엔터프라이즈/진지한 톤 — 기본은 항상 power3.out 스무스 정착.

- intensity: 70-100
- pairs: `spring-pop-entrance`(→ hyperframes-animation `rules/spring-pop-entrance.md`)

---

## keyframe-velocity-to-cubic-bezier — Keyframe Velocity → cubic-bezier 4점 제어

AE 키프레임 더블클릭 시 뜨는 Keyframe Velocity 창은 Incoming/Outgoing Speed와 Influence(%)를 진입/진출 독립 지정한다.

**구현** — 이 좌우 비대칭 접선은 CSS `cubic-bezier(x1,y1,x2,y2)`의 4점과 대응한다(P0=(0,0)·P3=(1,1) 고정, P1=출발 접선, P2=도착 접선). AE Influence% ≈ x좌표(0~1), Speed 크기 ≈ y좌표 편차로 옮겨 담는다. GSAP 타임라인 바깥의 CSS keyframes 루트는 엔진 가상클럭으로 구동돼 결정론/seek-safe.

```css
/* AE: Outgoing Influence 70%, Incoming Influence 30%, 약한 오버슈트 */
.rf-panel {
  animation: panelIn .6s cubic-bezier(0.7, 0, 0.3, 1.15) both;
  animation-delay: calc(var(--rf-scene-start, 0s) + .2s);
}
@keyframes panelIn {
  0%   { transform: translateY(24px); opacity: 0; }
  100% { transform: translateY(0);    opacity: 1; }
}
```

y2=1.15 오버슈트가 opacity에도 걸려 종점서 미세 >1이지만 브라우저 클램프로 무해 — 엄격 위생을 원하면 opacity를 별도 단조 keyframes로 분리하라.

**선택지**

| 파라미터 | 옵션 |
|---|---|
| x1(진출 영향력) | 0-1 |
| y1(진출 속도) | 오버슈트면 y<0 또는 y>1 |
| x2(진입 영향력) | 0-1 |
| y2(진입 속도) | 0-1 (transform만 초과 허용) |

**쓸 때**: CSS keyframes 기반 living-motion/일회성 루트에서 문자열 이즈보다 정밀한 4점 곡선이 필요할 때.
**피할 때**: y1/y2가 [0,1]을 크게 벗어나는 곡선을 opacity/색상에 적용하는 것.

- intensity: 40-70

---

## easy-ease-linear-hold-usage — Easy Ease vs Linear vs Hold 삼분법

AE 3대 키프레임 보간: Easy Ease(곡선 가감속) / Linear(등속) / Hold(보간 없음 — 값이 다음 키까지 유지되다 툭 바뀜).

**구현** — seek-safe 번역: Easy Ease → power/expo/sine, Linear → `ease:'none'`, Hold → `steps(N)`. 카운터의 리터럴 출발 단일 트윈+onUpdate는 blessed 패턴(→ hyperframes-animation의 카운터 규칙과 동형, 로컬 선례 06-shapes-strokes.md).

```js
// Linear: 카메라가 등속으로 프레임을 가로지름
tl.fromTo('#camera', { x: 0 }, { x: -800, duration: 2, ease: 'none' }, 0);
// Hold: 카운터가 정수 단위로 툭툭 스냅
const counter = { v: 0 };
tl.to(counter, {
  v: 42, duration: 1.2, ease: 'steps(42)',
  onUpdate: () => { document.getElementById('count').textContent = Math.round(counter.v); }
}, 0.3);
```

steps(42)는 값 1당 스냅 1회가 되도록 목표값과 스텝 수를 일치시킨 것. 1.2s는 카운트업 하우스 상한 준수.

→ hyperframes-animation Easing Vocabulary (character & mood) 참조

- intensity: 40-70
- pairs: `hold-keyframe-stepped-values`

---

## custom-function-ease — 커스텀 함수 이즈

AE에서 그래프 에디터 UI로 표현 못 하는 임의 속도 곡선은 Expression으로 코드화한다 — UI의 한계를 넘는 수단.

**구현** — GSAP ease는 문자열뿐 아니라 `(p:number)=>number` 순수 함수를 네이티브로 받는다(vendor 실측: CustomEase 플러그인 없어도 무관). 로컬 springEase가 이미 이 패턴 — → hyperframes-animation `adapters/gsap-easing-and-stagger.md` 참조.

```js
// 살짝 되감았다가 나가는 안티시페이션 곡선을 순수 함수로 authored
function anticipationEase(p) {
  const dip = 0.12;                    // 되감기 깊이: 메인 이동의 12%
  if (p < 0.2) return -dip * Math.sin((p / 0.2) * Math.PI);
  const q = (p - 0.2) / 0.8;           // 0.2 = 윈드업/메인 구간 분기점
  return -dip + (1 + dip) * (1 - Math.pow(1 - q, 3));
}
tl.to('#badge', { x: 120, duration: 0.6, ease: anticipationEase }, 0.4);
```

음수 반환은 transform(x)에만 적용돼 안전. CSS 리터럴 x:0에서 출발하는 단일 트윈이라 seek-safe 유지.

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 곡선 authored 상수 | dip 크기 / 구간 분기점 / 지수 차수 |

**쓸 때**: 그래프 에디터로도 못 만드는 복합 곡선(안티시페이션 되감기, 물리 스프링, 도메인 고유 곡선)이 필요할 때.
**피할 때**: 문자열 `'CustomEase.create(...)'` 사용 — vendor에 플러그인이 없어 렌더가 죽는다. 함수는 내부 상태를 누적하지 않는 순수 함수여야 한다(seek-safe 계약).

- intensity: 70-100

---

## anticipation-windup-chain — 안티시페이션 윈드업 체인

메인 액션 전에 반대 방향으로 작게 준비 동작을 넣는 애니메이션 12원칙 — AE에선 메인 이동 전에 반대 방향 키프레임을 하나 추가한다.

**구현** — 윈드업→메인 2단을 각각 명시 start의 `fromTo`로 이어붙여라. 같은 prop의 의존형 `.to` 연쇄는 비순차 seek 시 두 번째 트윈이 잘못된 시작값을 캡처하는 seek-order 위험(검증 fix 반영: fromTo 결정화).

```js
const T0 = 0.3;
tl.fromTo('#cta', { x: 0 },   { x: -10, duration: 0.12, ease: 'power1.in' }, T0)         // 윈드업(반대 방향)
  .fromTo('#cta', { x: -10 }, { x: 140, duration: 0.42, ease: 'power3.out' }, T0 + 0.12); // 메인 액션
```

윈드업 진입 이즈(power1.in 가속)와 메인 진출 이즈(power3.out 감속) 성격을 맞춰 끊김 없이 흐르게 한다.

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 윈드업 폭 | 메인 이동의 5-15% |
| 윈드업 duration | 메인 duration의 15-25% |

**쓸 때**: 클릭/발사/강조처럼 '힘이 실린' 액션 직전 — 버튼 프레스, 아이콘 발사, 카운트업 슬램 전.
**피할 때**: 준비 동작이 어울리지 않는 차분한 페이드 등장 — 그냥 house 기본 등장으로.

- intensity: 70-100
- pairs: `press-release-spring`, `kinetic-beat-slam`(둘 다 → hyperframes-animation rules)

---

## rolling-tension-chain — 롤링 텐션 체인

AE 그래프 에디터에서 여러 키프레임을 continuous bezier로 유지해, 세그먼트 간 진출/진입 속도가 매치되어 정지 없이 흐르는 경로를 만든다.

**구현** — 단일 `.to` + 퍼센트 keyframes 오브젝트(GSAP 3.9+ 코어)를 써라. '0%' 키가 명시 start를 정의해 fromTo와 동형의 결정성. 중간 정점에서 속도가 0으로 떨어지지 않고 통과한다.

```js
tl.to('#dot', {
  keyframes: {
    '0%':   { x: 0,   y: 0,   ease: 'power2.inOut' },
    '45%':  { x: 220, y: -40, ease: 'power2.inOut' }, // 중간 정점, 정지 없이 통과
    '100%': { x: 420, y: 0,   ease: 'power2.out' }
  },
  duration: 1.4
}, 0.2);
```

45%는 상승 구간을 살짝 길게 잡아 정점 통과감을 주는 배분(대칭 50%보다 자연스러움).

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 중간 keyframe 수 | 정거장 수만큼 |
| 각 구간 ease | 대칭 inOut(연속 흐름) / out(정거장 강조) |

**쓸 때**: 경로형 모션(마커 다지점 순회, 데이터 포인트가 차트를 따라 이동)에서 정거장마다 뚝뚝 끊기면 안 될 때.
**피할 때**: 정거장마다 의도적 '숨 고르기'(정보 확인 시간)가 필요하면 세그먼트를 분리하고 짧은 hold를 넣는 편이 낫다.

- intensity: 40-70
- pairs: `multi-phase-camera`, `coordinate-target-zoom`(로컬 규칙)

---

## elastic-amplitude-period — 엘라스틱 진폭·주기 파라미터

AE 그래프 에디터엔 elastic 프리셋이 없어, 점점 작아지는 왕복 오버슈트를 값 그래프에 손으로 여러 키 찍어야 한다.

**구현** — `elastic.out(amplitude, period)` 파라미터 두 개로 대체(코어 실측 존재). scale에만 적용하고 opacity는 결합하지 마라 — 잔진동이 색범위를 넘나든다.

```js
// amplitude 1 = 기본 진폭, period 0.3 = 짧은 주기(잔진동 많음)
tl.fromTo('#pin', { scale: 0 },
  { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.3)' }, 0.2);
```

0.8s는 등장창을 넘지만 elastic 잔진동 특성상 의도된 연출 시간.

→ hyperframes-animation Easing Vocabulary (character & mood) 참조

- intensity: 70-100
- pairs: `value-graph-overshoot-settle`

---

## bounce-drop-physics — 바운스 낙하 물리

AE Value Graph로 공 튀기기를 만들 땐 y 봉우리가 점점 낮아지는 키프레임을 여러 개 손으로 찍는다.

**구현** — `bounce.out` 하나가 감쇠하는 여러 번의 '바닥 닿기'를 자동 계산한다. opacity는 바운스에 묶지 마라 — 튕김마다 페이드가 깜빡이는 시각 결함(검증 fix 반영: 짧은 단조 페이드로 분리).

```js
tl.fromTo('#chip', { y: -160 },
  { y: 0, duration: 0.9, ease: 'bounce.out' }, 0.1);
tl.fromTo('#chip', { opacity: 0 },
  { opacity: 1, duration: 0.25, ease: 'power2.out' }, 0.1);
```

→ hyperframes-animation Easing Vocabulary (character & mood) 참조

- intensity: 70-100
- pairs: `elastic-amplitude-period`

---

## weighted-deceleration-mass — 감속 곡선으로 질량감 표현

AE Speed Graph에서 무거운 물체는 완만한 가속 후 길게 뻗는 감속 꼬리, 가벼운 물체는 즉각 반응 후 짧은 감속으로 구분한다.

**구현** — 질량감 = duration × ease family 조합. 무거움 = expo.out/power4.out + 0.7-1.0s + 오버슈트 없음. 가벼움 = power1/2.out + 0.3-0.4s. 둘 다 단조 이즈라 opacity 결합 안전.

```js
// 무거운 헤드라인 워드마크: 길게 뻗는 감속, 오버슈트 없음
tl.fromTo('#wordmark', { y: 60, opacity: 0 },
  { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out' }, 0);
// 가벼운 아이콘: 즉각 반응, 짧은 감속
tl.fromTo('#icon', { y: 12, opacity: 0 },
  { y: 0, opacity: 1, duration: 0.32, ease: 'power1.out' }, 0.05);
```

워드마크 0.9s는 무게 연출 의도의 등장창 예외.

**선택지**

| 파라미터 | 옵션 |
|---|---|
| duration | 0.3(가벼움) ~ 1.0(무거움) |
| ease family | power1(가벼움) ~ expo(무거움) |

**쓸 때**: 한 씬 안에서 요소들의 무게 위계를 이징·duration만으로 구분할 때(헤드라인=무겁게 랜딩, 아이콘=가볍게 팝).
**피할 때**: 모든 요소를 무겁게 — 위계가 사라지고 씬 전체가 늘어진다.

- intensity: 40-70
- pairs: `speed-graph-power-family`

---

## hold-keyframe-stepped-values — Hold 키프레임 → steps() 스냅

AE Toggle Hold Keyframe — 값이 다음 키프레임까지 유지되다 순간 점프한다. 보간 전혀 없음.

**구현** — CSS `steps(N, jump-none)` 또는 GSAP `ease:'steps(N)'`+roundProps로 재현. living-motion은 CSS keyframes infinite alternate + `--rf-scene-start` delay가 blessed 결정론 패턴(로컬 선례 01-anchor-transform.md). 커서 블링크 steps(1)은 → hyperframes-animation `techniques.md` 참조 — 여기선 다중 스텝으로 일반화.

```css
/* 배지 티어가 5단계로 툭툭 스냅하는 living-motion 루프 */
.rf-badge-tier {
  animation: tierSnap 2s steps(5, jump-none) infinite alternate;
  animation-delay: calc(var(--rf-scene-start, 0s) + .4s);
}
@keyframes tierSnap { from { filter: brightness(.6); } to { filter: brightness(1); } }
```

filter(brightness) 축은 1fps 스트립에서도 델타가 보이는 living-motion 안전축.

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 스텝 수 N | 단계 수만큼 |
| jump 모드 | jump-start / jump-end / jump-none / jump-both |

**쓸 때**: 디지털/데이터 톤(카운터, 상태 인디케이터), 타자기 커서, stop-motion/로파이 캐릭터.
**피할 때**: 자연스러운 유기적 모션 — 스냅 질감이 기계/디지털 톤을 강제한다.

- intensity: 40-70
- pairs: `easy-ease-linear-hold-usage`

---

## separate-dimensions-axis-ease — 축별 다른 이즈로 아크 궤적

AE Separate Dimensions는 X/Y를 독립 값 그래프로 분리해 각 축에 다른 이징·타이밍을 준다 — 두 축이 다른 시점에 도착하며 대각선이 아닌 곡선 아크가 된다.

**구현** — x/y를 한 tween에 묶지 말고, 같은 시작 시각의 별도 fromTo 두 개(다른 duration/ease)로 쪼개라. 도착 타이밍이 어긋나며 자연스러운 아크가 생긴다. 둘 다 순수 fromTo라 seek-safe.

```js
// X는 빠르게 도착, Y는 늦게 도착 → 대각선이 아니라 아크형 궤적
tl.fromTo('#node', { x: -260 }, { x: 0, duration: 0.4, ease: 'power2.out' }, 0.2);
tl.fromTo('#node', { y: 80 },   { y: 0, duration: 0.7, ease: 'power3.out' }, 0.2);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| X/Y duration 차이 | 0.2-0.4s 갭 (클수록 깊은 호) |
| X/Y ease family | 다른 계열 조합으로 호 모양 제어 |

**쓸 때**: 요소가 대각선이 아니라 곡선/아크 궤적으로 도착해야 할 때(카드가 옆에서 튀어나와 살짝 호를 그리며 안착).
**피할 때**: 직선 이동이 의도인 기계적/데이터 톤 — 그냥 단일 tween.

- intensity: 40-70
- pairs: `speed-graph-power-family`

---

## scene-boundary-tangent-handoff — 씬 경계 접선 핸드오프

여러 컴프를 넘나드는 연속 모션에서 이전 컴프의 퇴장 접선 속도와 다음 컴프의 진입 접선 속도를 맞춰(연속 베지어) 이어붙이는 AE 관례.

**구현** — HyperFrames 씬은 격리된 sub-composition이라 접선을 직접 공유할 수 없다. 대신 전환 페어로 앵커 좌표와 '어떤 이즈 성격으로 끝났는지'를 양쪽에 각각 독립 선언해, enter 이즈의 앞부분이 exit 이즈의 뒷부분과 감속 성격이 이어지게 하라.

```js
// exit anchor(이전 씬): power3.out으로 감속하며 (x:640, scale:1)에서 정지
tl.fromTo('#card', { x: 0, scale: .9 },
  { x: 640, scale: 1, duration: .6, ease: 'power3.out' }, 1.8);

// enter anchor(다음 씬, 별도 컴프/파일): 동일 성격의 감속으로 재출발
tl.fromTo('#card', { x: -640, scale: 1 },
  { x: 0, scale: 1, duration: .5, ease: 'power3.out' }, 0);
```

씬 경계를 넘는 실제 상태 공유(전역 변수, DOM 크로스 참조)는 계약 위반(RF-FRAGMENT-009/010) — 반드시 각 씬 내부에서 좌표/이즈를 독립 선언하는 '페어'로만 표현하라.

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 양쪽 앵커 | 좌표/스케일 값 매치 |
| ease family | 양쪽 동일 계열 유지(예: 둘 다 power3) |

**쓸 때**: 컷 전환에서 오브젝트가 하나의 몸짓처럼 이어지길 원할 때(가짜 연속성으로 씬 경계를 감춤).
**피할 때**: 완전히 다른 오브젝트로 컷될 때 — 그땐 그냥 컷/디졸브가 맞다.

- intensity: 40-70
- pairs: `rolling-tension-chain`

---

## Sources

- vendor 실측: `/home/seunghyeong/reelforge-v5-engine/vendor/gsap/3.14.2/gsap.min.js` — Power0-4/Linear/Sine/Expo/Circ/Back/Elastic/Bounce/SteppedEase 코어 등록, 함수 이즈 네이티브 지원, CustomEase·EasePack 부재 확인
- hyperframes-animation `adapters/gsap-easing-and-stagger.md` — house 기본 이즈(power3.out), Spring Eases 독트린, springEase 함수 패턴
- hyperframes-animation `rules/spring-pop-entrance.md` — 오버슈트 파라미터 범위·opacity 분리 원칙
- hyperframes-animation `techniques.md` — 커서 블링크 steps(1) 선례
- 로컬 그래머 선례: `01-anchor-transform.md`(living-motion blessed 패턴), `06-shapes-strokes.md`(리터럴 출발 카운터 onUpdate blessed 패턴)
- 린트 계약: `src/compiler/render-lint.mjs` — RF-FRAGMENT-003(비결정 API 금지), 004(paused:true), 008/010(씬 격리)
- AE 공식 튜토리얼(그래프 에디터·Keyframe Velocity·Separate Dimensions·Hold Keyframe), MDN cubic-bezier, gsap.com Easing 문서
- 검증 판정 2026-07-25: 13기법 중 pass 10 · fix 3(value-graph-overshoot-settle, anticipation-windup-chain, bounce-drop-physics — opacity 분리/fromTo 결정화 반영), drop 0
