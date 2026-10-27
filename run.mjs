// Runs the deterministic browser drives in tests/browser/ and aggregates
// their results. Each drive boots the app in headless Chromium (via the
// Chrome DevTools Protocol, Node built-ins only), prints a JSON block
//   { checks: [[name, passed], ...], exceptions: <count> }
// as its final output, and always exits 0 - so the verdict is computed
// here from that block: every check passed and zero page exceptions.
//
// Usage:
//   node tests/browser/run.mjs              # all drives
//   node tests/browser/run.mjs drive83      # one drive
// Browser binary: CHROME_BIN env var, else /opt/meta-chromium/chrome when
// present, else google-chrome from PATH (the drives apply the same rule).
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ALL = ['drive65', 'drive66', 'drive83', 'drive86', 'drive88', 'drive89'];
const names = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
const TIMEOUT_MS = 300000;

function runOne(name) {
  return new Promise(resolve => {
    const p = spawn(process.execPath, [path.join(HERE, name + '.mjs')], { cwd: HERE, env: process.env });
    let out = '', err = '';
    const timer = setTimeout(() => p.kill('SIGKILL'), TIMEOUT_MS);
    p.stdout.on('data', d => { out += d; });
    p.stderr.on('data', d => { err += d; });
    p.on('close', code => { clearTimeout(timer); resolve({ name, code, out, err }); });
  });
}

function parseResults(out) {
  const t = out.trim();
  const i = t.lastIndexOf('\n{');
  const start = i >= 0 ? i + 1 : (t.startsWith('{') ? 0 : -1);
  if (start < 0) return null;
  try { return JSON.parse(t.slice(start)); } catch { return null; }
}

let allPass = true;
for (const name of names) {
  const r = await runOne(name);
  const R = parseResults(r.out);
  if (!R || !Array.isArray(R.checks)) {
    console.log(`${name}: FAIL - no result block (exit ${r.code})` + (r.err ? `\n  stderr: ${r.err.slice(0, 300)}` : ''));
    allPass = false;
    continue;
  }
  const failed = R.checks.filter(c => !c[1]);
  const exc = Array.isArray(R.exceptions) ? R.exceptions.length : (R.exceptions ?? 0);
  const pass = failed.length === 0 && exc === 0;
  if (!pass) allPass = false;
  console.log(`${name}: ${R.checks.length - failed.length}/${R.checks.length} checks, ${exc} exceptions - ${pass ? 'PASS' : 'FAIL'}`);
  for (const [n] of failed) console.log(`  FAILED: ${n}`);
}
console.log(allPass ? 'BROWSER TESTS: PASS' : 'BROWSER TESTS: FAIL');
process.exit(allPass ? 0 : 1);
