import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source = await readFile(new URL('../../includes/uhub/src/main.tsx', import.meta.url), 'utf8');
const tree = ts.createSourceFile('main.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const declaration = tree.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'scheduleFirstLoadRefresh');
assert.ok(declaration);
const compiled = ts.transpileModule(`${declaration.getText(tree)}; scheduleFirstLoadRefresh`, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
}).outputText;
const key = 'uhub:first-load-refresh:v1';

function fixture({ navigation = 'navigate', marker, failRead = false, failWrite = false } = {}) {
  const storage = new Map(marker ? [[key, marker]] : []);
  const timers = [];
  const errors = [];
  let reloads = 0;
  let blockedRead = failRead;
  let blockedWrite = failWrite;
  const window = {
    performance: { getEntriesByType: type => { assert.equal(type, 'navigation'); return navigation ? [{ type: navigation }] : []; } },
    sessionStorage: {
      getItem: name => { if (blockedRead) throw new Error('Storage read blocked'); return storage.get(name) ?? null; },
      setItem: (name, value) => { if (blockedWrite) throw new Error('Storage write blocked'); storage.set(name, value); },
    },
    setTimeout: (callback, delay) => { timers.push({ callback, delay }); },
    location: { reload: () => { assert.equal(storage.get(key), 'completed'); reloads++; } },
  };
  const schedule = () => vm.runInNewContext(compiled, { window, console: { error: (...args) => errors.push(args) } })();
  return {
    storage, timers, errors, schedule, window,
    get reloads() { return reloads; },
    blockStorage() { blockedRead = true; blockedWrite = true; },
  };
}

test('schedules exactly one 6000ms timer even if startup executes twice; callback can reload only once', () => {
  const f = fixture();
  f.schedule();
  f.schedule();
  assert.equal(f.timers.length, 1);
  assert.equal(f.timers[0].delay, 6000);
  assert.equal(f.reloads, 0);
  f.timers[0].callback();
  f.timers[0].callback();
  assert.equal(f.reloads, 1);
  assert.equal(f.storage.get(key), 'completed');
});

test('the resulting reloaded document cannot schedule a second refresh, even with a missing storage marker', () => {
  for (const marker of [undefined, 'scheduled', 'completed']) {
    const f = fixture({ navigation: 'reload', marker });
    f.schedule();
    assert.equal(f.timers.length, 0);
    assert.equal(f.reloads, 0);
    assert.equal(f.storage.get(key), 'completed');
  }
});

test('existing session markers and a subsequent visit do not refresh again', () => {
  for (const marker of ['scheduled', 'completed']) {
    const f = fixture({ marker });
    f.schedule();
    assert.equal(f.timers.length, 0);
  }
  const f = fixture({ navigation: null });
  f.schedule();
  assert.equal(f.timers.length, 1, 'First load still schedules without navigation timing support');
});

test('blocked storage explicitly logs and prevents a reload loop at scheduling and completion', () => {
  for (const options of [{ failRead: true }, { failWrite: true }]) {
    const f = fixture(options);
    f.schedule();
    assert.equal(f.timers.length, 0);
    assert.equal(f.errors.length, 1);
  }
  const f = fixture();
  f.schedule();
  f.blockStorage();
  f.timers[0].callback();
  assert.equal(f.reloads, 0);
  assert.equal(f.errors.length, 1);
});
