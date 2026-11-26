import React from "react";
import { Composition } from "remotion";
import { Film, HEIGHT, WIDTH } from "./Film";
import { PIECES } from "./pieces";

export const Root: React.FC = () => (
  <>
    {Object.values(PIECES).map((p) => (
      <Composition key={p.id} id={p.id} component={Film} durationInFrames={Math.round(p.duration * p.fps)} fps={p.fps} width={WIDTH} height={HEIGHT} defaultProps={{ piece: p.id, slate: true, report: true }} />
    ))}
  </>
);
