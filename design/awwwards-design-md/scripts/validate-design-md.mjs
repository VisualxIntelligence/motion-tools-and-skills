#!/usr/bin/env node
// Validate a generated DESIGN.md + design-evidence.json without dependencies.
// Usage: node validate-design-md.mjs DESIGN.md design-evidence.json
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";

const DOC_LIMIT = 24 * 1024;
const SIDECAR_LIMIT = 256 * 1024;
const SECTIONS = [
  "Overview",
  "Colors",
  "Typography",
  "Layout",
  "Elevation & Depth",
  "Shapes",
  "Components",
  "Do's and Don'ts",
];
const CLASSES = new Set(["observed", "inferred", "proposed"]);

const [docPath, sidecarPath] = process.argv.slice(2);
if (!docPath || !sidecarPath) {
  console.error("usage: node validate-design-md.mjs DESIGN.md design-evidence.json");
  process.exit(2);
}

const failures = [];
const fail = (message) => failures.push(message);

// Remove fenced blocks (``` or ~~~) before section checks so a fence cannot
// hide or fake a required heading.
function parseYaml(text) {
  const script = [
    "import sys, json",
    "try:",
    "    import yaml",
    "except Exception:",
    "    print('MISSING_PYYAML', file=sys.stderr)",
    "    sys.exit(3)",
    "try:",
    "    data = yaml.safe_load(sys.stdin.read())",
    "except Exception as exc:",
    "    print('YAML_ERROR:' + str(exc), file=sys.stderr)",
    "    sys.exit(2)",
    "print(json.dumps(data))",
  ].join("\n");
  const candidates = process.platform === "win32" ? ["python", "python3"] : ["python3", "python"];
  for (const command of candidates) {
    const run = spawnSync(command, ["-c", script], { input: text, encoding: "utf8" });
    if (run.error && run.error.code === "ENOENT") continue;
    if (run.status === 3) {
      fail("YAML validation needs Python 3 + PyYAML (pip install pyyaml) or run `designmd lint`");
      return undefined;
    }
    if (run.status !== 0) {
      fail(`front matter is not valid YAML: ${(run.stderr || "").replace(/^YAML_ERROR:/, "").trim()}`);
      return undefined;
    }
    try {
      return JSON.parse(run.stdout);
    } catch {
      fail("front matter YAML could not be serialized as JSON");
      return undefined;
    }
  }
  fail("YAML validation needs Python 3 + PyYAML (pip install pyyaml) or run `designmd lint`");
  return undefined;
}

function stripFences(text) {  const out = [];
  let marker = null;
  for (const line of text.split("\n")) {
    if (marker) {
      const close = /^\s*(`{3,}|~{3,})\s*$/.exec(line);
      if (close && close[1][0] === marker[0] && close[1].length >= marker.length) marker = null;
      continue;
    }
    const open = /^\s*(`{3,}|~{3,})/.exec(line);
    if (open) {
      marker = open[1];
      continue;
    }
    out.push(line);
  }
  return out.join("\n");
}
const docFile = resolve(docPath);
const sidecarFile = resolve(sidecarPath);
if (!existsSync(docFile)) fail(`missing ${docFile}`);
if (!existsSync(sidecarFile)) fail(`missing ${sidecarFile}`);
if (failures.length) finish();

const docBytes = statSync(docFile).size;
const sidecarBytes = statSync(sidecarFile).size;
if (docBytes > DOC_LIMIT) fail(`DESIGN.md is ${docBytes} bytes (limit ${DOC_LIMIT})`);
if (sidecarBytes > SIDECAR_LIMIT) fail(`sidecar is ${sidecarBytes} bytes (limit ${SIDECAR_LIMIT})`);

const doc = readFileSync(docFile, "utf8").replace(/\r\n?/g, "\n");
const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(doc);
if (!frontmatter) fail("DESIGN.md has no YAML front matter");
else {
  const required = ["version", "name", "description", "colors", "typography", "rounded", "spacing", "components"];
  const data = parseYaml(frontmatter[1]);
  if (data !== undefined) {
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      fail("front matter must be a YAML mapping");
    } else {
      for (const key of required) {
        if (!Object.prototype.hasOwnProperty.call(data, key)) fail(`front matter is missing ${key}`);
        else if (data[key] === null || data[key] === undefined) fail(`front matter ${key} has no value`);
      }
    }
  }
}
const prose = stripFences(doc);
let cursor = -1;
for (const section of SECTIONS) {
  const at = prose.indexOf(`\n## ${section}\n`);
  if (at < 0) fail(`DESIGN.md is missing H2 section ${section}`);
  else if (at < cursor) fail(`DESIGN.md section ${section} is out of order`);
  else cursor = at;
}
if (/data:image\/[a-z+]+;base64,/i.test(doc)) fail("DESIGN.md embeds a base64 image");

let evidence;
try {
  evidence = JSON.parse(readFileSync(sidecarFile, "utf8"));
} catch (error) {
  fail(`sidecar is not valid JSON: ${error.message}`);
  finish();
}
if (evidence.schemaVersion !== "awwwards-design-evidence-v1") {
  fail(`unexpected schemaVersion ${JSON.stringify(evidence.schemaVersion)}`);
}
for (const field of ["requestedUrlHash", "redactedFinalUrl", "viewport", "captures", "claims", "omissions"]) {
  if (evidence[field] === undefined) fail(`sidecar is missing ${field}`);
}
if (!Array.isArray(evidence.captures) || evidence.captures.length === 0) {
  fail("sidecar has no captures");
}
if (!Array.isArray(evidence.claims)) fail("sidecar claims must be an array");
const captureIds = new Set((evidence.captures ?? []).map((capture) => capture.id));
const artifactByCapture = new Map();
for (const capture of evidence.captures ?? []) {
  for (const field of ["id", "tool", "capturedAt", "sha256", "coverage", "artifactPath"]) {
    if (capture[field] === undefined) fail(`capture ${capture.id ?? "?"} is missing ${field}`);
  }
  if (capture.coverage !== undefined && !["complete", "partial", "unknown"].includes(capture.coverage)) {
    fail(`capture ${capture.id} has invalid coverage ${JSON.stringify(capture.coverage)}`);
  }
  if (typeof capture.artifactPath !== "string" || capture.artifactPath.trim() === "") {
    fail(`capture ${capture.id ?? "?"} artifactPath must be a non-empty string`);
  } else if (typeof capture.sha256 !== "string" || !/^[a-f0-9]{64}$/i.test(capture.sha256)) {
    fail(`capture ${capture.id ?? "?"} sha256 must be a hex SHA-256`);
  } else {
    const artifactFile = resolve(dirname(sidecarFile), capture.artifactPath);
    const sidecarDir = realpathSync(dirname(sidecarFile));
    const realArtifact = existsSync(artifactFile) ? realpathSync(artifactFile) : artifactFile;
    const rel = relative(sidecarDir, realArtifact);
    if (rel.startsWith("..") || isAbsolute(rel)) {
      fail(`capture ${capture.id} artifactPath escapes the sidecar directory`);
    } else if (!existsSync(artifactFile)) {
      fail(`capture ${capture.id} artifact does not exist: ${artifactFile}`);
    } else {
      const artifactBytes = readFileSync(artifactFile);
      const digest = createHash("sha256").update(artifactBytes).digest("hex");
      if (capture.sha256 !== digest) fail(`capture ${capture.id} sha256 does not match ${capture.artifactPath}`);
      let parsed;
      try {
        parsed = JSON.parse(artifactBytes.toString("utf8"));
      } catch {
        fail(`capture ${capture.id} artifact is not valid JSON`);
      }
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        fail(`capture ${capture.id} artifact must be a JSON object`);
      } else {
        artifactByCapture.set(capture.id, parsed);
      }
    }
  }
}
for (const [index, claim] of (evidence.claims ?? []).entries()) {
  if (!claim.id) fail(`claim ${index} has no id`);
  if (!CLASSES.has(claim.classification)) {
    fail(`claim ${claim.id ?? index} has invalid classification ${JSON.stringify(claim.classification)}`);
  }
  if (!captureIds.has(claim.artifactId)) {
    fail(`claim ${claim.id ?? index} references unknown artifactId ${JSON.stringify(claim.artifactId)}`);
  }
  for (const field of ["value", "path", "property", "viewport", "state", "method"]) {
    if (claim[field] === undefined) fail(`claim ${claim.id ?? index} is missing ${field}`);
  }
  const artifact = artifactByCapture.get(claim.artifactId);
  if (!artifact) {
    fail(`claim ${claim.id ?? index} has no loaded artifact for ${JSON.stringify(claim.artifactId)}`);
  } else if (typeof claim.path !== "string" || !claim.path.startsWith("/")) {
    fail(`claim ${claim.id ?? index} path must be a JSON pointer string starting with /`);
  } else {
    const rawParts = claim.path.slice(1).split("/");
    if (rawParts.some((part) => /~(?:[^01]|$)/.test(part))) {
      fail(`claim ${claim.id ?? index} path ${claim.path} has an invalid JSON-pointer escape`);
    } else {
      const parts = rawParts.map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"));
      let node = artifact;
      let found = true;
      for (const part of parts) {
        if (node === null || typeof node !== "object" || !Object.prototype.hasOwnProperty.call(node, part)) {
          found = false;
          break;
        }
        node = node[part];
      }
      if (!found) fail(`claim ${claim.id ?? index} path ${claim.path} does not resolve in ${claim.artifactId}`);
    }
  }
}
if (typeof evidence.redactedFinalUrl !== "string") {
  fail("redactedFinalUrl must be a string");
} else {
  try {
    const finalUrl = new URL(evidence.redactedFinalUrl);
    if (finalUrl.username || finalUrl.password) fail("redactedFinalUrl still contains credentials");
    if (finalUrl.search || finalUrl.hash) fail("redactedFinalUrl still contains a query or fragment");
  } catch {
    fail("redactedFinalUrl is not an absolute URL");
  }
}

function finish() {
  if (failures.length) {
    for (const failure of failures) console.error(`FAIL ${failure}`);
    process.exit(1);
  }
  console.log(
    `PASS ${docBytes} B document, ${sidecarBytes} B sidecar, ${evidence.claims.length} claim(s), ${evidence.captures.length} capture(s)`,
  );
}
finish();
