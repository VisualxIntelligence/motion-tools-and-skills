# 04 — 마스크·트랙매트·리빌 (Masks & Mattes)

> 이 문서의 코드 스케치는 렌더 대상이 아니다 — 검증 실물은 references/gallery/fragments/, 이 파일은 통째 로딩 금지(배정 기법 섹션만 부분 로딩).

AE의 Mask Path / Track Matte 관용구를 ReelForge 계약(코어 GSAP 단일·seek-safe·결정론 렌더) 위에서 재현하는 기법 카탈로그. vendor 실측 전제: `vendor/gsap/3.14.2` 코어 단일 번들 — CSSPlugin·AttrPlugin·전 표준 이즈 포함, SplitText/DrawSVG/MorphSVG/MotionPath **부재**. clip-path·mask·background-position·CSS 커스텀 프로퍼티는 CSSPlugin 복합문자열 보간으로 코어만으로 트윈 가능하다.

## Contents

- [inset-wipe-reveal — 인셋 와이프 리빌](#inset-wipe-reveal--인셋-와이프-리빌)
- [polygon-diagonal-wipe — 폴리곤 대각선 와이프](#polygon-diagonal-wipe--폴리곤-대각선-와이프)
- [iris-circle-directional — 아이리스 리빌 (방향성 원점 확장)](#iris-circle-directional--아이리스-리빌-방향성-원점-확장)
- [gradient-mask-soft-wipe — 그라디언트 마스크 소프트 와이프](#gradient-mask-soft-wipe--그라디언트-마스크-소프트-와이프)
- [mask-spotlight-drift — 스포트라이트 마스크 드리프트](#mask-spotlight-drift--스포트라이트-마스크-드리프트)
- [bg-clip-text-shape — 배경클립 텍스트 셰이프](#bg-clip-text-shape--배경클립-텍스트-셰이프)
- [dual-layer-counter-move — 듀얼 레이어 카운터 무브](#dual-layer-counter-move--듀얼-레이어-카운터-무브)
- [crop-reveal-overflow — 크롭 리빌](#crop-reveal-overflow--크롭-리빌)
- [line-sweep-diagonal-stripes — 대각선 라인 스윕](#line-sweep-diagonal-stripes--대각선-라인-스윕)
- [blinds-stripe-reveal — 블라인즈/셔터 리빌](#blinds-stripe-reveal--블라인즈셔터-리빌)
- [alpha-matte-cutout — 알파매트 컷아웃](#alpha-matte-cutout--알파매트-컷아웃)
- [word-clip-stagger — 단어 단위 클립 스태거](#word-clip-stagger--단어-단위-클립-스태거)
- [corner-swing-mask — 코너 스윙 마스크](#corner-swing-mask--코너-스윙-마스크)
- [matte-invert-negative-space — 매트 반전 네거티브 스페이스](#matte-invert-negative-space--매트-반전-네거티브-스페이스)
- [mosaic-matte-collage — 모자이크 트랙매트 콜라주](#mosaic-matte-collage--모자이크-트랙매트-콜라주)

## inset-wipe-reveal — 인셋 와이프 리빌

AE 원리: 사각 Mask Path를 Mask Expansion 키프레임으로 확장 — 사각형의 한 변만 안쪽에서 바깥으로 열어 방향성 와이프를 만든다.

**구현** — `inset()` 4값 구조를 시작·종료 동일하게 유지하라(CSSPlugin이 복합문자열 내 숫자만 보간).

```js
.reveal-panel{ clip-path: inset(0 100% 0 0); }

tl.set(".reveal-panel", { clipPath: "inset(0 100% 0 0)" }, 0);
tl.to(".reveal-panel", {
  clipPath: "inset(0 0% 0 0)",
  duration: 0.5,            // 리빌 표준 템포 — 스냅은 0.3, 느긋은 0.8
  ease: "power3.out"
}, 0.1);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 방향 | 좌 / 우 / 상 / 하 / 코너(두 변 동시) |
| 속도 | 0.3s(스냅) / 0.5s(표준) / 0.8s(느긋) |
| ease | power3.out / back.out / expo.out |

**쓸 때**: 카드·패널·이미지가 한 방향에서 결단력 있게 열리는 등장. 로고 언더레이 리빌, 데이터 패널 등장.
**피할 때**: 직전 씬이 이미 fade로 등장했다면 등장 어휘 중복으로 임팩트가 죽는다.

intensity: 40-70 · pairs: `dual-layer-counter-move`, `corner-swing-mask`

## polygon-diagonal-wipe — 폴리곤 대각선 와이프

AE 원리: Pen 마스크를 사선으로 그리고 Path 포인트를 키프레임으로 스윕 — 스포츠·게이밍 로워써드의 사선 컷 관용구.

**구현** — 시작·종료 모두 4점(8숫자)으로 정점 수를 일치시켜야 CSSPlugin 보간이 성립한다. 음수 %는 허용된다.

```js
/* CSS 초기 상태: 화면 밖 */
.diag-wipe{
  clip-path: polygon(-20% 0%, 0% 0%, -20% 100%, -40% 100%);
}

tl.to(".diag-wipe", {
  clipPath: "polygon(0% 0%,120% 0%,100% 100%,-20% 100%)",
  duration: 0.45,           // 임팩트 컷 — 0.5 미만이 사선의 스냅감을 살린다
  ease: "power4.inOut"
}, 0);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 각도 | 15° / 30° / 45° (두 점의 x offset 차이로 제어) |
| 진입 방향 | 좌 / 우 |
| 엣지 스트로크 | accent 컬러 hairline 유무 |

**쓸 때**: 스포츠·게이밍·다이나믹 브랜드 톤. 씬 내부 강조 패널 등장, 헤드라인 아래 스트라이프 강조.
**피할 때**: 차분한 정보 전달·감성 톤에서는 과하다 — 그럴 땐 `gradient-mask-soft-wipe`.

intensity: 70-100 · pairs: `line-sweep-diagonal-stripes`

## iris-circle-directional — 아이리스 리빌 (방향성 원점 확장)

AE 원리: 원형 매트를 0→100% 확장하는 필름 아이리스 트랜지션. 원점을 특정 지점으로 옮기면 "그 지점에서 세계가 열리는" 방향성이 생긴다.

기본 `circle(0%→100%)` 확장 리빌은 → hyperframes-animation `techniques.md`의 “12. Clip-Path Reveal Masks”·`transitions/css-radial.md`의 “Circle Iris” 참조. 여기서는 **원점 좌표를 옮기는 방향성 확장판**만 다룬다.

**구현** — `at X% Y%` 좌표는 시작·종료 동일하게 고정하고 반지름만 보간한다.

```js
tl.set(".iris", { clipPath: "circle(0% at 12% 88%)" }, 0);
tl.to(".iris", {
  clipPath: "circle(75% at 12% 88%)",   // 75%면 코너에 비네트가 잔존 — 완전 개방은 150%
  duration: 0.6,
  ease: "power2.out"
}, 0.05);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 원점 | 중앙 / 좌하 / 우상 / 텍스트 앵커 좌표 |
| 최종 반경 | 75%(비네트 잔존) / 150%(완전 개방) |

**쓸 때**: 로고 마크·CTA에서 확산되는 리빌, 특정 지점에서 세계가 열리는 인상.
**피할 때**: 원점이 의미 없는 지점이면 그냥 중앙 아이리스와 다를 게 없다 — 원점은 반드시 앵커(로고·CTA·텍스트)에 물려라.

intensity: 40-70 · pairs: `dual-layer-counter-move`

## gradient-mask-soft-wipe — 그라디언트 마스크 소프트 와이프

AE 원리: Luma Matte에 검→백 그라디언트 매트를 써서 하드 엣지 없는 페더 리빌을 만든다. clip-path는 항상 하드 엣지지만 mask-image 그라디언트는 경계 자체가 부드럽다.

**구현** — 오버사이즈 페더 매트를 만들고 mask-position을 이동시킨다. GSAP가 매 프레임 style을 직접 쓰므로 `@property` 등록 없이 결정론적. 코어의 checkPrefix가 `webkitMask*`를 자동 처리하며, 렌더 크로미움은 unprefixed도 지원(병기는 무해 중복).

```js
.soft-wipe{
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 35%, #000 100%);
  mask-image: linear-gradient(90deg, transparent 0%, #000 35%, #000 100%);
  -webkit-mask-size: 300% 100%; mask-size: 300% 100%;  /* 300% = 페더 구간이 요소 밖에서 진입·퇴장할 여유폭 */
}

tl.fromTo(".soft-wipe",
  { maskPosition: "100% 0", webkitMaskPosition: "100% 0" },
  { maskPosition: "0% 0", webkitMaskPosition: "0% 0", duration: 0.6, ease: "power2.inOut" },
  0
);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 페더 폭 | 15% / 35% / 60% |
| 방향 | 가로 / 세로 / 대각선(그라디언트 각도로 제어) |

**쓸 때**: 사진·영상 프레임 리빌에서 하드 엣지가 과하게 느껴질 때. 감성적·다큐멘터리 톤.
**피할 때**: 스냅감 있는 강한 임팩트가 필요한 씬 — 그럴 때는 `polygon-diagonal-wipe`가 맞다.

intensity: 0-40 · pairs: —

## mask-spotlight-drift — 스포트라이트 마스크 드리프트

AE 원리: 원형 Track Matte를 서서히 이동시켜 화면 일부만 드러내는 토치 리빌 — 카메라가 아니라 마스크가 움직여 시선을 유도한다.

**구현** — 커스텀 프로퍼티 `--sx/--sy`를 트윈하고 updater로 그라디언트를 재조합한다. **프레임0 결정성 필수**: CSS 초기 그라디언트를 트윈 시작좌표와 일치시키고, 빌드 시 updater를 1회 선실행하라(`to()`는 immediateRender=false라 t=0에 onUpdate가 아직 안 돌 수 있다).

```js
/* CSS: 초기값을 트윈 시작좌표(20% 70%)와 일치 */
.spotlight{ --sx:20%; --sy:70%;
  -webkit-mask-image: radial-gradient(circle at var(--sx) var(--sy), #000 22%, transparent 46%);
  mask-image: radial-gradient(circle at var(--sx) var(--sy), #000 22%, transparent 46%); } /* 22→46% 페더 = 토치 인상 */

function paint(el){ var g='radial-gradient(circle at '+el.style.getPropertyValue('--sx')+' '+el.style.getPropertyValue('--sy')+', #000 22%, transparent 46%)'; el.style.maskImage=g; el.style.webkitMaskImage=g; }
gsap.set('.spotlight',{ '--sx':'20%','--sy':'70%' });
var sp=document.querySelector('.spotlight'); if(sp) paint(sp); // 프레임0 선반영
tl.to('.spotlight',{ '--sx':'78%','--sy':'30%', duration:2.4, ease:'sine.inOut', onUpdate:function(){ paint(this.targets()[0]); } },0);
// var()를 mask에 직접 쓰면 onUpdate 재조합조차 불필요(브라우저가 --sx 갱신만으로 재계산) — 더 견고
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 반경 | 18% / 28% / 40% |
| 이동 경로 | 대각선 / 원호 / 좌우 왕복 |
| 루프 | living motion용 infinite alternate 여부 |

**쓸 때**: 배경 이미지·지도·다이어그램 위 시선의 순차 안내, 은은한 living motion 배경.
**피할 때**: 전체 화면을 빠르게 보여줘야 하는 정보 밀도 높은 씬 — 스포트라이트는 가리는 기법이다.

intensity: 0-40 · pairs: —
비고: onUpdate 문자열 재조합 비용은 씬 duration 2~4.5s 범위에서 무해. VM 스모크의 timeline 스텁은 onUpdate를 실행하지 않으므로 프레임0 선반영이 없으면 스모크는 통과해도 실렌더 첫 프레임이 틀어진다.

## bg-clip-text-shape — 배경클립 텍스트 셰이프

AE 원리: 텍스트 레이어를 Alpha Matte로 써서 글자 모양 안에만 그라디언트·영상이 노출되는 'text as matte' 관용구.

**구현** — `background-clip:text` + `color:transparent`로 문자 셰이프를 창으로 쓰고 background-position을 이동시킨다.

```js
.matte-text{
  font-weight: 800;                       /* 굵을수록 창 면적이 넓어 그라디언트가 읽힌다 */
  background: linear-gradient(120deg, var(--rf-accent), var(--rf-text) 60%, var(--rf-accent));
  background-size: 240% 100%;             /* 240% = position 0→100% 이동 시 색이 한 사이클 흐를 여유폭 */
  -webkit-background-clip: text; background-clip: text;
  color: transparent;
}

tl.fromTo(".matte-text",
  { backgroundPosition: "0% 0%" },
  { backgroundPosition: "100% 0%", duration: 1.1, ease: "power1.inOut" },
  0
);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 그라디언트 색 | accent 단색 / 듀오톤(accent+text) |
| 속도 | 0.8s / 1.1s / 1.6s |
| 반복 | 1회 / 반복 |

**쓸 때**: 헤드라인 타이포의 프리미엄 쉬머·그라디언트 흐름, 브랜드 워드마크 등장.
**피할 때**: 저대비·차분한 정보 전달 씬 — 가독성이 떨어질 수 있다.

intensity: 40-70 · pairs: `word-clip-stagger`

## dual-layer-counter-move — 듀얼 레이어 카운터 무브

AE 원리: Track Matte는 정지시키고 Fill Layer만 Position 키프레임으로 이동 — 매트 뒤 콘텐츠가 창을 통해 스크롤되는 트래블링 매트의 역방향.

**구현** — **리빙모션은 CSS keyframes infinite alternate로 구현하라**(계약의 정규 기구 — 엔진이 씬클럭에 물려 결정론 렌더, 타임라인 길이 미소모). GSAP yoyo로 하면 `duration×(repeat+1) ≤ 씬 duration(≤4.5s)`을 지켜야 한다.

```css
/* 창은 고정, 두 레이어가 반대 방향으로 드리프트 */
.window{ position:absolute; inset:0; overflow:hidden; }
.layer-back{ position:absolute; inset:-10% -30%; background: var(--rf-surface-2); }  /* 오버스캔 — 이동폭만큼 여유 */
.layer-front{ position:absolute; inset:0; display:flex; align-items:center; }

@keyframes rf-drift-back{ from{ transform:translateX(-8%);} to{ transform:translateX(8%);} }
@keyframes rf-drift-front{ from{ transform:translateX(8%);} to{ transform:translateX(-8%);} }
.layer-back{ animation: rf-drift-back 3.2s ease-in-out infinite alternate; animation-delay: calc(var(--rf-scene-start,0s) + 0s); }
.layer-front{ animation: rf-drift-front 3.2s ease-in-out infinite alternate; animation-delay: calc(var(--rf-scene-start,0s) + 0s); }
/* 타임라인은 등장/전환만 담당. GSAP yoyo를 고수한다면 예: duration 1.5 repeat 1 = 3s ≤ 4.5s */
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 이동폭 | 6% / 12% / 20% |
| 레이어 수 | 2(전경·배경) / 3(전경·중경·배경) |
| 위상차 | 동시 / 딜레이 스태거 |

**쓸 때**: 창 안의 깊이감 있는 아이들 모션, 타이틀카드 배경 드리프트, 정적으로 느껴지는 프레임 살리기. 1fps 스트립에서도 위치 변화가 뚜렷하다.
**피할 때**: 전경 텍스트가 작고 밀도가 높으면 배경 드리프트가 가독성을 흔든다 — 이동폭 6%로 낮춰라.

intensity: 0-40 · pairs: `inset-wipe-reveal`, `iris-circle-directional`, `corner-swing-mask`

## crop-reveal-overflow — 크롭 리빌

AE 원리: Precomp를 프레임보다 크게 Scale해 잘라내는 '크롭 확대' 리빌 — 콘텐츠가 프레임 경계에 잘려 나타나는 가장 기본적인 매트 감각.

**구현** — clip-path 없이 overflow+transform만 사용. 가장 저비용·저위험 대체 카드. **`.crop-media`에 `<video>` 금지**(RF-FRAGMENT-007: 미디어는 엔진 소유) — 반드시 `<img>` 또는 엔진 마운트 레이어.

```js
.crop-frame{ overflow:hidden; border-radius: 12px; }
.crop-media{ width:100%; height:100%; object-fit:cover; transform-origin:50% 50%; }

tl.fromTo(".crop-media",
  { scale: 1.35, opacity: 0 },   /* 1.35 = 잘림이 인지되면서 왜곡은 안 느껴지는 중간값 */
  { scale: 1, opacity: 1, duration: 0.5, ease: "power3.out" },
  0
);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 초기 스케일 | 1.15 / 1.35 / 1.6 |
| 라운드 코너 | 0 / 8px / 24px |
| opacity 동반 | 유 / 무 |

**쓸 때**: 이미지·영상 프레임의 첫 등장에 가장 무난하고 안전한 리빌 — 플러그인 리스크 전무.
**피할 때**: 씬의 시그니처 컷으로는 심심하다 — 임팩트가 필요하면 마스크 계열로 승격하라.

intensity: 0-40 · pairs: —

## line-sweep-diagonal-stripes — 대각선 라인 스윕

AE 원리: 다중 사선 Shape Layer를 스태거로 통과시키는 '라이트 립' 트랜지션 — 스트라이프가 화면을 쓸고 지나가는 예열 효과.

**구현** — 무한 스트라이프 CSS 애니를 seek-safe한 1회성 `tl.fromTo` 통과로 변환한 것. 화면 밖→안→밖 단발 스윕.

```js
.sweep-overlay{
  position:absolute; inset:-20% -60%;   /* 오버스캔 — 스윕 진입·퇴장 여유 */
  background-image: repeating-linear-gradient(45deg,
    var(--rf-accent) 0 14px, transparent 14px 28px);
}

tl.fromTo(".sweep-overlay",
  { xPercent: -60, opacity: 0.9 },
  { xPercent: 60, opacity: 0, duration: 0.5, ease: "power2.in" },
  0.1
);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 스트라이프 폭 | 8px / 14px / 24px |
| 각도 | 30° / 45° / 60° |
| 색 구성 | 단색 / accent+hairline 2색 교차 |

**쓸 때**: 장면 전환 임팩트, 텍스트 강조 등장 직전의 예열 스윕. 스포츠·이벤트 톤.
**피할 때**: 연속 2씬에서 반복하면 장식이 아니라 노이즈가 된다.

intensity: 70-100 · pairs: `polygon-diagonal-wipe`

## blinds-stripe-reveal — 블라인즈/셔터 리빌

AE 원리: 다수의 수평 Shape Layer 마스크를 스태거로 각각 스케일업 — 셔터가 걷히는 인상의 리빌.

**구현** — 콘텐츠 위에 N개 스트립 div를 쌓고 scaleY 1→0 stagger. 매트를 여러 독립 DOM 요소로 대체한 것. stagger 트윈은 절대시간 기반이라 seek 결정론적. **각 `.blind`에 개별 top 오프셋(0, 12.5%, 25%…)을 반드시 부여하라** — height만으로는 겹쳐 쌓인다.

```js
/* 8개 스트립, 각 height:12.5% + top: i*12.5% */
.blind{ position:absolute; left:0; right:0; height:12.5%; background:var(--rf-bg); transform-origin:50% 50%; }

gsap.set(".blind", { scaleY: 1 });
tl.to(".blind", {
  scaleY: 0,
  duration: 0.35,
  ease: "power3.inOut",
  stagger: 0.04       /* 8스트립 × 0.04 = 마지막 시작까지 0.28s, 총 0.63s 리듬 */
}, 0);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 스트립 수 | 6 / 8 / 12 (DOM 비용 때문에 12개 이하) |
| 방향 | 위 / 아래 기준 축 / 좌우 |
| stagger 간격 | 0.02~0.06s |

**쓸 때**: 콘텐츠 위 셔터가 걷히며 등장, 강한 리듬감이 필요한 텍스트·이미지 리빌.
**피할 때**: 씬이 이미 stagger 어휘(단어 스태거 등)를 쓰고 있다면 리듬이 충돌한다.

intensity: 70-100 · pairs: —

## alpha-matte-cutout — 알파매트 컷아웃

AE 원리: 로고·아이콘 SVG를 Alpha Matte로 써서 실루엣 안에만 콘텐츠가 드러나는 고전 Track Matte.

**구현** — mask-image에 SVG data URI 실루엣(원격 아님 → RF-FRAGMENT-015 무관, 허용). 매트 형태는 정적, 콘텐츠의 scale/opacity만 트윈한다.

```js
.logo-matte{
  -webkit-mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45'/></svg>");
  mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45'/></svg>");
  -webkit-mask-repeat:no-repeat; mask-repeat:no-repeat;
  -webkit-mask-size:contain; mask-size:contain;
}

tl.fromTo(".logo-matte", { scale: 1.4, opacity: 0 },
  { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.6)" }, 0);  /* 1.6 = 기본 1.7보다 살짝 절제된 오버슛 */
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 매트 형태 | 원 / 브랜드 로고 SVG / 커스텀 셰이프 |
| 채움 방식 | scale / opacity / 양쪽 동시 |

**쓸 때**: 브랜드 로고 실루엣 안에 콘텐츠가 차오르는 리빌, 아이콘 형태의 통계·컬러 필.
**피할 때**: 매트 SVG가 복잡하면 data URI가 길어져 파일이 비대해진다 — 단순 셰이프만.

intensity: 40-70 · pairs: —

## word-clip-stagger — 단어 단위 클립 스태거

AE 원리: 텍스트를 줄/단어 단위 Shape Layer 마스크로 쪼개 순차적으로 여는 카피 리빌 관용구.

**구현** — SplitText는 vendor에 없다(실측 카운트 0). **빌드 단계에서 단어를 `<span>`으로 미리 분해해 마크업으로 조립하라**(런타임 분해 금지). 각 span을 overflow:hidden 래퍼로 감싸고 yPercent 110→0 stagger.

```js
<span class="word"><span class="word-in">첫</span></span>
<span class="word"><span class="word-in">번째</span></span>

.word{ display:inline-block; overflow:hidden; }
.word-in{ display:inline-block; }   /* inline-block이어야 yPercent가 동작 */

gsap.set(".word-in", { yPercent: 110 });   /* 110 = 디센더까지 완전히 숨는 여유 10% */
tl.to(".word-in", {
  yPercent: 0,
  duration: 0.45,
  ease: "power4.out",
  stagger: 0.05
}, 0);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 분해 단위 | 단어 / 줄 |
| 이동축 | y(세로 슬라이드) / x(가로 슬라이드) |
| stagger | 0.03~0.08s |

**쓸 때**: 헤드라인 등장, 카피 강조, '쓰기 리듬'이 필요한 텍스트 씬.
**피할 때**: 본문 급 장문 — 단어 수가 많으면 총 리빌 시간이 씬을 잡아먹는다.

intensity: 40-70 · pairs: `bg-clip-text-shape`

## corner-swing-mask — 코너 스윙 마스크

AE 원리: 마스크의 한 코너를 고정하고 반대 코너를 스윙시켜 여는 대각선 코너핀 리빌 — 커튼·종이 넘김의 인상.

**구현** — polygon 4점 중 고정 코너 2점은 그대로, 반대편 2점만 접힌 상태에서 정상 위치로 스윙. 초기의 정점 중첩(면적 0) 폴리곤은 비가시일 뿐 유효하며, 시작·종료 모두 4점이라 보간이 성립한다.

```js
/* CSS 초기: 접힌 상태(고정 코너=0,0) */
.corner-mask{
  clip-path: polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%);
}

tl.to(".corner-mask", {
  clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  duration: 0.55,
  ease: "power2.out"
}, 0);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 고정 코너 | 좌상 / 좌하 / 우상 / 우하 |
| 펼침 속도 | 0.4s / 0.55s / 0.75s |

**쓸 때**: 카드·패널이 한쪽 모서리를 축으로 펼쳐지는 느낌, 브랜드 임팩트가 필요한 진입.
**피할 때**: 같은 씬에서 `inset-wipe-reveal`과 병용하면 열림 어휘가 중복된다 — 하나만 골라라.

intensity: 40-70 · pairs: `dual-layer-counter-move`

## matte-invert-negative-space — 매트 반전 네거티브 스페이스

AE 원리: Alpha Inverted Matte — 실루엣 '안'이 아니라 '바깥'만 보이게 하는 반전 매트. 텍스트·로고가 뚫린 구멍처럼 배경을 드러낸다.

**구현** — SVG clipPath에 `clip-rule:evenodd`로 바깥 사각형과 안쪽 셰이프를 겹쳐 구멍을 만든다. 인라인 SVG라 원격참조 규칙 무관. 구멍 확장 변형은 MorphSVG 불필요 — 코어 AttrPlugin(`attr:{d}`)으로 정점 수 고정 시 트윈 가능하며, d 좌표 문자열은 미리 계산해 둔다.

```js
<svg width="0" height="0">
  <clipPath id="cut" clipPathUnits="objectBoundingBox" clip-rule="evenodd">
    <path d="M0,0 H1 V1 H0 Z M0.3,0.3 H0.7 V0.7 H0.3 Z"/>
  </clipPath>
</svg>
<div class="cutout" style="clip-path:url(#cut);"></div>

tl.fromTo(".cutout", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" }, 0);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 구멍 형태 | 사각 / 원 / 커스텀 path |
| 구멍 애니메이션 | 정적 / attr d 트윈으로 확장 |

**쓸 때**: 로고·타이포 모양의 '창'으로 뒤 배경이 보이는 반전형 리빌. 티저·프로모의 시그니처 컷.
**피할 때**: 구멍 안 배경이 단색이면 반전의 의미가 없다 — 뒤에 이미지·모션 레이어가 있어야 산다.

intensity: 70-100 · pairs: —

## mosaic-matte-collage — 모자이크 트랙매트 콜라주

AE 원리: 서로 다른 Shape Track Matte 여러 개를 겹쳐 하나의 콜라주·그리드를 구성 — 각 셀이 독립 매트 형태를 가진 서브레이어들의 조합.

**구현** — 셀별 clip-path는 CSS 정적으로 두고, GSAP은 scale/opacity stagger만 트윈한다. clip-path 보간이 필요 없어 코어만으로 자명하게 seek-safe. 매트 형태의 다양성 자체가 장식 역할.

```js
.cell{ clip-path: polygon(10% 0,100% 0,90% 100%,0% 100%); overflow:hidden; }
.cell:nth-child(2n){ clip-path: circle(50% at 50% 50%); }

gsap.set(".cell", { scale: 0.8, opacity: 0 });
tl.to(".cell", {
  scale: 1, opacity: 1, duration: 0.4, ease: "power3.out", stagger: 0.06
}, 0);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 셀 수 | 4 / 6 / 9 |
| 셰이프 조합 | 전부 동일 / 2종 교차 / 사전 정의된 결정론적 패턴 배열 |

**쓸 때**: 다중 이미지·통계 카드가 서로 다른 셰이프로 동시 등장하는 그리드 씬. 포트폴리오·무드보드 톤.
**피할 때**: 정보 밀도가 높아 시각 노이즈가 부담될 때는 셰이프를 1~2종으로 줄여라.

intensity: 40-70 · pairs: —

## Sources

- After Effects Track Matte / Mask Path 관용구 (Alpha Matte, Luma Matte, Alpha Inverted Matte, Mask Expansion, 필름 아이리스)
- MDN: `clip-path`(inset/polygon/circle), `mask-image`, `mask-position`, `background-clip: text`, SVG `clipPath` + `clip-rule: evenodd`
- GSAP 3 CSSPlugin 복합문자열 보간 · AttrPlugin · CSS 커스텀 프로퍼티 트윈 (vendor 실측 결과는 문서 상단 전제 참조) / CSS-Tricks repeating-linear-gradient 스트라이프 애니메이션(seek-safe 단발 변환의 원본)
- ReelForge 계약: RF-FRAGMENT-007(미디어 엔진 소유), RF-FRAGMENT-015(원격참조 차단·data URI 허용), 씬 duration ≤ 4.5s, 리빙모션 = CSS keyframes infinite alternate
- hyperframes-animation `techniques.md` · `transitions/css-radial.md` (기본 circle 확장 리빌 선등록분)
