# 06 — 셰이프·트림패스·스트로크

> 이 문서의 코드 스케치는 렌더 대상이 아니다 — 검증 실물은 references/gallery/fragments/, 이 파일은 통째 로딩 금지(배정 기법 섹션만 부분 로딩).

AE의 Trim Paths / 셰이프 마스크 / Path 보간 관용구를 ReelForge 계약(GSAP core-only,
seek-safe, RF-FRAGMENT 린트) 안에서 구현하는 기법 카탈로그. 총 12기법.

## Contents

- [공통 계약: getTotalLength 가드 관용구](#공통-계약-gettotallength-가드-관용구)
- [svg-stroke-draw-on — 스트로크 드로우온 (기본 트레이스)](#svg-stroke-draw-on--스트로크-드로우온-기본-트레이스)
- [trace-then-fill — 트레이스 후 필 (확정 아이콘)](#trace-then-fill--트레이스-후-필-확정-아이콘)
- [underline-emphasis-sweep — 언더라인/서클 강조 스윕](#underline-emphasis-sweep--언더라인서클-강조-스윕)
- [progress-ring-radial — 프로그레스 링 (원형 게이지)](#progress-ring-radial--프로그레스-링-원형-게이지)
- [progress-bar-linear-segmented — 스텝 프로그레스 바 (단계형)](#progress-bar-linear-segmented--스텝-프로그레스-바-단계형)
- [shape-wipe-clip-path — 도형 와이프 (아이리스/방향성)](#shape-wipe-clip-path--도형-와이프-아이리스방향성)
- [path-morph-consistent-topology — 패스 모프 (동형 토폴로지 보간)](#path-morph-consistent-topology--패스-모프-동형-토폴로지-보간)
- [line-connector-draw — 라인 커넥터 (데이터 연결선)](#line-connector-draw--라인-커넥터-데이터-연결선)
- [path-follow-marker — 패스 팔로우 마커 (경로 추종 오브젝트)](#path-follow-marker--패스-팔로우-마커-경로-추종-오브젝트)
- [animated-line-chart-trace — 라인 차트 드로우 + 선행 마커](#animated-line-chart-trace--라인-차트-드로우--선행-마커)
- [divider-rule-expand — 디바이더 라인 확장 (구분선)](#divider-rule-expand--디바이더-라인-확장-구분선)
- [checkmark-success-tick — 체크마크 성공 틱](#checkmark-success-tick--체크마크-성공-틱)
- [Sources](#sources)

## 공통 계약: getTotalLength 가드 관용구

이 도메인 전 기법에 적용되는 하드 규칙. `path.getTotalLength()` /
`getPointAtLength()`를 스크립트 최상위에서 동기 호출하면 RF-FRAGMENT-001
vm 스모크에서 탈락한다 — 스텁 element에는 두 메서드가 없고, `querySelector`는
메서드 없는 truthy 스텁을 반환하므로 존재 체크로도 못 막는다.

반드시 아래 관용구로 감싸라. 샌드박스에서는 `querySelectorAll`이 `[]`를
반환해 콜백이 미실행으로 통과하고, 라이브에서는 실측이 그대로 실행된다.

```js
// 검증된 회피 관용구 — 이 문서의 모든 SVG 실측 코드는 이 형태로 저작한다
root.querySelectorAll('.mark path').forEach((p) => {
  const len = p.getTotalLength();          // 라이브에서만 실행됨
  p.style.strokeDasharray = len;
  p.style.strokeDashoffset = len;
});
```

vendor 실측 근거: `vendor/gsap/3.14.2/`는 `gsap.min.js` 단일 파일 — DrawSVG /
MorphSVG / MotionPath 플러그인 전무. 그러나 core만으로 dashoffset 트윈(CSSPlugin),
`attr:{d}` 보간(내장 AttrPlugin), clip-path·dasharray 복합 문자열 보간
(renderComplexString), SVG transformOrigin(getBBox 베이킹)이 전부 가능하다.

## svg-stroke-draw-on — 스트로크 드로우온 (기본 트레이스)

AE 셰이프 레이어의 Trim Paths: Start/End를 0→100%로 키프레임하면 스트로크가 펜으로 그리듯 나타난다.

**구현** — 정본은 → hyperframes-animation `rules/svg-path-draw.md` 참조. 중복 발명 금지, 아래는 타이밍 골격만.

```js
// dasharray/dashoffset 초기화는 공통 가드 관용구(위)로 수행
tl.to('#seg-1', { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, 0.2);
tl.to('#seg-2', { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, 0.45); // 70~80% 스태거
```

DrawSVGPlugin 불필요 — dashoffset 트윈은 CSSPlugin 결정적 값 트윈이라 seek-safe.

**선택지**

| 파라미터 | 옵션 |
| --- | --- |
| 세그먼트 순서 | 동시 / 순차 / 좌→우 |
| 이징 | `power2.out`(펜 감속) / `none`(등속) |
| 시작점 | 12시 / 3시 (path 저작 시 회전) |
| 다중 세그먼트 스태거 | 70~80% 오버랩 |

**쓸 때**: 로고 마크·와이어프레임 아이콘·다이어그램 화살표가 "지금 막 그려지는 중"이라는 인상을 줄 때. 브랜드 리빌, 인트로 도입부.
**피할 때**: 면(fill)이 주된 실루엣 아이콘 — 윤곽선 위주 마크에만.

intensity: 40-70
pairs: `counting-dynamic-scale`, `progress-ring-radial`, `line-connector-draw`

## trace-then-fill — 트레이스 후 필 (확정 아이콘)

Trim Path로 외곽선을 그린 뒤 같은 셰이프의 Fill 오퍼시티를 0→100으로 올리는 2단 콤보 — 로고 스탬프·뱃지 확정의 AE 표준.

**구현** — dasharray 초기화는 공통 가드 관용구에 위임. 드로우 직후 fill과 scale 펄스를 겹친다.

```js
tl.to('#badge-outline', { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out' }, 0.2);
tl.to('#badge-outline', { fillOpacity: 1, duration: 0.25, ease: 'power1.out' }, 0.65);
tl.to('#badge-outline', { scale: 1.04, duration: 0.12, ease: 'power2.out',
  transformOrigin: '50% 50%' }, 0.65)                    // 1.04 = '도장 찍힘' 최소 가시 펄스
  .to('#badge-outline', { scale: 1, duration: 0.18, ease: 'power2.inOut' }, 0.77);
```

SVG scale의 `transformOrigin: '50% 50%'`는 core가 getBBox 실측으로 매트릭스에 베이킹 — `transform-box` 지정 불필요. 전부 결정적 값 트윈이라 seek-safe.

**선택지**

| 파라미터 | 옵션 |
| --- | --- |
| 펄스 크기 | 1.02 ~ 1.08 |
| 필 색 | 아웃라인과 동일 / 액센트로 전환 |
| 펄스 | 유지 / 생략(잔잔 버전) |

**쓸 때**: 체크마크·인증 뱃지·스탬프처럼 "완료됨"을 물리적으로 확정짓는 순간.
**피할 때**: 여러 아이콘을 빠르게 나열하는 리스트 — 2단 타이밍이 누적되면 느려진다.

intensity: 40-70
pairs: `svg-stroke-draw-on`, `checkmark-success-tick`

## underline-emphasis-sweep — 언더라인/서클 강조 스윕

손글씨 마커로 밑줄/동그라미를 치는 연출 — AE에서 Trim Path + 약간의 웨이브 패스.

**구현** — 스크리블 밑줄/서클 정본은 → hyperframes-animation `rules/css-marker-patterns.md` 참조. 여기서는 신규 변형 2종만: (a) 좁→넓 팽창 더블 스트로크 밑줄, (b) 텍스트 전체를 감싸는 러프 서클 draw.

```js
// querySelectorAll.forEach 가드 — 최상위 getTotalLength는 RF-FRAGMENT-001 탈락
root.querySelectorAll('#emphasis-ring').forEach((ring) => {
  const len = ring.getTotalLength();
  gsap.set(ring, { strokeDasharray: len, strokeDashoffset: len });
  tl.to(ring, { strokeDashoffset: 0, duration: 0.6, ease: 'power1.inOut' }, 0.9);
});
```

서클 path는 살짝 삐뚤게 저작해 유기적인 손그림 느낌을 낸다.

**선택지**

| 파라미터 | 옵션 |
| --- | --- |
| 형태 | 밑줄 / 취소선 / 서클 / 이중선 |
| 웨이브 강도 | 타이트 ~ 루즈 |
| 색 | `--rf-accent` 고정 |

**쓸 때**: 키워드/숫자 하나를 텍스트 애니메이션 안에서 콕 집어 강조할 때. kinetic-type 비트의 액센트 무브로 삽입.
**피할 때**: 한 씬에 강조 2개 이상 — 강조는 씬당 1회만 써야 눈에 남는다.

intensity: 40-70
pairs: `kinetic-beat-slam`, `svg-stroke-draw-on`

## progress-ring-radial — 프로그레스 링 (원형 게이지)

원형 셰이프의 Trim Path End를 0→목표%로 애니메이트하는 로딩/게이지 표준. 12시 시작을 위해 셰이프를 -90도 회전.

**구현** — 기본 링 fill 정본은 → hyperframes-animation `rules/stat-bars-and-fills.md` "2 — Progress Fill (Ring form)" 참조. 여기서는 확장 변형 3종: 디플리션(dashoffset 0→len 역방향), 세그먼트 도넛, 세미서클 게이지+니들.

```js
// 세그먼트 도넛: 카테고리 호를 같은 원 위에 offset으로 이어붙임
root.querySelectorAll('#ring-base').forEach((ring) => {
  const C = ring.getTotalLength();
  const segs = [0.4, 0.35, 0.25]; let acc = 0;  // 합 1.0
  segs.forEach((frac, i) => {
    root.querySelectorAll('#seg-' + i).forEach((arc) => {
      gsap.set(arc, { strokeDasharray: (frac*C) + ' ' + C, strokeDashoffset: -acc*C });
      tl.fromTo(arc, { strokeDasharray: '0 ' + C },
        { strokeDasharray: (frac*C)+' '+C, duration: 0.6, ease: 'power2.out' }, 0.3 + i*0.15);
    });
    acc += frac;
  });
});
```

dasharray 문자열 트윈은 renderComplexString이 숫자만 결정적으로 보간 — seek-safe.

**선택지**

| 파라미터 | 옵션 |
| --- | --- |
| 형태 | 풀서클 / 세미서클(게이지) |
| 방향 | 시계 / 반시계 |
| 모드 | 채움 / 디플리션(카운트다운) |
| 세그먼트 수 | 1 ~ 4 |

**쓸 때**: 완료율·구성비·로딩 상태를 원형으로. 세그먼트형은 카테고리 3~4개 구성비 비교.
**피할 때**: 값 5개 이상이면 도넛 구분이 안 보임 — 바 형태로 전환.

intensity: 40-70
pairs: `counting-dynamic-scale`, `progress-bar-linear-segmented`

## progress-bar-linear-segmented — 스텝 프로그레스 바 (단계형)

노드들을 잇는 라인의 Trim Path를 노드 도달 시점마다 다음 구간으로 이어 그리는 온보딩/체크리스트 AE 관용구.

**구현** — SVG 실측 불필요. scaleX 트윈만 이어 붙인다(폭/높이 트윈 금지 원칙).

```css
.step-fill { transform-origin: left center; transform: scaleX(0); }
```

```js
tl.to('#node-1', { scale: 1, duration: 0.25, ease: 'back.out(1.6)' }, 0.2)
  .to('#seg-1-2', { scaleX: 1, duration: 0.35, ease: 'power2.out' }, 0.35)
  .to('#node-2', { scale: 1, duration: 0.25, ease: 'back.out(1.6)' }, 0.65)
  .to('#seg-2-3', { scaleX: 1, duration: 0.35, ease: 'power2.out' }, 0.8);
```

**선택지**

| 파라미터 | 옵션 |
| --- | --- |
| 노드 팝 이징 | `back.out`(탄력) / `power2.out`(차분) |
| 구간 수 | 3 ~ 5 |
| 완료 노드 색 | `--rf-success` |

**쓸 때**: 3~5단계 프로세스·온보딩·체크리스트의 순차 진행.
**피할 때**: 단계 2개뿐이거나 단일 퍼센트만 필요하면 과설계 — ring/bar로 충분.

intensity: 40-70
pairs: `line-connector-draw`, `progress-ring-radial`

## shape-wipe-clip-path — 도형 와이프 (아이리스/방향성)

AE 셰이프 마스크(원/다각형)를 확장·이동시켜 콘텐츠를 드러내는 아이리스/대각선 와이프의 원리.

**구현** — clip-path로 콘텐츠 자체의 경계를 애니메이트. transitions의 블록 와이프(불투명 div 커버)와 다른 계열.

```css
.iris-mask { clip-path: circle(0% at 50% 50%); }
```

```js
tl.to('.iris-mask', { clipPath: 'circle(75% at 50% 50%)',   // 75% = 대각선 절반 초과, 풀커버 보장
  duration: 0.6, ease: 'power2.inOut' }, 0.4);

// 대각선 와이프: 4점 polygon, 점 개수 고정 — 좌표만 이동
tl.fromTo('.diag-mask',
  { clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' },
  { clipPath: 'polygon(100% 0%, 100% 0%, 0% 100%, 0% 100%)',
    duration: 0.55, ease: 'power3.inOut' }, 0.4);
```

계약 리스크: polygon 시작/끝의 점 개수가 다르면 브라우저가 보간을 포기하고 순간 전환된다 — 점 개수를 반드시 고정하고 좌표만 바꿀 것. circle()/ellipse()도 반지름·중심만 이동.

**선택지**

| 파라미터 | 옵션 |
| --- | --- |
| 형태 | circle / ellipse / polygon |
| 방향 | 중심확장 / 좌→우 / 대각선 |
| 엣지 | 하드(선명) / soft(약한 blur 오버레이) |

**쓸 때**: 한 씬 안에서 이미지·카드·차트가 드러나는 리빌. 원형 스포트라이트 등장.
**피할 때**: 풀스크린 씬 전환 — 그건 transitions `css-cover.md`의 블록 와이프가 더 명확.

intensity: 40-70
pairs: `svg-stroke-draw-on`, `path-morph-consistent-topology`

## path-morph-consistent-topology — 패스 모프 (동형 토폴로지 보간)

AE Path 키프레임 보간과 동일한 원리 — 정점 수·핸들 구조가 다르면 뒤틀리므로 실무에선 정점 수를 수동으로 맞춘다.

**구현** — vendor에 MorphSVGPlugin 없음(core만 포함) → 임의 정점 모프는 계약상 불가. 대신 core 내장 AttrPlugin의 복합 문자열 보간을 쓴다: 두 `d`의 커맨드 문자·숫자 개수·순서가 동일하면 숫자만 트윈된다.

```js
// 두 path는 반드시 동일한 command 시퀀스 (M L L L L Z 등)로 저작
const D_A = 'M20,50 L50,20 L80,50 L50,80 Z'; // 다이아몬드
const D_B = 'M20,50 L50,10 L90,50 L50,90 Z'; // 살짝 더 뾰족한 다이아몬드

tl.to('#morph-shape', { attr: { d: D_B }, duration: 0.8, ease: 'power2.inOut' }, 0.5);
```

계약 리스크: 정점 수 불일치 시 런타임 에러 없이 "조용히 이상하게" 보간된다 — 저작 시 두 `d`의 커맨드 시퀀스를 눈으로 대조 검증할 것. 값 트윈이라 seek-safe는 보장.

**선택지**

| 파라미터 | 옵션 |
| --- | --- |
| 정점 수 | 3 ~ 8 (적을수록 안전) |
| 이징 | `power2.inOut`(자연스러운 변형) |
| 경유 shape | 없음 / 중간 1개(3단 모프) |

**쓸 때**: 유사 실루엣(사각↔사각, 원↔둥근사각) 사이 전환, 로고 마크의 미세 변형.
**피할 때**: 완전히 다른 형태(별↔원) — 크로스페이드+스케일로 대체.

intensity: 40-70
pairs: `shape-wipe-clip-path`

## line-connector-draw — 라인 커넥터 (데이터 연결선)

노드 사이 패스를 Trim Path로 draw한 뒤 Offset을 무한 루프시켜 "흐르는 점선"을 만드는 네트워크 다이어그램 표준.

**구현** — draw-on 자체는 svg-stroke-draw-on에 위임, 여기는 draw 이후의 리빙 모션. 계약상 GSAP `repeat:-1` 금지 — 무한 루프는 CSS `infinite`만 허용. 주의: draw용 인라인 dasharray가 클래스의 `6 10`을 specificity로 누르므로, 흐름 전환 시 인라인 dasharray를 재set해야 한다.

```js
root.querySelectorAll('#connector').forEach((c) => {
  const len = c.getTotalLength();
  gsap.set(c, { strokeDasharray: len, strokeDashoffset: len });
  tl.to(c, { strokeDashoffset: 0, duration: 0.5 }, 0.3)
    // 인라인 dasharray를 흐름값으로 재지정 + 오프셋 인라인 제거 → CSS가 dashoffset 구동
    .set(c, { strokeDasharray: '6 10', clearProps: 'strokeDashoffset' }, 0.8)
    .set(c, { className: '+=is-flowing' }, 0.8);
});
```

```css
.connector.is-flowing {
  animation: dash-flow 1.4s linear infinite;
  animation-delay: calc(var(--rf-scene-start, 0s) + 1s);
}
@keyframes dash-flow { to { stroke-dashoffset: -16; } } /* -16 = 6+10 한 주기 */
```

**선택지**

| 파라미터 | 옵션 |
| --- | --- |
| 점선 주기 | 짧음(급함) ~ 김(차분) |
| 흐름 방향 | 순방향 / 역방향 |
| 흐름 | 리빙(무한 순환) / 정적(draw까지만) |

**쓸 때**: 허브-스포크·아키텍처 다이어그램, "데이터가 흐른다"는 개념 표현.
**피할 때**: 정적 관계도 — draw까지만 하고 무한루프는 끌 것, 불필요한 움직임은 시선 분산.

intensity: 0-40
pairs: `svg-stroke-draw-on`, `path-follow-marker`

## path-follow-marker — 패스 팔로우 마커 (경로 추종 오브젝트)

AE Motion Path에 레이어를 어태치해 따라가게 하는 기법 — 지도 이동 경로, 차트 선행 점.

**구현** — MotionPathPlugin 없음 → `path.getPointAtLength()`를 onUpdate에서 직접 샘플링. onUpdate는 타임라인 내부라 seek마다 재실행되어 결정적(getPointAtLength는 O(1) 순수함수).

```js
root.querySelectorAll('#route').forEach((path) => {
  const total = path.getTotalLength();
  const dot = root.querySelector('#lead-dot');
  const state = { p: 0 };
  tl.to(state, { p: 1, duration: 1.2, ease: 'power1.inOut', onUpdate: () => {
    if (typeof path.getPointAtLength !== 'function') return;  // 스텁 안전 가드
    const pt = path.getPointAtLength(state.p * total);
    dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
  } }, 0.3);
});
```

**선택지**

| 파라미터 | 옵션 |
| --- | --- |
| 동반 요소 | 점만 / 점+트레일(잔상) |
| 이징 | `power1.inOut`(자연 이동) / `none`(등속) |

**쓸 때**: 지도 경로 이동, 차트 라인 끝의 선행 값 마커, 곡선 경로를 따라가는 아이콘.
**피할 때**: 직선 이동 — 그냥 x/y 트윈으로 충분, getPointAtLength는 곡선 전용.

intensity: 40-70
pairs: `animated-line-chart-trace`, `line-connector-draw`

## animated-line-chart-trace — 라인 차트 드로우 + 선행 마커

꺾은선이 좌→우로 그려지며 끝점에 값 라벨이 따라붙는 AE 인포그래픽 관용구 — Trim Path draw + 카운트업 조합.

**구현** — svg-stroke-draw-on(선) + path-follow-marker(끝점)를 결합. area는 폭/높이 트윈 금지 원칙에 따라 clip-path inset만으로 채운다. 값 라벨은 counting-dynamic-scale과 동일 타이밍.

```js
root.querySelectorAll('#line-path').forEach((linePath) => {
  const len = linePath.getTotalLength();
  gsap.set(linePath, { strokeDasharray: len, strokeDashoffset: len });
  tl.to(linePath, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.out' }, 0.3)
    .to('#area-fill', { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'power2.out' }, 0.3);
  // leading dot은 path-follow-marker의 가드 패턴(getPointAtLength typeof 체크) 그대로 onUpdate로
});
```

**선택지**

| 파라미터 | 옵션 |
| --- | --- |
| area fill | 유 / 무 |
| 선행 마커 | 점만 / 점+값 라벨 |
| 그리드/축 | 동시 페이드인 / 사전 배치 |

**쓸 때**: 매출 추이·성장 그래프를 데이터가 실시간으로 그려지는 느낌으로.
**피할 때**: 값이 하나뿐이거나 비교가 목적(막대가 더 명확) — 라인 트레이스는 "추세" 전용.

intensity: 40-70
pairs: `path-follow-marker`, `counting-dynamic-scale`

## divider-rule-expand — 디바이더 라인 확장 (구분선)

얇은 셰이프 라인의 Trim Path를 중앙 발산 또는 좌→우로 그려 섹션 전환의 "숨표"를 만드는 AE 관용구.

**구현** — underline-emphasis-sweep(텍스트 종속)과 달리 독립 요소. scaleX만 사용(폭 트윈 금지), transform-origin으로 발산 방향 제어.

```css
.rule { width: 100%; height: 2px; background: var(--rf-hairline);
  transform: scaleX(0); transform-origin: center; }  /* left로 바꾸면 좌→우 */
```

```js
tl.to('.rule', { scaleX: 1, duration: 0.5, ease: 'power3.out' }, 0.2);
```

**선택지**

| 파라미터 | 옵션 |
| --- | --- |
| 발산 방향 | 중앙 / 좌→우 / 우→좌 |
| 두께 | 1 ~ 3px |
| 액센트 dot | 동반 / 없음 |

**쓸 때**: 챕터/섹션 전환 타이틀 주변, 통계 그룹 사이 구분, 미니멀 브랜드 톤 카드 헤더.
**피할 때**: 카드 경계·그리드 라인이 이미 구획을 나누고 있으면 중복 장식.

intensity: 0-40
pairs: `underline-emphasis-sweep`

## checkmark-success-tick — 체크마크 성공 틱

V자 2세그먼트 패스를 짧은 획→긴 획 순서로 Trim Path draw하고 마지막에 back-out으로 튕기는 UX 확정 연출의 AE 표준 타이밍.

**구현** — svg-stroke-draw-on의 특화 케이스. 두 세그먼트 길이비(짧은 획 40% : 긴 획 60%)에 duration을 맞추고, 마지막 프레임에서만 예외적으로 back.out 허용("완료 확정" 스냅으로 의도된 것 — 결정적 이징이라 seek-safe 무해).

```js
root.querySelectorAll('#check-path').forEach((check) => {
  const len = check.getTotalLength();
  gsap.set(check, { strokeDasharray: len, strokeDashoffset: len });
  tl.to(check, { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out' }, 0.2)
    .to('#check-circle-bg', { scale: 1.06, duration: 0.15, ease: 'back.out(2)' }, 0.6)
    .to('#check-circle-bg', { scale: 1, duration: 0.2, ease: 'power2.inOut' }, 0.75);
});
```

**선택지**

| 파라미터 | 옵션 |
| --- | --- |
| 배경 원 pop | 유 / 무 |
| 색 | `--rf-success` 고정 |
| SFX 큐 | 마킹만 (오디오 재생은 별도 계약) |

**쓸 때**: 폼 제출 완료, 결제 성공, 업로드 완료 등 단발성 확정 피드백.
**피할 때**: 반복 리스트 항목 각각에 체크 애니메이션 — 체크는 "단 하나의 확정 모먼트"에만.

intensity: 40-70
pairs: `trace-then-fill`

## Sources

- hyperframes-animation `rules/svg-path-draw.md` — 스트로크 드로우온 정본 구현 (dasharray/dashoffset, Draw then fill 변형)
- hyperframes-animation `rules/css-marker-patterns.md` — 스크리블 밑줄/서클 정본 구현
- hyperframes-animation `rules/stat-bars-and-fills.md` — Progress Fill (Ring form) 정본 구현
- transitions `css-cover.md` — 블록/블라인드 와이프 (clip-path 와이프와 계열 구분)
- `vendor/gsap/3.14.2/gsap.min.js` 실측 — core-only 구성(플러그인 0개), CSSPlugin·AttrPlugin·renderComplexString·getBBox 내장 확인
- `render-lint.mjs` RF-FRAGMENT 규칙 — 001 vm 동기 스모크(getTotalLength 가드 필요), 003 비결정 API 금지, 004 `timeline({paused:true})` 강제
- `blocks/line/block.html` — querySelectorAll 데이터가드 관용구 선례
