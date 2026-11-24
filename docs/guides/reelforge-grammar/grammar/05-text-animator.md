# 05 — AE 텍스트 애니메이터식 글자 연출

> 이 문서의 코드 스케치는 렌더 대상이 아니다 — 검증 실물은 references/gallery/fragments/, 이 파일은 통째 로딩 금지(배정 기법 섹션만 부분 로딩).

After Effects 텍스트 애니메이터(Range Selector + 프로퍼티 축)를 GSAP 코어만으로 근사하는 레퍼런스.
씬 스크립트를 쓰기 전에 반드시 아래 공통 계약을 지켜라.

## Contents

- [공통 계약](#공통-계약)
- [range-selector-stagger-map — 레인지 셀렉터 → 스태거 매핑표](#range-selector-stagger-map--레인지-셀렉터--스태거-매핑표)
- [char-word-line-split-strategy — 글자/단어/행 분해 전략](#char-word-line-split-strategy--글자단어행-분해-전략)
- [tracking-kerning-tween — 트래킹(자간) 애니](#tracking-kerning-tween--트래킹자간-애니)
- [offset-cascade-wave — 오프셋 캐스케이드 웨이브](#offset-cascade-wave--오프셋-캐스케이드-웨이브)
- [flipboard-3d-rotateX — 3D 글자 회전 플립보드 (경량판)](#flipboard-3d-rotatex--3d-글자-회전-플립보드-경량판)
- [blur-dissolve-in — 블러 디졸브 인](#blur-dissolve-in--블러-디졸브-인)
- [scale-jump-stairstep — 스케일 점프 계단](#scale-jump-stairstep--스케일-점프-계단)
- [typewriter-vs-fade-sequence — 타이프라이터 vs 페이드 시퀀스 선택](#typewriter-vs-fade-sequence--타이프라이터-vs-페이드-시퀀스-선택)
- [netflix-title-converge — 넷플릭스식 글자 수렴 타이틀](#netflix-title-converge--넷플릭스식-글자-수렴-타이틀)
- [mask-line-slide-reveal — 애플식 마스크 라인 슬라이드 리빌](#mask-line-slide-reveal--애플식-마스크-라인-슬라이드-리빌)
- [word-swap-crossfade — 워드 스왑 크로스페이드](#word-swap-crossfade--워드-스왑-크로스페이드)
- [selective-emphasis-pop — 선택적 강조 팝 (단일 타겟)](#selective-emphasis-pop--선택적-강조-팝-단일-타겟)
- [Sources](#sources)

## 공통 계약

- **벤더 실측**: `vendor/gsap/3.14.2/`엔 코어 단일 파일(gsap.min.js)뿐이다. SplitText·CustomEase 등
  플러그인은 **존재하지 않는다** — 글자 분해는 span 수동 분해([split 전략](#char-word-line-split-strategy)),
  커스텀 이즈는 함수형 `ease: (p) => ...`(코어 지원)로만 해결하라.
- **타임라인**: `gsap.timeline({ paused: true })` 필수(RF-FRAGMENT-004),
  `window.__timelines[compositionId]` 등록 키는 `data-composition-id`와 일치(RF-FRAGMENT-010), 등록 후 `tl.seek(0)`.
- **seek-safe**: 모든 상태는 타임라인 등록 tween이거나 progress 순수함수 드라이버(onUpdate)여야 한다.
  transition·rAF·타임라인 밖 상태변이 금지. `Math.random`/`Date.now`/`performance.now`는 문자열로도 금지(RF-FRAGMENT-003).
- **스모크 샌드박스**: 인라인 스크립트는 동기 스모크 실행된다(RF-FRAGMENT-001). document stub에
  `createTextNode`가 **없다** — 텍스트 노드는 `el.append(' ')`로만 삽입하라.
- **등장 예산**: 훅/타이틀 등장 완료 0.4s. 아래 스케치의 duration은 예산 내로 트림된 값이다.
- 아래 스케치의 `tl`은 위 계약대로 만든 paused 타임라인을 전제하고, 기법별 코드만 보인다.

## range-selector-stagger-map — 레인지 셀렉터 → 스태거 매핑표

AE Range Selector의 Offset 스윕(선택 구간이 텍스트를 쓸고 지나감)을 stagger 오브젝트로 근사한다.
매핑: `stagger.each` = Offset 진행 속도, `stagger.from` = 선택 기준점, `stagger.amount` = 전체 훑는 총 시간,
Shape(Ramp Up/Down)는 stagger 자체의 `ease`로 근사.

**구현**

```js
const chars = gsap.utils.toArray('#headline .ch'); // split 기법으로 .ch가 먼저 존재해야 함
const tl = gsap.timeline({ paused: true });
tl.fromTo(chars,
  { yPercent: 60, opacity: 0 },
  {
    yPercent: 0, opacity: 1,
    duration: 0.38, // 등장 예산 0.4s 이내로 트림 (0.5는 예산 초과)
    ease: 'power3.out',
    stagger: { each: 0.028, from: 'start', ease: 'power1.in' } // Offset 진행 근사
  }, 0.1);
window.__timelines['headline-scene'] = tl;
tl.seek(0);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| from | start / end / center / edges |
| each | 0.02~0.06s |
| stagger ease | power1.in(느리게 시작) / power3.out(빠르게 시작) |

**쓸 때**: 타이틀/헤드라인이 순차적으로 쓸고 지나가듯 등장해야 할 때 — 문자 단위 등장 연출의 기본기.
**피할 때**: 글자 수 많은 본문/자막 — tween 폭증으로 성능·가독성 저하, word 단위로 올려라.
intensity: 40-70 / pairs: char-word-line-split-strategy, offset-cascade-wave

## char-word-line-split-strategy — 글자/단어/행 분해 전략

AE Range Selector Advanced > Based on: Characters/Words/Lines 대응. 단위가 클수록(행>단어>글자) 차분,
작을수록 화려하고 파편화된다. 모든 텍스트-애니메이터 연출의 전제조건.

**구현** (SplitText 벤더 부재 확정 — span 수동 분해가 유일 정답)

```js
function splitToChars(el) {
  const words = el.textContent.split(' ');
  el.textContent = '';
  words.forEach((w, wi) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'word';
    wordSpan.style.whiteSpace = 'nowrap'; // 어절 중간 줄바꿈 방지
    [...w].forEach(ch => {
      const c = document.createElement('span');
      c.className = 'ch'; c.textContent = ch;
      c.style.display = 'inline-block'; // transform 적용 가능하게
      wordSpan.appendChild(c);
    });
    el.appendChild(wordSpan);
    // createTextNode는 lint 스모크 document stub에 없어 throw → append(' ')로 대체
    if (wi < words.length - 1) el.append(' ');
  });
}
splitToChars(document.getElementById('headline'));
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 분해 단위 | char / word / line |
| line 마스크 | overflow:hidden 래퍼 사용 여부(마스크 리빌 대비) |

**쓸 때**: 다른 기법 적용 전 분해 단위부터 결정 — 전 기법 공통 전제.
**피할 때**: 반응형 긴 본문의 line 자동 분해 — 줄바꿈이 폰트/뷰포트 의존이라 예측 불가, word까지만 분해하고 line은 CSS 흐름에 맡겨라.
intensity: 0-40

## tracking-kerning-tween — 트래킹(자간) 애니

AE Animator의 Tracking Amount를 Range Selector와 결합 — 넓은 자간이 좁혀지며 자리잡는 로고/타이틀 연출.

**구현**

```js
// A) 균일 자간 — 벌어진 상태에서 좁혀지며 착지 (fromTo라 computed 의존 없음)
tl.fromTo('#wordmark', { letterSpacing: '0.4em', opacity: 0 },
  { letterSpacing: '0.02em', opacity: 1, duration: 0.4, ease: 'power3.out' }, 0);
  // 0.7s 원안은 등장 예산 초과 → 0.4s로 트림. 여유 씬이면 0.6~0.7s까지 허용

// B) 글자별 개별 트래킹 — transform 기반, GPU 합성·리플로우 없음
gsap.utils.toArray('#wordmark .ch').forEach((c, i) => {
  tl.fromTo(c, { x: (i - 3) * 18 }, { x: 0, duration: 0.4, ease: 'power3.out' }, 0.05 * i);
});
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 시작 자간 | 0.2em~0.6em |
| 방식 | A 균일(letterSpacing) / B 글자별(x transform) |
| ease | power3.out(단정) / expo.out(드라마틱) |

**쓸 때**: 로고/워드마크 리빌, 프리미엄 타이틀 착지(애플식 자간 좁힘).
**피할 때**: 자주 갱신되는 본문/자막 — letterSpacing 리플로우가 매 프레임 발생, 이땐 B 버전을 써라.
intensity: 40-70

## offset-cascade-wave — 오프셋 캐스케이드 웨이브

Range Selector Offset을 -100%→200%로 통과시켜 좁은 선택 구간이 텍스트를 가로지르며
걸린 글자만 튀어오르는 웨이브. 이산 stagger가 아닌 연속 파동이 필요할 때.

**구현** (드라이버+onUpdate 공인 패턴 — wave.p가 progress 순수함수라 seek-safe)

```js
const chars = gsap.utils.toArray('#line .ch');
const wave = { p: 0 };
tl.to(wave, {
  p: 1, duration: 1.2, ease: 'none',
  onUpdate: () => {
    chars.forEach((c, i) => {
      const center = wave.p * (chars.length + 6) - 3; // ±3 여유로 화면 밖에서 진입·이탈
      const d = Math.max(0, 1 - Math.abs(i - center) / 3); // band width 3글자
      c.style.transform = `translateY(${-d * 8}px)`; // rest=0px: 웨이브가 지나간 뒤 정지 상태로 수렴
      c.style.color = d > 0.5 ? 'var(--rf-accent)' : 'var(--rf-text)'; // 이산 대입(보간 아님) — 안전
    });
  }
}, 0);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 폭(band width) | 2~4글자 |
| duration | 0.8~1.6s |
| 이동 방향 | 좌→우(기본) / 우→좌(center 식 반전) |

**쓸 때**: 타이틀 위를 훑는 강조 스윕 — 색보다 형태 변화가 주효과일 때.
**피할 때**: 짧은 단일 단어 — 웨이브가 지나갈 공간이 없어 효과가 안 보인다.
intensity: 40-70 / pairs: css-marker-patterns(카라오케 스윕), asr-keyword-glow

## flipboard-3d-rotateX — 3D 글자 회전 플립보드 (경량판)

AE 3D 텍스트 X축 회전 애니메이터를 글자 단위로 순차 90°→0° 회전시키는 스플릿-플랩 보드.
강한 버전(랜덤 글리프+글리치)에서 디코드 단계를 뺀 클린 저강도판 — 새로 발명한 것 아님.
강한 버전 → hyperframes-animation hacker-flip-3d.md 참조.

**구현** (랜덤 글리프 없음 → Math.random 미사용, RF-FRAGMENT-003 무관)

```js
/* CSS: .wrap{perspective:1200px} .ch{display:inline-block;transform-origin:bottom;backface-visibility:hidden} */
gsap.utils.toArray('#title .ch').forEach((c, i) => {
  tl.fromTo(c, { rotateX: 90, opacity: 0 },
    { rotateX: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, i * 0.045);
});
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| hinge(transform-origin) | bottom(플랩) / top(낙하) / center(바럴롤) |
| CHAR_STAGGER | 0.03~0.06s |
| FLIP_DURATION | 0.35~0.6s(훅 씬은 0.4s 이내) |

**쓸 때**: 클린한 기업/제품 타이틀 착지 — 플립 느낌은 필요하나 해킹/디코드 무드는 원치 않을 때.
**피할 때**: 같은 씬에 hacker-flip-3d를 이미 쓴 경우 — 3D 플립 중복은 과함.
intensity: 40-70 / pairs: hacker-flip-3d

## blur-dissolve-in — 블러 디졸브 인

AE 텍스트 애니메이터의 Blur 축 + Range Selector — 흐릿한 글자가 선명해지며 등장,
Position/Opacity 결합 시 안개에서 걸어나오는 느낌.

**구현** (filter:blur+opacity는 CSSPlugin 보간 지원, seek-safe)

```js
gsap.utils.toArray('#headline .word').forEach((w, i) => {
  tl.fromTo(w,
    { filter: 'blur(14px)', opacity: 0, y: 8 },
    { filter: 'blur(0px)', opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
    i * 0.09);
});
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 시작 블러 | 8px~20px |
| 단위 | char(화려, 동시 15개 이하) / word(표준, 동시 5개 이내) |

**쓸 때**: 잔잔한 인트로, 내레이션 없는 헤드라인의 부드러운 진입, 몽환적 무드.
**피할 때**: 저해상도/다수 요소 동시 블러 — GPU 비용으로 프레임 드랍 위험, 동시 블러 word 수를 5개 이내로.
intensity: 0-40

## scale-jump-stairstep — 스케일 점프 계단

AE Scale 애니메이터 + Offset 웨이브 — 글자가 순서대로 크게 튀었다가 착지하는 계단식 바운스.
하우스 스프링 독트린 준수: 기본 ζ=1 무오버슛, ζ 0.6~0.7은 **명시적 playful 등록 전용**.

**구현** (함수형 ease는 코어 지원 — CustomEase 불필요, progress 순수함수라 seek-safe)

```js
function springEase({response=0.25, dampingFraction=0.65}={}) {
  // response 0.25 → duration 0.4s: 등장 예산 준수 (0.35는 0.56s로 초과)
  const w=(2*Math.PI)/response, z=dampingFraction;
  const wd=w*Math.sqrt(1-z*z);
  const pos=(t)=>1-Math.exp(-z*w*t)*(Math.cos(wd*t)+((z*w)/wd)*Math.sin(wd*t));
  return { duration: response*1.6, ease: (p)=>pos(p*response*1.6) };
}
const settle = springEase();
gsap.utils.toArray('#stat .ch').forEach((c, i) => {
  tl.fromTo(c, { scale: 0, opacity: 0 },
    { scale: 1, opacity: 1, duration: settle.duration, ease: settle.ease },
    i * 0.05);
});
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| dampingFraction | 1(무오버슛, 기본) / 0.65(명시적 playful 전용) |
| stagger | 0.04~0.08s |

**쓸 때**: 숫자 카운트업 라벨, 짧고 경쾌한 브랜드 워드 — playful 톤이 명시된 씬만.
**피할 때**: 진지/엔터프라이즈 톤 — 오버슛은 명백한 playful register, dampingFraction:1로 낮춰 써라.
intensity: 70-100

## typewriter-vs-fade-sequence — 타이프라이터 vs 페이드 시퀀스 선택

AE 자막형 텍스트의 두 갈래: Source Text 키프레임식 디스크리트 타이핑(기계적/터미널) vs
Range Selector Opacity식 단어 순차 페이드(내레이션 동기). 구현은 기존 스킬이 소유 — 여기선 선택 기준만.

- 코드/터미널/시스템 UI 무드, 내레이션 없음 → 타이프라이터 → hyperframes-animation discrete-text-sequence.md 참조
- 감성 카피/내레이션 동반 → 워드 페이드 → hyperframes-animation dynamic-content-sequencing.md 참조

**구현** (오서링 분기는 빌더에서 처리 — mood 같은 미정의 변수를 씬에 방출하면 RF-FRAGMENT-001 위반.
씬엔 선택된 실체만 방출한다. 아래는 방출 가능한 타이프라이터 실체.)

```js
const full = el.dataset.text; const st = { n: 0 };
const tl = gsap.timeline({ paused: true });
tl.to(st, { n: full.length, duration: 1.0, ease: 'none',
  onUpdate: () => { el.textContent = full.slice(0, Math.round(st.n)); } }, 0);
window.__timelines['type-scene'] = tl; tl.seek(0); // st.n은 progress 순수함수 → seek-safe
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 갈래 | typewriter(기계적) / word-fade(내레이션 동기) |
| typewriter 밀도 | 0.06~0.12s/글자 |

**쓸 때**: 씬 초반 톤 결정 단계 — 어느 갈래로 갈지 먼저 정하라.
**피할 때**: 한 씬 안에서 두 갈래 혼용(한 줄 타이핑+다음 줄 페이드) — 톤 분열, 씬당 한 갈래만.
intensity: 0-40 / pairs: discrete-text-sequence, dynamic-content-sequencing, kinetic-beat-slam

## netflix-title-converge — 넷플릭스식 글자 수렴 타이틀

글자마다 다른 시작 Position/Rotation을 주고 Offset으로 최종 커닝 위치에 동시 수렴 —
조각들이 모여 완성되는 무드. 3D 심화판 → hyperframes-animation depth-scatter-assemble.md 참조.

**구현** (Math.random 금지 계약 → 137.5° 황금각 인덱스 해시로 결정적 산포. 137.5는 연속 인덱스의 각도 중복을 피하는 황금각)

```js
function scatterFor(i) { // 결정적 산포 — 시드 없는 순수 함수
  const a = (i * 137.5) % 360;
  return { x: Math.cos(a*Math.PI/180)*90, y: Math.sin(a*Math.PI/180)*60, rot: (i%2?1:-1)*25 };
}
gsap.utils.toArray('#title .ch').forEach((c, i) => {
  const s = scatterFor(i);
  tl.fromTo(c,
    { x: s.x, y: s.y, rotate: s.rot, opacity: 0, filter: 'blur(6px)' },
    { x: 0, y: 0, rotate: 0, opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' },
    0.02 * i); // 훅 씬은 duration 0.4s·산포 반경 축소로 예산 맞춰 트림
});
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 산포 반경 | 40~120px(훅 씬은 작게) |
| 블러 포함 | on / off(글자 수 많으면 off — 동시 블러는 렌더 비용↑) |
| stagger | 0.02~0.05s/글자 |

**쓸 때**: 브랜드 오프닝/엔딩 로고 타이틀, 조각이 모여 완성되는 클라이맥스 착지.
**피할 때**: 빠른 훅이 필요한 짧은 쇼츠 — 산포 반경이 크면 등장 0.4s 제약과 충돌, 반경을 줄여 대응.
intensity: 70-100 / pairs: depth-scatter-assemble, 3d-text-depth-layers

## mask-line-slide-reveal — 애플식 마스크 라인 슬라이드 리빌

AE 트랙 매트(직사각형)를 얹고 Position 슬라이드 — 가려진 줄이 위로 올라오며 드러나는
애플 키노트 시그니처 무브. 마스크는 고정, 내용만 창을 통과한다.

**구현** (transform tween — seek-safe. .line-mask는 클래스 스타일이라 RF-FRAGMENT-012 무관)

```js
/* CSS: .line-mask{overflow:hidden} */
gsap.utils.toArray('.line-mask .line-inner').forEach((line, i) => {
  tl.fromTo(line, { yPercent: 110 }, // 110: 100%+여유로 디센더까지 완전히 가림
    { yPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.08);
    // 훅 씬은 0.4s로 트림
});
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 단위 | line(표준) / word(더 화려) |
| ease | power4.out(단정) / expo.out(급브레이크) |

**쓸 때**: 프리미엄 제품/키노트 톤 타이틀, 여러 줄 카피가 차례로 밀려 올라오는 정제된 리빌.
**피할 때**: 캐주얼/코믹 톤(과하게 정제됨), 줄바꿈 예측이 어려운 반응형 본문.
intensity: 0-40

## word-swap-crossfade — 워드 스왑 크로스페이드

AE Source Text 키프레임 + Blur/Opacity 결합 — 한 단어가 흐려지며 사라지고 다음 단어가
선명해지며 나타난다('faster.'→'smarter.'→'stronger.'). 위치 고정, 겹침 구간에서 부드럽게 모프.
하드컷 버전 → hyperframes-animation discrete-text-sequence.md 참조 — 이 문서는 소프트 버전만 다룬다.

**구현** (전부 타임라인 등록 tween — seek-safe. i=0은 opacity 1→1 유지로 초기상태 결정적)

```js
const words = gsap.utils.toArray('#swap .w'); // 절대위치로 겹쳐진 단어들
words.forEach((w, i) => {
  if (i > 0) tl.to(words[i-1], { opacity: 0, filter: 'blur(10px)', duration: 0.35 }, i * 0.9);
  tl.fromTo(w, { opacity: i===0?1:0, filter: 'blur(10px)' },
    { opacity: 1, filter: 'blur(0px)', duration: 0.4 }, i * 0.9 + (i>0?0.05:0));
});
// 단어당 ~0.9s → 씬 2~4.5s 안에서 3~4단어로 제한하라
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 홀드 시간(단어당) | 0.6~1.2s |
| 크로스 블러 | 8~14px |

**쓸 때**: 슬로건 나열(형용사 연쇄), 부드러운 톤의 반복 강조 카피.
**피할 때**: 훅처럼 강한 임팩트가 필요한 자리 — 하드컷이 더 강하다, discrete-text-sequence를 써라.
intensity: 40-70 / pairs: discrete-text-sequence(대조: 하드컷 버전)

## selective-emphasis-pop — 선택적 강조 팝 (단일 타겟)

Range Selector를 특정 인덱스 하나로 좁혀 문장 중 키워드 하나에만 Scale/Color를 건다 —
문장은 정적, 키워드만 튀어나온다. ASR 타임스탬프 동기 버전 → hyperframes-animation asr-keyword-glow.md 참조
(이 기법은 정적 타임라인 상 고정 위치 강조라는 점에서 구분).

**구현** (주의: `var(--rf-accent)`를 GSAP color **보간**으로 tween하면 CSSPlugin 컬러 파서가
var()를 rgb로 해석 못해 깨진다 — 색은 이산 tl.set 토글, scale만 tween하라.)

```js
const POP = 1.0; // 강조 시각(초) — 내레이션 키워드 타이밍에 맞춤
tl.set('#sentence .kw', { color: 'var(--rf-accent)' }, POP);        // 이산 토글(보간 아님)
tl.set('#sentence .kw', { color: 'var(--rf-text)' }, POP + 0.6);
tl.fromTo('#sentence .kw', { scale: 1 },
  { scale: 1.15, duration: 0.3, ease: 'back.out(1.4)', yoyo: true, repeat: 1 }, POP);
// yoyo+repeat은 seek 시 반복 이터레이션이 정확 계산됨 — seek-safe
// 부드러운 색 페이드가 필요하면: accent색 복제 span을 겹치고 그 opacity만 크로스페이드
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| scale peak | 1.1~1.2 |
| ease | back.out(1.2~1.6) |
| 강조 지속(yoyo repeat) | 1~2회 |

**쓸 때**: 문장 중 핵심 단어 하나를 못 박듯 강조(가격, 숫자, 브랜드명).
**피할 때**: 강조 대상 2개 이상 — 산만해진다, 씬당 강조는 1개 원칙.
intensity: 40-70 / pairs: asr-keyword-glow(ASR 동기 버전)

## Sources

- After Effects 텍스트 애니메이터 모델: Range Selector(Start/End/Offset/Shape),
  Advanced > Based on(Characters/Words/Lines), Animator 프로퍼티 축(Position/Opacity/Scale/Tracking/Blur), Source Text 키프레임.
- vendor 실측: `vendor/gsap/3.14.2/` = gsap.min.js(72,779 bytes, 코어 단일 파일) + NOTICE.md.
  플러그인 전무 — SplitText/CustomEase/Flip/MotionPath/ScrambleText 없음.
  코어 번들: Power0~4/Back/Elastic/Bounce/Circ/Expo/Sine/Steps 이징, timeline/set/to/from/fromTo,
  stagger 오브젝트(each/from/amount/ease/grid), utils.toArray, 함수형 ease.
- lint 실체: `src/compiler/render-lint.mjs` RF-FRAGMENT-001~015.
  001 인라인 스크립트 동기 스모크 실행(vm.runInNewContext, document stub에 createTextNode 없음),
  003 Math.random|Date.now|performance.now 소스 스캔 금지, 004 timeline {paused:true} 필수,
  010 window.__timelines 키 = data-composition-id, 012 #root 직접 background 금지, 015 원격 script/link 금지.
- 로컬 기법 레퍼런스(hyperframes-animation 소유): hacker-flip-3d.md, discrete-text-sequence.md,
  dynamic-content-sequencing.md, kinetic-beat-slam.md, asr-keyword-glow.md, depth-scatter-assemble.md.
- 검증 판정 라운드(2026-07-25): 12기법 pass 9·fix 3(drop 0) — fix 반영: split의 append(' ') 대체,
  typewriter 라우팅 스텁 제거·실체 방출, emphasis-pop 색 이산 토글화.
