// Sveltia CMS is vendored in the repo (static/admin/sveltia-cms.js), so /admin does not depend
// on a CDN at runtime.
//
//   node scripts/sveltia.mjs check            Warns loudly when the bundle is missing or outdated (never fails)
//   node scripts/sveltia.mjs update [version] Downloads the version (default: latest) and records it
//
// The vendored version is recorded in scripts/sveltia.json.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { styleText } from "node:util";

const PACKAGE = "@sveltia/cms";
const versionFile = new URL("./sveltia.json", import.meta.url);
const bundleFile = new URL("../static/admin/sveltia-cms.js", import.meta.url);

const current = async () => JSON.parse(await readFile(versionFile, "utf8")).version;

async function latestVersion() {
  const res = await fetch(`https://registry.npmjs.org/${PACKAGE}/latest`, {
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error(`npm registry: HTTP ${res.status}`);
  return (await res.json()).version;
}

// styleText drops colors when no terminal is attached or NO_COLOR is set.
function warn(lines) {
  const width = Math.max(...lines.map((l) => l.length)) + 4;
  const line = (text) =>
    styleText(["bold", "white", "bgYellowBright"], `  ${text.padEnd(width - 4)}  `, {
      stream: process.stderr,
    });
  console.warn(["", line(""), ...lines.map(line), line(""), ""].join("\n"));
}

async function check() {
  let vendored;
  try {
    await readFile(bundleFile);
    vendored = await current();
  } catch {
    warn(["SVELTIA CMS MISSING: static/admin/sveltia-cms.js does not exist.", "Run: pnpm sveltia:update"]);
    return;
  }
  let latest;
  try {
    latest = await latestVersion();
  } catch {
    return; // offline or similar: skip the check, never break the build
  }
  if (latest !== vendored) {
    warn([
      `SVELTIA CMS OUTDATED: vendored ${vendored}, available ${latest}.`,
      "Update: pnpm sveltia:update",
      "Then test /admin locally and commit the change.",
    ]);
  }
}

async function update(version) {
  version ??= await latestVersion();
  const url = `https://unpkg.com/${PACKAGE}@${version}/dist/sveltia-cms.js`;
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  await writeFile(bundleFile, Buffer.from(await res.arrayBuffer()));
  await writeFile(versionFile, JSON.stringify({ version }, null, 2) + "\n");
  console.log(styleText("green", `Sveltia CMS ${version} -> ${fileURLToPath(bundleFile)}`));
}

const [command = "check", arg] = process.argv.slice(2);
if (command === "check") await check();
else if (command === "update") await update(arg);
else {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}
