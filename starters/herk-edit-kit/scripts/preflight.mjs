#!/usr/bin/env node
// Hyperframes preview preflight.
// Fails FAST on the specific authoring bugs that cause Studio to show "0:00 / 0:00"
// or to leave the scrubber dead. Complements `npx hyperframes lint` — this script
// only checks the preview-blocking conditions lint warns-but-doesn't-fail on.
//
// Usage:  node scripts/preflight.mjs <project-folder>
// Example: node scripts/preflight.mjs video-projects/may-shorts-19

import { readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";

const SHADER_BLOCK_NAMES = new Set([
  "glitch", "whip-pan", "cinematic-zoom", "flash-through-white", "light-leak",
  "ripple-waves", "chromatic-radial-split", "cross-warp-morph", "domain-warp-dissolve",
  "gravitational-lens", "ridged-burn", "sdf-iris", "swirl-vortex", "thermal-distortion",
]);

const ansi = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function readAttr(raw, name) {
  const m = raw.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return m ? m[1] : null;
}

function findRootDiv(html) {
  const re = /<div\b([^>]*\bdata-composition-id\s*=\s*["'][^"']+["'][^>]*)>/gi;
  const m = re.exec(html);
  if (!m) return null;
  return { raw: `<div${m[1]}>`, attrs: m[1] };
}

function scanAllTags(html, tagName) {
  const out = [];
  const re = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  let m;
  while ((m = re.exec(html)) !== null) out.push({ raw: m[0], index: m.index });
  return out;
}

function hasTimelineContent(scriptBody) {
  return /\b(?:mainTl|tl|masterTL|timeline)\s*\.\s*(?:to|from|fromTo|set|add|call)\s*\(/.test(
    scriptBody
  );
}

function timelineKeyMatchesRoot(scriptBody, compositionId) {
  const re = new RegExp(
    `window\\.__timelines\\s*\\[\\s*["']([^"']+)["']\\s*\\]\\s*=`,
    "g"
  );
  const keys = [];
  let m;
  while ((m = re.exec(scriptBody)) !== null) keys.push(m[1]);
  return { keys, match: keys.includes(compositionId) };
}

function scanSubCompSrcs(html) {
  const out = [];
  const re = /data-composition-src\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) out.push(m[1]);
  return out;
}

function countShaderBlocks(html, compositionsDir) {
  let count = 0;
  const srcs = scanSubCompSrcs(html);
  for (const src of srcs) {
    const stem = src
      .replace(/\\/g, "/")
      .split("/")
      .pop()
      .replace(/\.html$/, "");
    if (SHADER_BLOCK_NAMES.has(stem)) count++;
  }
  return count;
}

function listSubCompIds(html) {
  const out = [];
  const re =
    /data-composition-id\s*=\s*["']([^"']+)["'][^>]*data-composition-src\s*=\s*["']([^"']+)["']|data-composition-src\s*=\s*["']([^"']+)["'][^>]*data-composition-id\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    out.push({ id: m[1] || m[4], src: m[2] || m[3] });
  }
  return out;
}

function extractInlineScript(html) {
  const parts = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (!/\bsrc\s*=/.test(m[1])) parts.push(m[2]);
  }
  return parts.join("\n");
}

function fail(label, msg) {
  console.log(`  ${ansi.red("✗")} ${ansi.bold(label)}: ${msg}`);
}
function warn(label, msg) {
  console.log(`  ${ansi.yellow("⚠")} ${ansi.bold(label)}: ${msg}`);
}
function ok(label, msg) {
  console.log(`  ${ansi.green("✓")} ${ansi.bold(label)}${msg ? `: ${msg}` : ""}`);
}

const projectArg = process.argv[2];
if (!projectArg) {
  console.error("Usage: node scripts/preflight.mjs <project-folder>");
  process.exit(2);
}

const projectDir = resolve(projectArg);
if (!existsSync(projectDir) || !statSync(projectDir).isDirectory()) {
  console.error(`Project folder not found: ${projectDir}`);
  process.exit(2);
}

const indexPath = join(projectDir, "index.html");
console.log(`\n${ansi.bold("◆")} Preflight: ${projectDir.replace(/\\/g, "/")}`);

if (!existsSync(indexPath)) {
  fail("index_missing", `no index.html in ${projectDir}`);
  process.exit(1);
}

const html = readFileSync(indexPath, "utf8");
let hardFail = 0;
let warns = 0;

// 1) Root div + required attrs
const root = findRootDiv(html);
if (!root) {
  fail(
    "root_composition_missing",
    "no <div data-composition-id=...> found — Studio will not know what to render"
  );
  hardFail++;
  process.exit(1);
}
const rootId = readAttr(root.raw, "data-composition-id");
const rootWidth = readAttr(root.raw, "data-width");
const rootHeight = readAttr(root.raw, "data-height");
const rootStart = readAttr(root.raw, "data-start");
const rootDuration = readAttr(root.raw, "data-duration");
const rootDomId = readAttr(root.raw, "id");

if (!rootDomId) {
  warn("root_missing_id", `root <div data-composition-id="${rootId}"> has no id=... (convention: id="root")`);
  warns++;
}
if (!rootWidth || !rootHeight) {
  fail(
    "root_missing_dimensions",
    `root <div data-composition-id="${rootId}"> missing data-width/data-height — Studio cannot size the stage`
  );
  hardFail++;
} else {
  ok("root_dimensions", `${rootWidth}x${rootHeight}`);
}

// Per the CLI's root_composition_missing_data_start warning, the runtime wants
// data-start="0". But with an inline <video data-start=...>, the video_nested_in_timed_element
// rule fires if the root also has data-start. Surface the tradeoff — don't fail either way.
const inlineVideos = scanAllTags(html, "video");
const videoWithDataStart = inlineVideos.find((v) => readAttr(v.raw, "data-start") !== null);

if (!rootStart) {
  if (videoWithDataStart) {
    warn(
      "root_data_start_omitted_intentionally",
      `root lacks data-start="0" — this is the correct choice when an inline <video data-start=...> exists (avoids video_nested_in_timed_element lint error). Acceptable.`
    );
  } else {
    warn(
      "root_missing_data_start",
      `root <div> missing data-start="0" (CLI lint warns on this; add it if there is no inline <video data-start=...>)`
    );
    warns++;
  }
} else {
  if (videoWithDataStart) {
    fail(
      "root_data_start_conflicts_with_video",
      `root has data-start="${rootStart}" AND an inline <video ${readAttr(videoWithDataStart.raw, "id") ? `id="${readAttr(videoWithDataStart.raw, "id")}"` : ""} data-start=...>. This triggers video_nested_in_timed_element at render time. Either remove data-start from root, or remove data-start from the <video>.`
    );
    hardFail++;
  } else {
    ok("root_data_start", `"${rootStart}"`);
  }
}

// 2) Inline-script timeline registration + duration
const scriptBody = extractInlineScript(html);
const reg = timelineKeyMatchesRoot(scriptBody, rootId);
if (reg.keys.length === 0) {
  fail(
    "no_timeline_registered",
    `no window.__timelines[...] = ... assignment found in <script>. Studio will show 0:00 / 0:00.`
  );
  hardFail++;
} else if (!reg.match) {
  fail(
    "timeline_key_mismatch",
    `root data-composition-id="${rootId}" but <script> registers window.__timelines[${reg.keys
      .map((k) => `"${k}"`)
      .join(", ")}]. Studio will bind to the wrong (or empty) timeline. Fix the key to match the root.`
  );
  hardFail++;
} else {
  ok("timeline_registration", `window.__timelines["${rootId}"]`);
}

if (!hasTimelineContent(scriptBody)) {
  fail(
    "empty_timeline",
    `script body contains no tl.to / tl.from / tl.set / tl.add calls — tl.duration() will be 0 and Studio will show 0:00 / 0:00. Add padding like tl.to({}, { duration: <seconds> }, 0) at minimum.`
  );
  hardFail++;
} else {
  ok("timeline_content", `has .to/.from/.set/.add calls`);
}

// 3) <template data-composition-src="..."> target files exist
const srcs = scanSubCompSrcs(html);
const missing = [];
for (const src of srcs) {
  const abs = join(projectDir, src.replace(/^\.\//, ""));
  if (!existsSync(abs)) missing.push(src);
}
if (missing.length) {
  fail(
    "sub_composition_src_missing",
    `${missing.length} data-composition-src target(s) do not exist: ${missing.join(", ")}`
  );
  hardFail++;
} else if (srcs.length) {
  ok("sub_composition_srcs", `${srcs.length} targets resolved`);
}

// 4) Shader-block count and per-sub-comp URL hint
const shaderCount = countShaderBlocks(html, join(projectDir, "compositions"));
if (shaderCount > 3) {
  warn(
    "shader_heavy_master",
    `${shaderCount} WebGL shader blocks in the master composition. On software-WebGL machines (no hardware accel in Chromium), Studio will stall loading the master URL. Preview individual sub-compositions instead:`
  );
  const subs = listSubCompIds(html);
  for (const { id } of subs.slice(0, 12)) {
    console.log(`    ${ansi.dim("→")} http://localhost:3002/?comp=${encodeURIComponent(id)}`);
  }
}

// 5) Summary
console.log("");
if (hardFail > 0) {
  console.log(
    `${ansi.red("◇")} ${hardFail} blocker(s), ${warns} advisory — preview ${ansi.red(
      "WILL fail"
    )}. Fix blockers before running \`hyperframes preview\`.`
  );
  process.exit(1);
} else if (warns > 0) {
  console.log(
    `${ansi.yellow("◇")} 0 blockers, ${warns} advisory — preview should work. Review advisories if Studio still misbehaves.`
  );
  process.exit(0);
} else {
  console.log(`${ansi.green("◇")} all preflight checks passed`);
  process.exit(0);
}
