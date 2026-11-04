# Motion System

Date:
Brand:
Repo:

## Motion Thesis

Motion is hierarchy over time. It should explain what changed, where to look, and what action matters next.

## Runtime Defaults

| Need | Runtime |
| --- | --- |
| React UI state/layout | Motion / Framer Motion |
| Signature timeline or scroll story | GSAP |
| Rendered MP4/GIF/social clip | Remotion |
| Browser proof capture | Playwright |
| Export/compression | ffmpeg |
| Spatial/3D scene | Three.js / React Three Fiber |
| Stateful vector asset | Rive |
| Portable loop | Lottie |

## Tokens

```ts
export const motionTokens = {
  easing: {
    standard: [0.22, 1, 0.36, 1],
    quick: [0.2, 0, 0, 1],
  },
  duration: {
    hover: 140,
    state: 220,
    modal: 280,
    route: 360,
    reveal: 420,
    signature: 900,
  },
  stagger: {
    tight: 40,
    standard: 60,
    loose: 90,
  },
};
```

## Rules

- Give every motion a job.
- Default to stillness on dense work surfaces.
- Use Motion for standard UI.
- Use GSAP only for named signature surfaces.
- Use Remotion when the output is video, GIF, or social.
- Respect `prefers-reduced-motion` for non-trivial movement.
- Do not animate text while the user needs to read it.
- Do not ship canvas/3D without a nonblank visual check.

## Reduced Motion

Reduced motion should preserve meaning:

- remove transforms and parallax
- keep hierarchy visible
- replace animated loops with poster frames
- replace scroll narratives with static ordered sections
- keep focus, hover, and state feedback through color/border/content

## QA

Required before handoff:

- desktop first viewport
- mobile first viewport
- primary interaction/state
- reduced-motion state
- video or frame sequence for motion-heavy work
- asset provenance for generated or third-party media

## Pattern Registry

Use the shared registry:

```text
awesome-motion-design-agent-skills/patterns/motion-pattern-registry.json
```

