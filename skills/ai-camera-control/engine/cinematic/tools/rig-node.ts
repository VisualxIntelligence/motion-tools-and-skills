// Load the mannequin rig for the node tools (the film loads it in the browser).
import fs from "fs";
import path from "path";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RIG_EXTRA, RIG_FILE, rigReady, setRigAsset } from "../src/kit/rig";

// the scripts run from engine/cinematic, where the rig is shipped in ./public/kit (CINEMATIC_PUBLIC overrides)
const PUBLIC = (process.env.CINEMATIC_PUBLIC ?? path.resolve(process.cwd(), "public")) + "/";
const read = (file: string) => { const buf = fs.readFileSync(file); return new Promise<GLTF>((res, rej) => new GLTFLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), "", res, rej)); };
export async function loadRigNode(file = PUBLIC + RIG_FILE, extra = PUBLIC + RIG_EXTRA) {
  if (rigReady()) return;
  setRigAsset(await read(file), fs.existsSync(extra) ? await read(extra) : undefined);
}
