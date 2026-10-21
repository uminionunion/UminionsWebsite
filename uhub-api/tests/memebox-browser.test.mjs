import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const hasCompose = spawnSync('docker', ['compose', 'version'], { encoding: 'utf8' }).status === 0;
const config = migrated => {
  const args = ['compose', '-f', path.join(root, 'docker-compose.yml')];
  if (migrated) args.push('-f', path.join(root, 'docker-compose.migration.yml'));
  args.push('config', '--format', 'json');
  return JSON.parse(execFileSync('docker', args, {
    encoding: 'utf8',
    env: {
      ...process.env,
      JWT_SECRET: 'compose-test-only',
      UHUB_MIGRATED_DATA_DIRECTORY: path.join(root, 'uhub-api', 'data'),
    },
  }));
};

for (const migrated of [false, true]) {
  test(`MemeBox browser uses the API data source and loopback-only port (${migrated ? 'migration' : 'base'})`, { skip: !hasCompose && 'Docker Compose is not installed' }, () => {
    const { services } = config(migrated);
    const browser = services['memebox-sqlite-web'];
    const api = services['uhub-api'];
    const browserMount = browser.volumes.find(volume => volume.target === '/data');
    const apiMount = api.volumes.find(volume => volume.target === '/app/data');
    assert.equal(browserMount.type, migrated ? 'bind' : 'volume');
    assert.equal(browserMount.type, apiMount.type);
    assert.equal(browserMount.source, apiMount.source);
    assert.equal(services['uhub-sqlite-web'].volumes.find(volume => volume.target === '/data').source, apiMount.source);
    assert.equal(browser.ports.length, 1);
    assert.equal(browser.ports[0].host_ip, '127.0.0.1');
    assert.equal(String(browser.ports[0].published), '8093');
    assert.equal(browser.ports[0].target, 8080);
    assert.equal(browser.depends_on['uhub-api'].condition, 'service_healthy');
    assert.equal(browser.restart, 'always');
    assert.equal(browser.image, services['uhub-sqlite-web'].image);
    assert.ok(browser.command.join(' ').includes('sqlite_web --host 0.0.0.0 --port 8080 /data/memebox.sqlite'));
    assert.ok(browser.command.join(' ').includes('if [ ! -s /data/memebox.sqlite ]'));
    assert.ok(browser.command.join(' ').includes('exit 1'));
    assert.ok(browser.healthcheck.test.join(' ').includes('http://127.0.0.1:8080/'));
    if (migrated) assert.notEqual(browserMount.bind.create_host_path, true);
    for (const [service, port] of [['sqlite-web', '8091'], ['uhub-sqlite-web', '8092']]) {
      assert.equal(String(services[service].ports[0].published), port);
      assert.equal(services[service].ports[0].host_ip, '127.0.0.1');
    }
  });
}
