// The film: a 2.39 picture in 16:9 bars, rendered by three.js inside Remotion, with a previs slate in the bars and,
// for pieces that ask for it, a live camera report in the lower right of the picture.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PIECES, type Piece, type PieceWorld } from "./pieces";
import { measure, place, realCam } from "./camera";
import { makePost } from "./post";
import { blurIn } from "./motion";
import { pathTraceFrame } from "./pathtrace";
import { makeInk } from "./ink";
import { addTrackMarks } from "./trackmarks";
import { StandIns, setStandin } from "./standins";

export const WIDTH = 1920, HEIGHT = 1080;
const PIC_H = Math.round(WIDTH / 2.39 / 2) * 2; // 804
const BAR = (HEIGHT - PIC_H) / 2;

function useWorld(piece: Piece) {
  const [world, setWorld] = useState<PieceWorld | null>(() => (piece.textures || piece.preload ? null : piece.makeWorld({})));
  useEffect(() => {
    if (piece.preload && !piece.textures) {
      const handle = delayRender(`loading ${piece.id} assets`);
      piece.preload(staticFile).then(() => { setWorld(piece.makeWorld({})); continueRender(handle); }).catch((e) => { console.error(e); setWorld(piece.makeWorld({})); continueRender(handle); });
      return;
    }
    if (!piece.textures) return;
    const handle = delayRender(`loading ${piece.id} textures`);
    const loader = new THREE.TextureLoader();
    const entries = Object.entries(piece.textures);
    Promise.all(entries.map(([, p]) => loader.loadAsync(staticFile(p)).then((tx) => { tx.colorSpace = THREE.SRGBColorSpace; return tx; })))
      .then((txs) => { setWorld(piece.makeWorld(Object.fromEntries(entries.map(([k], i) => [k, txs[i]])))); continueRender(handle); })
      .catch((e) => { console.error(e); setWorld(piece.makeWorld({})); continueRender(handle); });
  }, [piece]);
  return world;
}

const Director: React.FC<{ piece: Piece; blur: boolean; subframes: number; pathtrace: number; storyboard?: boolean; pencil?: boolean; ghost?: boolean; plate?: boolean; boxes?: boolean; marks?: boolean; noScenery?: boolean }> = ({ piece, blur, subframes, pathtrace, storyboard = false, pencil = false, ghost = false, plate = false, boxes = false, marks = false, noScenery = false }) => {
  const frame = useCurrentFrame();
  const fRef = useRef(frame);
  fRef.current = frame;
  const { gl, camera, advance } = useThree();
  const world = useWorld(piece);
  // the passes run at the canvas's real pixel size, so a still rendered at a higher scale is sharp, not upscaled
  const dpr = gl.getPixelRatio();
  const post = useMemo(() => makePost(Math.round(WIDTH * dpr), Math.round(PIC_H * dpr)), [dpr]);
  const ink = useMemo(() => (storyboard || pencil || ghost ? makeInk(Math.round(WIDTH * dpr), Math.round(PIC_H * dpr)) : null), [dpr, storyboard, pencil, ghost]);
  const prev = useMemo(() => new THREE.PerspectiveCamera(), []);
  const standins = useRef<StandIns | null>(null);
  const depthMask = useRef<THREE.MeshBasicMaterial | null>(null);
  const realPill = boxes && storyboard;   // the set drawn in ink, the pill left as the real lit 3D pill
  const next = useMemo(() => new THREE.PerspectiveCamera(), []);
  // once the world exists, draw the current frame (the canvas may have advanced before the textures arrived)
  useEffect(() => { if (world) advance(performance.now()); }, [world, advance]);
  useFrame(() => {
    if (!world) return;
    if (marks) addTrackMarks(world.scene);                              // idempotent: each material is marked once
    const t = fRef.current / piece.fps - (piece.offset ?? 0);
    const shot = piece.shotAt(t);
    const look = piece.look(t);
    const cam = camera as THREE.PerspectiveCamera;
    gl.toneMapping = THREE.NoToneMapping;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    const pose = (x: number) => {
      const rc = realCam(shot, x, piece.fps);
      (world as { setCamera?: (p: THREE.Vector3, q: THREE.Vector3) => void }).setCamera?.(rc.cam.pos, rc.cam.target);
      world.update(x, shot.shadow(x));
      place(cam, rc.cam);
      return rc;
    };
    // sub-frame motion blur: n renders across a 180° shutter centred on the frame, never across a cut
    // the storyboard look: one sharp pose, drawn as ink on paper (no blur, no lens, no grade)
    if (ink && storyboard) {
      const rc = pose(t);
      let subjects = [...((world as { actors?: Map<string, { root: THREE.Object3D }> }).actors?.values() ?? [])].map((a) => a.root);
      // drawn capsules: each person outlined as their stand-in capsule (no body to copy), props that act keep their outline
      const hid: THREE.Object3D[] = [];
      if (boxes) {
        const acts = [...((world as { actors?: Map<string, any> }).actors?.values() ?? [])];
        if (!standins.current) standins.current = new StandIns(world.scene);
        standins.current.show(acts.filter((a) => a.rig)); standins.current.clearAround(cam.position); standins.current.labelProps(acts.filter((a) => a.prop));
        for (const a of acts) if ((a.rig || a.fig) && a.root.visible) { a.root.visible = false; hid.push(a.root); }
        // the drawn look keeps the pill a real 3D object (painted over the ink below), so it gets no ink outline of its own
        subjects = [...acts.filter((a) => !(a.rig || a.fig)).map((a) => a.root), ...(realPill ? [] : standins.current.roots().filter((r) => r.parent?.visible))];
        // the scenery is not drawn: the prompt describes it, so there is no stand-in tree or rock to copy
        world.scene.traverse((o: any) => { if (o.userData?.dressing && o.visible) { o.visible = false; hid.push(o); } });
      }
      ink.render(gl, world.scene, cam, subjects, false, false); void rc;   // plain line: rendered shadows read as a render, not a drawing
      // the drawn look: the striped pill painted flat over the ink, with the set as an invisible depth mask so it still hides the pill
      if (boxes && standins.current && standins.current.groups().length) {
        const caps = standins.current.groups(), dep = (depthMask.current ??= new THREE.MeshBasicMaterial({ colorWrite: false }));
        const inCaps = (o: THREE.Object3D) => { for (let p: THREE.Object3D | null = o; p; p = p.parent) if (caps.includes(p as THREE.Group)) return true; return false; };
        const swap: [THREE.Mesh, THREE.Material | THREE.Material[]][] = [], off: THREE.Object3D[] = [];
        world.scene.traverse((o: any) => {
          if (o.userData?.noPathTrace && o.visible) { o.visible = false; off.push(o); }
          else if (o.isMesh && o.visible && !inCaps(o)) { swap.push([o, o.material]); o.material = dep; }
        });
        const bg = world.scene.background, fog = world.scene.fog, ac = gl.autoClear;
        world.scene.background = null; world.scene.fog = null; gl.autoClear = false; gl.setRenderTarget(null); gl.clearDepth();
        gl.render(world.scene, cam);
        gl.autoClear = ac; world.scene.background = bg; world.scene.fog = fog;
        for (const [o, m] of swap) o.material = m as any;
        for (const o of off) o.visible = true;
      }
      for (const r of hid) r.visible = true;
      standins.current?.hide();
      return;
    }
    let n = Math.max(1, Math.round(subframes));
    if (n > 1) {
      const open = 0.5 / piece.fps, times: number[] = [];
      // enough renders that no copy lands more than ~2.5 px from the next: measured on points 2 m in front of the lens
      const ends = [Math.max(shot.start, t - open / 2), Math.min(shot.end - 1e-4, t + open / 2)];
      place(prev, realCam(shot, ends[0], piece.fps).cam); place(next, realCam(shot, ends[1], piece.fps).cam);
      for (const c of [prev, next]) { c.updateMatrixWorld(true); c.updateProjectionMatrix(); }
      let px = 0;
      for (const x of [-0.9, 0, 0.9]) for (const y of [-0.9, 0, 0.9]) {
        const ray = new THREE.Vector3(x, y, 0.5).unproject(prev).sub(prev.position).normalize();
        const p = prev.position.clone().addScaledVector(ray, 2).project(next);
        px = Math.max(px, Math.hypot(((p.x - x) * WIDTH * dpr) / 2, ((p.y - y) * PIC_H * dpr) / 2));
      }
      n = Math.max(n, Math.min(48, Math.ceil(px / 2.5)));
      for (let k = 0; k < n; k++) times.push(Math.min(shot.end - 1e-4, Math.max(shot.start, t + (k / (n - 1) - 0.5) * open)));
      times.sort((a, b) => Math.abs(b - t) - Math.abs(a - t));            // the centre last: the world is left posed there for depth
      times.forEach((x, k) => {
        pose(x);
        // stand-in capsules: fitted to the people as posed at this sub-frame, then the people go, so the blur never carries a body
        let gone: THREE.Object3D[] = [];
        if (boxes) {
          if (!standins.current) standins.current = new StandIns(world.scene);
          const acts = [...((world as { actors?: Map<string, any> }).actors?.values() ?? [])];
          standins.current.show(acts.filter((a) => a.rig)); standins.current.clearAround(cam.position); standins.current.labelProps(acts.filter((a) => a.prop));
          gone = acts.filter((a) => (a.rig || a.fig) && a.root.visible).map((a) => a.root); for (const r of gone) r.visible = false;
        }
        post.accumulate(gl, world.scene, cam, k);
        for (const r of gone) r.visible = true;
        if (boxes) standins.current?.hide();
      });
    }
    const rc = pose(t);
    // a path-traced still: real light, soft shadows and a physical lens, sampled until clean
    if (pathtrace > 0) { pathTraceFrame(gl, world.scene, cam, { samples: pathtrace, stop: shot.stop ? shot.stop(t) : 8, focus: rc.focus, frame: fRef.current }); return; }
    // camera motion blur over a 180 degree shutter, inside the shot only (a cut never smears); off when sub-frames blur
    const tp = t - 0.5 / piece.fps;
    const vel = new THREE.Vector2();
    if (blur && n === 1 && tp >= shot.start) {
      place(prev, realCam(shot, tp, piece.fps).cam);
      const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(prev.quaternion);
      const p = prev.position.clone().add(fwd.multiplyScalar(60)).project(cam);
      vel.set((p.x * WIDTH * dpr) / 2, (p.y * PIC_H * dpr) / 2);
      if (vel.length() > 140 * dpr) vel.setLength(140 * dpr);
    }
    // the pencil look: the specks off, then the subjects redrawn in pencil over the finished frame
    const specks: THREE.Object3D[] = [];
    if (pencil || ghost || plate || boxes) world.scene.traverse((o: any) => { if (o.isInstancedMesh && o.userData?.noPathTrace && o.visible) { o.visible = false; specks.push(o); } });
    // the camera-only plate (and under a ghost): the people are not rendered (props that act stay); the set and the move remain
    const people = plate || ghost || boxes ? [...((world as { actors?: Map<string, { root: THREE.Object3D; rig?: unknown; fig?: unknown }> }).actors?.values() ?? [])].filter((a) => a.rig || a.fig).map((a) => a.root).filter((r) => r.visible) : [];
    // stand-in boxes: fitted to the people as posed now (while they are still visible to measure), then the people go
    if (boxes) { if (!standins.current) standins.current = new StandIns(world.scene); const acts = [...((world as { actors?: Map<string, any> }).actors?.values() ?? [])]; standins.current.show(acts.filter((a) => a.rig)); standins.current.clearAround(cam.position); standins.current.labelProps(acts.filter((a) => a.prop)); }
    for (const r of people) r.visible = false;
    // no scenery: trees, rocks, bushes, lamps and benches left out, so a video model has no stand-in shape to copy
    const scen: THREE.Object3D[] = [];
    if (noScenery) world.scene.traverse((o: any) => { if (o.userData?.dressing && o.visible) { o.visible = false; scen.push(o); } });
    post.render(gl, world.scene, cam, { focal: rc.raw.mm, stop: shot.stop ? shot.stop(t) : 22, focus: rc.focus, vel, seed: (fRef.current % 97) * 13.1, bloom: look.bloom, fish: rc.raw.fish ?? 0, exposure: look.exposure, warm: look.warm, dof: look.dof && !!shot.stop, ao: look.ao, accumulated: n > 1 });
    if ((pencil || ghost) && ink) {
      for (const r of people) r.visible = true;                         // the ghost reads the people's silhouettes, not their render
      const acts = [...((world as { actors?: Map<string, { root: THREE.Object3D; rig?: unknown; fig?: unknown }> }).actors?.values() ?? [])];
      ink.render(gl, world.scene, cam, (ghost ? acts.filter((a) => a.rig || a.fig) : acts).map((a) => a.root), ghost ? "ghost" : true);
    }
    for (const r of people) r.visible = true;
    for (const o of specks) o.visible = true;
    for (const o of scen) o.visible = true;
    standins.current?.hide();
  }, 1);
  return null;
};

const tc = (f: number, fps: number) => {
  const s = Math.floor(f / fps), fr = f % fps;
  return `00:00:${String(s).padStart(2, "0")}:${String(fr).padStart(2, "0")}`;
};

/** the camera report: what a director or DP would write on the sheet for this exact frame. It sits in the lower bar,
 *  never over the picture: a header, then the six readings in two columns. */
const CameraReport: React.FC<{ piece: Piece; frame: number; top: number }> = ({ piece, frame, top }) => {
  const t = frame / piece.fps - (piece.offset ?? 0);
  const shot = piece.shotAt(t);
  const m = measure(shot, t, piece.fps);
  const style = blurIn(frame, Math.round((shot.start + (piece.offset ?? 0)) * piece.fps), { dur: 9, blur: 8 });   // the kit's entrance, per shot
  const cell = ([k, v]: [string, string]) => (
    <div key={k} style={{ display: "flex", gap: 10, whiteSpace: "nowrap", overflow: "hidden" }}>
      <span style={{ width: 46, flex: "none", color: "rgba(235,235,230,0.42)" }}>{k}</span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{v}</span>
    </div>
  );
  const L = m.lines;
  return (
    <div style={{ position: "absolute", left: 48, right: 48, top, fontFamily: "Menlo, Monaco, monospace", fontSize: 12.5, lineHeight: "17px", color: "rgba(240,240,236,0.86)", letterSpacing: 0.5, ...style }}>
      <div style={{ color: "rgba(255,255,255,0.95)", marginBottom: 2 }}>SH {String(shot.id).padStart(2, "0")} · {shot.label}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 36 }}>
        {[L[0], L[3], L[1], L[4], L[2], L[5]].map(cell)}
      </div>
    </div>
  );
};

/** blur false: no camera motion blur (sharp reference frames for an AI video model) */
/** subframes: renders averaged across the shutter (1 = the fast camera-only blur) */
export const Film: React.FC<{ standin?: string; piece?: string; slate?: boolean; report?: boolean; clean?: boolean; blur?: boolean; subframes?: number; pathtrace?: number; storyboard?: boolean; pencil?: boolean; ghost?: boolean; plate?: boolean; boxes?: boolean; marks?: boolean; noScenery?: boolean }> = ({ standin = "pin", piece: id = "Rootsong", slate = true, report = true, clean = false, blur = true, subframes = 1, pathtrace = 0, storyboard = false, pencil = false, ghost = false, plate = false, boxes = false, marks = false, noScenery = false }) => {
  setStandin(standin);
  const piece = PIECES[id];
  const frame = useCurrentFrame();
  const off = piece.offset ?? 0;
  const ft = frame / piece.fps;      // film time
  const t = ft - off;                // story time
  const shot = piece.shotAt(t);
  const sub = clean ? null : piece.subtitle?.(t);
  const [a, b, c, d] = piece.titleAt;
  const titleOut = interpolate(t, [c, d], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleIn = blurIn(frame, Math.round((a + off) * piece.fps), { dur: Math.round((b - a) * piece.fps / 2), blur: 18, scaleFrom: 0.97 });
  const black = piece.fade === false ? 0 : Math.max(interpolate(ft, [0, 0.9], [1, 0], { extrapolateRight: "clamp" }), interpolate(ft, [piece.duration - 0.7, piece.duration - 0.05], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const mono: React.CSSProperties = { fontFamily: "Menlo, Monaco, monospace", fontSize: 19, letterSpacing: 2, color: "rgba(235,235,230,0.62)" };
  const hasReport = piece.hud && report && !clean;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", top: BAR, left: 0, width: WIDTH, height: PIC_H, overflow: "hidden" }}>
        <ThreeCanvas width={WIDTH} height={PIC_H} shadows gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }} camera={{ fov: 30, position: [0, 10, 50] }}>
          <Director piece={piece} blur={blur} subframes={subframes} pathtrace={pathtrace} storyboard={storyboard} pencil={pencil} ghost={ghost} plate={plate} boxes={boxes} marks={marks} noScenery={noScenery} />
        </ThreeCanvas>
        <AbsoluteFill style={{ background: "#000", opacity: black }} />
        {!clean && t > a - 0.1 && (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: titleOut }}>
            <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 200, fontSize: 104, letterSpacing: "0.5em", color: "#f8efe0", marginLeft: "0.5em", textShadow: "0 2px 30px rgba(0,0,0,0.35)", ...titleIn }}>{piece.title}</div>
          </AbsoluteFill>
        )}
        {!clean && piece.openAt && ft > piece.openAt[0] - 0.1 && ft < piece.openAt[3] && (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: interpolate(ft, [piece.openAt[2], piece.openAt[3]], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            <div style={{ textAlign: "center", ...blurIn(frame, Math.round(piece.openAt[0] * piece.fps), { dur: Math.round((piece.openAt[1] - piece.openAt[0]) * piece.fps / 2), blur: 18, scaleFrom: 0.96 }) }}>
              <div style={{ fontFamily: "Baskerville, 'Big Caslon', Georgia, serif", fontSize: 150, letterSpacing: "0.42em", marginLeft: "0.42em", color: "#fbf2e2", textShadow: "0 0 50px rgba(255,170,80,0.6), 0 3px 30px rgba(0,0,0,0.45)" }}>{piece.title}</div>
              <div style={{ fontFamily: "Baskerville, Georgia, serif", fontStyle: "italic", fontSize: 30, letterSpacing: "0.3em", color: "rgba(255,226,190,0.85)", marginTop: 8 }}>a voyage through the Shoals of Amberlight</div>
            </div>
          </AbsoluteFill>
        )}
      </div>
      {piece.audio?.map((a) => (
        <Sequence key={a.file} from={Math.round((a.at + off) * piece.fps)} layout="none">
          <Audio src={staticFile(a.file)} volume={a.vol ?? 1} loop={a.loop} />
        </Sequence>
      ))}
      {sub && (
        // subtitles: at the top of the lower bar, centred, like a release print
        <div style={{ position: "absolute", left: 0, right: 0, top: BAR + PIC_H + (hasReport ? 6 : BAR / 2 - 24), textAlign: "center", fontFamily: "Baskerville, 'Big Caslon', Georgia, serif", fontStyle: "italic", fontSize: hasReport ? 30 : 36, lineHeight: "40px", color: "#fbf3e4" }}>{sub}</div>
      )}
      {hasReport && <CameraReport piece={piece} frame={frame} top={BAR + PIC_H + (piece.subtitle ? 50 : 24)} />}
      {slate && (
        // the slate: two rows in the upper bar
        <>
          <div style={{ ...mono, position: "absolute", left: 48, top: BAR / 2 - 30 }}>{piece.title}  ·  PREVIS {piece.version ?? "v1"}</div>
          <div style={{ ...mono, position: "absolute", right: 48, top: BAR / 2 - 30 }}>{tc(frame, piece.fps)}  ·  {piece.fps} FPS</div>
          <div style={{ ...mono, position: "absolute", left: 48, right: 360, top: BAR / 2 + 8, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>SH {String(shot.id).padStart(2, "0")} / {piece.shots.length}   {shot.note ?? shot.label}</div>
          <div style={{ ...mono, position: "absolute", right: 48, top: BAR / 2 + 8, fontSize: 15 }}>2.39 : 1   ·   CLAY</div>
        </>
      )}
    </AbsoluteFill>
  );
};
