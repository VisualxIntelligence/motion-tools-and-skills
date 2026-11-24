# 03 — 레이어 분해 2.5D/3D + 가상 카메라

> 이 문서의 코드 스케치는 렌더 대상이 아니다 — 검증 실물은 references/gallery/fragments/, 이 파일은 통째 로딩 금지(배정 기법 섹션만 부분 로딩).

씬을 깊이별 plane으로 쪼개고 가상 카메라(월드/리그)를 움직여 입체감을 만드는 기법 12종.
모든 스케치는 RF-FRAGMENT v1.0 계약 준수: core GSAP만(vendor에 플러그인 없음), `paused:true` 타임라인, arbitrary-seek 결정적, `Math.random`/`Date.now`/fetch 금지.

## Contents

1. [parallax-3plane-rule — 시차 레이어 3평면 규칙](#parallax-3plane-rule--시차-레이어-3평면-규칙)
2. [multiplane-dolly-push — 멀티플레인 돌리 푸시/풀](#multiplane-dolly-push--멀티플레인-돌리-푸시풀-진짜-z축-카메라)
3. [camera-orbit-turntable — 카메라 오빗 턴테이블](#camera-orbit-turntable--카메라-오빗-턴테이블)
4. [dolly-zoom-vertigo — 버티고 돌리줌](#dolly-zoom-vertigo--버티고-돌리줌)
5. [whip-pan-cut-mask — 휩팬 하드컷 마스킹](#whip-pan-cut-mask--휩팬-하드컷-마스킹)
6. [crane-pedestal-tilt — 크레인 승강+틸트 복합 무브](#crane-pedestal-tilt--크레인-승강틸트-복합-무브)
7. [rack-focus-reference — 랙포커스 페이크 (참조 전용)](#rack-focus-reference--랙포커스-페이크-참조-전용)
8. [perspective-origin-eye-shift — 퍼스펙티브 오리진 시선 이동](#perspective-origin-eye-shift--퍼스펙티브-오리진-시선-이동)
9. [preserve-3d-layer-safety — preserve-3d 안전 레이어링](#preserve-3d-layer-safety--preserve-3d-안전-레이어링-함정-방지-체크리스트)
10. [gpu-compositing-budget — GPU 합성 레이어 예산 관리](#gpu-compositing-budget--gpu-합성-레이어-예산-관리)
11. [ambient-parallax-breathing — 앰비언트 3평면 시차 루프](#ambient-parallax-breathing--앰비언트-3평면-시차-루프-카메라-없는-living-motion)
12. [depth-fog-atmospheric-falloff — 깊이 안개 (대기 원근 감쇠)](#depth-fog-atmospheric-falloff--깊이-안개-대기-원근-감쇠)

---

## parallax-3plane-rule — 시차 레이어 3평면 규칙

AE 원리: 디즈니식 멀티플레인 카메라 — 배경/중경/전경을 다른 깊이에 놓고 카메라 널 하나로 움직이면 레이어마다 겉보기 속도가 달라져 입체감이 생긴다.

특정 무브가 아니라 "몇 장을 어떤 비율로 쪼갤지"의 공통 뼈대다. 팬/돌리/앰비언트 표류(#11) 어디에든 이 위에 얹어라. 2D 근사판(이동배율 수동 곱)이며, 원근 나눗셈을 자동 처리하는 진짜 3D판은 multiplane-dolly-push를 써라.

**구현** — 카메라 프록시 하나를 트윈하고 onUpdate에서 factor를 곱해 각 plane에 적용한다. onUpdate-프록시는 GSAP가 매 seek마다 값을 재계산·발화하므로 arbitrary-seek 결정적(엔진 승인 패턴).

```js
const cam = { x: 0 };
const planes = [
  { el: document.querySelector('.plane-bg'),  factor: 0.15 },
  { el: document.querySelector('.plane-mid'), factor: 0.45 },
  { el: document.querySelector('.plane-fg'),  factor: 1.0  },
];
tl.to(cam, {
  x: PAN_DISTANCE_PX,
  duration: PAN_DUR,
  ease: 'power2.inOut',
  onUpdate: () => {
    planes.forEach(({ el, factor }) => {
      el.style.transform = `translateX(${cam.x * factor}px)`;
    });
  },
}, PAN_AT);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 평면 수 | 2(bg+fg) / 3(bg+mid+fg) / 4(bg+mid+near+fg overlay) |
| 배율 프로파일 | 완만 0.1/0.3/0.6 · 표준 0.15/0.45/1.0 · 과장 0.05/0.4/1.4 |
| 이동축 | 수평 팬 / 수직 크레인 / 대각선 |

**쓸 때**: 배경/전경이 존재하는 모든 씬의 구조적 출발점 — 정적이든 카메라가 움직이든.
**피할 때**: 레이어 1~2장뿐이거나 깊이가 목적이 아닌 flat UI 톤(design-linear류 텍스트 중심 씬).
주의: 같은 `.plane` 요소에 ambient-parallax-breathing의 CSS transform을 동시에 걸면 transform 소유권 충돌 — 카메라(GSAP)는 바깥 래퍼, 앰비언트(CSS)는 안쪽 자식으로 분리하라.

intensity: 0-40 · pairs: multiplane-dolly-push, ambient-parallax-breathing, depth-fog-atmospheric-falloff

---

## multiplane-dolly-push — 멀티플레인 돌리 푸시/풀 (진짜 Z축 카메라)

AE 원리: 카메라 Z축 이동(트럭인/아웃) — 줌(스케일 확대)과 달리 카메라가 장면 속으로 이동해 앞뒤 레이어의 원근 비율이 달라지며 진짜 시차가 생긴다.

`perspective` 부모 안 `.rig`(preserve-3d)의 자식들을 서로 다른 `translateZ`에 배치하고 rig의 z만 트윈하면, CSS 3D 원근 수학이 레이어별 다른 속도의 확대/축소를 자동으로 만든다 — 수동 배율 계산 불필요. 기존 multi-phase-camera/viewport-change는 `scale()` 기반 2D 근사이므로 멀티플레인에는 이 z 이동판을 써라.

**구현** — z(translateZ)·transformStyle은 core CSSPlugin이 지원. 안정성을 위해 `preserve-3d`는 CSS에서도 이중 선언하라.

```css
.stage { perspective: 1000px; }
.rig   { transform-style: preserve-3d; }
```

```js
gsap.set('.plane-bg',  { z: -600 });
gsap.set('.plane-mid', { z: -250 });
gsap.set('.plane-fg',  { z:    0 });
gsap.set('.rig', { transformStyle: 'preserve-3d' });

// push-in: DOLLY_PUSH_Z > 0 (rig가 시청자 쪽으로), pull-out: 음수
tl.to('.rig', {
  z: DOLLY_PUSH_Z,
  duration: DOLLY_DUR,
  ease: 'power2.inOut',
}, DOLLY_AT);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 방향 | push-in(진입/압박) / pull-out(공개/이완) |
| perspective | 800(과장) ~ 1600(완만) — 낮을수록 원근 왜곡 강함 |
| DOLLY_PUSH_Z | -400 ~ +400px |

**쓸 때**: 히어로 오프닝(pull-out으로 전체 공개), 클라이맥스 강조(push-in으로 압박) — 레이어가 여럿으로 쪼개진 씬.
**피할 때**: 레이어 1장이면 scale 줌과 시각적으로 동일 → multi-phase-camera/viewport-change로 충분.

intensity: 40-70 · pairs: parallax-3plane-rule, depth-fog-atmospheric-falloff, crane-pedestal-tilt

---

## camera-orbit-turntable — 카메라 오빗 턴테이블

AE 원리: 카메라가 고정 피사체 둘레를 원호로 도는 3D 오빗(널 목표 + 카메라 회전) — 제품 턴테이블/로고 리빌 무브.

orbit-3d-entry(요소들이 각자 궤도를 도는 안무)와 달리 여기선 '무대 하나'가 회전하고 피사체는 무대 안에 고정된다. 내부 파츠가 서로 다른 z를 가지면 회전 중 시차·occlusion이 preserve-3d의 실제 Z-order로 자동 처리된다.

**구현** — rotationY는 core CSSPlugin 기본 지원. fromTo는 GSAP가 속성을 소유하므로 backward-seek revert까지 결정적.

```js
gsap.set('.turntable', { transformStyle: 'preserve-3d' });
// logo-front z:80, logo-shadow z:-40 등은 CSS/HTML에서 이미 배치

tl.fromTo('.turntable',
  { rotationY: ORBIT_FROM_DEG },
  { rotationY: ORBIT_TO_DEG, duration: ORBIT_DUR, ease: 'power1.inOut' },
  ORBIT_AT
);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 스윕 각도 | 20°(살짝 서라운드) / 45°(표준) / 90°+(드라마틱 리빌) |
| 방향 | 편도(한쪽 정착) / 왕복(좌우 스윙 후 정면 정착) |

**쓸 때**: 단일 히어로 피사체(로고/제품/카드) 리빌, 브랜드 락업 소개.
**피할 때**: 대등한 피사체가 여럿일 때 — 오빗 무대가 하나뿐이라 주인공이 불분명. 이땐 split-tilt-cards.

intensity: 40-70 · pairs: parallax-3plane-rule, 3d-text-depth-layers, press-release-spring

---

## dolly-zoom-vertigo — 버티고 돌리줌

AE 원리: 히치콕 '버티고 샷' — 카메라가 다가가며 동시에 화각을 반대로 좁혀, 피사체 크기는 고정한 채 배경만 압축/팽창하듯 뒤틀린다.

`.rig`의 z 이동과 `.subject`의 counter-scale을 같은 duration/ease로 동시에 태운다. counter-scale은 원근 나눗셈의 역수를 authoring 시점 상수로 계산 — 런타임 수학 없음, 결정적. subject는 반드시 rig의 자식(Z0 위치)이어야 counter-scale이 성립한다.

**구현**

```js
const PERSPECTIVE = 1000, Z0 = 0, PUSH_Z = 380; // 380 = 1000px 원근에서 배경 왜곡이 뚜렷하되 클리핑 전인 상한권
// subject는 Z0에 위치; rig.z가 Z0→Z0+PUSH_Z로 움직여도 화면상 크기 고정
const scaleAt = z => (PERSPECTIVE - Z0) / (PERSPECTIVE - z);
tl.to('.rig',     { z: Z0 + PUSH_Z, duration: VERTIGO_DUR, ease: 'power2.inOut' }, VERTIGO_AT);
tl.to('.subject', { scale: scaleAt(Z0 + PUSH_Z), duration: VERTIGO_DUR, ease: 'power2.inOut' }, VERTIGO_AT);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 방향 | 인(다가가며 줌아웃, 압박감) / 아웃(물러나며 줌인, 이완) |
| PUSH_Z 강도 | 200(약) ~ 500(강) |

**쓸 때**: 반전/충격 비트(정보 공개의 심리적 뒤틀림), 임팩트 순간 단발성.
**피할 때**: 잔잔한 톤, 반복 사용 — 씬당 최대 1회, 남용 시 어지러움만 남는다.
계약 리스크: 씬당 1회, 0.6~1.0s 내 완결 — 씬 duration 2~4.5s 안에서 길게 끌면 8fps 프리뷰에서도 어지러움이 과장돼 보인다.

intensity: 70-100 · pairs: multiplane-dolly-push, parallax-3plane-rule

---

## whip-pan-cut-mask — 휩팬 하드컷 마스킹

AE 원리: 스위시 팬 — 빠른 팬의 모션블러로 화면을 순간 지우고, 블러 정점에서 콘텐츠를 바꿔치기해 편집점을 숨긴다.

한 씬 내부의 비트 전환(A→B)용 GSAP 버전이다. 씬 경계를 넘는 전환은 transitions/overview.md의 '휩팬' 셰이더 트랜지션 소관 — 여기서 재구현하지 마라. 방향성 블러 엔벌로프(peak-at-max-velocity)는 → hyperframes-animation motion-blur-streak.md 참조.

**구현** — 검증 반영판: `.set()` 토글의 backward-seek revert가 성립하려면 t=0에 두 콘텐츠의 baseline을 타임라인이 소유해야 한다(특히 `.content-b`의 초기 opacity 0). filter:blur는 paint-only라 seek-safe.

```js
const world = document.querySelector('.world');
const blur = { px: 0 };
const WHIP_DUR = Math.max(0.15, RAW_WHIP_DUR); // 0.15s 미만이면 저fps 스트립에서 블러 정점 프레임 스킵
// t=0 결정적 baseline — arbitrary-seek revert가 성립하도록 타임라인이 소유
tl.set('.content-a', { opacity: 1 }, 0)
  .set('.content-b', { opacity: 0 }, 0)
  .to(world, { x: `-=${PAN_DISTANCE}`, duration: WHIP_DUR, ease: 'power4.in' }, WHIP_AT)
  .to(blur, {
    px: PEAK_BLUR, duration: WHIP_DUR / 2, ease: 'power2.in', yoyo: true, repeat: 1,
    onUpdate: () => { world.style.filter = `blur(${blur.px}px)`; },
  }, WHIP_AT)
  .set('.content-a', { opacity: 0 }, WHIP_AT + WHIP_DUR / 2)
  .set('.content-b', { opacity: 1 }, WHIP_AT + WHIP_DUR / 2);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| PAN_DISTANCE | 400 ~ 1200px |
| WHIP_DUR | 0.15 ~ 0.3s (짧을수록 하드컷처럼) |
| PEAK_BLUR | 20 ~ 50px |

**쓸 때**: 리스트/스탯 항목 사이 빠른 비트 전환, 에너지 있는 몽타주 내부 컷.
**피할 때**: 차분한 톤, 또는 씬 경계 자체를 넘는 연출(전환 레지스트리 소관).
계약 리스크: WHIP_DUR 최소 0.15s 강제 — 저프레임 프리뷰 스트립에서 블러 정점 프레임 보존.

intensity: 70-100 · pairs: motion-blur-streak, kinetic-beat-slam

---

## crane-pedestal-tilt — 크레인 승강+틸트 복합 무브

AE 원리: 크레인(지브) 샷 — 카메라가 수직으로 오르내리며 동시에 피치(틸트)가 바뀌어 '내려다보다가 눈높이로' 같은 시점 전환을 만든다.

단순 팬(수평 스위블)·트럭(수평 이동)과 달리 Y이동+피치가 함께 간다. `.world`의 translateY와 `.rig`의 rotationX를 같은 구간에 병렬 트윈 — 둘 다 core CSSPlugin 소유 속성이라 seek-safe.

**구현**

```js
gsap.set('.stage', { perspective: 1200, transformStyle: 'preserve-3d' });
tl.to('.world', {
  y: CRANE_RISE_PX,        // 음수면 상승
  duration: CRANE_DUR,
  ease: 'power2.inOut',
}, CRANE_AT)
 .to('.rig', {
   rotationX: TILT_TO_DEG,
   duration: CRANE_DUR,
   ease: 'power2.inOut',
 }, CRANE_AT);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| CRANE_RISE_PX | 60 ~ 200 |
| TILT_TO_DEG | 5 ~ 20° |
| 방향 | 상승(내려다보다 안착) / 하강(위압감) |

**쓸 때**: 장면을 여는 설립 샷(내려다보다 인물/제품 눈높이로 안착), 계층 구조를 위→아래로 훑는 리빌.
**피할 때**: 콘텐츠가 평면적 텍스트 카드라 피치 변화가 왜곡으로만 보일 때 — 피치를 최소화하거나 생략.

intensity: 40-70 · pairs: parallax-3plane-rule, perspective-origin-eye-shift

---

## rack-focus-reference — 랙포커스 페이크 (참조 전용)

AE 원리: 렌즈 초점 이동 — 카메라는 정지, 포커스 플레인만 바뀌어 시선을 옮긴다.

재발명 금지 — 메커니즘(인접한 두 윈도우가 같은 `--dof` 변수를 교차)은 → hyperframes-animation rules/depth-of-field-blur.md 참조. 이 항목은 카메라 무브 카탈로그 완결성을 위한 위치 표시이자 multiplane-dolly-push와의 결합 지점만 추가한다.

**구현** — depth-of-field-blur.md의 rack-focus 섹션 그대로. `--dof`는 CSS(:root 또는 해당 요소)에 초기값을 선언해 backward-seek revert 기준값을 확보하라.

```js
tl.to('.plane-a', { '--dof': DOF_MAX, opacity: DIM_LEVEL, duration: RACK_DUR }, RACK_AT)
  .to('.plane-b', { '--dof': 0,       opacity: 1,         duration: RACK_DUR }, RACK_AT);
```

**쓸 때**: multiplane-dolly-push와 동시에 태워 '밀고 들어가며 포커스도 옮기는' 복합 샷.
**피할 때**: focal plane이 하나뿐일 때 — depth-of-field-blur의 '단일 포컬 풀'로 충분.

intensity: 40-70 · pairs: multiplane-dolly-push, depth-fog-atmospheric-falloff

---

## perspective-origin-eye-shift — 퍼스펙티브 오리진 시선 이동

AE 원리: 관심점(POI)이 아니라 렌즈 광학 중심 자체의 이동 — CSS perspective-origin이 3D 소실점 위치를 결정하며, 이를 애니메이션하면 저각 히어로 샷이나 미세 헤드트래킹 시차가 나온다.

perspectiveOrigin은 2값 문자열 compound라 GSAP 직접 보간이 부정확 — `{x,y}` 퍼센트 프록시를 트윈하고 onUpdate에서 문자열로 조립하는 것이 유일하게 안전한 방법이다(매 seek 결정적).

**구현**

```js
const stage = document.querySelector('.stage');
const origin = { x: 50, y: 50 };
tl.to(origin, {
  y: 85,  // 아래에서 위로 올려다보는 저각 느낌
  duration: EYE_SHIFT_DUR,
  ease: 'power2.inOut',
  onUpdate: () => { stage.style.perspectiveOrigin = `${origin.x}% ${origin.y}%`; },
}, EYE_SHIFT_AT);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| y 이동 | 50→70(살짝 올려봄) / 50→90(강한 저각) |
| x 이동 | 커서 추적용 좌우 미세 오프셋(±10%) |

**쓸 때**: 히어로 타이포/제품을 '우러러보는' 저각 연출, 오빗/돌리에 겹쳐 광학적 미세 이동감을 줄 때.
**피할 때**: perspective가 이미 커서(2000px+) 원근 왜곡이 약한 씬 — origin 이동이 거의 안 보인다. 저각을 강조하려면 perspective를 800~1200px로 낮춰야 함께 산다.

intensity: 0-40 · pairs: camera-orbit-turntable, crane-pedestal-tilt

---

## preserve-3d-layer-safety — preserve-3d 안전 레이어링 (함정 방지 체크리스트)

AE 원리: 'AE의 3D 레이어 체크박스가 켜져야 같은 카메라 공간에 참여한다'와 대응 — CSS도 preserve-3d 체인이 끊기면 그 지점부터 자손이 평면화된다.

preserve-3d를 2단 이상 중첩하는 모든 씬(오빗/돌리/스캐터) 셋업 시 이 4항을 검증하라.

1. **perspective는 최상위 부모 하나에만** — 자식마다 걸면 각자 소실점이 생겨 뒤틀린다.
2. **매 계층에 preserve-3d** — 중간에 없는 조상이 끼면 그 아래 전체가 평면화된다.
3. **opacity<1 · filter · overflow:hidden을 3D 자손을 가진 요소 자체에 걸지 마라** — 엔진에 따라 3D 컨텍스트가 강제 평면화된다. 그런 스타일은 바깥 래퍼에.
4. **z-index는 preserve-3d 안에서 무시** — 실제 Z 위치가 페인트 순서를 결정한다. 항상 위여야 하는 오버레이는 translateZ로 더 앞에 두거나 별도 컨텍스트로 분리.

**구현**

```css
/* 올바른 체인: perspective(부모, 1개만) -> preserve-3d(자식1) -> preserve-3d(자식2) ... */
.stage      { perspective: 1200px; }
.rig        { transform-style: preserve-3d; }
.turntable  { transform-style: preserve-3d; }
.part       { transform-style: preserve-3d; backface-visibility: hidden; }

/* 잘못된 예 — 3D 체인이 끊김: */
.rig-broken { transform-style: preserve-3d; opacity: 0.99; }
```

**쓸 때**: preserve-3d 중첩이 있는 모든 씬 셋업 시 항상.
**피할 때**: 단일 평면 2D 트윈만 쓰는 씬엔 무관.
계약 리스크: opacity/filter 애니메이션을 preserve-3d 요소 자체에 걸지 마라 — dim/blur는 그 자식의 자식(별도 레이어)에서 처리해야 3D 컨텍스트가 안 깨진다.

intensity: 0-40 · pairs: multiplane-dolly-push, camera-orbit-turntable, depth-scatter-assemble

---

## gpu-compositing-budget — GPU 합성 레이어 예산 관리

AE 원리: 직접 대응 없음 — 렌더 파이프라인 관점. HF는 헤드리스 캡처라 기준은 60fps 체감이 아니라 '모든 프레임이 정확히 그려지는가'지만, 과도한 합성 레이어는 캡처를 느리게/불안정하게 만든다.

will-change는 애니메이션 활성 구간에만 걸고 끝나면 해제하라. preserve-3d 컨텍스트는 씬당 필요한 만큼만, 배경 이미지는 `scale()` 확대 대신 실제 픽셀 크기에 가깝게(합성 레이어 비용은 물리적 픽셀 기준).

**구현** — willChange는 core가 세팅하는 임의 CSS 속성이고 시각 결정성에 무관한 합성 힌트라 seek-safe. `tl.set`은 backward-seek 시 CSS 기본값으로 revert된다.

```css
/* 이 씬에서 실제로 움직이는 요소에만 좁게 적용 */
.rig, .plane-fg { will-change: transform; }
.plane-bg { will-change: auto; } /* 배경은 거의 안 움직이니 레이어 승격 생략 */
```

```js
// 무거운 무브가 씬 중간에 끝나면 힌트 해제 — 독립 레이어로 계속 남지 않게
tl.set('.plane-fg', { willChange: 'auto' }, POST_DOLLY_SETTLED_AT);
```

**쓸 때**: preserve-3d 스테이지/멀티플레인 스택이 3개 이상 동시일 때, 배치 렌더에서 프레임 드랍/타임아웃이 관찰될 때.
**피할 때**: 씬이 가볍고(레이어 2~3개 이하) 이미 부드럽게 렌더되면 손대지 마라 — 조기 최적화 금지.
계약 리스크: will-change 블랑켓 적용은 메모리/합성 비용이 늘어 역효과 — 애니메이팅 중인 요소에만, 필요한 동안만.

intensity: 0-40 · pairs: preserve-3d-layer-safety

---

## ambient-parallax-breathing — 앰비언트 3평면 시차 루프 (카메라 없는 living motion)

AE 원리: 멀티플레인 배경의 '숨쉬기' — 카메라 없이도 plane들이 서로 다른 진폭·주기로 미세 표류하면 정지 화면이 살아 보인다. AE의 wiggle 표류를 결정론적 CSS keyframes로 대체.

순수 CSS keyframes infinite alternate — 계약 living-motion 조항이 명시 허용(1fps 스트립에서도 변화 보임), 스크립트 불필요. 진폭은 parallax-3plane-rule의 배율을 그대로 반영하고, delay는 `calc(var(--rf-scene-start,0s) + Ns)`로 씬 시작에 앵커한다.

**구현**

```css
@keyframes rf-drift-bg  { from { transform: translate3d(0,0,0); } to { transform: translate3d(6px,3px,0); } }
@keyframes rf-drift-mid { from { transform: translate3d(0,0,0); } to { transform: translate3d(16px,8px,0); } }
@keyframes rf-drift-fg  { from { transform: translate3d(0,0,0); } to { transform: translate3d(32px,14px,0); } }
.plane-bg  { animation: rf-drift-bg  9s ease-in-out calc(var(--rf-scene-start,0s) + 0.2s) infinite alternate; }
.plane-mid { animation: rf-drift-mid 7s ease-in-out calc(var(--rf-scene-start,0s) + 0.1s) infinite alternate; }
.plane-fg  { animation: rf-drift-fg  5s ease-in-out var(--rf-scene-start,0s) infinite alternate; }
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 진폭 프로파일 | 미세(배경 4~8px) / 표준(6~16px) / 과장(10~30px, 광고성 씬 한정) |
| 주기 | 5 ~ 12s — 배경일수록 길게(먼 것일수록 느리게 숨쉬어야 자연스러움) |

**쓸 때**: 카메라 무브 없이 정적 프레임을 오래 유지하는 씬(타이틀 카드, 홀드 구간)에서 배경이 죽어 보이지 않게.
**피할 때**: 능동적 카메라 무브(오빗/돌리/크레인) 진행 중 — 표류가 묻히거나 흔들림 노이즈로 읽힌다. 카메라가 쉬는 구간에만.
계약 정합 조건: 같은 `.plane`을 parallax-3plane-rule(GSAP transform)이 동시에 구동하면 transform 소유권 충돌 — 카메라 무브는 바깥 래퍼, 앰비언트 드리프트는 안쪽 자식으로 분리해 translate 축을 겹치지 마라.

intensity: 0-40 · pairs: parallax-3plane-rule, sine-wave-loop

---

## depth-fog-atmospheric-falloff — 깊이 안개 (대기 원근 감쇠)

AE 원리: 대기 원근 — 먼 대상일수록 대기 산란으로 채도/명도가 낮고 흐리다. AE 카메라의 Fog 피처, 또는 먼 레이어에 수동 톤 다운.

각 plane에 고정 filter/opacity를 부여한다 — 애니메이션이 아닌 정적 depth cue라 결정적. rack-focus(depth-of-field-blur)와 달리 시선 이동에 따라 바뀌지 않고 씬 내내 고정된 베이스 깊이 신호다.

**구현** — `--rf-*` 토큰 규칙 준수(color-mix in srgb).

```css
:root { --rf-fog: color-mix(in srgb, var(--rf-bg) 60%, transparent); }
.plane-bg  { filter: blur(1.5px) brightness(0.85); opacity: 0.9; }
.plane-mid { filter: blur(0.5px) brightness(0.95); opacity: 0.96; }
.plane-fg  { filter: none; opacity: 1; }
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| blur 강도 | 배경 0.5 ~ 2px |
| brightness 낙차 | 0.8 ~ 0.95 |
| 적용 범위 | 배경만 / 배경+중경 |

**쓸 때**: 배경/중경/전경이 뚜렷이 구분돼야 하는 모든 멀티플레인 씬의 기본 세팅 — 카메라가 움직이든 정적이든 항상 켜두는 베이스.
**피할 때**: 배경이 이미 --rf-surface-3 등 저대비 톤이라 추가 감쇠가 불필요하거나, 플랫 브랜드 컬러를 요구하는 씬 — 과도한 blur는 배경의 가독 요소를 뭉갠다.
주의: filter는 그 요소를 평면화하므로, 3D 자식(translateZ 파츠)을 가진 preserve-3d plane에 직접 걸면 multiplane 3D가 깨진다(preserve-3d-layer-safety 3항) — fog는 자식 없는 leaf plane이나 별도 inner 레이어에만.

intensity: 0-40 · pairs: parallax-3plane-rule, multiplane-dolly-push, rack-focus-reference

---

## Sources

- 리서치 기법 카탈로그: 레이어 분해 2.5D/3D + 가상 카메라 12종 (AE 멀티플레인/카메라 무브 원리 → GSAP core/CSS 이식)
- 검증 판정: RF-FRAGMENT v1.0 계약 대조 — pass 11 / fix 1(whip-pan-cut-mask: t=0 baseline 고정 + WHIP_DUR≥0.15s) / drop 0
- vendor 실측: vendor/gsap/3.14.2/gsap.min.js (공식 UMD core, SHA-256 핀) — 플러그인 0개, core CSSPlugin으로 12종 전부 충족
- render-lint.mjs: RF-FRAGMENT-001~015 (paused:true 필수, Math.random/Date.now/fetch 금지, seek-safe 의미 = 프레임별 seek 시 GSAP 트윈값 재계산+onUpdate 발화)
- 교차 참조: hyperframes-animation rules/depth-of-field-blur.md (rack-focus 메커니즘), motion-blur-streak.md (방향성 블러 엔벌로프), transitions/overview.md (씬 경계 휩팬 셰이더)
