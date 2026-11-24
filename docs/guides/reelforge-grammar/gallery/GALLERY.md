# Gallery — 검증된 안무 실물

이 폴더는 ReelForge의 **검증된 실물(verified fragments)** 층이다. 여기 있는 프래그먼트만이
D3 라우팅에서 스탬프로 인정되며, 스탬프 존재 여부는 `gallery-index.json`의 `verified` 필드가
단독으로 소유한다. "검증 안 된 것은 어휘가 아니다."

## 구조

```
gallery/
├── ROUTING.md          # 선택 문법 — 아크·intensity·무드·예산 라우팅 (D2/D3에서 로드)
├── GALLERY.md          # 이 파일 — 갤러리 운영 규칙
├── gallery-index.json  # 검증 상태의 단일 소유자 (schemas/gallery-index.schema.json)
└── fragments/<family>/<name>.html (+ .meta.json 사이드카)
```

## 엔트리 규칙

- 파일 1행: `<!-- rf-gallery v1 | <id> | <implementsGrammar> | mutate=... | keep=... -->`
- `implementsGrammar`는 `references/grammar/00-INDEX.md`의 기법 ID여야 한다. direction-lint는
  STORYBOARD의 refId(문법 ID)를 이 필드로 역해석해 스탬프를 찾는다.
- 카피 요소는 전부 `data-slot="<이름>"` — `.meta.json`의 `slots[].maxChars`와 1:1.
- keep(안무 정체성: 페이즈 구조·이징·셰이크/스트로브 패턴)은 워커가 변형 금지,
  mutate(카피·duration·액센트색·데이터값)만 교체 가능.
- 프래그먼트 계약 v1.0 하드라인은 `references/scene-authoring.md`가 소유한다.

## 입고(verify)와 퇴출

- 입고는 오직 `node scripts/gallery-verify.mjs <fragment> --id <id> --grammar <gid> --family <fam> --meta <side.json>`.
  3프리셋(linear·dark-hype·nebula-pop) 직렬 실렌더 → blank/frozen-motion/low-contrast 검사
  전부 통과해야 `verified{contractVersion, renderHash, checkedAt}` 스탬프가 찍힌다.
- 스탬프는 verify 전용 — `--meta`로 스탬프를 들고 와도 무시된다(렌더 우회 불가).
- 계약 버전이 오르면 전 스탬프 만료: `node scripts/gallery-verify.mjs --all` 재검증.
- QC에서 2회 실패한 엔트리는 갤러리에서 강등(스탬프 제거)하고 원인을 엔트리 데이터에서 고친다.
- 역방향 회귀: `fixtures/negative/gallery/` 3종은 반드시 반려되어야 한다(통과 = 검사기 고장).

## 시드 현황 (2026-07-25 C6 수확)

| id | implementsGrammar | band | arcFit | 출처 |
|---|---|---|---|---|
| typo/scale-slam-strike | scale-jump-stairstep | 70-100 | hook,peak | intro-v6 s01 |
| typo/glitch-swap-punch | word-swap-crossfade | 70-100 | hook,peak | intro-v6 s02 |
| typo/demote-promote-arrow | svg-stroke-draw-on | 40-70 | build | intro-v6 s03 |
| typo/typewriter-stage | typewriter-vs-fade-sequence | 40-70 | hook,build | intro-v6 s04 |
| object/hero-overshoot-strobe | value-graph-overshoot-settle | 70-100 | peak | intro-v6 s05 |
| object/connector-tree-cascade | line-connector-draw | 40-70 | build,resolve | intro-v6 s07 |
| data/count-up-punch | hold-keyframe-stepped-values | 40-70 | build,peak | darkhype s09 |
| seal/rail-lockup-sweep | underline-emphasis-sweep | 0-40 | resolve | intro-v6 s08 |

검증 상태는 이 표가 아니라 `gallery-index.json`이 진실이다 — 표는 출처 기록용.

## 양산 쿼터 (C7 목표)

typo≥8 · camera≥4 · data≥3 · object≥3 · atmo≥2 · seal≥2 · pairs≥4조.
소스는 grammar 스케치, 생산은 codex 병렬, verify는 직렬(머신당 렌더 1개) 큐로만.
