# 00 — 그래머 인덱스 (Cinematic Grammar Index)

AE(After Effects)식 모션 어휘를 ReelForge 계약(단일 `paused` timeline, seek-safe, vendor GSAP 3.14.2 **코어 단일 번들** — 플러그인 0개) 위에서 재현한 8도메인 **101기법**의 마스터 인덱스. 각 도메인 문서는 기법별로 `구현 스케치 · 선택지 표 · 쓸 때/피할 때 · intensity 밴드 · pairs`를 담는다.

## 언제 이 폴더를 읽는가

- **D3 (스토리보드+라우팅) 단계**: `STORYBOARD.md`의 각 씬 행에 `refId`(1~2개)를 배정할 때, [ROUTING.md](../gallery/ROUTING.md)의 결정 테이블(씬 의도 동사 × intensity 밴드 × 무드)로 후보 기법을 룩업한 뒤, 여기 도메인 문서에서 해당 기법의 계약·선택지·궁합을 확인한다.
- **씬 저작 워커**: 배정받은 `refId`의 도메인 문서를 열어 keep(타임라인 페이즈 구조·이징·anchor-exit)과 mutate(카피 슬롯·duration·stagger·액센트) 경계를 읽는다. **빈 캔버스 창작 금지** — 배정 기법의 스케치를 변형한다.
- 이 폴더는 **읽기 전용 어휘 사전**이다. 씬을 실제로 컴파일·검증하는 것은 갤러리 프래그먼트이며, 여기 코드 스케치는 그 자체로 렌더 대상이 아니다.

## 그래머 · ROUTING · 갤러리의 관계

[cinematic-refactor-plan](../../../../docs/history/2026-07-25-cinematic-refactor-plan.md)의 3층 구조에서 이 폴더는 **어휘 사전(vocabulary)**에 해당한다. `gallery/ROUTING.md`는 **선택 문법(grammar of choice)** — intensity 0~100 스칼라, 아크 프리셋 4종(ramp/double-peak/cliff/steady-pulse), 무드 에스컬레이션 사다리, BPM 그리드 계약으로 "어느 씬에 어느 어휘를 쓰는가"를 결정한다. `gallery/`는 **검증된 실물(verified fragments)** — gallery-verify(compile→실렌더→스트립 검사→renderHash 스탬프)를 통과한 안무만 라우팅 대상이 된다. 즉 **그래머는 무엇이 가능한지를, ROUTING은 무엇을 언제 고를지를, 갤러리는 그것이 실제로 렌더되는지를** 각각 소유한다. 셋이 어긋나면 SKILL.md가 아니라 **갤러리 엔트리·ROUTING 테이블을 고친다**(플랜 하드 원칙 4).

## 도메인 맵 (도메인:개수)

| # | 도메인 | 1줄 요약 | 개수 | owner | 입고 상태 |
|---|---|---|---|---|---|
| 01 | [anchor-transform](01-anchor-transform.md) | 앵커포인트(transform-origin)를 회전·스케일의 축으로 다루는 트랜스폼 안무 | 12 | local | sketch |
| 02 | [easing-graph](02-easing-graph.md) | AE 그래프 에디터(Speed/Value/Velocity/Hold)의 텐션을 코어 이즈로 재현 | 13 | local | sketch |
| 03 | [camera-3d](03-camera-3d.md) | 씬을 깊이별 plane으로 쪼갠 2.5D/3D + 가상 카메라 무브 | 12 | local | sketch |
| 04 | [masks-mattes](04-masks-mattes.md) | clip-path·mask-image·트랙매트 관용구로 짓는 리빌·와이프 | 15 | local | sketch |
| 05 | [text-animator](05-text-animator.md) | AE 텍스트 애니메이터(Range Selector+프로퍼티 축)식 글자 연출 | 12 | local | sketch |
| 06 | [shapes-strokes](06-shapes-strokes.md) | Trim Paths·스트로크·패스 보간(SVG dashoffset/attr d) | 12 | local | sketch |
| 07 | [stylize-time](07-stylize-time.md) | Glow·색수차·그레인·Echo·타임 리매핑 등 텍스처·속도 룩 | 13 | local | sketch |
| 08 | [transitions-advanced](08-transitions-advanced.md) | 씬 경계에서 컷을 숨기거나 서사(연속·인과·대비·챕터)를 부여하는 전환 | 12 | local | sketch |

`owner`: `local` = 자체 계약 번역, `hf-anim` = hyperframes-animation 포인터(그래머 기법 ID·101기법 집계 밖).

> 입고 상태 주석: 현재 101기법 전원 `sketch` — 갤러리 verify 통과 시 `verified`로 승격 예정.

인용 규칙: 외부 문서 인용은 파일 라인넘버 금지 — 기법 ID 또는 섹션 헤딩으로만 인용한다(라인은 드리프트함).

**총 101기법.** 도메인 안 코드 스케치는 전부 vendor 코어(CSSPlugin·AttrPlugin·표준 이즈)만 사용하며, SplitText/DrawSVG/MorphSVG/MotionPath/CustomEase는 부재(호출 시 렌더 사망).

## 기법 ID 전체 리스트

### 01 anchor-transform (12)
`anchor-corner-swing` · `door-hinge-open` · `seesaw-fulcrum-tilt` · `orbital-revolve` · `axis-isolated-transform-stack` · `anchor-itself-animated` · `null-parent-rig` · `edge-flip-reveal` · `pendulum-decay-swing` · `skew-pivot-peel` · `anchor-relay-handoff` · `offset-origin-idle-breathe`

### 02 easing-graph (13)
`speed-graph-power-family` · `value-graph-overshoot-settle` · `keyframe-velocity-to-cubic-bezier` · `easy-ease-linear-hold-usage` · `custom-function-ease` · `anticipation-windup-chain` · `rolling-tension-chain` · `elastic-amplitude-period` · `bounce-drop-physics` · `weighted-deceleration-mass` · `hold-keyframe-stepped-values` · `separate-dimensions-axis-ease` · `scene-boundary-tangent-handoff`

### 03 camera-3d (12)
`parallax-3plane-rule` · `multiplane-dolly-push` · `camera-orbit-turntable` · `dolly-zoom-vertigo` · `whip-pan-cut-mask` · `crane-pedestal-tilt` · `rack-focus-reference` · `perspective-origin-eye-shift` · `preserve-3d-layer-safety` · `gpu-compositing-budget` · `ambient-parallax-breathing` · `depth-fog-atmospheric-falloff`

### 04 masks-mattes (15)
`inset-wipe-reveal` · `polygon-diagonal-wipe` · `iris-circle-directional` · `gradient-mask-soft-wipe` · `mask-spotlight-drift` · `bg-clip-text-shape` · `dual-layer-counter-move` · `crop-reveal-overflow` · `line-sweep-diagonal-stripes` · `blinds-stripe-reveal` · `alpha-matte-cutout` · `word-clip-stagger` · `corner-swing-mask` · `matte-invert-negative-space` · `mosaic-matte-collage`

### 05 text-animator (12)
`range-selector-stagger-map` · `char-word-line-split-strategy` · `tracking-kerning-tween` · `offset-cascade-wave` · `flipboard-3d-rotateX` · `blur-dissolve-in` · `scale-jump-stairstep` · `typewriter-vs-fade-sequence` · `netflix-title-converge` · `mask-line-slide-reveal` · `word-swap-crossfade` · `selective-emphasis-pop`

### 06 shapes-strokes (12)
`svg-stroke-draw-on` · `trace-then-fill` · `underline-emphasis-sweep` · `progress-ring-radial` · `progress-bar-linear-segmented` · `shape-wipe-clip-path` · `path-morph-consistent-topology` · `line-connector-draw` · `path-follow-marker` · `animated-line-chart-trace` · `divider-rule-expand` · `checkmark-success-tick`

### 07 stylize-time (13)
`glow-pulse-halo` · `chromatic-aberration-static` · `chromatic-aberration-glitch-cut` · `vhs-tracking-glitch` · `film-grain-seeded-flip` · `scanline-interlace` · `light-sweep-sheen` · `light-leak-film-burn` · `speed-ramp-density` · `motion-smear-echo` · `flash-frame-subliminal` · `strobe-pulse-grid` · `vignette-impact-pulse`

### 08 transitions-advanced (12)
`match-cut-position-carry` · `match-cut-graphic-analogy` · `zoom-through-portal` · `whip-pan-directional` · `shape-wipe-color-block` · `iris-portal-threshold` · `motion-vector-inheritance` · `axis-of-action-pan-handoff` · `speed-ramp-blur-flash` · `silhouette-negative-space-match` · `light-flash-join` · `object-scale-continuity`

## 이름 충돌 주의 (의도적 분리, 중복 아님)

같은 영화 용어가 두 도메인에 나뉘어 있으되 **범위가 다르다** — 라우팅 시 도메인 접두로 구분하라.

| 개념 | 씬 **내부** 모션 | 씬 **경계** 전환 |
|---|---|---|
| 휩팬 | `whip-pan-cut-mask` (03) | `whip-pan-directional` (08) |
| 스피드램프 | `speed-ramp-density` (07) | `speed-ramp-blur-flash` (08) |
| 아이리스 | `iris-circle-directional` (04) / `shape-wipe-clip-path` (06) | `iris-portal-threshold` (08) |
| 셰이프 와이프 | `shape-wipe-clip-path` (06) | `shape-wipe-color-block` (08) |

외부 참조(`→ hyperframes-animation … 참조`로 표기된 `split-tilt-cards`·`coordinate-target-zoom`·`orbit-3d-entry`·`kinetic-beat-slam` 등)는 이 폴더의 기법 ID가 아니라 hyperframes-animation 스킬의 rule/blueprint다. 그래머 ID와 혼동하지 말 것.
