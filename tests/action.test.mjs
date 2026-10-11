import assert from 'node:assert/strict';
import { mkdtempSync, copyFileSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

function run(data) {
  const dir = mkdtempSync(path.join(tmpdir(), 'invoker-utils-'));
  try {
    copyFileSync(new URL('../dist/index.js', import.meta.url), path.join(dir, 'action.cjs'));
    writeFileSync(path.join(dir, 'outputs'), '');
    const result = spawnSync(process.execPath, [path.join(dir, 'action.cjs')], { cwd: dir, env: { INPUT_DATA: data, GITHUB_OUTPUT: path.join(dir, 'outputs') }, encoding: 'utf8' });
    return { ...result, outputs: readFileSync(path.join(dir, 'outputs'), 'utf8') };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
test('standalone utils bundle preserves structured outputs without logging values', () => {
  const result = run('{"environment":"stage","secret":"private-token-789","enabled":true,"services":["api"]}');
  assert.equal(result.status, 0);
  assert.match(result.outputs, /data_environment<<[^\n]+\nstage\n/);
  assert.match(result.outputs, /data_secret<<[^\n]+\nprivate-token-789\n/);
  assert.match(result.outputs, /data_enabled<<[^\n]+\ntrue\n/);
  assert.match(result.outputs, /data_services<<[^\n]+\n\["api"\]\n/);
  assert.doesNotMatch(result.stdout, /private-token-789/);
});
test('invalid JSON and non-object input roots fail', () => {
  for (const input of ['{', '[]', 'null', 'true', '"text"']) assert.equal(run(input).status, 1);
});
