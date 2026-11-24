#!/usr/bin/env node
// Transcribe a video/audio file with ElevenLabs Scribe -> word-level JSON.
// Workspace default for ad-hoc transcription. See CLAUDE.md "Ad-hoc transcription".
//
// Usage:
//   node scripts/transcribe-elevenlabs.mjs <input> [options]
//
// Defaults:
//   --output  <input-without-ext>.json next to the source
//   --model   scribe_v1
//   --language en
//   --diarize (use --no-diarize to disable)
//   audio extraction: mono 16 kHz mp3 @ 64 kbps via ffmpeg (deleted after upload
//     unless --keep-audio). Audio inputs are uploaded as-is.
//
// Reads ELEVENLABS_API_KEY from process.env or the workspace .env file.

import { readFileSync, writeFileSync, existsSync, statSync, unlinkSync, openAsBlob } from "node:fs";
import { dirname, join, resolve, basename, extname } from "node:path";
import { spawnSync } from "node:child_process";
import { argv, exit, env } from "node:process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = resolve(SCRIPT_DIR, "..");
const ENDPOINT = "https://api.elevenlabs.io/v1/speech-to-text";
const AUDIO_EXTS = new Set([".mp3", ".wav", ".flac", ".m4a", ".aac", ".ogg", ".opus", ".webm"]);

function die(msg, code = 1) {
  console.error(msg);
  exit(code);
}

// --- parse args ---
const args = argv.slice(2);
if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  console.log(
    `Usage: node scripts/transcribe-elevenlabs.mjs <input> [--output path] ` +
      `[--model scribe_v1|scribe_v1_experimental] [--language en] [--no-diarize] ` +
      `[--tag-audio-events] [--keep-audio]`,
  );
  exit(args.length === 0 ? 1 : 0);
}

const opts = {
  input: null,
  output: null,
  model: "scribe_v1",
  language: "en",
  diarize: true,
  tagAudioEvents: false,
  keepAudio: false,
};
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--output" || a === "-o") opts.output = args[++i];
  else if (a === "--model") opts.model = args[++i];
  else if (a === "--language" || a === "--lang") opts.language = args[++i];
  else if (a === "--no-diarize") opts.diarize = false;
  else if (a === "--diarize") opts.diarize = true;
  else if (a === "--tag-audio-events") opts.tagAudioEvents = true;
  else if (a === "--keep-audio") opts.keepAudio = true;
  else if (a.startsWith("--")) die(`unknown option: ${a}`);
  else if (!opts.input) opts.input = a;
  else die(`unexpected argument: ${a}`);
}
if (!opts.input) die("no input file given");

const inputPath = resolve(opts.input);
if (!existsSync(inputPath)) die(`input not found: ${inputPath}`);

const inputExt = extname(inputPath).toLowerCase();
const inputDir = dirname(inputPath);
const inputStem = basename(inputPath, extname(inputPath));
const outputPath = resolve(opts.output ?? join(inputDir, `${inputStem}.json`));

// --- load API key (env first, then workspace .env) ---
let apiKey = env.ELEVENLABS_API_KEY ?? env.ELEVEN_API_KEY ?? env.XI_API_KEY;
if (!apiKey) {
  const dotenv = join(WORKSPACE_ROOT, ".env");
  if (existsSync(dotenv)) {
    for (const line of readFileSync(dotenv, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*(ELEVENLABS_API_KEY|ELEVEN_API_KEY|XI_API_KEY)\s*=\s*(.+?)\s*$/);
      if (m) {
        apiKey = m[2].replace(/^["']|["']$/g, "");
        break;
      }
    }
  }
}
if (!apiKey) die("ELEVENLABS_API_KEY not set (env or workspace .env)");

// --- pick upload path: if input is video, extract audio via ffmpeg ---
const isAudio = AUDIO_EXTS.has(inputExt);
let uploadPath = inputPath;
let tempAudioPath = null;

if (!isAudio) {
  tempAudioPath = join(inputDir, `${inputStem}.mp3`);
  console.log(`extracting audio -> ${tempAudioPath}`);
  const ff = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i", inputPath,
      "-vn",
      "-ac", "1",
      "-ar", "16000",
      "-c:a", "libmp3lame",
      "-b:a", "64k",
      tempAudioPath,
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  if (ff.status !== 0) die(`ffmpeg failed:\n${ff.stderr?.toString() ?? ""}`, ff.status ?? 1);
  uploadPath = tempAudioPath;
}

// --- POST to ElevenLabs ---
const sizeMb = (statSync(uploadPath).size / (1024 * 1024)).toFixed(2);
console.log(`uploading ${basename(uploadPath)} (${sizeMb} MB) to ${ENDPOINT} ...`);

const form = new FormData();
form.append("file", await openAsBlob(uploadPath), basename(uploadPath));
form.append("model_id", opts.model);
form.append("timestamps_granularity", "word");
if (opts.language) form.append("language_code", opts.language);
form.append("diarize", String(opts.diarize));
form.append("tag_audio_events", String(opts.tagAudioEvents));

const t0 = Date.now();
const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "xi-api-key": apiKey },
  body: form,
});
const dt = ((Date.now() - t0) / 1000).toFixed(1);

if (!res.ok) {
  const body = await res.text();
  if (tempAudioPath && !opts.keepAudio) unlinkSync(tempAudioPath);
  die(`HTTP ${res.status} after ${dt}s\n${body}`, 1);
}

const json = await res.json();
writeFileSync(outputPath, JSON.stringify(json, null, 2));

if (tempAudioPath && !opts.keepAudio) unlinkSync(tempAudioPath);

const wordCount = Array.isArray(json.words)
  ? json.words.filter((w) => w.type === "word").length
  : 0;
console.log(
  `ok ${dt}s | ${wordCount} words | ${json.audio_duration_secs?.toFixed?.(1) ?? "?"}s audio | ${outputPath}`,
);
