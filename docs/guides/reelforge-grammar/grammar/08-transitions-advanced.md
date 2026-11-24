# 08 — 고급 씬 전환 문법 (Advanced Transitions)

> 이 문서의 코드 스케치는 렌더 대상이 아니다 — 검증 실물은 references/gallery/fragments/, 이 파일은 통째 로딩 금지(배정 기법 섹션만 부분 로딩).

씬 경계에서 컷을 숨기거나 서사(연속·인과·대비·챕터)를 부여하는 12기법 레퍼런스.
모든 스케치는 vendor gsap.min.js 3.14.2 코어(CSSPlugin+AttrPlugin)만 사용 — 플러그인 파일 0개 실측 기준.
개별 씬 내부 모션 규칙·블루프린트는 이 문서 소관이 아니다 → hyperframes-animation 참조.

## Contents

- [공통 계약: anchorGeometry](#공통-계약-anchorgeometry)
- [match-cut-position-carry — 포지션 매치컷](#match-cut-position-carry--포지션-매치컷-오브젝트-좌표-승계)
- [match-cut-graphic-analogy — 그래픽 매치컷](#match-cut-graphic-analogy--그래픽-매치컷-형태-유사-오브젝트-은유)
- [zoom-through-portal — 줌스루](#zoom-through-portal--줌스루-요소-관통-확대-전환)
- [whip-pan-directional — 윕팬](#whip-pan-directional--윕팬-스위시팬-방향성-전환)
- [shape-wipe-color-block — 셰이프 와이프](#shape-wipe-color-block--셰이프-와이프-단색-블록-스윕-히든컷)
- [iris-portal-threshold — 포털/마스크 전환](#iris-portal-threshold--포털마스크-전환-문턱-은유-아이리스)
- [motion-vector-inheritance — 모션 방향 승계](#motion-vector-inheritance--모션-방향-승계-exit-벡터--enter-벡터)
- [axis-of-action-pan-handoff — 팬 방향 승계](#axis-of-action-pan-handoff--팬-방향-승계-축-유지-카메라-핸드오프)
- [speed-ramp-blur-flash — 스피드램프 블러 플래시](#speed-ramp-blur-flash--스피드램프-블러-플래시-급가속-하이퍼줌)
- [silhouette-negative-space-match — 실루엣 네거티브 스페이스 매치](#silhouette-negative-space-match--실루엣-네거티브-스페이스-매치-톤-대비-컷)
- [light-flash-join — 라이트 플래시 조인](#light-flash-join--라이트-플래시-조인-중립-챕터-구두점)
- [object-scale-continuity — 오브젝트 스케일 승계](#object-scale-continuity--오브젝트-스케일-승계-미시거시-인과-확대)
- [Sources](#sources)

## 공통 계약: anchorGeometry

ReelForge 씬은 격리되어 런타임에 서로를 측정할 수 없다(`getBoundingClientRect`는 VM 스텁에 없어 RF-FRAGMENT-001 즉시 탈락). 따라서 전환 계약은 **스토리보드 단계에서 정규화 좌표(0~1)로 손 합의**하고, 두 프래그먼트 스크립트 상단에 각각 선언한다:

```js
// 반드시 '||{}' 패턴 — VM 스모크 통과 조건
window.__anchors = window.__anchors || {};
window.__anchors['scene-04'] = { exit: { shape:'rect', cx:0.62, cy:0.38 /* ... */ } };
```

지켜야 할 4가지:

1. **손 합의는 유일한 측정 예외.** coordinate-target-zoom.md의 "측정하라, 손으로 유도하지 말라" 원칙과 충돌하는 유일한 지점 — 오프라인 린트로 두 프래그먼트의 exit/enter JSON을 diff해 좌표 드리프트를 사전 검증하라.
2. **색 트윈에 `var()` 금지.** GSAP은 트윈 끝값의 `var(--rf-bg)`를 rgb로 파싱 못 해 스냅한다. 색 토큰은 `tl.set`/`gsap.set`(순간 지정)으로만 쓰고, 서서히 덮으려면 프리셋 색 오버레이의 `opacity`를 트윈하라.
3. **filter는 함수 구조가 같을 때만 보간.** `blur(4px) brightness(2.4)` → `blur(0px) brightness(1)`은 OK, `url(#f)` ↔ `blur(0px)`는 함수 종류가 달라 스냅. SVG 필터는 `filter:url()`을 고정하고 `attr:{stdDeviation}`로 램프하라(AttrPlugin 코어 번들 실측 확인).
4. **seek-safe.** `Math.random`/`Date.now`/rAF 의존 금지(RF-FRAGMENT-003/001). SVG 필터도 결정론적 파라미터만(feTurbulence는 motion.mjs 선례대로 seed 고정).

## match-cut-position-carry — 포지션 매치컷 (오브젝트 좌표 승계)

동일 형태·색·스케일의 오브젝트를 두 샷의 같은 화면 좌표에 놓아 컷을 숨기는 고전 매치컷 — AE의 부모 null 동일 키프레임 기법.

**구현**

```js
// 씬N(exit): 계약 선언 후 오브젝트를 계약 좌표에 안착시키고 정지 (컷 순간 정적 매치)
window.__anchors = window.__anchors || {};
window.__anchors['scene-04'] = {
  exit: { shape:'rect', cx:0.62, cy:0.38, w:0.22, h:0.22, rot:0, color:'--rf-accent' }
};
tl.to('#hero-card', {
  left: '62%', top: '38%', width: '22vw', height: '22vw',
  duration: 0.6, ease: 'power2.inOut'
}, T);

// 씬N+1(enter): 동일 좌표에서 시작해 모션 재개
// window.__anchors['scene-05'] = { enter: exit와 동일 값 }
gsap.set('#hero-card-2', { left:'62%', top:'38%', width:'22vw', height:'22vw' });
tl.to('#hero-card-2', { scale: 1, duration: 0.5, ease: 'power2.out' }, 0);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 형태 | 원 / 사각 / 실루엣 |
| 안착 좌표 | cx, cy (0~1 정규화) |
| 색 토큰 | `--rf-accent` / `--rf-text` |
| 정지 홀드 | 0.1~0.3s — 컷 직전 정적 프레임을 확보해야 매치가 읽힘 |

**쓸 때**: 같은 오브젝트(또는 같은 역할)가 두 씬에 걸쳐 존재의 연속성을 주장할 때 — 제품이 로고로, 카드가 아이콘으로 변주되는 서사. 의미: 연속.
**피할 때**: 두 씬 배경 톤이 극단적으로 다르거나 오브젝트-배경 대비가 낮을 때 — 좌표가 맞아도 눈에 안 띄면 효과 실종.

intensity: 0-40 / pairs: `match-cut-graphic-analogy`, `object-scale-continuity`

## match-cut-graphic-analogy — 그래픽 매치컷 (형태 유사 오브젝트 은유)

쿠브릭의 뼈다귀→인공위성처럼, 실루엣·궤적·회전축이 유사한 서로 다른 두 오브젝트를 하나의 시각적 아이디어로 잇는 편집.

**구현**

```js
// 씬N(exit): 오브젝트가 회전하며 중앙 원형 실루엣으로 수렴
window.__anchors['scene-07'] = {
  exit: { shape:'circle', cx:0.5, cy:0.45, r:0.10, rotDir:'cw', rotSpeed:'fast' }
};
tl.to('#icon-a', {
  rotation: 340, scale: 0.9,
  clipPath: 'circle(50% at 50% 50%)',   // 구조 동일 circle()끼리라 숫자 보간 성립
  duration: 0.5, ease: 'power1.in'
}, T);

// 씬N+1(enter): 다른 오브젝트가 동일 반지름·동일 회전방향으로 이어받아 확장
// enter anchor: { shape:'circle', cx:0.5, cy:0.45, r:0.10, rotDir:'cw' }
tl.fromTo('#icon-b',
  { rotation: -20, scale: 0.9, clipPath: 'circle(50% at 50% 50%)' },
  { rotation: 0, scale: 1, clipPath: 'circle(150% at 50% 50%)', duration: 0.5, ease: 'power1.out' },
  0
);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 실루엣 형태 | 원 / 마름모 / 커스텀 폴리곤 |
| 회전 방향 일치 | cw / ccw (반드시 양쪽 동일) |
| 정지 프레임 | 0.2~0.4s — 시청자가 은유를 읽는 최소 시간 |

**쓸 때**: 인과·은유적 도약 — '작은 문제'가 '큰 해법'으로, 톱니바퀴가 지구본으로 컨셉 확장. 의미: 인과·챕터.
**피할 때**: 실루엣이 억지스럽거나(원이 사각을 억지 대체) 은유를 읽을 정지 프레임(≥0.3s)이 없을 때.

intensity: 40-70 / pairs: `match-cut-position-carry`, `iris-portal-threshold`

## zoom-through-portal — 줌스루 (요소 관통 확대 전환)

카메라가 한 요소(로고 구멍, 문틀)로 급가속 줌인해 화면이 단색으로 차면 컷하고, 다음 씬이 같은 단색에서 줌아웃하는 AE 마스크+지수 Scale 기법.

**구현** (검증 수정본 — `var()` 색 트윈 대신 프리셋 오버레이 opacity 트윈)

```js
// <div id="portal-cover" style="position:absolute;inset:0;background:var(--rf-bg);opacity:0"></div>
window.__anchors['scene-09'] = { exit: { fill:'--rf-bg', coverage:1.0 } };
tl.to('#zoom-outer', { scale: 14, filter: 'blur(6px)', duration: 0.45, ease: 'power3.in' }, T);
tl.to('#portal-cover', { opacity: 1, duration: 0.2, ease: 'power2.in' }, T + 0.25); // var() 트윈 금지 → opacity

// 씬N+1(enter): 동일 --rf-bg 단색에서 줌아웃하며 등장
// enter anchor: { fill:'--rf-bg', coverage:1.0 }
gsap.set('#scene-root', { backgroundColor: 'var(--rf-bg)' });  // set은 순간 지정이라 var() OK
tl.fromTo('#world-inner',
  { scale: 14, filter: 'blur(6px)' },
  { scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' },
  0
);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 관통 색 | `--rf-bg` / `--rf-surface-2` / `--rf-accent` |
| 줌 배율 | 8x(빠른) / 14x(급격) / 20x+(극단) |
| 블러 동반 | on / off |

**쓸 때**: 속도감 + '이 디테일 안에 다음 이야기가 있다'는 인과 — 로고 구멍을 통과해 제품 UI로. 의미: 인과·연속.
**피할 때**: 타겟이 너무 작아 배율이 과대해질 때(래스터 소스 해상도 부족 시 블록 노이즈) — coordinate-target-zoom.md의 headroom budget 준용, 확대 상한을 소스 해상도로 캡.

intensity: 70-100 / pairs: `iris-portal-threshold`, `light-flash-join`

## whip-pan-directional — 윕팬 (스위시팬 방향성 전환)

카메라가 홱 돌아 방향성 블러로 뭉개지는 기법 — AE 전통 레시피는 Adjustment Layer + Motion Tile + Directional Blur, 편집점에서 양 샷의 팬 방향·블러 강도를 맞춰 '한 번의 팬'처럼 잇는다.

**구현** (검증 수정본 — `filter:url()`↔`blur()` 함수종류 상이 보간 스냅 → filter 고정 + stdDeviation attr 램프)

```html
<svg style="position:absolute;width:0;height:0">
  <filter id="dirBlurH" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0 0"/></filter>
  <filter id="dirBlurH2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="26 2"/></filter>
</svg>
```

```js
// 씬N(exit): filter는 상시 고정, 스미어 세기는 attr로 램프 (AttrPlugin 코어 실측 확인)
window.__anchors['scene-11'] = { exit: { dir:'right', blurPeak:26 } };
gsap.set('#scene-content', { filter: 'url(#dirBlurH)' });
tl.to('#scene-content', { x: '+=260', duration: 0.18, ease: 'power4.in' }, T);
tl.to('#dirBlurH feGaussianBlur', { attr: { stdDeviation: '26 2' }, duration: 0.12, ease: 'power4.in' }, T);

// 씬N+1(enter): 반대편에서 동일 스미어로 진입해 감쇠
// enter anchor: { dir:'right', blurPeak:26 }
gsap.set('#scene-content-2', { filter: 'url(#dirBlurH2)' });
tl.fromTo('#scene-content-2', { x: -260 }, { x: 0, duration: 0.22, ease: 'power4.out' }, 0);
tl.fromTo('#dirBlurH2 feGaussianBlur',
  { attr: { stdDeviation: '26 2' } },
  { attr: { stdDeviation: '0 0' }, duration: 0.18, ease: 'power4.out' },
  0
);
```

feGaussianBlur는 입력 비례 고정 출력이라 결정론적 — seek-safe 위반 없음.

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 방향 | 좌 / 우 / 상 / 하 |
| 블러 강도 | stdDeviation 12(약) / 26(표준) / 40(강) |
| 지속 | 0.15~0.25s — 양쪽 합산 0.3~0.5s, 이보다 길면 팬이 아니라 드리프트로 읽힘 |

**쓸 때**: 에너지·시간 경과·장소 이동의 빠른 신호. 콘텐츠보다 톤 전환에 강함. 의미: 대비(급전환)·챕터(시간 점프).
**피할 때**: 차분·프리미엄 톤(럭셔리, 웰니스) — 윕팬은 그 톤과 충돌. overview.md의 Calm 에너지에는 배정 금지.

intensity: 70-100 / pairs: `speed-ramp-blur-flash`, `axis-of-action-pan-handoff`

## shape-wipe-color-block — 셰이프 와이프 (단색 블록 스윕 히든컷)

브랜드 컬러 블록이 화면을 완전히 덮은 순간 컷을 숨기고 반대 방향으로 걷히며 다음 샷을 드러내는 트레일러식 히든 컷.

**구현**

```js
// 씬N(exit): 대각선 블록이 화면을 완전히 덮음 — 색은 set(순간)이라 var() OK
window.__anchors['scene-13'] = { exit: { fill:'--rf-accent', coverage:1.0, sweepDir:'tl-br' } };
tl.set('#wipe-block', { background:'var(--rf-accent)', zIndex:10 }, T);
tl.fromTo('#wipe-block',
  { clipPath:'polygon(0 0,0 0,0 100%,0 100%)' },      // 4정점→4정점: 동일 정점수라 보간 성립
  { clipPath:'polygon(0 0,120% 0,120% 100%,0 100%)', duration:0.35, ease:'power3.in' },
  T
);

// 씬N+1(enter): 동일 색에서 반대 방향으로 걷혀 콘텐츠 등장
// enter anchor: { fill:'--rf-accent', coverage:1.0, sweepDir:'tl-br' }
gsap.set('#wipe-block-2', { background:'var(--rf-accent)', clipPath:'polygon(0 0,120% 0,120% 100%,0 100%)' });
tl.to('#wipe-block-2', { clipPath:'polygon(120% 0,120% 0,120% 100%,120% 100%)', duration:0.4, ease:'power3.out' }, 0);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 스윕 방향 | 좌→우 / 대각선 / 방사형 |
| 색 토큰 | `--rf-accent` / `--rf-surface-3` |
| 커버 지속 | 0.3~0.5s |

**쓸 때**: 챕터 전환·섹션 브레이크에 브랜드 컬러를 각인시킬 때. 의미: 챕터.
**피할 때**: 앞뒤 씬이 강하게 연관되어 '이어짐'을 원할 때 — 완전 피복은 관계를 끊는 신호라 연속성 서사와 상충.

intensity: 40-70 / pairs: `light-flash-join`, `iris-portal-threshold`

## iris-portal-threshold — 포털/마스크 전환 (문턱 은유 아이리스)

원형·문틀 마스크가 좁아지고 넓어지며 다음 공간에 '들어가는' 은유를 만드는 트랙매트(도어 마스크) 기법.

**구현**

```js
// 씬N(exit): 조리개를 닫으며 어둠으로 수렴
window.__anchors['scene-15'] = { exit: { shape:'circle', cx:0.5, cy:0.5, r:0, fill:'--rf-bg' } };
tl.to('#iris-mask', { clipPath: 'circle(0% at 50% 50%)', duration: 0.5, ease: 'power2.in' }, T);
tl.set('#iris-mask', { background:'var(--rf-bg)' }, T);   // 색은 set(순간)로

// 씬N+1(enter): 반드시 동일 중심좌표에서 조리개가 열리며 새 공간 등장 — 중심이 다르면 '문턱' 의미론 붕괴
// enter anchor: { shape:'circle', cx:0.5, cy:0.5, r:0, fill:'--rf-bg' }
tl.fromTo('#iris-mask-2',
  { clipPath: 'circle(0% at 50% 50%)' },
  { clipPath: 'circle(75% at 50% 50%)', duration: 0.5, ease: 'power2.out' },
  0
);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 형태 | 원 / 문틀 폴리곤 / 다이아몬드 |
| 중심 좌표 | cx, cy — 두 씬 고정 공유(필수) |
| 지속 | 0.4~0.7s — 0.4s 미만이면 '문턱' 느낌이 죽음 |

**쓸 때**: '새 공간/챕터에 입장'을 명시적으로 걸 때 — 세션 전환, 막(幕) 전환. 의미: 챕터·연속(공간은 달라도 여정은 이어짐).
**피할 때**: 빠른 템포의 임팩트 컷이 필요할 때 — 급한 씬에서는 늘어져 보임.

intensity: 0-40 / pairs: `zoom-through-portal`, `match-cut-graphic-analogy`

## motion-vector-inheritance — 모션 방향 승계 (exit 벡터 = enter 벡터)

필름 연속편집의 스크린 방향 일관성(180도 규칙)을 오브젝트 모션에 적용 — 왼쪽으로 나간 물체는 반드시 왼쪽에서 이어받아 들어와야 하며, 벡터가 역전되면 뇌가 '되감김'으로 인지해 컷이 튄다.

특정 셰이프가 아니라 **모든 전환 위에 상시 적용하는 상위 원칙**이다. exit의 in계열 ease와 enter의 out계열 ease가 하나의 연속 운동 곡선을 이루도록 easing family를 짝지어라. GSAP ease 계열 상세 → hyperframes-animation GSAP 어댑터 참조.

**구현**

```js
// 씬N(exit): 카드가 화면 왼쪽으로 가속하며 퇴장
window.__anchors['scene-17'] = {
  exit: { dir:'left', axis:'x', speedProfile:'accelerate', ease:'power2.in' }
};
tl.to('#card', { xPercent: -140, duration: 0.4, ease: 'power2.in' }, T);

// 씬N+1(enter): 반드시 왼쪽에서 등장 — 오른쪽 진입은 벡터 역전 = 오작동
// enter anchor: { dir:'left', axis:'x', speedProfile:'decelerate', ease:'power2.out' }
tl.fromTo('#card-2', { xPercent: -140 }, { xPercent: 0, duration: 0.45, ease: 'power2.out' }, 0);
// 카메라 팬에도 동일 원칙 적용 → axis-of-action-pan-handoff
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 방향축 | x / y / z(스케일) |
| 속도 프로파일 | accelerate(in계열) / decelerate(out계열) — in↔out 짝 필수 |
| 적용 대상 | 오브젝트 / 카메라 팬 / 텍스트 라인 |

**쓸 때**: 모든 컷백/전환의 상시 체크리스트 — 특히 두 씬이 하나의 연속 행동(걸어나감→걸어들어옴, 던짐→받음)일 때 필수.
**피할 때**: 의도적 디스컨티뉴이티 편집이거나 두 씬이 인과 없이 완전 분리된 주제일 때 — 억지 벡터 일치는 오히려 억지 연결로 읽힘.

intensity: 0-40 / pairs: `axis-of-action-pan-handoff`, `match-cut-position-carry`

## axis-of-action-pan-handoff — 팬 방향 승계 (축 유지 카메라 핸드오프)

180도 규칙·아이라인 매치처럼 가상 카메라가 같은 방향의 팬을 씬 경계 너머로 이어받아 '카메라가 계속 움직이는' 착각을 만든다. station-to-station 팬 원리의 씬 경계 확장 → hyperframes-animation spatial-pan-stations 블루프린트 참조.

**구현**

```js
// 씬N(exit): 등속(ease:none) 팬으로 종료 — 등속이어야 다음 씬이 이어받기 쉬움
window.__anchors['scene-19'] = { exit: { camDir:'left', panSpeed:'fast', ease:'none' } };
tl.to('#world', { x: '-=480', duration: 0.6, ease: 'none' }, T);
// '-=480' 상대값은 빌드 시 1회 해석 후 캐시 → seek 결정적

// 씬N+1(enter): 동일 방향 등속 팬으로 시작, 이후 감속해 다음 스테이션 안착
// enter anchor: { camDir:'left', panSpeed:'fast', ease:'none' }
tl.to('#world-2', { x: '-=480', duration: 0.5, ease: 'none' }, 0);
tl.to('#world-2', { x: '-=120', duration: 0.4, ease: 'power3.out' }, 0.5);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 팬 방향 | 좌 / 우 / 대각선 |
| 이징 | none(등속, 승계 용이) / power(감속 안착) |
| 구간 배분 | exit 등속 구간 vs enter 감속 구간 비율 |

**쓸 때**: 여정·타임라인·공간 이동 서사(마일스톤 워크, 지도 이동)에서 씬을 넘어도 하나의 트래킹샷처럼 느끼게 할 때. 의미: 연속(여정).
**피할 때**: 씬 간 배경/콘텐츠 밀도 차가 커서 등속 팬이 속도 불일치를 노출할 때.

intensity: 40-70 / pairs: `motion-vector-inheritance`, `whip-pan-directional`

## speed-ramp-blur-flash — 스피드램프 블러 플래시 (급가속 하이퍼줌)

AE Time Remap + Frame Blend로 클립 끝을 500~4000% 가속해 블러 스매시로 만드는 기법 — 릴스 '하이퍼줌'과 동일 원리, 배율·블러가 동시 폭증하며 화이트로 클리핑.

**구현**

```js
// 씬N(exit): scale과 brightness를 동시에 지수 가속 — 함수 리스트·순서 동일이라 filter 보간 성립
window.__anchors['scene-21'] = { exit: { clipColor:'--rf-text', brightnessPeak:2.4 } };
tl.to('#subject', {
  scale: 3.2, filter: 'blur(4px) brightness(2.4)',
  duration: 0.18, ease: 'expo.in'
}, T);

// 씬N+1(enter): 화이트 클리핑에서 역재생하듯 감속하며 정착
// enter anchor: { clipColor:'--rf-text', brightnessPeak:2.4 }
tl.fromTo('#subject-2',
  { scale: 3.2, filter: 'blur(4px) brightness(2.4)' },
  { scale: 1, filter: 'blur(0px) brightness(1)', duration: 0.3, ease: 'expo.out' },
  0
);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 클리핑 색 | `--rf-text`(화이트 계열) / `--rf-accent` |
| 밝기 피크 | 1.8~2.8 — 2.4가 과다노출 클리핑의 표준점 |
| 지속 | 0.15~0.25s — 줌스루보다 짧고 공격적 |

**쓸 때**: 쇼츠·릴스 톤의 고에너지 클라이맥스 전환. 의미: 대비(극적 강조).
**피할 때**: 남발 금지 — 0.4s 이하 초단기 전환은 다음 컨텐츠 인지를 방해하므로 primary 전환의 60~70%는 이보다 차분한 것으로.

intensity: 70-100 / pairs: `whip-pan-directional`, `zoom-through-portal`

## silhouette-negative-space-match — 실루엣 네거티브 스페이스 매치 (톤 대비 컷)

어두운 실루엣 형태가 다음 샷의 밝은 배경 속 동일 실루엣 여백과 겹치며 컷 — 형태는 유지하고 명암을 반전시켜 '대비'를 서사화.

**구현** (검증 수정본 — `clipPath:'inherit'`는 씬 격리로 무효, 동일 폴리곤을 양쪽 CSS에 직접 심는다)

```css
/* 두 프래그먼트 CSS 모두 — 동일 정점 실루엣을 손으로 복제 (형태 연속의 유일한 성립 경로) */
#figure, #figure-2 { clip-path: polygon(/* 동일 정점 실루엣 */); }
```

```js
// 씬N(exit): 실루엣으로 수렴
window.__anchors['scene-23'] = { exit: { shape:'silhouette-fig', tone:'dark', bg:'--rf-bg' } };
tl.to('#figure', { filter:'brightness(0)', duration:0.4, ease:'power2.in' }, T);

// 씬N+1(enter): 같은 실루엣, 명암 반전 국면으로 재등장
// enter anchor: { shape:'silhouette-fig', tone:'light', bg:'--rf-surface-2' }
gsap.set('#figure-2', { filter:'brightness(0)' });
tl.set('#figure-2', { backgroundColor:'var(--rf-surface-2)' }, 0);  // var()는 set(순간)로만
tl.to('#figure-2', { filter:'brightness(1)', duration:0.5, ease:'power2.out' }, 0);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 실루엣 형태 | 인물형 / 아이콘형 / 텍스트형 |
| 톤 반전 쌍 | `--rf-bg` ↔ `--rf-surface-3` — 팔레트 내 명암 대응 쌍을 사전 정의 |
| 반전 지속 | 0.4~0.6s |

**쓸 때**: '상황이 뒤집혔다'는 대비 서사 — Before/After, 문제→해결, 어두운 톤→밝은 톤 국면 전환. 의미: 대비.
**피할 때**: 밝기 반전이 `--rf-*` 토큰 체계 밖의 색을 만들어낼 위험이 있을 때 — 반드시 토큰 내 대응 쌍으로.

intensity: 40-70 / pairs: `match-cut-graphic-analogy`, `shape-wipe-color-block`

## light-flash-join — 라이트 플래시 조인 (중립 챕터 구두점)

공간·인과가 무관한 두 샷 사이에 짧은 화이트/컬러 플래시를 끼워 '다음 장'을 알리는 중립 구두점 — 트레일러 챕터 카드 직전의 그것.

**구현**

```js
// 씬N(exit): 연속·인과를 주장하지 않는 게 핵심 — 앵커는 색+지속시간만 공유
window.__anchors['scene-25'] = { exit: { flash:'--rf-text', coverage:1.0, dur:0.12 } };
tl.to('#scene-root', { filter:'brightness(3)', duration:0.12, ease:'power2.in' }, T);
// GSAP은 filter:none을 brightness(1) 아이덴티티로 처리 → none→3 보간 성립
tl.set('#scene-root', { opacity:0 }, T+0.12);

// 씬N+1(enter): 동일 플래시 색에서 정상 밝기로 복귀
// enter anchor: { flash:'--rf-text', coverage:1.0, dur:0.12 }
gsap.set('#scene-root-2', { filter:'brightness(3)' });
tl.to('#scene-root-2', { filter:'brightness(1)', duration:0.18, ease:'power2.out' }, 0);
```

가장 구현이 단순하고 안전한 **폴백 전환** — 다른 전환이 계약을 못 지킬 때의 기본값.

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 플래시 색 | `--rf-text` / `--rf-accent` |
| 지속 | 0.1~0.15s — 프레임 플래시는 이보다 길면 페이드로 읽힘 |
| 밝기 피크 | brightness(2.5~4) |

**쓸 때**: 완전히 다른 주제로 넘어가는 챕터 브레이크, 또는 전환 선택이 애매할 때의 안전한 기본값. 의미: 챕터(순수 구두점).
**피할 때**: 같은 시퀀스 안 남발 — 매 전환이 '광고 트랜지션'처럼 가벼워짐. 레지스트리 '2~3종 반복' 원칙에서 accent 취급, 챕터 경계에만 예산 배정.

intensity: 40-70 / pairs: `shape-wipe-color-block`, `zoom-through-portal`

## object-scale-continuity — 오브젝트 스케일 승계 (미시→거시 인과 확대)

씬 속 작은 디테일이 다음 씬에서 주인공 규모로 확대되어 나타나는 그래픽 매치의 스케일 버전 — '작은 것이 큰 그림이 된다'는 인과적 스케일 점프.

**구현**

```js
// 씬N(exit): 타겟이 특정 정규화 좌표·크기로 축소 정지
window.__anchors['scene-27'] = { exit: { shape:'gear-icon', cx:0.5, cy:0.5, scaleEnd:0.08, color:'--rf-accent' } };
tl.to('#gear', { scale: 0.08, x:0, y:0, duration:0.4, ease:'power2.in' }, T);

// 씬N+1(enter): 동일 형태·색이 화면 지배 규모로 시작해 안정화 — "이게 그거였다"
// enter anchor: { shape:'gear-icon', cx:0.5, cy:0.5, scaleStart:0.08, color:'--rf-accent' }
tl.fromTo('#gear-2', { scale: 0.08 }, { scale: 1, duration: 0.5, ease: 'power2.out' }, 0);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 축소 스케일 | 0.05(극소) / 0.08~0.12(표준) / 0.2(약한 확대) |
| 안착 좌표 | cx, cy — 두 씬 고정 공유 |
| 지속 | 0.35~0.5s |

**쓸 때**: '디테일 하나가 전체를 설명한다'는 인과 서사 — 나사 하나가 시스템 전체로, 데이터 포인트 하나가 차트 전체로. 의미: 인과.
**피할 때**: 축소 오브젝트가 스케일 0.05 미만으로 사실상 사라져 시청자가 앵커를 인지 못 할 때.

intensity: 40-70 / pairs: `zoom-through-portal`, `match-cut-graphic-analogy`

## Sources

- AE 매치컷/트랙매트/도어 마스크 전통 레시피 — 리서치 카탈로그의 `ae_concept` 필드 (쿠브릭 《2001: 스페이스 오디세이》 뼈다귀→인공위성 매치컷 포함)
- PremiumBeat — Whip Pan(Adjustment Layer + Motion Tile + Directional Blur), Time Ramping(500~4000% 가속 스피드램프)
- 필름 연속편집 이론 — 180도 규칙, 아이라인 매치, 스크린 방향 일관성
- vendor 실측 — `vendor/gsap/3.14.2/gsap.min.js`(72,779B, 코어 단일 파일): CSSPlugin·AttrPlugin 번들 확인, 플러그인 파일 0개, clip-path/filter는 비숫자 구조 동일 시 숫자 보간
- `render-lint.mjs` 실측 — RF-FRAGMENT-001~015 정규식+VM 스모크 계약 (getBoundingClientRect/rAF 미제공, `||{}` 패턴 통과, Math.random/Date.now 금지)
- 관련 문법 문서 — coordinate-target-zoom.md(측정 원칙·headroom budget), overview.md(에너지 밴드), hyperframes-animation(블루프린트·GSAP 어댑터·spatial-pan-stations)
