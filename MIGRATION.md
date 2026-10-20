# Testing01 (version 2) to Testing002 (version 3) migration

## Purpose and scope

Testing01 is being retired. Testing002 remains version 3, with its existing features,
and takes over the existing accounts, products, stores, images, chat and other
application records. The migration does not require the old application to remain
running. New activity uses the normal version-3 databases and upload handling.

This document is deliberately separate from the existing READMEs. Those READMEs were
not edited for this upgrade. Testing01 was inspected read-only; neither its source
nor its database was changed. Testing000 was not changed by this upgrade.

Reviewed source locations:

- Version 2: `F:\Testing01\GitHubQuestIssue34`.
- Version 3: this repository, `F:\Testing002\UminionsWebsite`.

**Implemented and tested locally; not deployed to the public website.** No live
production volume was mounted, modified, or replaced during development. The
checked-in version-2 database is not assumed to contain the public site's data.

## What changed

| File | Upgrade |
| --- | --- |
| [migrate-testing01.cjs](uhub-api/scripts/migrate-testing01.cjs) | Explicit source-to-new-destination import, SQLite-aware backups, complete data-directory copy, isolated staging, integrity/row/sequence/media checks, source-change detection, completion report, and safe repeat behavior. |
| [legacy-compat.cjs](uhub-api/scripts/legacy-compat.cjs) | Missing core tables, legacy product constraint upgrade, and one-time adaptation of saved legacy episodes to version-3 broadcasts/episodes. |
| [init-data.cjs](uhub-api/scripts/init-data.cjs) | Runs legacy compatibility and, for migrated deployments, refuses to seed/start from a directory without the completed migration and all three databases. Existing schema upgrades remain in use. |
| [meme-db.ts](uhub-api/server/meme-db.ts) | Handles legacy user foreign keys while splitting MemeBox data; SQLite cannot enforce those references across attached databases. Actual user lookups still use the account database, not copied/fake users. |
| [products.ts](uhub-api/server/products.ts) | New/replacement product images and store badge/banner images now consistently use `DATA_DIRECTORY`, rather than a different working-directory data folder. |
| [index.ts](uhub-api/server/index.ts) | Broadcast-gallery uploads now use `DATA_DIRECTORY` too. |
| [package.json](uhub-api/package.json) | Adds `migrate:testing01`; API compilation now fails on TypeScript errors instead of masking them with `|| true`. |
| [docker-compose.migration.yml](docker-compose.migration.yml) | Mounts the completed migration directory into the API and matching database browser; requires a supplied JWT secret and enables the migration startup guard. Does not create a missing host directory. |
| [deploy.yml](.github/workflows/deploy.yml) | When the deployment host has a private `.env.migration`, subsequent deployments continue using the migrated-data override instead of switching back to a different volume. Deployment commands fail fast. Existing non-migration deployments keep their prior path. |
| [.gitignore](.gitignore) | Excludes the private `.env.migration` deployment file. |
| [testing01-schema.sql](uhub-api/tests/fixtures/testing01-schema.sql) | Portable, schema-only fixture based on the actual checked-in Testing01 schema; no copied account records. |
| [testing01-migration.test.mjs](uhub-api/tests/testing01-migration.test.mjs) | Populated migration, real HTTP read/write/restart, source preservation, WAL snapshot, missing-media rejection, destination protection, and cutover-guard tests. |

The compiled API output in [uhub-api/dist/server](uhub-api/dist/server) was rebuilt.
No frontend feature was downgraded or replaced.

## Where everything goes

The source is the **entire version-2 persistent data directory**, not just a copy
of `database.sqlite`. In the old Compose deployment it was mounted at `/app/data`
from the `app_data` named volume. Actual Docker volume names may have a Compose
project prefix.

The migration creates a separate destination directory:

| Existing information | Version-3 destination and behavior |
| --- | --- |
| Users, password hashes, original IDs, contact fields, existing roles/moderation flags | Remain in `database.sqlite`, unchanged. Missing role/profile columns are added with version-3 defaults; existing flags are not reassigned. |
| Main-store, personal-store and regional-store products; store IDs, ownership, payment/SKU fields | Original records and IDs stay in `database.sqlite`. Missing version-3 columns are added. A main-store product with a null `store_id` is assigned the existing version-3 main-store value `0`. |
| Old `CHECK(store_type IN ('main','user'))` constraint | Rebuilt to also permit version-3 `'store'` records. Original columns, rows, explicit indexes/triggers, and the product autoincrement high-water mark are retained. |
| Stores, carts, trash, looking-for entries, friends, blocked users, messages, reports, chatrooms, archives and unknown extra tables/columns | Copied with the database. Existing records are not deleted or ID-remapped. Missing support tables are created for version-3 routes. Archived/unused legacy tables are retained, not dropped. |
| Old `MainHubUpgradeV001ForBroadcasts` carousel records | Stay in place for the existing UnionNews gallery API. They are not all blindly turned into user broadcasts. |
| Saved `MainHubUpgradeV001ForEpisodes`, images and tags | Episodes with a valid original broadcast owner are also imported into `UserBroadcasts`, `UserBroadcastEpisodes` and `UserBroadcastEpisodeMedia`. Original legacy rows, including subtitles, remain intact. Tags become the version-3 comma-separated format; media/cover/schedule references are retained. |
| Broadcast/episode IDs referenced internally by the legacy format | `Testing01BroadcastMap` and `Testing01EpisodeMap` record their version-3 IDs. A restart does not duplicate them or resurrect an episode intentionally deleted in version 3. These maps do not refer to a running version-2 service. |
| Meme posts, images, comments, votes and favorites | Existing split-database migration moves these tables to `memebox.sqlite`, preserving IDs, sequences, data and supported schema objects. Old inline base64 images remain valid data URLs; newly uploaded memes use version-3 file-backed media. |
| Profile/cover selections and legacy profile images | Existing photo-library initialization imports references into `usersAddedProfileAndCoverImages.sqlite` and keeps compatible URL fields in `users`. Files are present before the one-time photo import runs. New photo activity uses version-3 library storage. |
| Product, store, profile, cover, broadcast and other files under the old data directory | Copied without renaming or re-encoding. Existing `/api/uploads/...` and `/data/...` references continue using the version-3 static routes. Extra unreferenced files are retained too. |
| New activity after takeover | Uses version-3 APIs, databases, permissions and media rules. It does not write back to the old source. |

Legacy episode subtitles and any extra legacy fields that have no equivalent
version-3 UI field are preserved in their original tables; this migration does not
invent a new interface for archived fields.

A preserved legacy cart table is not automatically combined with a different cart
table representing another application's state. The active version-2 and
version-3 product routes both use `MainHubUpgradeV001ForInternalCart`; its contents
are copied intact.

## Preservation and failure guarantees

1. The importer opens source databases read-only and uses SQLite's backup API.
   Committed WAL data is included; raw WAL/shared-memory files are not copied into
   the destination as if they were independent databases.
2. All non-database source files are byte-verified after copying. Symbolic links and
   unsupported filesystem entries are rejected rather than followed outside the
   supplied source tree.
3. Migrations run in a temporary sibling directory. The destination is published
   by renaming that directory only after validation succeeds.
4. Original table row counts and digests of every original column are compared
   after migration, including unknown tables/columns. The documented main-store
   `store_id` normalization is the sole allowed change to an existing value.
   Meme tables are verified in their new database. Original autoincrement
   sequences cannot go backwards.
5. SQLite integrity checks run before/after conversion. Newly introduced
   account-database foreign-key violations fail the import. Pre-existing issues
   are retained and reported as a count, not silently called repaired.
6. Referenced local media under `/api/uploads/` and `/data/` must exist inside the
   copied data tree. Missing files or paths escaping that tree stop publication.
7. The source tree is fingerprinted before/after the operation. A changing source
   is rejected. Use a stable snapshot or stop version-2 writes for the final import;
   this is not continuous replication.
8. A pre-existing destination is never overwritten or merged with beta/demo
   accounts. An identical source snapshot already imported into that destination
   is a no-op, preserving later version-3 writes. A changed source snapshot is
   refused; import it into another new destination instead.
9. `testing01-migration.json` records completion time, snapshot fingerprint,
   original table counts, local reference verification count, and retained
   hosting-reference count. It contains no exported passwords or user rows.
10. With `UHUB_REQUIRE_MIGRATION=1`, startup refuses a missing/invalid completion
    report or missing database. It cannot silently replace a missing migrated
    database with the bundled seed.

The source data and old application are left available for rollback. Do not point
version 2 at the converted destination: MemeBox has changed databases, and new
version-3 records are not a reverse migration.

## Hosting assets, connections and beta data

- Root-relative assets outside `/api/uploads/` or `/data/`, such as `/includes/`,
  `/StoreProductsAndImagery/` or externally hosted URLs, are kept as references.
  They are counted separately, not falsely reported as locally copied files.
  The existing version-3 WordPress bind mounts serve its private include/media
  directories. Those host assets and the same site's external content must remain
  available after the old app is retired; they do not require the old Node process.
- WordPress MySQL and Pantry SQLite are separate from version-2 uHub accounts.
  This import does not replace WordPress/MySQL, convert uHub users into WordPress
  users, overwrite Pantry data, or change the site's URL/proxy/TLS configuration.
- Existing version-3 beta volumes are not modified. The authoritative production
  import goes into a new directory. This is not an automatic merge of two
  independently populated account databases: identical numeric IDs can identify
  different people. No beta data is destroyed by this importer.
- Supply the existing production JWT secret privately at deployment if current
  sessions should remain valid. Password hashes and account IDs are preserved
  independently of session cookies. Cookie policy and origin changes can still
  require a new login; users do not need new passwords.

## Running the import

Build the Testing002 API first. From `uhub-api` on Windows:

```powershell
npm.cmd run build
npm.cmd run migrate:testing01 -- --source "F:\UminionMigration\v2-data" --destination "F:\UminionMigration\v3-data"
```

The source example means a complete, stable copy of the version-2 `/app/data`
directory, including its uploads, profile-images, broadcast-images, and any
additional directories. The destination must **not already exist**, and its parent
must already exist. Do not substitute this repository's sample database for the
public site's populated source data.

The same Node CLI runs on the Linux deployment host with that host's absolute
paths. It does not require Testing01 dependencies, source code or its server after
the data directory has been supplied.

An API image can also run the importer as a one-off process: mount the source
snapshot read-only and a writable destination parent outside the source. Override
the image command with `node scripts/migrate-testing01.cjs --source <mounted-source>
--destination <mounted-parent/new-directory>`. Do not use the normal API startup
command to create the destination before the import.

The importer uses the current API's installed dependencies and compiled migration
modules. It fails rather than downloading tools or returning an empty-success
result. No extra dependency was added for this upgrade.

## Connecting the completed directory to version 3

The optional migration Compose override binds the resulting directory to
`/app/data`. It replaces the API's default data-volume mount by target, rather
than relying on `app_data` and `uhub_data` accidentally resolving to the same
Docker volume.

Create a private `.env.migration` on the deployment host, not in Git:

```dotenv
UHUB_MIGRATED_DATA_DIRECTORY=<absolute completed migration directory on this host>
JWT_SECRET=<existing production JWT secret>
```

Do not use the literal angle-bracket placeholders. The directory is the **completed
destination**, not the source or its parent. The bind mount must be writable by
the API's runtime user. Keep it outside a directory replaced by source deployment.

From the repository root:

```powershell
docker compose --env-file .env.migration -f docker-compose.yml -f docker-compose.migration.yml config --quiet
docker compose --env-file .env.migration -f docker-compose.yml -f docker-compose.migration.yml build uhub-api
docker compose --env-file .env.migration -f docker-compose.yml -f docker-compose.migration.yml up -d uhub-api uhub-sqlite-web
```

These are deployment instructions, **not commands executed against the public
site during this upgrade**. The existing version-3 WordPress/Pantry stack must
also be running for a complete website. The override intentionally leaves their
connections, external network and private media mounts unchanged.

The normal SSH workflow detects `.env.migration` and uses this override for later
full-stack builds/starts too. Do not remove that private file or start the stack
with only the base Compose configuration after cutover: that would select a
different uHub data source. The separate FTP frontend workflow does not migrate
databases or rebuild the API.

Later automatic deployments preserve nonconflicting tracked VPS edits using a
stash, fast-forward to the merged commit, restore those edits and validate/build
before replacing containers, without `compose down` or volume deletion. A stash
conflict stops deployment and retains the stash rather than guessing which
configuration to keep. See the [automatic deployment guide](README.md#automatic-vps-deployment-after-merging)
for checks and exceptional-failure handling. Private `.env.migration` is not
stashed or replaced.

For the final takeover, stop old writes, import the final stable snapshot, start
version 3 on the completed directory, and switch the site's existing traffic
routing to version 3. The old source remains unchanged; do not delete its volume
or use volume-removal commands as part of this change. If rollback is needed
after accepting new version-3 writes, preserve that destination too: reverting
traffic to the old snapshot alone would omit those new writes.

If the process is forcibly killed before publishing, the source and destination
remain unchanged. An exclusive `<destination>.testing01-lock` and a named
`.testing01-import-*` scratch directory can remain. Only remove the specific
abandoned lock/scratch paths after confirming no importer is active; do not
delete a source directory or a completed destination to retry.

## Validation performed

- Strict API build/type-check: `npm.cmd run build` passed.
- Full API regression suite: `npm.cmd test -- --test-concurrency=1` passed: **33 tests,
  33 passed, 0 failed**.
- Populated synthetic version-2 fixtures verify:
  - unchanged source database bytes, original users/password hashes/IDs/roles;
  - every original table/column, extra files/columns, product indexes/triggers,
    ID sequence high-water marks and cart rows;
  - legacy profile/cover images, product files, broadcast cover files, episodes,
    inline base64 memes and comments;
  - real version-3 login and HTTP reads for old products/broadcasts/episodes/photos/memes;
  - byte-identical media responses through both legacy URL prefixes;
  - new regional-store product/image, broadcast-gallery image and file-backed meme
    creation after import;
  - API restart without loss or duplicate episode import;
  - rerunning import without erasing new version-3 products;
  - committed WAL rows; refusal of a changed snapshot, existing beta destination,
    nested destination, missing media or uncompleted cutover directory.
- Existing startup, MemeBox/media, photo-library/editor and mobile-dashboard tests
  remain part of the suite.
- Merged migration Compose configuration was validated without starting or
  replacing any container: both API and browser use the intended bind directory,
  and the migration guard is enabled.
- A separate isolated migration of the actual checked-in Testing01 database
  preserved all 12 source tables and its five products. That clone has zero user
  accounts and no uploaded media tree; populated user/media behavior was therefore
  verified with synthetic fixtures rather than presented as a live-user migration.
- An initial concurrent targeted run hit the existing startup test's 15-second
  startup timeout. The startup test passed in isolation, and the complete suite
  passed sequentially. No failing assertion was suppressed.
- Testing01's tracked-file status remained clean. No production database, live
  connection, or public URL was changed. Existing READMEs were left unchanged.

The persistent deliverable is version-3 migration code, deployment support,
compiled API output, regression fixtures/tests, and this document. Local
validation databases are disposable test outputs, not a replacement for the
public site's authoritative data.
