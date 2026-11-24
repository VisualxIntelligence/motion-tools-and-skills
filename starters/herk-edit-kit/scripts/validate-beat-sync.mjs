#!/usr/bin/env node
// Gate 0: transcript-sync validator for an explicit video project.
// Walks index.html, resolves every beat's absolute start time, reads data-anchor
// from each beat HTML file, finds the anchor in assets/transcript.json, and
// enforces -0.2s <= (wordStart - beatStart) <= 1.8s.
//
// Usage:
//   node scripts/validate-beat-sync.mjs                # human table, exit 1 on any FAIL
//   node scripts/validate-beat-sync.mjs --json         # machine-readable
//   node scripts/validate-beat-sync.mjs --suggest-fix  # print absolute data-start per beat
//
// Exit codes: 0 = all green, 1 = any FAIL, 2 = unresolved references / missing file.

import { readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const cliArgs = process.argv.slice(2);
if (cliArgs.includes('--help')) {
  console.log('Usage: node scripts/validate-beat-sync.mjs [project-folder] [--json] [--suggest-fix]');
  process.exit(0);
}
const PROJECT_ROOT = resolve(cliArgs.find(a => !a.startsWith('--')) ?? process.cwd());
const INDEX_HTML = join(PROJECT_ROOT, "index.html");
const TRANSCRIPT_JSON = join(PROJECT_ROOT, "assets", "transcript.json");

const LEAD_MIN = -0.2; // beat may enter up to 0.2s AFTER the anchor word (barely-tolerable)
const LEAD_MAX = 1.8; // and up to 1.8s BEFORE (bigger = premature / disconnected)
const LEAD_SUGGESTED = 0.5; // for --suggest-fix output: target lead

const flags = new Set(process.argv.slice(2));
const JSON_OUT = flags.has("--json");
const SUGGEST = flags.has("--suggest-fix");

/** Parse index.html for every sub-composition beat entry. */
function parseIndex(html) {
  // Match blocks like:
  // <div id="bXXX..." ... data-composition-src="..." data-start="..." data-duration="..." ...></div>
  const beatRe = /<(?:div|template)\b[^>]*\bdata-composition-src\s*=\s*["'][^"']+["'][^>]*>/gi;
  const beats = [];
  let m;
  while ((m = beatRe.exec(html))) {
    const attr = name => m[0].match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1];
    const id = attr('id'), src = attr('data-composition-src');
    const startExpr = attr('data-start'), duration = Number(attr('data-duration'));
    if (!id || startExpr == null || !Number.isFinite(duration) || duration <= 0) throw new Error('Every sub-composition needs id, data-start, and a positive data-duration');
    if (beats.some(b => b.id === id)) throw new Error(`Duplicate beat id: ${id}`);
    beats.push({ id, src, startExpr: startExpr.trim(), duration });
  }
  return beats;
}

/** Resolve absolute start for every beat by walking references. */
function resolveStarts(beats) {
  const byId = new Map(beats.map((b) => [b.id, b]));
  const resolved = new Map();

  function resolveOne(id, stack = new Set()) {
    if (resolved.has(id)) return resolved.get(id);
    if (stack.has(id)) {
      throw new Error(`Circular data-start reference at ${id}`);
    }
    stack.add(id);
    const b = byId.get(id);
    if (!b) throw new Error(`Unknown beat id referenced: ${id}`);
    const expr = b.startExpr;
    // Plain number:
    if (/^-?\d+(\.\d+)?$/.test(expr)) {
      const v = parseFloat(expr);
      resolved.set(id, v);
      return v;
    }
    // "bID" or "bID + N" or "bID - N"
    const refMatch = expr.match(/^([a-z][a-z0-9_-]*?)\s*([+\-]\s*\d+(?:\.\d+)?)?$/i);
    if (!refMatch) {
      throw new Error(`Cannot parse data-start="${expr}" on ${id}`);
    }
    const refId = refMatch[1];
    const offsetStr = refMatch[2];
    const refStart = resolveOne(refId, stack);
    const refBeat = byId.get(refId);
    const baseEnd = refBeat ? refStart + refBeat.duration : refStart;
    let v;
    if (offsetStr == null) {
      // pure "bID" means it starts when bID ends (data-start chained to previous).
      v = baseEnd;
    } else {
      const offset = parseFloat(offsetStr.replace(/\s+/g, ""));
      // "bID + N" and "bID - N" anchor to refStart, not to its end.
      v = refStart + offset;
    }
    resolved.set(id, v);
    return v;
  }

  for (const b of beats) resolveOne(b.id);
  return resolved;
}

/** Read data-anchor from a beat HTML file; returns null if missing. */
function readAnchor(srcRelative) {
  const p = join(PROJECT_ROOT, srcRelative);
  let html;
  try {
    html = readFileSync(p, "utf8");
  } catch (e) {
    return { err: `missing-file: ${srcRelative}` };
  }
  // Root div: the inner div immediately inside <template id="..."> â€” its data-composition-id
  // matches the outer wiring. Match data-anchor on ANY div within the file (first occurrence).
  const m = html.match(/data-anchor\s*=\s*["']([^"']*)["']/);
  if (!m) return { anchor: null };
  return { anchor: m[1].trim() };
}

/** Find the earliest word in transcript at or after minStart whose joined text contains phrase. */
function findAnchorStart(words, phrase, minStart, maxStart = Infinity) {
  if (!phrase) return null;
  const needle = phrase.toLowerCase();
  const needleTokens = needle.split(/\s+/).filter(Boolean);
  if (needleTokens.length === 0) return null;
  // Multi-word match: slide a window over words[] starting at index i; compare joined lower-case
  for (let i = 0; i < words.length; i++) {
    if (words[i].start < minStart) continue;
    if (words[i].start > maxStart) break;
    // Build candidate window = words[i..i+needleTokens.length-1]
    const window = [];
    for (let k = 0; k < needleTokens.length && i + k < words.length; k++) {
      window.push((words[i + k].word || "").toLowerCase());
    }
    const joined = window.join(" ").replace(/[^a-z0-9\/\.\-]/g, " ").replace(/\s+/g, " ").trim();
    const norm = needle.replace(/[^a-z0-9\/\.\-]/g, " ").replace(/\s+/g, " ").trim();
    if (joined.startsWith(norm)) {
      return words[i].start;
    }
    // Also try single-word substring (for things like "/context" inside "slash context")
    if (needleTokens.length === 1) {
      const w = (words[i].word || "").toLowerCase().replace(/[^a-z0-9\/\.\-]/g, "");
      const need = needle.replace(/[^a-z0-9\/\.\-]/g, "");
      if (need && w.includes(need)) return words[i].start;
    }
  }
  return null;
}

/** Load transcript words. Supports top-level array, { words: [...] }, or { segments: [{ words: [...] }] }. */
function loadWords() {
  const raw = JSON.parse(readFileSync(TRANSCRIPT_JSON, "utf8"));
  let words;
  if (Array.isArray(raw)) {
    words = raw;
  } else if (Array.isArray(raw.words)) {
    words = raw.words;
  } else if (Array.isArray(raw.segments)) {
    words = [];
    for (const seg of raw.segments) {
      if (Array.isArray(seg.words)) words.push(...seg.words);
    }
  }
  if (!Array.isArray(words) || words.length === 0) {
    throw new Error("transcript.json has no words[] (checked top-level, .words, .segments[].words)");
  }
  return words.map((w) => ({
    start: typeof w.start === "number" ? w.start : parseFloat(w.start),
    word: (w.word ?? w.text ?? "").toString(),
  }));
}

function main() {
  const html = readFileSync(INDEX_HTML, "utf8");
  const beats = parseIndex(html);
  if (beats.length === 0) {
    console.error("No beats parsed from index.html â€” check the regex / file format");
    process.exit(2);
  }
  const starts = resolveStarts(beats);
  const words = loadWords();

  const rows = [];
  for (const b of beats) {
    const { anchor, err } = readAnchor(b.src);
    const start = starts.get(b.id);
    const row = {
      id: b.id,
      start: round2(start),
      duration: b.duration,
      src: b.src,
      startExpr: b.startExpr,
      anchor: anchor ?? null,
      wordStart: null,
      slack: null,
      status: "OK",
      detail: "",
    };
    if (err) {
      row.status = "ERROR";
      row.detail = err;
      rows.push(row);
      continue;
    }
    if (anchor == null) {
      row.status = "NO-ANCHOR";
      row.detail = "no data-anchor attribute in beat HTML";
      rows.push(row);
      continue;
    }
    const wordStart = findAnchorStart(words, anchor, Math.max(0, start - 10));
    if (wordStart == null) {
      row.status = "ANCHOR-MISS";
      row.detail = `anchor phrase "${anchor}" not found in transcript after t=${(start - 10).toFixed(2)}s`;
      rows.push(row);
      continue;
    }
    row.wordStart = round2(wordStart);
    const slack = wordStart - start;
    row.slack = round2(slack);
    if (slack < LEAD_MIN) {
      row.status = "LATE";
      row.detail = `beat arrives ${Math.abs(slack - LEAD_MIN).toFixed(2)}s too late`;
    } else if (slack > LEAD_MAX) {
      row.status = "EARLY";
      row.detail = `beat leads word by ${slack.toFixed(2)}s (max ${LEAD_MAX}s)`;
    }
    rows.push(row);
  }

  if (JSON_OUT) {
    console.log(JSON.stringify({ rows, LEAD_MIN, LEAD_MAX }, null, 2));
  } else {
    printTable(rows);
  }

  if (SUGGEST) {
    console.log("\n# --- suggested absolute data-start values (anchor - 0.6s lead) ---");
    for (const r of rows) {
      if (r.wordStart != null) {
        const suggested = Math.max(0, r.wordStart - LEAD_SUGGESTED);
        console.log(`${r.id}\tdata-start="${suggested.toFixed(2)}"\t(anchor @ ${r.wordStart}s)`);
      }
    }
  }

  const fails = rows.filter(
    (r) => r.status !== 'OK',
  );
  const warns = rows.filter((r) => r.status === "EARLY");
  if (!JSON_OUT) console.log(
    `\nSummary: ${rows.length} beats | ${rows.length - fails.length} OK | ${fails.length} FAIL | ${warns.length} EARLY`,
  );
  process.exit(fails.length > 0 ? 1 : 0);
}

function round2(n) {
  if (n == null) return null;
  return Math.round(n * 100) / 100;
}

function printTable(rows) {
  const headers = ["id", "start", "dur", "anchor", "wordStart", "slack", "status", "detail"];
  const widths = headers.map((h) => h.length);
  const data = rows.map((r) => [
    r.id,
    r.start != null ? r.start.toFixed(2) : "",
    r.duration.toFixed(2),
    (r.anchor ?? "â€”").slice(0, 32),
    r.wordStart != null ? r.wordStart.toFixed(2) : "",
    r.slack != null ? r.slack.toFixed(2) : "",
    r.status,
    r.detail,
  ]);
  for (const row of data) {
    row.forEach((v, i) => {
      widths[i] = Math.max(widths[i], String(v).length);
    });
  }
  const fmt = (cells) =>
    cells.map((c, i) => String(c).padEnd(widths[i])).join("  ");
  console.log(fmt(headers));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const row of data) console.log(fmt(row));
}

try { main(); } catch (error) { console.error(error.message); process.exitCode = 2; }
