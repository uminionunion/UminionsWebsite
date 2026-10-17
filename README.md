# Uminion Website: Architecture and Maintenance Guide

Last updated: 2026-10-16. Start here before changing the website. Keep this README updated alongside changes to navigation, features, APIs, database structure, loading behavior, or deployment. This guide covers the public application and ordinary development workflow.

## 1. System overview

This is not a single React application or a single database:

| Layer | Source | Responsibility |
|---|---|---|
| WordPress / Astra child theme | [wp-content/themes/astra-child](wp-content/themes/astra-child) | Outer page, legacy PHP functionality, mount points, page styling |
| uHub React / TypeScript / Vite | [includes/uhub](includes/uhub) | Main interactive interface, numbered buttons, profiles, stores, feed, broadcasts, chat |
| uHub Express / Kysely / SQLite | [uhub-api](uhub-api) | Accounts, application records, uploads, chat sockets, feature APIs |
| Pantry React / Leaflet | [includes/pantry-finder](includes/pantry-finder) | Standalone pantry launcher and components also imported directly into uHub |
| Pantry Express / Kysely / SQLite | [pantry-api](pantry-api) | Pantry records, location data, geocoding, candidate routes |

WordPress uses MySQL. Each Node service uses its own SQLite database. Do not assume that WordPress accounts, uHub accounts, and pantry records share one schema.

Browser requests follow this path:

```text
Browser -> host nginx -> WordPress / Apache (published port 4002)
  /uhub/dist/                 -> compiled uHub frontend
  /pantry-finder/dist/        -> compiled standalone pantry frontend
  /api/...                   -> uhub-api:4001
  /socket.io/...              -> uhub-api:4001 (chat connection)
  /data/...                  -> uHub runtime static data
  /pantry-api/api/...         -> pantry-api:4000
```

Routing is configured in [apache-uhub-proxy.conf](apache-uhub-proxy.conf), [apache-pantry-proxy.conf](apache-pantry-proxy.conf), and [docker-compose.yml](docker-compose.yml). Use same-origin browser URLs; do not hard-code internal Docker addresses into React.

## 2. Start with the active entry points

- [front-page.php](wp-content/themes/astra-child/front-page.php): outer page markup, substantial inline CSS/JavaScript, legacy media/archive/forms, and React integration. Read surrounding code before changing it.
- [functions.php](wp-content/themes/astra-child/functions.php): child-theme hooks, parent stylesheet, PHP session and CSRF setup.
- [style.css](wp-content/themes/astra-child/style.css): child-theme metadata and stylesheet; not the only location of page CSS.
- [uHub main.tsx](includes/uhub/src/main.tsx): mounts on `emojiLineForGitHubQuest34onFrontPage001`, falling back to `root`, and establishes the isolated root.
- [uHub App.tsx](includes/uhub/src/App.tsx): authentication provider, launcher/autolaunch, profile dialogs, shared-profile URL handling and top-level routing.
- [MainUhubFeatureV001ForMyProfileModal.tsx](includes/uhub/src/features/profile/MainUhubFeatureV001ForMyProfileModal.tsx): main hub composition, desktop/mobile layouts, navigation, feature selection, stores, carousels and many inline feature components.

Important: similarly named `MainHubUpgradeV001...` and `MainUhubFeatureV001...` files coexist. Follow imports from the active entry point before editing; a similar filename is not proof it is used.

## 3. The 10,000 buttons: where and how to modify them

The numbered button area is a hard-coded page/slot map, not 10,000 separate React files and not a SQL-generated menu.

1. Open [MainUhubFeatureV001ForMyProfileModal.tsx](includes/uhub/src/features/profile/MainUhubFeatureV001ForMyProfileModal.tsx).
2. Find `hardCodedCustomButtonPages`: the page-to-slot lookup starts here and spreads `additionalHardCodedCustomButtonPages`.
3. Open [additional-hard-coded-custom-button-pages.ts](includes/uhub/src/features/profile/additional-hard-coded-custom-button-pages.ts) for the extended lookup (starting at page 73).
4. Find `customizableButtonPage` and `setCustomizableButtonPage`: they track the selected page.
5. Follow the renderer's `buttonNumber` branches for labels, icons, styling and click behavior. A number's presence in the lookup does not necessarily mean it already has a dedicated feature.

Lookup values are ordered arrays: numbers identify buttons; string values such as `CustomButtonsPage073sNextPageButton` identify page navigation; `null` represents an empty slot. Preserve slot order and navigation tokens. The current navigation clamps pages to 1 through 715; changing the range requires updating the lookup and navigation limits together.

The renderer handles previous/next string suffixes before feature-specific actions. Some actions are additionally gated by page number, so do not attach a new global number branch without checking that distinction.

Public examples on page 715: button 9998 opens About Us, 9999 opens Terms of Use & Service, and 10000 opens the main Uminion website. The informational modal implementation is in the main hub file.

For a button change:
- Locate its page and slot, then its renderer/click branches.
- Update display and action together; preserve unrelated buttons and page controls.
- If it opens a feature, follow the selected-view state through to that feature's rendering branch.
- For persistence, add or reuse a backend route and database contract rather than storing records in the button lookup.
- Check desktop/mobile layouts, pagination, keyboard access, and visitor/logged-in behavior.
- Rebuild uHub and update this section if the navigation architecture changes.

## 4. Feature-to-file map

Paths below are under [includes/uhub/src](includes/uhub/src), unless a backend is named.

| Task | Start here |
|---|---|
| Hub layout, header/footer, view selection | [features/profile/MainUhubFeatureV001ForMyProfileModal.tsx](includes/uhub/src/features/profile/MainUhubFeatureV001ForMyProfileModal.tsx) |
| Sister Union routes | [features/uminion/MainUhubFeatureV001ForSisterUnionRoutes.tsx](includes/uhub/src/features/uminion/MainUhubFeatureV001ForSisterUnionRoutes.tsx) |
| Login/signup and session state | [features/auth](includes/uhub/src/features/auth), [hooks/useAuth.tsx](includes/uhub/src/hooks/useAuth.tsx); backend [auth.ts](uhub-api/server/auth.ts) |
| Own/other profile, settings, friends | Active `MainUhubFeatureV001For...` components in [features/profile](includes/uhub/src/features/profile); backend [friends.ts](uhub-api/server/friends.ts) |
| My Store, product forms/detail | [MyStoreView.tsx](includes/uhub/src/features/profile/MyStoreView.tsx), [MyStoreProductSection.tsx](includes/uhub/src/features/profile/MyStoreProductSection.tsx), related product modal components |
| Everything / Users' Stores / quadrants | [EverythingProductsList.tsx](includes/uhub/src/features/profile/EverythingProductsList.tsx), [UserStoresQuadrantView.tsx](includes/uhub/src/features/profile/UserStoresQuadrantView.tsx), main hub; backend [products.ts](uhub-api/server/products.ts) |
| World Feed / post rendering | [WorldFeed.tsx](includes/uhub/src/features/profile/WorldFeed.tsx), [FeedEntryCard.tsx](includes/uhub/src/features/profile/FeedEntryCard.tsx), [hooks/usePaginatedFeed.ts](includes/uhub/src/hooks/usePaginatedFeed.ts); backend [social-posts.ts](uhub-api/server/social-posts.ts) |
| MemeBoxes | [TheMemeBoxRenderer.tsx](includes/uhub/src/TheMemeBoxRenderer.tsx), [TheMemeBoxImplementation001.jsx](includes/uhub/src/features/profile/TheMemeBoxImplementation001.jsx); backend [memes.ts](uhub-api/server/memes.ts) |
| MyBroadcasts uploads/recording/schedule UI | [CreateBroadcastView.tsx](includes/uhub/src/features/profile/CreateBroadcastView.tsx); backend [broadcasts.ts](uhub-api/server/broadcasts.ts) |
| UnionRadio playback/calendar | `UnionRadioPlayer` in the main hub file; backend [broadcasts.ts](uhub-api/server/broadcasts.ts) |
| Broadcast image gallery/zoom | [BroadcastCarousel.tsx](includes/uhub/src/features/profile/BroadcastCarousel.tsx), [BroadcastCarouselZoomModal.tsx](includes/uhub/src/features/profile/BroadcastCarouselZoomModal.tsx) |
| Chat | [MainUhubFeatureV001ForChatModal.tsx](includes/uhub/src/features/uminion/MainUhubFeatureV001ForChatModal.tsx); backend [chat.ts](uhub-api/server/chat.ts) |
| UmiMatch / Million-Pixel | Inline feature views in the main hub; backend [umimatch.ts](uhub-api/server/umimatch.ts), [million-pixel.ts](uhub-api/server/million-pixel.ts) |
| Reusable UI, style utilities | [components](includes/uhub/src/components), [lib/utils.ts](includes/uhub/src/lib/utils.ts), [index.css](includes/uhub/src/index.css) |

Frontend state chooses what is visible; backend records provide persistent content. After finding a frontend request, follow its exact URL into the backend route instead of assuming a similarly named component owns the data.

## 5. API and persistent storage

[uhub-api/server/index.ts](uhub-api/server/index.ts) configures Express, upload handling, cookie parsing, route mounts, Socket.IO and startup. Authentication, friends and products mount under `/api/auth`, `/api/friends`, and `/api/products`. Other route modules define their full paths; inspect the route declarations before adding a prefix.

[db.ts](uhub-api/server/db.ts) creates the uHub SQLite connection; [db-types.ts](uhub-api/server/db-types.ts) defines table contracts. [scripts](uhub-api/scripts) contains initialization/startup scripts. Changing a TypeScript table interface alone does not migrate an existing SQL database: update schema initialization/migration logic and preserve existing records.

Both Node services resolve `DATA_DIRECTORY`, falling back to a local `data` directory, and open `database.sqlite` there. In Compose, `uhub_data` and `pantry_data` mount separately at `/app/data`. Uploaded media is runtime data too; [static-serve.ts](uhub-api/server/static-serve.ts) and the upload routes determine its served URLs.

Never commit database files, credentials, session tokens, or production uploads. Back up each live database and media directory before migrations. Do not remove named volumes during normal deployment. UI changes must not silently change API response shapes or bypass server-side checks.

## 6. Pantry Finder and its SQL data

There are two entry paths:
- Standalone: [pantry main.tsx](includes/pantry-finder/src/main.tsx) -> [App.tsx](includes/pantry-finder/src/App.tsx) -> [landing-page.tsx](includes/pantry-finder/src/pages/landing/landing-page.tsx).
- Embedded in uHub: `PantryFinderBroadcastView` in the main hub imports [TheFoodPantryFeature](includes/pantry-finder/src/pages/pantry-feature/the-food-pantry-feature.tsx) directly.

The embedded view requests `/pantry-api/api/pantries` three seconds after opening. Closing it clears the timer and aborts the request. The server returns the collection in one response; the browser filters it and reveals 50 matching records at a time, every three seconds. This is **render batching**, not SQL pagination or 50-row network requests. Changing country/state/category restarts the visible batch. The standalone entry has a separate fetch lifecycle; do not assume the embedded delay applies there.

Data comes from the pantry service's SQLite database, not from a static pantry list. [pantry-api/server/index.ts](pantry-api/server/index.ts) defines pantry CRUD, politician/candidate and geocoding routes. [db.ts](pantry-api/server/db.ts) maps SQL tables; [types.ts](pantry-api/server/types.ts) defines server contracts. Startup [init-db.cjs](pantry-api/scripts/init-db.cjs) initializes schema; [backfill-pantry-locations.cjs](pantry-api/scripts/backfill-pantry-locations.cjs) maintains location metadata.

Frontend modification map:
- Layout/batch size/filters: [the-food-pantry-feature.tsx](includes/pantry-finder/src/pages/pantry-feature/the-food-pantry-feature.tsx).
- Controls/view switching: [pantry-controls.tsx](includes/pantry-finder/src/pages/pantry-feature/pantry-controls.tsx).
- Filter UI: [find-pantry-view.tsx](includes/pantry-finder/src/pages/pantry-feature/find-pantry-view.tsx).
- Countries/states: [countries-data.ts](includes/pantry-finder/src/pages/pantry-feature/countries-data.ts).
- Map/markers: [map.tsx](includes/pantry-finder/src/pages/home/map.tsx), [marker-icons.ts](includes/pantry-finder/src/pages/home/marker-icons.ts).
- Submission/details: [host-pantry-form.tsx](includes/pantry-finder/src/pages/home/host-pantry-form.tsx), [pantry-details-view.tsx](includes/pantry-finder/src/pages/pantry-feature/pantry-details-view.tsx).
- Browser contracts/API base: [types.ts](includes/pantry-finder/src/pages/home/types.ts), [api.ts](includes/pantry-finder/src/lib/api.ts).

Running for Office is disabled, its filter options are commented out, and its automatic politician/candidate fetches are disabled. Preserve that state unless explicitly changing the feature. Leaflet styling and Tailwind scanning of shared pantry components are necessary for the embedded map to display correctly.

## 7. Loading and performance: preserve these boundaries

- [image-load-queue.ts](includes/uhub/src/lib/image-load-queue.ts): general queued media, 4 concurrent loads, decoded-image cache targets of 40 images / 48 MiB. Retained images can exceed eviction targets because they are protected. [QueuedImage.tsx](includes/uhub/src/components/QueuedImage.tsx) integrates it with React.
- [product-image-cache.ts](includes/uhub/src/lib/product-image-cache.ts): separate product media cache, 3 concurrent loads, 48 images / 48 MiB. Stores alternate 2-second work slices; in-flight requests are allowed to finish, so a turn is not a hard network deadline. At most two entries per store, with extra URLs merged into an existing entry. Unfinished work can return indefinitely; a no-progress check stops repeated work and leaves the spinner visible.
- [ProductQueuedImage.tsx](includes/uhub/src/components/ProductQueuedImage.tsx): product image display. Do not route product media or MemeBox media through the general queue indiscriminately.
- [carousel-rotation-queue.ts](includes/uhub/src/lib/carousel-rotation-queue.ts): one browser scheduler visits registered carousels, chooses a random different slide, then waits five seconds before the next visit. There are no independent autoplay clocks for these registered carousels. Manual arrows remain separate.
- The scheduler retains each carousel's image URLs and requests the chosen image through the image cache. **Current implementation caveat:** it races that request against four seconds and advances the index even on timeout/failure; it does not guarantee a ready image or skip a slow slide. `keepPreviousWhileLoading` can keep the previous image visible. Do not describe this as guaranteed network-free display.
- Registration order determines the visit order; instance IDs distinguish multiple covers. Hover state is consulted on a visit. Legacy `intervalMs`/`pickNext` arguments remain in call sites but are ignored by the current hook.
- Carousel metadata is fetched on mount and relevant update events, not on every rotation. No carousel socket is currently implemented; chat Socket.IO is separate.
- Startup all-store request fan-out stays disabled. MemeBox 1 mounts normally; the extra boxes mount on expansion.
- UnionRadio uses the next scheduled time and a single timer, plus `uhub:episodes-changed` and focus refreshes. Retired WordPress video scheduling and old interval pollers must not be casually re-enabled.

User testing found major lag improvements with caches and serialized rotations; occasional transition hitches remain. This is not a measured browser performance profile. Image fetching, decoding, React rendering and paint remain distinct possible costs. Change one performance variable at a time and test on slow connections.

## 8. Build, deployment and validation

Run from the relevant package directory (PowerShell on Windows can use `npm.cmd`):

| Changed source | Command / output |
|---|---|
| uHub, or pantry components imported into uHub | In `includes\uhub`: `npm.cmd run build` -> `dist\uhub.js`, `dist\uhub.css` |
| Standalone pantry | In `includes\pantry-finder`: `npm.cmd run build` -> `dist` |
| uHub API | In `uhub-api`: `npm.cmd run build` -> `dist`; use `npx.cmd tsc --project tsconfig.server.json --noEmit` for an unmasked type check |
| Pantry API | In `pantry-api`: `npm.cmd run build` -> `dist` |

The uHub API build script currently ends with `|| true`; a successful exit code alone does not prove compilation succeeded. Read compiler output and verify emitted files. Frontend Vite builds do not substitute for full TypeScript checks.

[Dockerfile](Dockerfile) copies built frontends, the child theme, and selected public assets into WordPress. The backend Dockerfiles compile their services. Source edits without rebuilding do not update the served frontend bundles. Ensure generated assets are included in delivery; never hand-edit minified output.

[docker-compose.yml](docker-compose.yml) defines WordPress, both APIs, persistent volumes and database browsers. WordPress uses the existing external MySQL/network and private bind mounts. Pantry/uHub API ports are internal; database browsers are loopback-bound on 8091/8092. Preserve these boundaries and inspect the active deployment configuration before restarting services.

[deploy.yml](.github/workflows/deploy.yml) handles the Compose deployment. [AutoDeployWebsite.yml](.github/workflows/AutoDeployWebsite.yml) is a separate FTP delivery path. Check which workflow actually deploys a changed file; editing one does not update the other.

After a functional change, verify: correct feature/view and button page, visitor and logged-in paths, desktop/mobile layout, browser network/console, persisted records after reopening, and timer/request cleanup after closing. For pantry work, check the three-second delay, 50-record increments, filter resets and SQL-backed data. For rotation work, watch for overlapping transitions and test slow image responses.

## 9. Maintenance rules for future changes

1. Read this guide, then follow the current imports and request path in code. The code is the final authority.
2. Keep changes localized. Do not replace the entire main hub file to change one feature.
3. Preserve instance-specific layouts, login gates, and storage contracts.
4. Update both frontend and backend types when changing an API; migrate SQL explicitly where required.
5. Rebuild the actual consuming bundle, especially when editing shared pantry components.
6. Update this README in the same change: file map, navigation, API/storage changes, loading semantics, validation and deployment steps. Document actual behavior, not just the intended outcome.
7. Report what was tested and what remains unverified. Do not treat expected visitor `/api/auth/me` 401 responses as the same as server 500 failures.

### Dialog integration and documentation baseline (2026-10-16)

Dialogs must be mounted in the React render tree, not created as unused JSX inside upload/save callbacks. Callbacks update state; the rendered dialog consumes that state. Validate opening, closing, loading, saving, and refreshing displayed content independently of profile-photo uploads. Retain frontend visibility rules and backend permission checks.

Carousel help text now describes the shared random scheduler and its five-second gap between visits, not independent three-to-six-second rotations. The bottom strip starts with two built-in entries followed by added entries; random rotation does not guarantee that display order.

This README is the maintained architecture reference. Update it whenever implementation changes. Older guides with an OUTDATED notice are historical context, not an implementation specification. Privileged-tool details remain outside this public guide.
