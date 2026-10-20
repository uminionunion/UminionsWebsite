import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const script = readFileSync(new URL('../../scripts/deploy-vps.sh', import.meta.url), 'utf8').replaceAll('\r\n', '\n');
const bash = process.platform === 'win32' ? path.join(process.env.ProgramFiles, 'Git', 'bin', 'bash.exe') : 'bash';

function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'uminion-deploy-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const repo = path.join(root, 'server');
  const bin = path.join(root, 'bin');
  mkdirSync(repo);
  mkdirSync(bin);
  const git = (...args) => {
    const result = spawnSync('git', ['-c', 'core.autocrlf=false', ...args], { cwd: repo, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  const put = (file, content) => {
    const dest = path.join(repo, file);
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, content);
  };
  git('init', '-b', 'main');
  git('config', 'user.name', 'Deployment Test');
  git('config', 'user.email', 'deployment@example.invalid');
  git('config', 'core.autocrlf', 'false');
  put('app.txt', 'old application\n');
  put('server.conf', 'original configuration\n');
  put('docker-compose.yml', 'services: {}\n');
  put('includes/uhub/dist/uhub.js', 'Coming Soon This Week!\n');
  put('.gitignore', '.env.migration\n');
  git('add', '.');
  git('commit', '-m', 'original');
  const original = git('rev-parse', 'HEAD');
  put('app.txt', 'updated application\n');
  put('includes/uhub/dist/uhub.js', 'Coming Soon This Week!!!\n');
  git('add', '.');
  git('commit', '-m', 'release');
  const target = git('rev-parse', 'HEAD');
  git('update-ref', 'refs/remotes/origin/main', target);
  git('switch', '-c', 'fixture-original', original);
  git('branch', '-f', 'main', original);
  git('switch', 'main');
  git('config', 'pull.rebase', 'true');
  writeFileSync(path.join(root, 'deploy.sh'), script);
  const command = (name, content) => writeFileSync(path.join(bin, name), `#!/usr/bin/env bash\nset -eu\n${content}\n`, { mode: 0o755 });
  command('flock', 'test "${LOCK_FAIL:-0}" != 1');
  command('docker', `
printf '%s\\n' "$*" >> "$COMMAND_LOG"
if [[ "$*" == *"build --no-cache"* && "\${BUILD_FAIL:-0}" == 1 ]]; then exit 7; fi
if [[ "$*" == *"up -d"* && "\${UP_FAIL:-0}" == 1 ]]; then exit 8; fi`);
  command('curl', `
printf 'curl %s\\n' "$*" >> "$COMMAND_LOG"
out=''
while [[ $# -gt 0 ]]; do
  if [[ "$1" == -o ]]; then out="$2"; shift; fi
  shift
done
if [[ "\${HTTP_FAIL:-0}" == 1 ]]; then exit 22; fi
if [[ "$out" != /dev/null ]]; then
  if [[ "\${STALE_BUNDLE:-0}" == 1 ]]; then printf 'stale frontend' > "$out"
  else cp includes/uhub/dist/uhub.js "$out"; fi
fi`);
  const log = path.join(root, 'commands.log');
  const run = (env = {}, sha = target) => spawnSync(bash, ['-c', 'export PATH="$(cd "$TEST_BIN" && pwd):$PATH"; exec bash "$TEST_SCRIPT" "$TEST_TARGET"'], {
    cwd: repo,
    encoding: 'utf8',
    env: { ...process.env, TEST_BIN: bin, TEST_SCRIPT: path.join(root, 'deploy.sh'), TEST_TARGET: sha, COMMAND_LOG: log, ...env },
  });
  const commands = () => existsSync(log) ? readFileSync(log, 'utf8') : '';
  return { root, repo, git, put, run, commands, original, target };
}

test('dirty VPS fast-forwards with rebase enabled, restores staged/unstaged edits and preserves an older stash', t => {
  const f = fixture(t);
  f.put('server.conf', 'older saved configuration\n');
  f.git('stash', 'push', '-m', 'existing stash');
  const olderStash = f.git('rev-parse', 'refs/stash');
  f.put('server.conf', 'local VPS configuration\n');
  f.git('add', 'server.conf');
  f.put('server.conf', 'local VPS configuration plus unstaged edit\n');
  f.put('private-untracked.txt', 'private\n');
  f.put('.env.migration', 'private migration settings\n');
  const result = f.run();
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(f.git('rev-parse', 'HEAD'), f.target);
  assert.equal(readFileSync(path.join(f.repo, 'server.conf'), 'utf8'), 'local VPS configuration plus unstaged edit\n');
  assert.equal(f.git('show', ':server.conf'), 'local VPS configuration');
  assert.equal(f.git('rev-parse', 'refs/stash'), olderStash);
  assert.equal(readFileSync(path.join(f.repo, 'private-untracked.txt'), 'utf8'), 'private\n');
  assert.equal(readFileSync(path.join(f.repo, '.env.migration'), 'utf8'), 'private migration settings\n');
  const commands = f.commands();
  assert.ok(commands.includes('--env-file .env.migration -f docker-compose.yml -f docker-compose.migration.yml build --no-cache'));
  assert.ok(commands.indexOf('config --quiet') < commands.indexOf('build --no-cache'));
  assert.ok(commands.indexOf('build --no-cache') < commands.indexOf('up -d --wait --wait-timeout 180'));
  assert.ok(commands.includes('/uhub/dist/uhub.js'));
  assert.ok(!commands.includes('down'));
  assert.match(result.stdout, /VPS deployment verified:/);
});

test('clean VPS deploys without creating a stash or selecting the migration override', t => {
  const f = fixture(t);
  const result = f.run();
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(f.git('stash', 'list'), '');
  assert.ok(f.commands().includes('compose -f docker-compose.yml build --no-cache'));
  assert.ok(!f.commands().includes('.env.migration'));
});

test('conflicting server edits retain their stash and prevent container changes', t => {
  const f = fixture(t);
  f.put('app.txt', 'conflicting VPS application\n');
  const result = f.run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Preserved stash/);
  assert.match(f.git('show', 'stash@{0}:app.txt'), /conflicting VPS application/);
  assert.equal(f.commands(), '');
});

test('an untracked incoming-file collision restores the saved edits and stops deployment', t => {
  const f = fixture(t);
  // This file exists in the incoming commit, but is untracked in the old checkout.
  f.git('switch', 'fixture-original');
  f.put('incoming.txt', 'incoming release\n');
  f.git('add', 'incoming.txt');
  f.git('commit', '-m', 'another release');
  const target = f.git('rev-parse', 'HEAD');
  f.git('update-ref', 'refs/remotes/origin/main', target);
  f.git('switch', 'main');
  f.put('incoming.txt', 'local untracked file\n');
  f.put('server.conf', 'local configuration\n');
  const result = f.run({}, target);
  assert.notEqual(result.status, 0);
  assert.equal(f.git('rev-parse', 'HEAD'), f.original);
  assert.equal(readFileSync(path.join(f.repo, 'server.conf'), 'utf8'), 'local configuration\n');
  assert.equal(readFileSync(path.join(f.repo, 'incoming.txt'), 'utf8'), 'local untracked file\n');
  assert.equal(f.git('stash', 'list'), '');
  assert.equal(f.commands(), '');
});

for (const [name, env] of [
  ['build failure', { BUILD_FAIL: '1' }],
  ['container startup failure', { UP_FAIL: '1' }],
  ['HTTP failure', { HTTP_FAIL: '1' }],
  ['stale served bundle', { STALE_BUNDLE: '1' }],
]) {
  test(`${name} cannot report a successful deployment`, t => {
    const f = fixture(t);
    const result = f.run(env);
    assert.notEqual(result.status, 0);
    assert.ok(!result.stdout.includes('VPS deployment verified:'));
    assert.match(result.stderr, /VPS deployment failed/);
    if (env.BUILD_FAIL) assert.ok(!f.commands().includes('up -d'));
  });
}

test('a second deployment cannot run while the VPS lock is held', t => {
  const f = fixture(t);
  const result = f.run({ LOCK_FAIL: '1' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Another VPS deployment is running/);
  assert.equal(f.git('rev-parse', 'HEAD'), f.original);
  assert.equal(f.commands(), '');
});

test('divergent server commits are never reset or overwritten', t => {
  const f = fixture(t);
  f.put('server.conf', 'committed server change\n');
  f.git('add', '.');
  f.git('commit', '-m', 'server-only commit');
  const local = f.git('rev-parse', 'HEAD');
  const result = f.run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /divergent or newer commits/);
  assert.equal(f.git('rev-parse', 'HEAD'), local);
  assert.equal(f.commands(), '');
});
