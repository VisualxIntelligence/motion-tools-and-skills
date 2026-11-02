// Neutral placeholder brand for the demos (this copy of video-shotcraft).
// Upstream, every logo, name and slogan on screen was the video-shotcraft brand. In this repo they are
// replaced with a generic placeholder so no demo carries a third-party mark. Before using a demo for real,
// put your own mark, name and approved copy here; the export names and shapes are unchanged, so every demo
// that imports this file keeps working.
// Pure props functions, react only.
import React from 'react';

export const BRAND = {
  name: 'your-brand', // full name as shown on screen
  short: 'Brand', // short form for tight spaces
  repo: 'example.com', // shown where a URL appears
  amber: '#D3923C', // accent colour (the "cut" in the mark)
  ink: '#171714', // mark colour on light backgrounds
  paper: '#F5F3EE', // mark colour on dark backgrounds / light background
  slate: '#B5B0A5', // secondary text on dark backgrounds
  font: '"Avenir Next", Avenir, Inter, "Helvetica Neue", Arial, sans-serif',
} as const;

// The two parts of the placeholder mark (viewBox 0 0 128 128): frame = a square ring, cut = a diagonal bar.
// Exported separately so they can be animated in stages (frame draws on, then the bar slides in).
export const MARK_PATHS = {
  frame: 'M16 16h96v96H16V16Zm22 22v52h52V38H38Z',
  cut: 'M58 82l24-24h14L72 82H58Z',
} as const;

// The mark. tone='dark' for dark backgrounds (light frame), 'light' for light backgrounds; frameColor / cutColor override.
// cutProgress 0→1 wipes the bar in along its diagonal (1 = complete); frameProgress reveals the frame left to right.
export const ShotcraftMark: React.FC<{
  size?: number; tone?: 'dark' | 'light'; frameColor?: string; cutColor?: string;
  frameProgress?: number; cutProgress?: number; style?: React.CSSProperties;
}> = ({ size = 96, tone = 'dark', frameColor, cutColor, frameProgress = 1, cutProgress = 1, style }) => {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const fp = Math.max(0, Math.min(1, frameProgress));
  const cp = Math.max(0, Math.min(1, cutProgress));
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" style={{ display: 'block', overflow: 'visible', ...style }}>
      <defs>
        {/* frame: revealed left to right */}
        <clipPath id={`f${id}`}><rect x={16} y={0} width={96 * fp} height={128} /></clipPath>
        {/* bar: wiped in along 45° from bottom-left to top-right */}
        <clipPath id={`c${id}`}><polygon points={`56,84 ${56 + 36 * cp},${84 - 36 * cp} ${84 + 36 * cp},${84 - 36 * cp} 84,84`} /></clipPath>
      </defs>
      {fp > 0 && <path d={MARK_PATHS.frame} fill={frameColor ?? (tone === 'dark' ? BRAND.paper : BRAND.ink)} clipPath={fp < 1 ? `url(#f${id})` : undefined} />}
      {cp > 0 && <path d={MARK_PATHS.cut} fill={cutColor ?? BRAND.amber} clipPath={cp < 1 ? `url(#c${id})` : undefined} />}
    </svg>
  );
};

// Lockup: mark + name side by side (mark height ≈ 2.1 × font size, weight 700, +0.03em tracking).
// size = font size in px; mark={false} for the name alone.
export const ShotcraftWordmark: React.FC<{
  size?: number; tone?: 'dark' | 'light'; color?: string; mark?: boolean;
  markScale?: number; gap?: number; weight?: number; fontFamily?: string; style?: React.CSSProperties;
}> = ({ size = 48, tone = 'dark', color, mark = true, markScale = 2.1, gap, weight, fontFamily, style }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: gap ?? size * 0.5, ...style }}>
    {mark && <ShotcraftMark size={size * markScale} tone={tone} />}
    <span style={{
      fontFamily: fontFamily ?? BRAND.font,
      fontSize: size, fontWeight: weight ?? 700, lineHeight: 1, letterSpacing: '0.03em', whiteSpace: 'nowrap',
      color: color ?? (tone === 'dark' ? BRAND.paper : BRAND.ink),
    }}>{BRAND.name}</span>
  </div>
);

// Generic aliases, so new code need not use the upstream names.
export const BrandMark = ShotcraftMark;
export const BrandWordmark = ShotcraftWordmark;

// Placeholder copy. Replace with real, approved copy before use. The `praise` lines are deliberately
// marked as placeholders: never ship invented testimonials — use real, attributed quotes or drop the shot.
export const PITCH = {
  en: {
    motto: 'Your line here.',
    taglines: [
      'Placeholder tagline one.',
      'Placeholder tagline two.',
      'Placeholder tagline three.',
      'Placeholder tagline four.',
      'Placeholder tagline five.',
      'Placeholder tagline six.',
      'Placeholder tagline seven.',
      'Placeholder tagline eight.',
    ],
    features: [
      'Feature one', 'Feature two', 'Feature three', 'Feature four',
      'Feature five', 'Feature six', 'Feature seven', 'Feature eight',
    ],
    praise: [
      'Placeholder quote — replace with a real, attributed quote.',
      'Placeholder quote — replace with a real, attributed quote.',
      'Placeholder quote — replace with a real, attributed quote.',
      'Placeholder quote — replace with a real, attributed quote.',
      'Placeholder quote — replace with a real, attributed quote.',
    ],
    works: 'Placeholder subtitle line',
  },
  zh: {
    motto: '占位标语。', // "Placeholder motto."
    taglines: ['占位副标题一。', '占位副标题二。', '占位副标题三。', '占位副标题四。', '占位副标题五。', '占位副标题六。'],
    features: ['功能一', '功能二', '功能三', '功能四', '功能五', '功能六', '功能七', '功能八'],
    praise: [
      '占位引语——请换成真实、署名的引语。',
      '占位引语——请换成真实、署名的引语。',
      '占位引语——请换成真实、署名的引语。',
      '占位引语——请换成真实、署名的引语。',
    ],
    works: '占位说明文字',
  },
} as const;
