# 앵커포인트·트랜스폼 안무 (Anchor & Transform Choreography)

> 이 문서의 코드 스케치는 렌더 대상이 아니다 — 검증 실물은 references/gallery/fragments/, 이 파일은 통째 로딩 금지(배정 기법 섹션만 부분 로딩).

AE의 Anchor Point 사고방식을 HyperFrames 계약(단일 paused timeline, seek-safe, GSAP 코어 전용) 위에서 재현하는 12기법 레퍼런스. `transform-origin`을 회전·스케일의 "축"으로 다루는 법이 공통 골격이다.

**vendor 전제**: `/vendor/gsap/3.14.2/`에는 gsap.min.js(코어)만 존재한다. CSSPlugin(코어 번들)이 x/y/rotation/rotateX/rotateY/scale/skewX/skewY/autoAlpha/transformOrigin을 전부 처리하고, 이징은 코어(power0~4, sine, expo, circ, back, elastic, bounce, steps, none)만 사용하라. SplitText·CustomEase·MotionPathPlugin 등 유료/외부 플러그인은 없다 — 호출하면 렌더가 죽는다.

## Contents

1. [anchor-corner-swing — 코너 피벗 스윙](#anchor-corner-swing--코너-피벗-스윙)
2. [door-hinge-open — 도어 힌지 오픈](#door-hinge-open--도어-힌지-오픈)
3. [seesaw-fulcrum-tilt — 시소/티터 밸런스](#seesaw-fulcrum-tilt--시소티터-밸런스)
4. [orbital-revolve — 궤도 회전 (위성 오빗)](#orbital-revolve--궤도-회전-위성-오빗)
5. [axis-isolated-transform-stack — 다축 트랜스폼 분리 래퍼](#axis-isolated-transform-stack--다축-트랜스폼-분리-래퍼)
6. [anchor-itself-animated — 앵커(오리진) 자체의 이동](#anchor-itself-animated--앵커오리진-자체의-이동)
7. [null-parent-rig — 널 오브젝트식 부모 리깅](#null-parent-rig--널-오브젝트식-부모-리깅)
8. [edge-flip-reveal — 엣지 플립 리빌](#edge-flip-reveal--엣지-플립-리빌)
9. [pendulum-decay-swing — 진자 감쇠 스윙](#pendulum-decay-swing--진자-감쇠-스윙)
10. [skew-pivot-peel — 오프셋 축 스큐 필](#skew-pivot-peel--오프셋-축-스큐-필)
11. [anchor-relay-handoff — 앵커 릴레이](#anchor-relay-handoff--앵커-릴레이)
12. [offset-origin-idle-breathe — 오프셋 오리진 브리딩](#offset-origin-idle-breathe--오프셋-오리진-브리딩)

---

## anchor-corner-swing — 코너 피벗 스윙

AE에서 앵커포인트를 네 모서리 중 하나로 옮기고(Pan-Behind, Y) Rotation을 걸면 그 모서리에 고정된 채 스윙한다.

**구현** — `transform-origin`을 코너에 정적 CSS로 고정하고 rotation만 tween하라. origin 자체는 건드리지 않는다(anchor-itself-animated와 구분).

```css
.corner-card{ transform-origin:0% 100%; will-change:transform; }
```
```js
tl.fromTo(".corner-card",
  {rotation:-6},
  {rotation:0,duration:.45,ease:"back.out(1.6)"},
  0.1
);
tl.to(".corner-card",
  {rotation:2,duration:1.6,ease:"sine.inOut",yoyo:true,repeat:1},
  0.6
);
```

두 tween은 같은 rotation 속성이지만 시간 비중첩(0.55 종료 → 0.6 시작) 순차라 덮어쓰기 충돌이 없다. -6° 시작은 프레임0부터 화면에 존재시키기 위한 값(페이드 없음, 등장창 무관).

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 피벗 코너 | 좌상 / 우상 / 좌하 / 우하 |
| 회전각 | 4~10° (10° 초과 시 대각선 왜곡 급증) |
| yoyo 반복 | 있음(잔향) / 없음(단발 안착) |

**쓸 때**: 리스트 아이템이 카드 형태로 통통 튀며 등장할 때, 알림/토스트가 모서리에 걸린 듯 흔들릴 때.
**피할 때**: 텍스트가 많은 카드 — 코너 회전은 대각선 왜곡이 커서 본문 가독성을 해친다.

- intensity: 40-70
- pairs: `axis-isolated-transform-stack`

---

## door-hinge-open — 도어 힌지 오픈

앵커를 레이어의 세로 변에 두고 Y Rotation(3D, perspective 필수)을 애니메이트하면 문이 열리듯 나타난다.

**구현** — 부모에 perspective, 패널에 `transform-origin:left center` + rotateY. split-tilt-cards의 좌우 대칭 쌍과 달리 단일 요소가 한쪽 경첩축으로 열린다. autoAlpha 페이드는 등장창 0.4s 안에 끝내라(검증 fix 반영본).

```css
.hinge-stage{ perspective:1400px; }
.hinge-panel{ transform-origin:0% 50%; transform-style:preserve-3d; will-change:transform; }
```
```js
tl.fromTo(".hinge-panel", {rotateY:-78, autoAlpha:0}, {rotateY:0, autoAlpha:1, duration:.35, ease:"power3.out"}, 0);
// 등장 종료(0.35s) 이후의 후속 흔들림은 등장창을 지연시키지 않음
tl.to(".hinge-panel", {rotateY:-3, duration:.9, ease:"sine.inOut", yoyo:true, repeat:1}, 0.45);
```

perspective 1400px은 9:16 캔버스에서 왜곡이 과하지 않은 중간 심도값.

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 힌지 위치 | 좌 / 우 / 상 / 하 |
| 시작 각도 | -60 ~ -85° (90° 근접은 패널이 실선이 됨) |
| 등장 duration | 0.3~0.4s (계약 등장창 준수) |

**쓸 때**: 패널/모달/메뉴가 옆에서 열리는 느낌, 이전 씬을 가리던 판이 젖혀지며 다음 콘텐츠를 드러낼 때.
**피할 때**: perspective 없이 쓰면 rotateY가 납작해져 좌우 스케일처럼만 보인다 — 부모 perspective 선언은 필수.

- intensity: 40-70
- pairs: `split-tilt-cards` → hyperframes-animation split-tilt-cards.md 참조

---

## seesaw-fulcrum-tilt — 시소/티터 밸런스

앵커를 하단 중앙(받침점)에 두고, 실제 시소처럼 막대와 양쪽 접시를 반대 위상으로 회전시킨다.

**구현** — 가상의 공유 fulcrum 좌표에 각 요소의 `transform-origin`을 맞추고 rotation을 반대 부호로 tween하라. 접시(pan)가 막대와 역회전해 수평을 유지한다 — 세 요소가 서로 다른 노드라 GSAP 충돌이 없다.

```css
.seesaw-bar{ transform-origin:50% 100%; will-change:transform; }
.pan-left,.pan-right{ transform-origin:50% 0%; will-change:transform; }
```
```js
tl.to(".seesaw-bar",{rotation:-8,duration:1.1,ease:"sine.inOut",yoyo:true,repeat:1},0.4);
tl.to(".pan-left",{rotation:8,duration:1.1,ease:"sine.inOut",yoyo:true,repeat:1},0.4);
tl.to(".pan-right",{rotation:-8,duration:1.1,ease:"sine.inOut",yoyo:true,repeat:1},0.4);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 기울기 각 | 5~12° |
| 주기 | 1.6~2.4s |
| 구성 | 막대+양쪽 접시 / 두 요소 단독 대비 |

**쓸 때**: A vs B 트레이드오프, 장단점 비교, "무게추가 기운다"는 은유가 필요할 때.
**피할 때**: 단순 두 옵션 나열(과잉 은유), 이미 split-tilt-cards로 대칭 비교가 충분한 씬.

- intensity: 40-70
- pairs: `split-tilt-cards` → hyperframes-animation split-tilt-cards.md 참조

---

## orbital-revolve — 궤도 회전 (위성 오빗)

위성 레이어를 중심 널에 부모 지정하고 반지름만큼 오프셋한 뒤 널을 0→360° 회전시키면 원 궤도를 돈다. 업라이트 유지에는 카운터-로테이션을 더한다.

**구현** — 이중 래퍼: 궤도 래퍼(회전) > 반경 래퍼(정적 translateX) > 카운터 래퍼(역회전) > 위성. **MotionPathPlugin은 vendor에 없다** — path 기반 API를 절대 호출하지 말고 rotate+translate 합성만 써라. `ease:"none"`이라 각 프레임이 결정적(seek-safe).

```css
.orbit-wrap{ transform-origin:50% 50%; will-change:transform; }
.orbit-radius{ transform:translateX(180px); will-change:transform; }
.orbit-counter{ will-change:transform; }
```
```js
tl.to(".orbit-wrap",{rotation:360,duration:4,ease:"none"},0);
tl.to(".orbit-counter",{rotation:-360,duration:4,ease:"none"},0); // 부모 회전 상쇄 → 위성 정자세 유지
```

180px 반경은 9:16 1080폭 기준 중심 허브와 겹치지 않는 최소 궤도.

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 반경 | px 단위, 허브 크기에 비례 |
| 바퀴 수 | 0.25~1바퀴(부분 호) / 풀 서클 |
| 위성 개수 | 1~N (각자 시작 각도 오프셋) |
| 카운터로테이션 | 있음(업라이트) / 없음(궤도에 매달린 느낌) |

**쓸 때**: 아이콘/데이터포인트가 중심 허브 주위를 도는 생태계·네트워크 시각화, "선택지들이 메인 주위를 맴돈다"는 연출.
**피할 때**: duration이 씬 길이(2~4.5s)보다 길어 궤도를 완주 못하면 어색하게 끊긴다 — 씬 길이에 바퀴 수를 맞춰라.

- intensity: 40-70
- contract_risk: 경로 플러그인 부재 — rotate+translate 합성만 허용.

---

## axis-isolated-transform-stack — 다축 트랜스폼 분리 래퍼

AE는 Position/Scale/Rotation이 레이어당 독립 채널이라 서로 다른 이징을 자유롭게 건다. 웹에서는 축별 DOM 래퍼로 분리해 재현한다.

**구현** — `pos-wrap > rotate-wrap > scale-wrap > content` 중첩, 각 래퍼가 자기 축만 소유한다. 주의: GSAP은 x·rotation·scale을 별도 채널로 추적하므로 한 요소에 세 tween을 동시에 걸어도 충돌하지 않는다 — 래퍼 분리의 실제 가치는 **축마다 다른 transform-origin을 줄 때**다(예: 회전은 코너, 스케일은 중앙).

```html
<div class="pos-wrap"><div class="rotate-wrap"><div class="scale-wrap">
  <div class="content">...</div>
</div></div></div>
```
```js
tl.fromTo(".pos-wrap",{x:-400,y:80},{x:0,y:0,duration:.9,ease:"power3.out"},0);
tl.fromTo(".rotate-wrap",{rotation:-25},{rotation:0,duration:1.3,ease:"power2.out"},0);
tl.fromTo(".scale-wrap",{scale:.4},{scale:1,duration:.6,ease:"back.out(1.7)"},0.15);
```

pos-wrap 0.9s는 위치 안무(opacity 페이드 아님)라 등장창 위반이 아니다. 스냅감이 필요하면 pos-wrap을 0.4s 이하로 압축하고 rotation/scale은 오버슈트 세틀로 남겨라. scale/translate 2단 분리 원칙은 → hyperframes-animation coordinate-target-zoom.md 참조 (이 기법은 그것을 회전까지 3단으로 확장).

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 축별 duration/ease | 각 축 독립 선택 (회전 느리게 / 스케일 빠르게 팝) |
| 래퍼 중첩 순서 | 안쪽일수록 바깥 축의 영향을 받음 |
| 시작 시점 오프셋 | 축별 0~0.2s 지연 |

**쓸 때**: "날아들며 + 회전 감쇠 + 팝 스케일"을 각각 다른 리듬으로 겹치는 진입 — HyperFrames 등장 시퀀스의 기본 골격.
**피할 때**: 단순 페이드/슬라이드 하나면 충분한 미니멀 씬 — 3중 래퍼는 과설계.

- intensity: 40-70
- pairs: `coordinate-target-zoom`, `card-morph-anchor`

---

## anchor-itself-animated — 앵커(오리진) 자체의 이동

AE의 Anchor Point는 그 자체가 키프레임 가능한 채널이다 — 회전/스케일의 "축"이 시간에 따라 옮겨간다.

**구현** — GSAP CSSPlugin(코어 번들, 플러그인 불필요)은 `transformOrigin`을 다중 숫자 문자열로 파싱해 tween한다. 원점을 이동시키며 동시에 scale을 걸어라. paused timeline의 `.to` 시작값은 CSS 베이스라인(상수)에서 lazy 캡처되어 seek 결정성이 유지된다.

```css
.lens{ transform-origin:10% 90%; will-change:transform; }
```
```js
tl.to(".lens",{
  transformOrigin:"90% 10%",
  scale:1.4,
  duration:2.2,
  ease:"sine.inOut"
},0.3);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 시작/끝 origin | 대각 코너 간 이동이 가장 명료 |
| 동반 스케일 | 1.2~1.6 |
| ease | sine.inOut(렌즈 훑기) / power2.out(포커스 잠금) |

**쓸 때**: 돋보기/스포트라이트가 화면을 가로지르며 확대 축 자체가 이동, 종이가 귀퉁이에서 반대 귀퉁이로 접히듯 구겨지는 연출.
**피할 때**: 대부분의 회전/스케일은 고정 origin으로 충분 — 명확한 서사적 이유(초점 이동) 없이 쓰면 관객이 시각적 중심을 잃는다.

- intensity: 40-70
- contract_risk: 실기기 렌더 검증 권장. 실패 시 폴백은 %값 대신 getBoundingClientRect 기반 px 절대값 — 단, 반드시 build/setup 시점 1회 상수화(프레임루프 밖)로만 baked하라.

---

## null-parent-rig — 널 오브젝트식 부모 리깅

AE의 널 레이어는 안 보이지만 여러 레이어를 하나의 트랜스폼 채널로 묶는다 — 널을 흔들면 자식 전체가 같은 리듬으로 흔들리되 로컬 트랜스폼은 유지된다.

**구현** — DOM 중첩이 곧 부모 관계다. 시각적으로 렌더링되지 않는 rig 래퍼에 자식들을 넣고 rig 하나만 tween하라. rig는 그룹 y/rotation, 자식은 로컬 scale/autoAlpha stagger — 별개 노드라 오너십 충돌 없이 합성된다. chip 개별 autoAlpha 0.4s는 요소당 등장창을 준수한다(stagger 오프셋은 개별 등장시간이 아님).

```html
<div class="rig">
  <div class="chip chip-a">A</div>
  <div class="chip chip-b">B</div>
  <div class="chip chip-c">C</div>
</div>
```
```js
tl.fromTo(".rig",{y:40,rotation:-3},{y:0,rotation:0,duration:.7,ease:"power3.out"},0);
tl.to(".rig",{rotation:1.5,duration:2.4,ease:"sine.inOut",yoyo:true,repeat:1},0.9);
tl.fromTo(".chip",{scale:.7,autoAlpha:0},{scale:1,autoAlpha:1,stagger:.08,duration:.4},0.2);
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| rig 진입 방향 | 하단 / 좌우 / 상단 |
| idle sway | 각 1~3° × 주기 2~3s |
| 자식 stagger | 0.04~0.12s |

**쓸 때**: 칩/아이콘/카드 그룹을 하나의 유기체처럼 함께 진입·흔들림·이탈시키되 각 요소가 개별 스태거도 가져야 할 때(그룹 리듬 + 개별 리듬 이중 레이어).
**피할 때**: 자식이 하나뿐이면 불필요한 래퍼 — 그 요소를 바로 tween하라.

- intensity: 0-40
- pairs: `axis-isolated-transform-stack`

---

## edge-flip-reveal — 엣지 플립 리빌

앵커를 변(edge)에 두고 3D Rotation을 180°까지 돌려 뒷면을 드러낸다 — backface-visibility로 앞뒤가 전환된다.

**구현** — 도어힌지가 "열림"이라면 이것은 "완전한 뒤집힘으로 콘텐츠 교체"다. perspective 부모 + origin을 변으로 + rotateY 0→180. 앞/뒷면 두 레이어에 `backface-visibility:hidden`과 뒷면 180° 프리셋 회전을 사전 배치하라. `transform-style:preserve-3d` 누락 시 뒷면 교체가 깨진다.

```css
.flip-stage{ perspective:1600px; }
.flip-edge{ transform-origin:100% 50%; transform-style:preserve-3d; }
.face-front,.face-back{ position:absolute; inset:0; backface-visibility:hidden; }
.face-back{ transform:rotateY(180deg); }
```
```js
tl.to(".flip-edge",{rotateY:180,duration:.9,ease:"power2.inOut"},0.3);
```

단일 `.to`라 각 프레임이 결정적이다.

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 힌지 변 | 좌 / 우 / 상 / 하 |
| duration | 0.6~1.0s (90° 불가시 구간을 짧게) |
| 홀드 | 사전/사후 정지 시간 |

**쓸 때**: 통계 카드가 아이콘→숫자로 뒤집히며 정보를 교체, before/after를 한 몸처럼 전환할 때.
**피할 때**: 텍스트가 빽빽한 콘텐츠 — 90° 지점에서 아무것도 안 보이는 구간이 길게 느껴진다. 0.6~1s로 짧게 유지하라.

- intensity: 40-70
- pairs: `card-morph-anchor`

---

## pendulum-decay-swing — 진자 감쇠 스윙

앵커를 상단(매달린 지점)에 두고 감쇠 사인 회전을 걸면 실제 추처럼 흔들리다 멈춘다. AE는 expression으로 자동화하지만 여기서는 명시적 다단 tween으로 근사한다.

**구현** — origin을 상단 중앙에 고정, 진폭이 등비로 줄어드는 상수 배열을 순차 tween 체인으로 조립하라. 각도값이 전부 명시 상수라 expression·함수이징 없이 seek-safe이며, `forEach`는 VM 인트린식이라 RF-FRAGMENT-001 스모크를 통과한다(Math.random/Date 금지).

```css
.pendant{ transform-origin:50% 0%; will-change:transform; }
```
```js
const AMPS=[14,-9,6,-3,1.5,0]; // 등비 ~0.6 감쇠 — 실제 진자의 에너지 손실 근사
let t=0.3;
AMPS.forEach((a,i)=>{
  const dur = i===0? .5 : .4;
  tl.to(".pendant",{rotation:a,duration:dur,ease:"sine.inOut"},t);
  t += dur; // 빌드 시점 누적 — 런타임 시간 의존 없음
});
```

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 초기 진폭 | 10~18° |
| 감쇠율 | 진폭 배열 등비 0.5~0.7 |
| 매단 지점 | 상단 중앙 / 코너 |

**쓸 때**: 매달린 태그/배지/조명이 진입 직후 자연스럽게 흔들리다 멈추는, 라이프 있는 정지 상태로 안착할 때.
**피할 때**: idle 전체를 무한 진자로 채우면 산만 — 감쇠 후 정지가 핵심이며, 지속 idle은 offset-origin-idle-breathe로 대체하라.

- intensity: 0-40
- pairs: `offset-origin-idle-breathe`

---

## skew-pivot-peel — 오프셋 축 스큐 필

AE의 Corner Pin 또는 앵커+Skew 조합 — 앵커를 반대쪽 귀퉁이에 고정하고 skew를 걸면 그 귀퉁이를 중심으로 나머지가 젖혀진다.

**구현** — origin을 왜곡의 "고정 귀퉁이"로 잡고 skewX/skewY를 짧게 tween 후 복귀시켜라. 두 tween이 시간 비중첩 순차라 속성 충돌이 없다.

```css
.peel-corner{ transform-origin:100% 100%; will-change:transform; }
```
```js
tl.fromTo(".peel-corner",
  {skewX:0,skewY:0},
  {skewX:-6,skewY:2,duration:.5,ease:"power2.out"},
  0.4
);
tl.to(".peel-corner",{skewX:0,skewY:0,duration:.3,ease:"power1.in"},1.0);
```

skew -6°/+2° 비대칭은 종이 귀퉁이가 한 방향으로 들리는 물성 표현.

**선택지**

| 파라미터 | 옵션 |
|---|---|
| skew 각 | 3~8° |
| 고정 귀퉁이 | 4방향 |
| 복귀 | hold 후 복귀 / 젖혀진 채 유지 |

**쓸 때**: 카드/라벨/스티커의 물성을 강조하는 짧은 디테일 모션, 클릭/도착 반응의 잔향.
**피할 때**: 본문 텍스트에 큰 skew는 가독성 붕괴 — 아이콘/배지/짧은 라벨에 한정하라.

- intensity: 0-40

---

## anchor-relay-handoff — 앵커 릴레이

애니메이션 도중 앵커를 교체하되 위치 점프가 없도록 하는 AE 튜토리얼 패턴 — 페이즈마다 회전축이 바뀌는 손맛 있는 모션(anticipation→overshoot).

**구현** — 페이즈 1은 pivot-a(코너1 origin), 페이즈 2는 pivot-b(반대 코너 origin)로 rotation 오너십만 교대하라. 각 요소는 자기 tween만 받아 충돌이 없다. 권장 구조는 형제 겹침이 아니라 **`pivot-a > pivot-b > content` 중첩** — content 1개를 두 원점으로 릴레이한다(형제 겹침은 content 중복 → 정합 어긋나면 시각 팝).

```css
.pivot-a{ transform-origin:0% 100%; } /* bottom-left */
.pivot-b{ transform-origin:100% 0%; } /* top-right, nested inside pivot-a */
```
```js
// Phase 1 — anticipation on bottom-left pivot
tl.fromTo(".pivot-a",{rotation:0},{rotation:-8,duration:.3,ease:"power2.out"},0.2);
tl.to(".pivot-a",{rotation:0,duration:.35,ease:"power2.in"},0.5);
// Phase 2 — overshoot on the OPPOSITE pivot, after pivot-a settles at 0
tl.fromTo(".pivot-b",{rotation:0},{rotation:6,duration:.25,ease:"power2.out"},0.85);
tl.to(".pivot-b",{rotation:0,duration:.3,ease:"elastic.out(1,.5)"},1.1);
```

페이즈 교대는 반드시 이전 pivot이 0으로 복귀한 뒤에 시작하라(0.85 > 0.85 세틀 종료).

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 코너 조합 | 대각(좌하↔우상) / 인접 변 |
| 페이즈별 각도·duration | anticipation 크게·짧게 / overshoot 작게·탄성 |
| 구조 | 중첩(권장) / 형제 겹침(정합 관리 필요) |

**쓸 때**: 예비동작→진행→오버슈트를 한 오브젝트에 압축, 방향 전환 지점에서 "무게가 실리는 귀퉁이"가 바뀌는 디테일.
**피할 때**: 단순 등장/퇴장에는 과함 — 실제로 방향이 꺾이는 서사에서만 의미가 있다.

- intensity: 40-70
- contract_risk: 형제 겹침 구현 시 두 래퍼의 위치·크기 정합이 어긋나면 페이즈 전환에서 시각 팝 — 중첩 구조로 회피하라.

---

## offset-origin-idle-breathe — 오프셋 오리진 브리딩

중심이 아닌 바닥/모서리에 앵커를 두고 미세 오실레이션을 무한 반복 — 대칭 브리딩(중심 스케일)보다 훨씬 자연스러운 "표면에 놓여 숨쉬는" idle.

**구현** — 계약의 living-motion 규칙(CSS keyframes infinite alternate + `--rf-scene-start` delay, blessed 패턴)을 따르되 origin을 바닥 중앙에 고정해 위로만 부풀게 하라. 1fps 스트립에서도 프레임간 델타가 보이도록 진폭을 키우고 filter/opacity 축을 함께 걸어라(검증 fix 반영본 — transform 단독·미세 진폭은 요건 미달).

```css
@keyframes breathe-offset {
  from { transform: scale(1) rotate(0deg); filter: brightness(1); opacity:.82; }
  to   { transform: scale(1.06) rotate(1.2deg); filter: brightness(1.12); opacity:1; }
}
.idle-badge{
  transform-origin:50% 100%;
  animation: breathe-offset 3.4s ease-in-out infinite alternate;
  animation-delay: calc(var(--rf-scene-start,0s) + .6s);
}
```

3.4s 주기는 씬 길이(2~4.5s) 안에서 최소 반주기 이상이 보이는 값.

**선택지**

| 파라미터 | 옵션 |
|---|---|
| 원점 | 바닥 중앙 / 코너 |
| 스케일 진폭 | 1.04~1.08 (1fps 가시성 하한 1.04) |
| 회전 진폭 | 0.8~1.5° |
| 주기 | 2.4~4s |

**쓸 때**: 등장을 마친 요소가 씬 내내 완전히 멈추지 않게 하는 기본 idle 레이어 — 1fps 스트립 변화 요건 충족용.
**피할 때**: 해당 요소가 GSAP 타임라인에서 rotation/scale을 이미 점유 중이면 CSS keyframes와 transform 채널이 충돌 — 그 경우 idle도 타임라인 안의 yoyo tween으로 통일하라.

- intensity: 0-40
- pairs: `pendulum-decay-swing`

---

## Sources

- After Effects Anchor Point 기본기: Pan-Behind Tool(Y), 앵커 키프레임, 널 오브젝트 부모 리깅, 앵커 재설정 시 Position 보정 패턴 (AE 튜토리얼 관행).
- GSAP 3 CSSPlugin 문서: transformOrigin 문자열 tween, autoAlpha, transform 채널별 독립 추적(overwrite:'auto'의 동일 속성 한정 kill).
- vendor 실측 (2026-07): `/home/seunghyeong/reelforge-v5-engine/vendor/gsap/3.14.2/` = gsap.min.js 코어 단일 — 플러그인 전무, 코어 이징만 사용 가능.
- render-lint.mjs 실측: RF-FRAGMENT-001 VM 샌드박스 스모크(gsap/timeline 스텁, rAF·Date·fetch 미노출), -003 Math.random/Date.now/performance.now 금지, -004 paused:true 강제.
- 12기법 계약 검증 판정 (2026-07-25): 10 pass, 2 fix(door-hinge-open 등장창, offset-origin-idle-breathe 1fps 가시성) — fix 반영 완료.
