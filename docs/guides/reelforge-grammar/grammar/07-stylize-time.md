# 스타일라이즈 이펙트 + 속도 연출 (Stylize & Time Manipulation)

> 이 문서의 코드 스케치는 렌더 대상이 아니다 — 검증 실물은 references/gallery/fragments/, 이 파일은 통째 로딩 금지(배정 기법 섹션만 부분 로딩).

AE의 Stylize/Time 계열 이펙트(Glow·채널 분리·그레인·타임 리매핑·Echo·Posterize Time)를 HyperFrames 계약(단일 paused timeline, seek-safe, GSAP 코어 전용) 위에서 재현하는 13기법 레퍼런스. 텍스처는 "정적 레이어 + 결정론적 토글", 속도감은 "이즈 곡선·이벤트 밀도"로 만드는 것이 공통 골격이다.

**vendor 전제**: `/vendor/gsap/3.14.2/`에는 gsap.min.js(코어)만 존재한다. `steps(n)`(SteppedEase)·함수형 ease·`gsap.utils.toArray`·CSSPlugin(clipPath/filter/mix-blend 포함)은 코어에 실재하지만, CustomEase·MotionPathPlugin·SplitText·RoughEase/SlowMo는 없다 — 커스텀 곡선은 순수 함수 ease로, 경로는 x/y 배열 보간으로 대체하라.

**공통 계약 원칙** (이 문서 전 기법에 적용):
- **seek-safe 앵커링**: 렌더는 `tl.seek(frame)` 프레임 샘플링이다. 속성을 완전 제어하는 `fromTo`/앵커된 `set` 체인은 결정론적이지만, 앵커 없는 순수 `to()` 다중 트윈은 lazy start-capture로 비결정 위험 — 같은 속성을 여러 번 움직일 때는 반드시 선행 `set`/`fromTo`로 시작값을 앵커하라.
- **랜덤 금지**: `Math.random`/`Date.now`/`performance.now`는 lint(RF-FRAGMENT-003)가 차단한다. 모든 "무작위처럼 보이는" 변주는 고정 배열·인덱스·고정 seed로 만들라.
- **토큰 규범**: 색은 `--rf-*` 토큰만. `color-mix`·`hue-rotate`·저투명도 파생은 허용되나 새 hex 도입은 금지(lint는 검사하지 않음 — 저작 책임이다).
- **repeat:-1 금지**: 무한 반복은 시크 클럭과 어긋난다. 브리딩·펄스는 유한 위상 트윈으로 구현하라.
- 오버레이 레이어는 `#root` 직접 배경 금지(RF-FRAGMENT-012) — 항상 `inset:0` 자식 레이어로 깔라. 기본 원자 모션 규칙·이즈 카탈로그·텍스트 이펙트는 → hyperframes-animation 참조.

## Contents

1. [glow-pulse-halo — 글로우 펄스 헤일로](#glow-pulse-halo--글로우-펄스-헤일로)
2. [chromatic-aberration-static — 색수차(정적 렌즈 룩)](#chromatic-aberration-static--색수차정적-렌즈-룩)
3. [chromatic-aberration-glitch-cut — 색수차 글리치 컷(임팩트)](#chromatic-aberration-glitch-cut--색수차-글리치-컷임팩트)
4. [vhs-tracking-glitch — VHS 트래킹 밴드시어 글리치](#vhs-tracking-glitch--vhs-트래킹-밴드시어-글리치)
5. [film-grain-seeded-flip — 필름 그레인(고정 시드 플립북)](#film-grain-seeded-flip--필름-그레인고정-시드-플립북)
6. [scanline-interlace — 스캔라인/인터레이스 오버레이](#scanline-interlace--스캔라인인터레이스-오버레이)
7. [light-sweep-sheen — 라이트 스윕(트래블링 신)](#light-sweep-sheen--라이트-스윕트래블링-신)
8. [light-leak-film-burn — 라이트 리크/필름 번](#light-leak-film-burn--라이트-리크필름-번)
9. [speed-ramp-density — 스피드램프(키프레임 밀도 기반)](#speed-ramp-density--스피드램프키프레임-밀도-기반)
10. [motion-smear-echo — 스미어/잔상(고스트 트레일)](#motion-smear-echo--스미어잔상고스트-트레일)
11. [flash-frame-subliminal — 플래시 프레임(서브리미널 삽입 컷)](#flash-frame-subliminal--플래시-프레임서브리미널-삽입-컷)
12. [strobe-pulse-grid — 스트로브(비트 그리드 플래시)](#strobe-pulse-grid--스트로브비트-그리드-플래시)
13. [vignette-impact-pulse — 비네트 임팩트 펄스](#vignette-impact-pulse--비네트-임팩트-펄스)

## glow-pulse-halo — 글로우 펄스 헤일로

AE Glow의 4대 파라미터(Glow Based On·Threshold·Radius·Intensity + Composite Original)를 히어로 요소 "뒤" 별도 radial-gradient 레이어로 재현한다.

**구현** — box-shadow는 falloff 제어가 약하다. 히어로 뒤(z-index 낮음) glow 레이어를 opacity+scale로 블룸인시키고, `repeat:-1` 대신 위상값을 트윈으로 구동하는 유한 브리딩을 얹어라. 알파 윤곽이 뚜렷한 텍스트/아이콘은 `filter:drop-shadow()`가 대안이다.

```css
.glow{ background:radial-gradient(circle,
  color-mix(in srgb, var(--rf-accent) 70%, transparent), transparent 70%); }
```
```js
const glow = document.getElementById('glow');
tl.fromTo(glow,
  { opacity: 0, scale: 0.85 },
  { opacity: 0.3, scale: 1, duration: 0.9, ease: 'power2.out' },
  BLOOM_START);
// 유한 브리딩: 위상 p를 0→2π×3(사이클 3회)까지 단일 트윈으로 진행 — seek 클럭과 항상 일치
const phase = { p: 0 };
tl.to(phase, {
  p: Math.PI * 2 * 3, duration: HOLD_DUR, ease: 'none',
  onUpdate: () => {
    const s = Math.sin(phase.p);
    glow.style.opacity = 0.3 + s * 0.03;      // ±0.03 = 인지 하한 바로 위, 상한 0.45 준수
    glow.style.transform = `scale(${1 + s*0.02})`;
  }
}, BLOOM_START + 0.9);
```

위상값이 트윈으로 구동되므로 어느 프레임을 seek해도 결정론적이다. `BLOOM_START`/`HOLD_DUR`는 프래그먼트에서 상수로 정의하라.

**선택지**

| 파라미터 | 옵션 |
|---|---|
| peak opacity | 0.15 / 0.30 / 0.45 |
| 브리딩 | on / off |
| scale swell 시작값 | 0.8~0.95 |
| Composite | glow-behind(기본) / glow-front(드문 강조) |

**쓸 때**: 히어로 카드/로고/스탯 카운터의 "파워온" 순간, 카운트업 완료 직후의 존재감 부여.
**피할 때**: 이미 밝은 배경(워시아웃), 여러 히어로 동시 브리딩(강도를 /√N으로 낮추지 않으면 시각 합산 과다).

- intensity: 0-40
- pairs: `light-sweep-sheen`, `vignette-impact-pulse`

## chromatic-aberration-static — 색수차(정적 렌즈 룩)

AE의 표준 RGB 스플릿(Shift Channels로 R/G/B 분리 → Add 블렌드 → 채널별 미세 오프셋)을 3레이어 CSS로 재현한다.

**구현** — 동일 콘텐츠 3레이어를 `mix-blend-mode:screen`(웹의 Add 근사)으로 겹치고 고정 x 오프셋을 상시 부여하라. 임의 hex 대신 단일 `--rf-accent`를 `filter:hue-rotate()`로 파생하라(하나의 원본 색조 변주이지 새 색값 도입이 아님). 정적 CSS라 별도 트윈이 필요 없다.

```html
<span class="ca-layer r">TITLE</span>
<span class="ca-layer g">TITLE</span>
<span class="ca-layer b">TITLE</span>
```
```css
.ca-layer{ position:absolute; inset:0; color:var(--rf-accent);
  mix-blend-mode:screen; will-change:transform; }
.ca-layer.r{ transform:translateX(-2px); filter:hue-rotate(0deg); }
.ca-layer.g{ transform:translateX(2px);  filter:hue-rotate(40deg); }
.ca-layer.b{ transform:translateX(0);    filter:hue-rotate(-40deg); }
```

hue-rotate ±140deg는 토큰에서 먼 색(녹/마젠타)을 만들어 토큰 순수성이 스트레치된다 — 기본은 오프셋 ±1~2px + hue-rotate ±40deg 이하로 잡고, 강한 분리가 필요하면 채널당 별도 토큰(`--rf-accent`/`--rf-success` 등)을 배정하라. 이 기법 자체엔 모션이 없으므로 living-motion 요건은 위에 얹히는 콘텐츠 애니메이션이 충족해야 한다.

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 오프셋 | 1~3px(미묘) / 4~8px(뚜렷) |
| hue-rotate 각도 | ±40deg(안전 기본) / 90~160deg(토큰 스트레치 — 별도 토큰 권장) |
| 적용 대상 | 텍스트만 / 배경 이미지만 |

**쓸 때**: 사이버/테크/프리미엄 렌즈 무드의 상시 배경 텍스처.
**피할 때**: 작은 본문 텍스트(가독성 저하), 브랜드 색 정합이 중요한 클린 톤.

- intensity: 0-40

## chromatic-aberration-glitch-cut — 색수차 글리치 컷(임팩트)

정적 색수차에 스텝형(계단) 키프레임 오프셋 스파이크를 얹어 "비트 히트"를 만든다 — 뮤직비디오/트레일러 로고 슬램의 표준 whip.

**구현** — 각 채널에 T시점 선행 `tl.set(x)` 앵커를 먼저 박고, `steps(1)` 점프컷 오프셋을 0.03~0.06s 간격으로 쌓은 뒤 짧은 `power2.out`으로 수렴시켜라. 앵커 덕에 뒤따르는 `to()`들의 start가 결정론적으로 잡힌다(seek-safe의 핵심).

```js
tl.set('.ca-layer.r', { x: -2 }, T);              // 앵커 — 이후 to()의 start 확정
tl.set('.ca-layer.g', { x: 2 }, T);
tl.to('.ca-layer.r', { x: -14, duration: 0.06, ease: 'steps(1)' }, T+0.3);
tl.to('.ca-layer.g', { x: 14, duration: 0.06, ease: 'steps(1)' }, T+0.3);
tl.to('.ca-layer.r', { x: -22, duration: 0.04, ease: 'steps(1)' }, T+0.45);
tl.to('.ca-layer.g', { x: 22, duration: 0.04, ease: 'steps(1)' }, T+0.45);
// 수렴
tl.to('.ca-layer.r', { x: -2, duration: 0.4, ease: 'power2.out' }, T+0.6);
tl.to('.ca-layer.g', { x: 2,  duration: 0.4, ease: 'power2.out' }, T+0.6);
tl.fromTo('.scanlines', { opacity: 0 }, { opacity: 0.85, duration: 0.06, ease: 'steps(1)' }, T+0.3);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 오프셋 최대치 | 14~30px |
| 스캔라인 동반 | on / off |
| 지속시간 | 0.2~0.5s |
| 스텝 간격 | 0.03~0.06s(1~2프레임@30fps — 끊김이 프레임 경계에 얹힘) |

**쓸 때**: 비트 히트, 로고 슬램 직전 임팩트 프레임(0.2~0.4s), 컷 전환의 펀치감.
**피할 때**: 차분/기업 톤, 3초 이상 유지(멀미 유발).

- intensity: 70-100
- pairs: `flash-frame-subliminal`, `scanline-interlace`

## vhs-tracking-glitch — VHS 트래킹 밴드시어 글리치

아날로그 VHS 데크의 트래킹 노이즈 — 수평 밴드 단위 어긋남(밴드 시어)과 미세 좌우 흔들림(테이프 위브)을 재현한다.

**구현** — 화면을 `clip-path: inset()`으로 3~5개 수평 밴드로 잘라 각 밴드에 결정론적 배열의 x 전단을 `fromTo`로 부여하고(앵커=seek-safe), red/cyan 오정합 사본을 겹쳐라. `steps(1)` 스냅으로 어긋났다 SNAP 정렬. 위브 배열의 마지막 원소는 0이어야 종료 후 x=0으로 정착한다.

```js
// 밴드별 결정론적 shear — Math.random 금지, 배열 인덱스가 전부 결정
const BAND_CLIPS = [[0,64],[36,30],[70,0]];
const BAND_SHEAR = [-46, 40, -34];
BAND_CLIPS.forEach((clip, i) => {
  const band = bands[i];
  gsap.set(band, { clipPath: `inset(${clip[0]}px 0 ${clip[1]}px 0)` });
  tl.fromTo(band, { x: BAND_SHEAR[i] }, { x: 0, duration: 0.12, ease: 'steps(1)' }, T);
});
// 테이프 위브: 고정 배열 순차 적용(랜덤 아님), 마지막 0으로 idle 정착
const WEAVE = [-2,1,-1,2,-1,1,-2,0];
WEAVE.forEach((wx, i) => tl.set('#frame', { x: wx }, T + i*0.03));
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 밴드 수 | 3~5 |
| shear 범위 | -50~50px |
| misregistration 오프셋 | 2~11px |
| 위브 지속 | 스텝 0.03s × 6~10회 |

**쓸 때**: 레트로/파운드푸티지/신호 불안정 연출, "REC" 진입 순간.
**피할 때**: 클린 프로덕트 데모, 정보 판독이 중요한 데이터 씬.

- intensity: 70-100
- pairs: `chromatic-aberration-glitch-cut`, `scanline-interlace`, `film-grain-seeded-flip`

## film-grain-seeded-flip — 필름 그레인(고정 시드 플립북)

AE Add Grain의 "살아있는" 노이즈를, seed 고정 시 완전 결정론적인 SVG `feTurbulence` 정적 레이어 여러 장을 스위칭하는 플립북으로 재현한다.

**구현** — seed를 달리한 2~4장의 정적 그레인 필터 레이어를 미리 만들고, `tl.set`으로 고정 간격마다 opacity를 토글하라. 색은 `--rf-text` 저투명도 + `mix-blend-mode:overlay` 파생(새 색값 없음). 루프의 t 진행은 저작 시점 배치 계산일 뿐 런타임 상태변이가 아니다 — 결정론적.

```html
<svg width=0 height=0 aria-hidden=true>
 <filter id="grain-1"><feTurbulence type="fractalNoise"
   baseFrequency="0.9" numOctaves="2" seed="1" stitchTiles="stitch"/></filter>
 <filter id="grain-2"><feTurbulence type="fractalNoise"
   baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch"/></filter>
</svg>
<div class="grain-layer" style="filter:url(#grain-1)"></div>
<div class="grain-layer" style="filter:url(#grain-2)"></div>
```
```css
.grain-layer{ position:absolute; inset:0; opacity:0;
  background:var(--rf-text); mix-blend-mode:overlay; pointer-events:none; }
```
```js
// 결정론적 플립: 0.12s(≈3프레임@25fps)마다 레이어 토글, 랜덤 없음
for (let t = 0; t < DURATION; t += 0.12) {
  const cur = layers[Math.floor(t / 0.12) % layers.length];
  const prev = layers[(Math.floor(t / 0.12) - 1 + layers.length) % layers.length];
  tl.set(prev, { opacity: 0 }, t);
  tl.set(cur, { opacity: 0.06 }, t);
}
```

**금지**: SMIL `<animate>`로 seed/baseFrequency를 연속으로 흔드는 방식은 렌더러별 비일관·비결정 소지로 계약 위반 — 반드시 고정 seed 정적 레이어의 플립북 패턴만 사용하라.

**선택지**

| 파라미터 | 옵션 |
|---|---|
| opacity | 0.03~0.08(잔잔) / 0.1~0.2(필름룩 강조) |
| seed 레이어 수 | 2~4 |
| 플립 간격 | 0.08~0.16s(2~4프레임@24-30fps) |

**쓸 때**: 필름/아날로그 전체 씬 텍스처, VHS/레트로 룩과 결합.
**피할 때**: 클린 UI/모던 SaaS 톤, 4K 클로즈업 텍스트(가독성 저해).

- intensity: 0-40
- pairs: `vhs-tracking-glitch`, `strobe-pulse-grid`

## scanline-interlace — 스캔라인/인터레이스 오버레이

CRT/브라운관의 수평 라인 패턴 — VHS·홀로그램·아케이드 룩의 상시 질감 표준.

**구현** — `repeating-linear-gradient` 1px 줄무늬를 inset:0 자식 오버레이로 깔라. 상시엔 낮은 opacity, 임팩트 프레임에서만 `fromTo`(opacity 완전 제어=seek-safe)로 스파이크 후 복귀.

```html
<div class="scanlines"></div>
```
```css
.scanlines{ position:absolute; inset:0; pointer-events:none;
  background:repeating-linear-gradient(0deg,
    transparent 0px, transparent 3px,
    color-mix(in srgb, var(--rf-text) 4%, transparent) 3px,
    color-mix(in srgb, var(--rf-text) 4%, transparent) 4px);
  opacity:0.15; }
```
```js
// 임팩트 순간 스파이크 후 상시값 복귀
tl.fromTo('.scanlines', { opacity:0.15 },
  { opacity:0.85, duration:0.06, ease:'steps(1)' }, IMPACT_T);
tl.to('.scanlines', { opacity:0.15, duration:0.5, ease:'power2.out' }, IMPACT_T+0.06);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 줄 간격 | 3~6px |
| 상시 opacity | 0.02~0.06 |
| 스파이크 opacity | 0.3~0.85 |

**쓸 때**: VHS/아케이드/홀로그램 룩의 상시 텍스처, 임팩트 프레임의 노이즈 동반.
**피할 때**: 미니멀/클린 톤.

- intensity: 0-40
- pairs: `vhs-tracking-glitch`, `chromatic-aberration-glitch-cut`

## light-sweep-sheen — 라이트 스윕(트래블링 신)

그라디언트 와이프/리니어 라이트 — 좁은 하이라이트 밴드가 표면을 단 한 번 가로질러 "빛이 훑고 지나갔다"는 인상을 준다. 로고 신의 표준 sheen 마감.

**구현** — surface `overflow:hidden` 안에서 밴드를 오프서피스→오프서피스로 `fromTo` 단발 이동시켜라. `ease:'none'` 등속(빛은 가속/감속 없이 훑는 게 자연스럽다), repeat 없이 정확히 1회. 이동 fromTo를 0.8s에 끝내고 페이드아웃을 그 뒤에 이어붙이면 opacity를 두 트윈이 겹쳐 제어하는 구간이 없어 가장 깔끔하다.

```css
.sweep{ position:absolute; top:0; bottom:0; width:15%;
  background:linear-gradient(105deg, transparent,
    color-mix(in srgb, var(--rf-accent) 60%, transparent), transparent); }
```
```js
tl.fromTo('#sweep',
  { x: SWEEP_START_X, opacity: 0 },
  { x: SWEEP_END_X, opacity: 0.25, duration: 0.8, ease: 'none' },
  SWEEP_START);
// 페이드는 이동 종료 후 시작 → opacity 제어권 겹침 없음
tl.to('#sweep', { opacity: 0, duration: 0.3, ease: 'power1.in' }, SWEEP_START + 0.8);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 밴드 폭 | 8~35% surface width |
| peak opacity | 0.10~0.40 |
| 각도 | 0°(수평) / 105°(사선 — 시계 반대 기울기의 관용값) |

**쓸 때**: 로고/워드마크/카드 조립 완료 직후의 "완성 신호" 원샷 하이라이트.
**피할 때**: 반복 sweep(로딩 스피너처럼 보임 — 금지), 이미 붐비는 배경.

- intensity: 0-40
- pairs: `glow-pulse-halo`

## light-leak-film-burn — 라이트 리크/필름 번

아날로그 필름 카메라의 렌즈 플레어/노광 누출 — 웜톤 radial gradient가 프레임 가장자리에서 번져 들어와 씬을 워시한다.

**구현** — 프레임보다 큰 warm radial-gradient 레이어 2~3장을 각기 다른 타이밍으로 드리프트시켜라. **모든 인트로는 `fromTo`로 앵커하고, 페이드아웃 `to`는 인트로 종료 이후에 시작**시켜 start가 fromTo 종료값으로 확정되게 하라(앵커 없는 순수 to 다중 트윈은 seek 비결정 위험). 색은 `--rf-accent`를 warm 방향으로만 사용 — 새 hex 금지.

```js
tl.fromTo('#leak-warm', {opacity:0}, {opacity:0.4, duration:0.3, ease:'power1.in'}, T);
tl.fromTo('#leak-1', {opacity:0, x:0}, {opacity:0.6, x:300, duration:0.5, ease:'sine.inOut'}, T+0.05);
tl.fromTo('#leak-2', {opacity:0, x:0}, {opacity:0.5, x:200, duration:0.6, ease:'sine.inOut'}, T+0.1);
// 페이드아웃은 각 인트로 종료 이후 시작 → start가 결정론적, 겹침 없음
tl.to('#leak-warm', {opacity:0, duration:0.4, ease:'power2.out'}, T+0.5);   // 인트로 T+0.3 종료 후
tl.to('#leak-1',    {opacity:0, x:600, duration:0.35, ease:'power1.out'}, T+0.55); // 인트로 T+0.55 종료 직후
tl.to('#leak-2',    {opacity:0, x:520, duration:0.35, ease:'power1.out'}, T+0.7);  // 인트로 T+0.7 종료 직후
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 리크 개수 | 1~3 |
| 피크 opacity | 0.4~0.9 |
| 드리프트 거리 | 200~600px |

**쓸 때**: 씬 내부 악센트, 노스탤직/라이프스타일 톤의 임팩트.
**피할 때**: 정보 밀도 높은 데이터 씬(리크가 콘텐츠를 가림).

- intensity: 40-70

## speed-ramp-density — 스피드램프(키프레임 밀도 기반)

AE Speed Graph의 급락(슬로우모)/스파이크(고속)가 곧 램프 — 핵심은 시간 자체가 아니라 값-시간 매핑 곡선의 기울기 변화다.

**구현** — 재생 중 `timeScale`을 매 프레임 바꾸는 방식은 **금지**(파생 로직이 seek 순서에 의존 → 비결정). 대신 두 가지로 대체하라: (1) 구동값 진행을 piecewise 순수 함수 이즈(느림→급가속→감속)로 매핑, (2) 파티클/틱/컷 같은 시각 이벤트 밀도를 구간별로 다르게 배치. 둘 다 `tl.seek(아무 t)`에서 결정론적이다.

```js
// 커스텀 이즈 — CustomEase 플러그인 부재를 순수 함수로 우회(GSAP은 함수형 ease 허용)
function rampEase(p) {
  // 0-0.3: 느리게(0.3배속 느낌), 0.3-0.6: 급가속, 0.6-1: 감속 착지
  // 경계 연속성 검증됨: p=0.3에서 0.1, p=0.6에서 0.8, ease(0)=0, ease(1)=1
  if (p < 0.3) return (p / 0.3) * 0.1;
  if (p < 0.6) return 0.1 + ((p - 0.3) / 0.3) * 0.7;
  return 0.8 + (1 - Math.pow(1 - (p - 0.6) / 0.4, 3)) * 0.2;
}
tl.to(driver, { value: 1, duration: 2.4, ease: rampEase, onUpdate: render }, T);
// 밀도 기반 대안: '고속' 구간에서만 컷/파티클 빈도를 4배로
FAST_WINDOW.forEach((t, i) => tl.set('.tick', { opacity: 1 }, T + i * (STEP / 4)));
```

`onUpdate:render`는 driver.value만 읽어야 seek-safe다. 경로 기반 램프는 MotionPathPlugin이 vendor에 없으므로 수동 x/y 배열 보간으로 대체하라.

**선택지**

| 파라미터 | 옵션 |
|---|---|
| piecewise 구간 수 | 2~4 |
| 이벤트 밀도 배수 | 1x / 2x / 4x |
| 램프 방향 | 가속 / 감속 / 가속-감속 |

**쓸 때**: 몽타주/하이라이트 릴, 카운트업이 "가속하다 착지"하는 느낌, 다다닥 컷 리듬.
**피할 때**: 내레이션 동기화 구간(발화 타이밍 붕괴 위험), 정밀 데이터 판독 구간.

- intensity: 40-70
- pairs: `motion-smear-echo`

## motion-smear-echo — 스미어/잔상(고스트 트레일)

진짜 모션 블러(셔터 개방 광 적분)는 프레임 seek 렌더러에 존재하지 않는다 — AE도 Echo(Echo Time·Number of Echoes·Decay)로 "가짜" 잔상을 만든다.

**구현** — 리드 요소 뒤 2~4개 복제 레이어에 인덱스 기반 결정론적 오프셋(`i*STEP`)과 감쇠 오파시티(`BASE/i` — Echo의 Decay 등가)를 부여하고, 리드 정착 순간 모두 수렴/소멸시켜라. 모든 고스트/리드가 `fromTo` 앵커 = 완전 seek-safe. 변주는 HTML `data-i`가 전부 결정한다(랜덤 무관).

```js
gsap.utils.toArray('.echo-ghost').forEach((g) => {
  const i = Number(g.dataset.i); // 1..N, HTML에 미리 기입
  tl.fromTo(g,
    { x: ENTER_FROM_X - i * ECHO_STEP, opacity: 0.45 / i },
    { x: 0, opacity: 0, duration: MOVE_DUR, ease: MOVE_EASE },
    MOVE_START);
});
tl.fromTo('#lead',
  { x: ENTER_FROM_X, opacity: 0 },
  { x: 0, opacity: 1, duration: MOVE_DUR, ease: MOVE_EASE },
  MOVE_START);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 고스트 수 | 2~4 |
| 간격 | 12~40px |
| 베이스 opacity | 0.3~0.6 |

**쓸 때**: 빠른 진입/카메라 푸시, 로고 펀치스루, 고속 이동 컷의 착지 강조.
**피할 때**: 씬 중간 퇴장(글리치처럼 보임 — 항상 진입 전용), 얇거나 저대비인 타이포.

- intensity: 40-70
- pairs: `speed-ramp-density`

## flash-frame-subliminal — 플래시 프레임(서브리미널 삽입 컷)

편집 용어 flash frame — 단 1~3프레임만 지속되는 화이트/컬러 프레임을 삽입해 시각적 충격을 준다(AE의 단일 키프레임 홀드 등가).

**구현** — 트윈이 아니라 `tl.set()` 즉시 값 변경 대칭 쌍이라야 "번쩍"이 프레임 경계에서 정확히 재현된다. seek 결정론: 삽입 구간 밖은 CSS 기본 0, 구간 내 프레임만 1.

```js
// 정확히 1프레임(30fps 기준 0.0333s) 동안만 풀스크린 오버레이
tl.set('#flash', { opacity: 1 }, IMPACT_T);
tl.set('#flash', { opacity: 0 }, IMPACT_T + 0.0333);
```
```css
#flash{ position:absolute; inset:0; background:var(--rf-text);
  opacity:0; pointer-events:none; z-index:99; }
```

`IMPACT_T`는 프레임 그리드(1/fps 배수)에 정렬하라 — 어긋나면 1프레임을 통째로 놓칠 수 있다.

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 프레임 수 | 1~3 |
| 컬러 | `--rf-text`(화이트) / `--rf-accent` |
| 삽입 빈도 | 단발(기본) / 드문 반복 |

**쓸 때**: 비트 히트, 로고 슬램 직전의 "충격" 예고, 컷 전환의 펀치감.
**피할 때**: 광과민성 우려 — 고빈도 반복 절대 금지. 차분한 톤의 콘텐츠.

- intensity: 70-100
- pairs: `chromatic-aberration-glitch-cut`, `vignette-impact-pulse`

## strobe-pulse-grid — 스트로브(비트 그리드 플래시)

플래시 프레임을 일정 비트 그리드로 반복 배치한 것 — EDM/뮤직비디오 편집의 핵심 리듬 장치(낮은 Posterize Time과 동일 원리).

**구현** — 시작/끝/간격으로 결정론적 시간 배열을 만드는 `gridJumps` 헬퍼로 각 지점마다 텍스처/컬러 레이어를 순환 토글하라(진짜 랜덤 없이 "번쩍임" 재현). 버스트 종료 시 반드시 idle로 컷백. looks 레이어의 CSS 기본 opacity는 0이어야 idle이 깔끔하다.

```js
function gridJumps(start, end, step) {
  const n = Math.floor((end - start) / step + 1e-6) + 1; // 1e-6 = 부동소수 경계 보정
  return Array.from({length:n}, (_,i) => +(start + i*step).toFixed(4));
}
let step = 0, prev = null;
gridJumps(BURST_START, BURST_END, 0.125).forEach((t) => {  // 0.125s = 120BPM 16분음표 그리드
  const cur = looks[step % looks.length];
  if (prev && prev !== cur) tl.set(prev, { opacity: 0 }, t);
  tl.set(cur, { opacity: 1 }, t);
  prev = cur; step += 1;
});
if (prev) tl.set(prev, { opacity: 0 }, BURST_END); // idle로 컷백
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 스텝 간격 | 0.06~0.25s |
| 프레임 소스(텍스처/컬러) 수 | 3~7 |
| 버스트 구간 길이 | 0.5~2s |

**쓸 때**: 비트 동기 하이라이트, 릴리즈 임팩트 구간(1~3초 이내).
**피할 때**: 3초 이상 지속(피로/광과민 우려), 내레이션 겹침 구간.

- intensity: 70-100
- pairs: `flash-frame-subliminal`, `film-grain-seeded-flip`

## vignette-impact-pulse — 비네트 임팩트 펄스

비네트(가장자리 어둡게)는 시선을 중앙으로 모으는 고전 기법 — 히트 순간 순간적으로 좁혔다 넓히면 "충격의 압력"이 시각화된다.

**구현** — 방사형 gradient 오버레이(중앙 투명→가장자리 `--rf-bg`)의 opacity/scale을 `fromTo`로 급격히 좁혔다가(power2.in) `to`로 완만히 되돌려라(power2.out). 선행 fromTo가 상태를 완전 확정하므로 뒤 to의 start가 결정론적이다. 반복 없이 정확히 1회.

```css
#vignette{ position:absolute; inset:-10%;  /* -10% = scale 펄스 시 가장자리 노출 방지 여유 */
  background:radial-gradient(circle, transparent 55%, var(--rf-bg) 100%); }
```
```js
tl.fromTo('#vignette',
  { opacity: 0.2, scale: 1 },
  { opacity: 0.55, scale: 0.85, duration: 0.12, ease: 'power2.in' },
  IMPACT_T);
tl.to('#vignette', { opacity: 0.2, scale: 1, duration: 0.35, ease: 'power2.out' }, IMPACT_T + 0.12);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 비네트 강도 | 0.2~0.6 |
| 펄스 지속 | 0.15~0.3s |
| scale 좁힘 정도 | 0.8~0.95 |

**쓸 때**: 카운트업 완료, 충돌/임팩트 정착 순간의 강조.
**피할 때**: 이미 어두운 배경(효과가 안 보임), 텍스트가 프레임 가장자리 가까이 배치된 레이아웃.

- intensity: 40-70
- pairs: `glow-pulse-halo`, `flash-frame-subliminal`

## Sources

- Adobe After Effects 공식 문서 — Glow(Glow Based On/Threshold/Radius/Intensity/Composite Original), Shift Channels, Add Grain/Noise HLS, Echo(Echo Time/Number of Echoes/Decay/Echo Operator), CC Force Motion Blur(Samples/Shutter Angle), Posterize Time, Time Remapping Speed Graph
- MDN — `<feTurbulence>`(baseFrequency/numOctaves/seed, seed 고정 시 결정론적 정적 패턴), `mix-blend-mode`, `color-mix()`, `filter: hue-rotate()/drop-shadow()`, `clip-path: inset()`, `repeating-linear-gradient`
- GSAP 3 문서 + vendor 실측 — `/vendor/gsap/3.14.2/gsap.min.js` 코어 단일 파일: SteppedEase(`steps(n)`)·함수형 ease·`gsap.utils.toArray`·CSSPlugin 포함 / CustomEase·MotionPathPlugin·SplitText·EasePack 미포함
- render-lint 규칙(`src/compiler/render-lint.mjs`, RF-FRAGMENT-001~015) + 검증 판정 노트 — 13기법 seek-safety/계약 심사(2026-07, light-leak-film-burn fromTo 앵커링 수정 반영)
