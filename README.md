# Uminion Website: Architecture and Maintenance Guide

Last updated: 2026-10-18. Start here before changing the website. Keep this README updated alongside changes to navigation, features, APIs, database structure, loading behavior, or deployment. This guide covers the public application and ordinary development workflow.

This is the single maintained project guide. [README-ARCHIVE.md](README-ARCHIVE.md) combines the superseded setup and lag guides and is marked OUTDATED throughout its historical sections. Dependency/vendor READMEs are not project instructions and must not be consolidated or deleted. Privileged account tiers, restricted-tool procedures and credentials are deliberately outside both guides.

## Table of contents

- [1. System overview](#1-system-overview)
- [2. Active entry points](#2-start-with-the-active-entry-points)
- [3. The 10,000 buttons](#3-the-10000-buttons-where-and-how-to-modify-them)
- [4. Feature-to-file map](#4-feature-to-file-map)
  - [Mobile dashboard and More rows](#approved-mobile-dashboard-branchexpansion001)
- [5. API and persistent storage](#5-api-and-persistent-storage)
- [6. Pantry Finder and SQL data](#6-pantry-finder-and-its-sql-data)
- [7. Loading and performance](#7-loading-and-performance-preserve-these-boundaries)
  - [Chat loading indicators](#chat-loading-indicators)
- [8. Build, deployment and validation](#8-build-deployment-and-validation)
  - [Launch the live browser / local preview](#launch-the-live-browser--local-preview)
  - [Meme uploads and sound](#meme-uploads-and-independent-sound)
  - [Profile, cover and Photo Library](#profile-cover-and-photo-library-lifecycle)
  - [Input protection and sanitation](#input-protection-and-upload-sanitization)
  - [HTTP 500s and schema compatibility](#reported-http-500-errors-and-schema-compatibility)
- [9. Maintenance rules](#9-maintenance-rules-for-future-changes)
  - [Dialog integration](#dialog-integration-and-documentation-baseline-2026-10-16)
  - [Saved image collections and startup refresh](#saved-image-collections-and-startup-refresh)
  - [Main Cart (internal cart)](#main-cart-internal-cart)
- [10. Navigation and route tracing](#10-navigation-and-route-tracing)
- [11. Patching, rebuilding and safe delivery](#11-patching-rebuilding-and-safe-delivery)
- [12. Troubleshooting and acceptance checklist](#12-troubleshooting-and-acceptance-checklist)
- [Outdated archive](README-ARCHIVE.md)

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

### Approved mobile dashboard: branchExpansion001

The approved Testing000 mobile dashboard has been ported to Testing002. The reactive breakpoint is 767px and below; desktop keeps its existing layout and features. Layout and navigation are in [MainUhubFeatureV001ForMyProfileModal.tsx](includes/uhub/src/features/profile/MainUhubFeatureV001ForMyProfileModal.tsx), with mobile rules in [index.css](includes/uhub/src/index.css).

- The Uminion Union title opens mobile About Us, including the welcome/rally description, coding link, and saved About Us content with applicable administrator editing controls. Login/signup remain beneath the title; the site sound control occupies the top right. The separate welcome/exclamation row and mobile header X are removed. Close uHub is under More.
- For signed-in members, the mute control shares the brand row at the far right; the shared desktop/mobile Logged In status (green dot, gray text) sits directly beneath it, on the username row. Clicking it shows the same red Log Out? confirmation on both layouts. Avatar, brand and username remain on the left; picture/cover editing remains below.
- The circled customizable-button symbols (book, palm/skull, wheel/ship, key, tools, star, projector/image and next-page), plus heart and previous-page controls, use bundled Lucide SVGs in the shared desktop/mobile grid rather than OS-dependent emoji glyphs. Shapes and active-state changes now match across devices; existing actions and paging are unchanged. Unchanged animal/hieroglyph buttons still use their existing characters.
- MemeBox uploads require a nonblank title for every account except authenticated numeric user ID `3`. That account alone may omit both title and description when uploading supported media (MP4/GIF/JPG/JPEG/PNG); the API derives the exemption from the signed-in identity, never a submitted user ID. Text validation, authentication, media limits and sanitization still apply. Descriptions remain optional for everyone, and post-edit/comment validation is unchanged. This is an API behavior change as well as a form update; rebuild/restart the uHub API when deploying it. No database/schema migration is required.

Header/upload verification (2026-10-21): API compilation and focused mobile/media tests passed. Isolated API tests cover untitled ID-3 uploads in all five supported formats, blank/omitted captions, rejection for IDs 1/2/13/30 and string `"3"`, spoofed form identity, invalid caption types, and required media. A real Edge fixture using the built CSS and source-derived header passed 15 member/logout/visitor cases at 320/360/390/430/700px, checking row alignment, far-right positioning, no horizontal overflow and desktop-matching status colors. This does not replace testing on a physical phone.

- Above the cover, shortcuts are Profile (the existing login-gated Home/profile surface), uHome-Hub, UnionRadio, a disabled Coming Soon anvil, and 10,000. The supplied [10,000-button logo](includes/uhub/public/mobile-custom-buttons-logo.png) replaces its former ellipsis. Footer order is Front Page, Stores, a second disabled Coming Soon anvil, and More. The two placeholder anvils have separate IDs and no click actions; the footer placeholder is visibly dimmed.
- The top 10,000 shortcut is the only mobile entry to the customizable-button page. It uses the existing shared page/slot map, actions, permissions, scrolling and page controls (1-715), not a duplicate grid or modal. Its heading is "Your 10,000 Customizable-Buttons:" with only the orange coding link centered underneath. More has three matching full-width rows immediately above the bottom navigation: Friends, Social links & promotions, then Close uHub. Friends retains its existing center-view action, pending-request count and logged-out disabled state, with an upward chevron at the right. Social links & promotions retains its expand/collapse behavior and inserts its contents between that row and Close uHub. Close uHub has an X at the right and uses the original close callback. These rows share background, padding, typography and touch-target sizing; the former outlined buttons below the More heading are removed.
- On the front page, World Feed and the post composer replace the anchor image in the carousel row's left third. The adjacent carousel uses the other two thirds. The collapsed feed is 192px high; clicking, typing or keyboard interaction expands it to two thirds of the row width and 384px high, while the adjacent carousel uses the remaining third. Clicking or focusing outside collapses the feed. Both surfaces remain within their own columns; the old lower feed is not duplicated.
- Unsent mobile post text lives only in page-layout React state in [App.tsx](includes/uhub/src/App.tsx), passed into the main hub. Collapsing the feed, changing mobile sections, switching broadcasts, closing/reopening uHub, or opening About Us does not submit or discard it. Refresh/page teardown, account logout/change, or a successful submission clears it; failed submissions keep the draft and show an error. There is no draft database route or browser-storage persistence.
- The eight mobile MemeBox controls (Previous, Upload, Upvote, Comments, Next, User Posts, Downvote and Favorites) use compact, non-overlapping side rails. Previous/Upload and Next/User Posts stay at the top of the media; Upvote/Comments and Downvote/Favorites stay at its bottom, with a flexible spacer between pairs. The media stack and both rails share grid row 1; title/description/attribution use row 2, so a long caption does not pull the bottom buttons below the image. The mobile viewer uses `display: contents` to share that grid without moving its DOM/event handlers; image/video sizing changes automatically resize the row. Each rail reserves at least 172px for four 40px controls and three 4px gaps. All icon assets and existing actions, counts, media zoom and independent sound behavior are retained. Additional MemeBoxes and the shared credit are hidden only on mobile. The separate creator/alternate-content strip is commented out with a restoration note; desktop keeps its original strip.
- On mobile UnionNews#14 (Front Page) only, the broadcast title and its previous/next arrows appear below the MemeBox instead of above the feed/carousel. Other broadcasts and desktop retain navigation at the top. Broadcast hooks execute before alternate-view returns to avoid hook-order errors when changing broadcasts.
- Stores keeps Browse All Stores with its mountain icon. The left managed product carousel moves from the bottom of mobile uHome-Hub to below the Stores heading/browse controls and above the selected regional store (initially UnionSAM#20). It uses the same saved left-carousel collection and scheduler; desktop placement is unchanged. The numbered uHome-Hub/chat section and unread indicators are available through the top shortcut.
- Mobile profile dialogs, the photo editor, Home/profile and store-browser grids have responsive sizing, scrolling and overflow rules. Existing explicit-save photo behavior, Photo Library ownership/lazy loading and resource cleanup remain intact.
- The prior focused World Feed SQL-injection review found no vulnerability in the submission/read path. The identical Testing002 [social-posts.ts](uhub-api/server/social-posts.ts) inserts post text through Kysely `.values(...)` and applies feed cursors through query-builder comparisons, not SQL string concatenation. Type/length validation supplements parameterization; SQL-looking punctuation remains ordinary post data. This is not a whole-application security audit.

Build with `npm.cmd run build` in `includes/uhub`. The public logo is copied into the build alongside JS/CSS and must be deployed too. [Dockerfile](Dockerfile) copies the complete uHub build directory. A disk build alone does not refresh a running WordPress container; publishing/rebuilding a live environment remains a separate deployment step. This frontend port does not require API/schema changes, database migrations, or copying Testing000 data, uploads, dependencies, credentials or preview configuration.

Regression coverage is in [mobile-dashboard.test.mjs](uhub-api/tests/mobile-dashboard.test.mjs) alongside the existing media/profile tests. Check 320/390/430px mobile layouts and 1440px desktop, visitor/member navigation, both disabled placeholders, feature pagination/actions, exact feed dimensions, draft retention/reset rules, carousel placement, photo editing and library cleanup. Validate against Testing002's own type-check baseline; do not assume its existing unrelated errors are fixed by this mobile port.

Mobile image-edge rail correction: all 10 focused dashboard tests passed, including the eight existing button handlers and row/spacer assertions. A real Edge layout fixture using the generated CSS passed 30 cases across 320/360/390/430/700px container widths and 200/350/600px media heights: first buttons aligned to media top, last buttons aligned to media bottom, no button overlap, and captions below the rails. The frontend was rebuilt and the local preview updated. These fixture checks do not claim a walkthrough of every production post.

Testing002 mobile verification (2026-10-18): all 20 targeted mobile/media/profile/lifecycle tests passed, and the frontend production build passed. Browser checks loaded Testing002's built assets into the existing local preview page with fixture accounts and intercepted mutations; 320/390/430px mobile, 1440px desktop, navigation, feature scrolling, exact feed geometry, draft lifecycle, Stores placement, profile/editor overflow and runtime-error checks passed without real account/post writes. The full frontend compiler reported the same 40 pre-existing diagnostics before and after the initial port (no new messages, ignoring shifted line positions). Initial source/test/logo parity and unchanged non-port files were checked; Testing002's subsequent More-row refinement is an intentional difference from Testing000. No production deployment, API restart or replacement of the Testing000 preview assets was performed.

The subsequent More-row refinement passed the same 20 targeted tests and production build. Browser checks additionally verified identical row background/padding/type sizing and full-width alignment, 44px-or-larger touch targets, row order at all three mobile widths, social expansion/collapse, the member Friends view, visitor disabling and Close uHub. The compiler still reports only the same 40 baseline diagnostics. Both consolidated guides' local links and contents anchors resolve; only the two project README files remain outside vendor dependencies.

Paths below are under [includes/uhub/src](includes/uhub/src), unless a backend is named.

| Task | Start here |
|---|---|
| Hub layout, header/footer, view selection | [features/profile/MainUhubFeatureV001ForMyProfileModal.tsx](includes/uhub/src/features/profile/MainUhubFeatureV001ForMyProfileModal.tsx) |
| Sister Union routes | [features/uminion/MainUhubFeatureV001ForSisterUnionRoutes.tsx](includes/uhub/src/features/uminion/MainUhubFeatureV001ForSisterUnionRoutes.tsx) |
| Login/signup and session state | [features/auth](includes/uhub/src/features/auth), [hooks/useAuth.tsx](includes/uhub/src/hooks/useAuth.tsx); backend [auth.ts](uhub-api/server/auth.ts) |
| Own/other profile, settings, friends | Active `MainUhubFeatureV001For...` components in [features/profile](includes/uhub/src/features/profile); backend [friends.ts](uhub-api/server/friends.ts) |
| Profile/cover editor and Photo Library | [ProfilePhotoEditor.tsx](includes/uhub/src/features/profile/ProfilePhotoEditor.tsx), [UserPhotoLibrary.tsx](includes/uhub/src/features/profile/UserPhotoLibrary.tsx), [MainUhubFeatureV001ForUserProfileModal.tsx](includes/uhub/src/features/profile/MainUhubFeatureV001ForUserProfileModal.tsx); backend [user-photos.ts](uhub-api/server/user-photos.ts) |
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

### UnionNews#14 image pairs and zoom

The broadcast heading is **UnionNews#14 & GGEMMMS#25**, its creator attribution is **by GGEMMMS#25**, and both shared/standalone MemeBox credits read **A GGEMMMS#25 Creation: "The MemeBox"** (two leading Gs).

The green Add button retains its existing high-high-high-admin upload permission. The UnionNews#14 carousel now shows exactly **two images per page** on desktop and mobile. The API's descending `display_order` remains authoritative: new uploads occupy the left slot and shift older images right, then onto subsequent pages. Five uploads appear as `[5, 4]`, `[3, 2]`, `[1, empty]`. A new first image resets the carousel to page one; removing images clamps the active page. Existing manual reorder actions are preserved, and refreshes no longer re-sort by unavailable `created_at` fields.

**Maximum: 183 pages / 366 active images.** Pages are populated as images are uploaded, not shown as 183 empty pages. There is no page 184: once full, a new upload enters page 1 and the last image leaving page 183 is permanently removed from the active carousel and recorded in **ArchiveImagesForUnionNews14**. Page navigation wraps between page 183 and page 1 when full. Other carousels are not subject to this cap.

The archive is a persistent table in the main uHub `database.sqlite`, not a temporary browser list or a deletion folder. It stores `image_id` and `archived_at`; the original image metadata remains in `MainHubUpgradeV001ForBroadcasts` and its bytes stay in the existing `DATA_DIRECTORY/broadcast-images` directory. This preserves IDs, URLs and any historical episode references without destructive moves. Join the archive table to the original table by `image_id = id` to retrieve archived metadata in a future feature. Archive entries never automatically return to the active carousel, even if active entries are removed. Archived media is retained, not made private; existing file URLs remain valid. Include the main database and media directory in backups.

[union-news-archive.ts](uhub-api/server/union-news-archive.ts) archives pre-existing overflow at API startup and enforces the cap in the same immediate SQLite transaction as each upload record insert. An archive failure rolls back that database insert and surfaces an API error. Public gallery reads and manual reorder operations exclude archived IDs. No scheduled job or manual production SQL is needed; rebuild/redeploy the API as well as the frontend.

**Future admin feature TODO:** create an admin-only **ArchiveImagesForUnionNews14** browser/page or plug-in entry point for viewing archived images, metadata and archive dates. No admin archive UI or restore/delete controls are included yet. Any future restore action must explicitly enforce the same 366-active-image cap and define which image is displaced; do not silently reinsert archived images.

Both image slots fill their complete half of the 192px-high container, with no reserved arrow columns, gaps or button padding. UnionNews#14 uses a black background matching uHub on desktop and mobile, including the empty half and the no-images message; other broadcast carousels keep their existing muted background. Paging arrows overlay the outer edges. Thumbnails use `object-cover` to fill each half (cropping when aspect ratios differ); the enlarged viewer fits the complete image without cropping. A lone image stays in the left half, leaving the right half empty. Unrelated carousels retain their configured item counts.

Clicking an image, including as an admin, opens a simple enlarged viewer showing the complete image fitted to the window. There are no zoom percentage, magnification, reset, pan or image-navigation controls. The shared [Dialog](includes/uhub/src/components/ui/dialog.tsx) supplies scoped portal styling, focus management, Escape, outside-click dismissal and a close button. Linked images still enlarge on image click; an explicit **Open link** action preserves external navigation. Reorder buttons occupy only their own hit areas rather than an invisible overlay intercepting the image.

Regression checks: `node --test tests/broadcast-carousel.test.mjs tests/mobile-dashboard.test.mjs` from `uhub-api` (17 tests, including the page-183 boundary and the fitted viewer without magnification controls). The carousel/zoom components also passed a strict targeted TypeScript check before the archive upgrade. An isolated actual Edge browser previously verified exact half-width, full-height images and overlapping arrows at 1200px, 600px and 360px widths; five-image pagination/wrapping; admin click-to-zoom; Escape close; and a single image remaining in the left half. Those checks used synthetic images, not production records. The intermediate 100%-300% controls have since been removed at the user's request.

Archive boundary checks: build the API with `npm.cmd run build`, then run `node --test tests/union-news-archive.test.mjs tests/broadcast-carousel.test.mjs tests/mobile-dashboard.test.mjs tests/startup-api.test.mjs` from `uhub-api`. Synthetic fixtures cover 366/367/368 images, page-183 wraparound, initial overflow, timestamp/metadata/reference preservation, restarts/idempotence, transaction rollback, actual public API filtering and exclusion of archived images from reordering.

Validation for the 183-page upgrade: API TypeScript build, frontend builds and preview launch passed; the archive table exists in the persistent local API database. All 23 targeted archive/carousel/mobile/startup/Testing01-migration tests passed together with `--test-concurrency=1`. No production database was changed by these checks.

## 5. API and persistent storage

[uhub-api/server/index.ts](uhub-api/server/index.ts) configures Express, upload handling, cookie parsing, route mounts, Socket.IO and startup. Authentication, friends and products mount under `/api/auth`, `/api/friends`, and `/api/products`. Other route modules define their full paths; inspect the route declarations before adding a prefix.

[db.ts](uhub-api/server/db.ts) creates the uHub SQLite connection; [db-types.ts](uhub-api/server/db-types.ts) defines table contracts. [scripts](uhub-api/scripts) contains initialization/startup scripts. Changing a TypeScript table interface alone does not migrate an existing SQL database: update schema initialization/migration logic and preserve existing records.

Both Node services resolve `DATA_DIRECTORY`, falling back to a local `data` directory. The pantry service and the main uHub account service each use their own `database.sqlite`. In Compose, `uhub_data` and `pantry_data` mount separately at `/app/data`. The uHub service additionally keeps two independent SQLite files:

- `memebox.sqlite`: all MemeBox posts, media records, comments, votes and favorites. [meme-db.ts](uhub-api/server/meme-db.ts) migrates all `MemeImplementation001*` tables out of the main database, preserving IDs, relationships, indexes and sequences. The migration is transactional and marked complete so deleted content is not resurrected on restart. Account identities stay in the main database; MemeBox reads live account data for attribution. [social-posts.ts](uhub-api/server/social-posts.ts) also reads MemeBox feed/favorite data through the dedicated connection.
- `usersAddedProfileAndCoverImages.sqlite`: photo-library records, captions, original upload purpose, current profile/cover selections and migration bookkeeping, owned by [user-photos-db.ts](uhub-api/server/user-photos-db.ts). Existing nondefault user image URLs and historical files matching the old `profile-USERID-TIMESTAMP` naming convention are imported once. Defaults are excluded. Deleted entries remain deleted on restart. Legacy history is preserved even if it already exceeds the new 100-photo cap; no new uploads are allowed until there is room.

Image/video bytes are stored as files, not enormous SQL blobs: new MemeBox media uses `uploads/memes`; new profile/cover/library media uses `uploads/user-photos`. Legacy MemeBox base64 records remain readable in the separate MemeBox database. Legacy profile files remain readable at their original URLs. The main `users.profile_image_url` and `users.cover_photo_url` fields retain only compatibility URL references so existing account, chat and store displays continue to work; library records, captions and selection ownership live in the photo database. Selection/reference updates share one attached-database transaction.

Uploaded media is runtime data too; [static-serve.ts](uhub-api/server/static-serve.ts) and the upload routes determine its served URLs. `/data` and `/api/uploads` both honor `DATA_DIRECTORY`. Back up **all three uHub SQLite files and their media together**, in addition to the separate pantry database. Do not restore only one side of a migration.

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
- [product-image-cache.ts](includes/uhub/src/lib/product-image-cache.ts): separate product media cache, 3 concurrent loads, 48 images / 48 MiB. Union/users queues alternate individual requests and continuously drain asynchronously, including regional stores and standalone product lists. There are no timed slices, no-progress discards or selected-store activation gate. A stalled image times out after 30 seconds, reports an error and releases its slot so later images still load; failed URLs can be retried. Duplicate URLs share an in-flight request and cached entries use LRU eviction.
- [ProductQueuedImage.tsx](includes/uhub/src/components/ProductQueuedImage.tsx): product image display. Do not route product media or MemeBox media through the general queue indiscriminately.

Store thumbnail correction (2026-10-21): the previous scheduler could discard unfinished batches while their image promises remained unresolved, and paused queued thumbnails outside UnionSAM#20/the store browser. Testing01 used direct browser images, so it did not have these queue gates. Product requests now continue independently, without waiting for every image to finish before displaying successful thumbnails. Loading thumbnails reserve their space; failures are logged and show a clickable Retry instead of silently disappearing. Changing a product URL clears the previous thumbnail. The queue does not modify stored image URLs or migrate product records; missing/invalid server files still require repair.

Store icon controls (eye/search/cart, both in UnionSAM#20 and the mountain store browser) use transparent backgrounds, white SVGs/text, explicit sizing and transparent hover colors. Scoped rules prevent theme-inherited white squares. The Everything list uses a cart SVG instead of a plus and keeps its shuffled order stable across unrelated renders. Eye/search buttons still open product details; the full product-detail modal retains its orange labeled Add to Cart button.

Mountain/Everything follow-up (2026-10-21): the quadrants modal received fetched products as `everythingProducts` but passed its unused, default-empty `allProducts` prop to Everything. This meant no product thumbnail components or requests were created there, even after the API had finished. Everything now renders directly from `everythingProducts`; the unused alias is removed. Opening mountain page 1 requests both main-store and Everything metadata. Metadata failures display an explicit error and Retry. The existing asynchronous thumbnail queue is unchanged by this wiring fix. The cart icon opens a saved purchase URL, or the existing SKU/cart link; products without either open details so visitors can choose their purchase/contact option. It no longer just logs a fake cart success or toggles a pretend in-cart state.

Regression coverage is in [product-images.test.mjs](uhub-api/tests/product-images.test.mjs): 150-image queue drain, fairness/concurrency, failed/stalled requests, retries, deduplication, exact cache limits, URL changes, unmount cleanup and action styles, plus actual QuadrantsModal rendering with supplied Everything products, mountain-open loads, metadata errors/retry and purchase callbacks. The prior isolated image fixture proved the shared thumbnail component but did not test this parent-to-child data connection; do not treat that earlier check as verification of the mountain browser. Rebuilt assets must be deployed; no API/database migration is needed. Missing production media files are not repaired by frontend wiring.

Follow-up verification: 22 targeted product/mobile tests passed. A real Edge fixture using the actual source-derived QuadrantsModal, actual Everything list, thumbnail queue and built CSS passed at 390px and 1200px. Clicking the mountain entry triggered metadata loading, an intentional metadata failure displayed Retry, and retry requested/displayed all 24 synthetic Everything images in under one second on localhost. Eye/search/cart computed styles were transparent with white SVGs, detail clicks worked, and cart icons replaced plus icons. Those localhost timings are not a production latency guarantee.
- [carousel-rotation-queue.ts](includes/uhub/src/lib/carousel-rotation-queue.ts): `useQueuedImageSlot` registers a single-image placeholder at each former auto-changing carousel location (top-left, bottom-left, right, center, each cover, bottom promo). One browser scheduler chooses a different saved entry (cover's second entry for its first change, random afterward; the mobile cover, which also carries the bottom entries, goes in saved order instead), removes the current image from the DOM, requests the replacement through the existing cache path, and fills that same placeholder. It then waits five seconds before the next location. There is no slide track, multi-image rotation, or independent autoplay clock. Manual arrows still select an entry.
- The scheduler retains each location's image URLs and requests the chosen image through the image cache. **Current implementation caveat:** it races that request against four seconds and selects the replacement even on timeout/failure; it does not guarantee a ready image or skip a slow image. The old image is removed first; the slot stays blank until `QueuedImage` has its replacement. These slots no longer use `keepPreviousWhileLoading`; keyed image elements also remove the old image on manual changes. Captions, links, saved collections, management tools, hover pauses and cache limits are preserved. Do not describe this as guaranteed network-free display or a proven fix for long-running lag.
- Registration order determines the visit order; instance IDs distinguish multiple covers. Hover state is consulted on a visit. Obsolete per-carousel interval and next-slide options have been removed. The manually paged broadcast gallery is separate from these queue-controlled image locations.
- Carousel metadata is fetched on mount and relevant update events, not on every rotation. No carousel socket is currently implemented; chat Socket.IO is separate.
- Startup all-store request fan-out stays disabled. MemeBox 1 mounts normally; the extra boxes mount on expansion.
- UnionRadio uses the next scheduled time and a single timer, plus `uhub:episodes-changed` and focus refreshes. Retired WordPress video scheduling and old interval pollers must not be casually re-enabled.

User testing found major lag improvements with caches and serialized rotations; occasional transition hitches remain. This is not a measured browser performance profile. Image fetching, decoding, React rendering and paint remain distinct possible costs. Change one performance variable at a time and test on slow connections.

### Chat loading indicators

[MainUhubFeatureV001ForChatModal.tsx](includes/uhub/src/features/uminion/MainUhubFeatureV001ForChatModal.tsx) has independent username and message spinners. Opening a room, switching tabs, or reconnecting starts both. A nonempty `updateUserList` clears only the username spinner; nonempty `loadMessages` or a received message clears only the message spinner. Empty responses do not dismiss them. Existing error handling, archive behavior and socket transport are unchanged; no new error UI or timeout was added.

## 8. Build, deployment and validation

### Meme uploads and independent sound

The upload button beside "Got Memes? Share Memes:" opens the main MemeBox uploader. It accepts MP4, GIF, JPG, JPEG and PNG, with **1-10 entries per post and at most 50 GiB (50 x 1024 cubed bytes) per file**. Selection errors reject the selection rather than silently dropping extra files. MP4 previews use video elements; image previews use images. Browser object URLs avoid reading complete files into base64 strings, and are revoked on removal, completion or unmount.

[TheMemeBoxImplementation001.jsx](includes/uhub/src/features/profile/TheMemeBoxImplementation001.jsx) sends multipart `media` files, `title` and `description` to authenticated `POST /api/memes/posts`. [meme-upload.ts](uhub-api/server/meme-upload.ts) uses Busboy and backpressure-aware stream pipelines into request-specific temporary disk storage, not the general memory-buffered upload parser. [memes.ts](uhub-api/server/memes.ts) repeats count, extension and byte-size validation, sanitizes the media, moves it to `DATA_DIRECTORY/uploads/memes`, and saves URLs and post metadata together in the dedicated MemeBox database. New posts no longer put large base64 media into SQLite; existing base64 posts still display. Failed saves roll back metadata and remove newly moved files. Temporary request directories are cleaned after success, rejection or disconnect. Owner deletion and the existing downvote auto-delete also remove newly file-backed media. Public `/api/uploads/memes/...` delivery supports video range requests through Express static serving. Back up both SQL and uploaded files.

The application accepts the specified byte limit; this is **not evidence of a completed 50 GiB production upload**. Deploy the updated API, frontend and [Apache proxy configuration](apache-uhub-proxy.conf) together. Apache removes its request-body cap and uses a 24-hour proxy timeout; Node removes its five-minute whole-request deadline, while meme uploads use a 60-second connection-inactivity timeout. Check any external CDN/reverse-proxy upload limits and timeouts separately. Temporary and persistent disks need enough capacity for up to ten such files, including any cross-filesystem copy overhead. Browser/container resources and MP4 codec support also matter; accepting MP4 does not transcode it. Title and description are each limited to 64 KiB during multipart parsing.

The former welcome-area play button had no action. It is now `siteWideMuteButton`, rendered in all three layouts as a speaker with an X while muted and a speaker with sound waves when enabled. [media-sound.ts](includes/uhub/src/lib/media-sound.ts) shares its state across React roots. Each page starts with UnionRadio sound muted; clicking toggles Now Playing audio/video (including replay players), without affecting MemeBoxes. Enabling sound attempts playback of active autoplay media directly from the click; browser playback refusals are logged, and native playback controls remain available.

MemeBox sound is separate and also starts muted for a new user preference. Bottom-right speaker controls on video memes share one setting across MemeBoxes, post changes, zoom playback and favorites detail for that user. Favorites-grid video thumbnails are silent previews, not players. The setting persists in this browser's local storage under a user-specific key (visitors have a separate key) until toggled again. GIFs and still images do not have audio controls. Storage errors are logged; within-page sound changes still work. This is browser-local persistence, not account synchronization between devices.

In `uhub-api`, run `npm.cmd run test:memes` for the focused regression suite: supported formats, ten-entry limit, exact byte boundary validation without allocating a 50 GiB file, disk-backed multipart delivery, SQL rollback and cleanup, aborted uploads, range playback, deletion, independent sound preferences and responsive-player wiring. Tests use an in-memory SQLite database and temporary test files, not live data.

### Profile, cover and Photo Library lifecycle

Both the launcher-avatar edit button and the hub-avatar edit button use [ProfilePhotoEditor.tsx](includes/uhub/src/features/profile/ProfilePhotoEditor.tsx). Before selection, the present picture is on the left and file selection on the right. After selection, controls move to the middle and the new preview appears on the right. Profile previews use a circular frame with `object-contain`, not stretched dimensions. Selection creates a temporary object URL; it does **not** upload or save. Only the orange, black-text **Save** button submits. Cancel discards the selection, and replacement/cancel/unmount revokes preview URLs. Failed saves stay in the editor with an error and never publish a success event.

After an actual successful save, shared auth state is updated without a page reload; [profile-photo-events.ts](includes/uhub/src/lib/profile-photo-events.ts) sends `uhub:profile-photos-changed` so open profiles and libraries refresh their selected URLs. Role flags are preserved; deleted selections apply exact `null` resets. The success message is a colored toast, **"Profile Picture Updated- Successfully!"**, not a browser alert. New uploaded avatars bypass the retained general image queue, avoiding stale queued profile-image state. The old immediate-upload `/api/auth/profile-image` endpoint now returns an explicit refresh-required error instead of allowing an unvalidated alternate upload path.

The former `/api/auth/me` response omitted both saved photo URLs, and the old upload handler did not update shared auth state before reloading. Those are confirmed causes of inconsistent avatar display in the code; the user's exact ten-minute delay was not measured or independently reproduced. Current-account responses now include both image URLs with `Cache-Control: no-store`; login includes the cover URL too. Database errors retrieving the current account are logged as server errors rather than mislabeled invalid-token responses.

The formerly inert **Change Cover** button opens the same explicit-save editor for a cover. A saved personal cover is shown directly and stays selected in the header rather than rotating away through the site's managed images; it also appears in the opened profile's cover area. With no personal cover, the existing managed-cover image queue is unchanged. Both profile and cover displays preserve aspect ratio; clicking the profile portrait or cover inside that profile opens a local full-image zoom.

In [MainUhubFeatureV001ForUserProfileModal.tsx](includes/uhub/src/features/profile/MainUhubFeatureV001ForUserProfileModal.tsx), the left Products for Sale column is preserved. The middle column has two equal-height, independently vertically scrolling sections: Hosted Broadcasts above the unchanged Recent Posts & Episodes content. The right column is Photo Library.

[UserPhotoLibrary.tsx](includes/uhub/src/features/profile/UserPhotoLibrary.tsx) is mounted **only while that user's profile is open**, including one's own profile. It starts with a spinner, fetches `/api/user-photos/:userId`, then retrieves small thumbnails sequentially. It does not preload libraries at site startup or put them in the global retained image cache. Closing the profile aborts metadata/thumbnail requests, unmounts zoom/library images, removes listeners and revokes its thumbnail object URLs. Reopening retrieves a fresh collection. Full originals load only on zoom. New photo originals and thumbnails are served with `Cache-Control: no-store`; browser resource reclamation timing remains browser-managed.

The owner's **+** uploads JPG/JPEG/PNG files only, up to **25 GiB per file**, with **100 photos total across library, profile and cover uploads**. Picking a file for the profile/cover editor does not count until saved. The existing owner Edit button enables clicking library pictures to add/edit a caption (up to **1,000 Unicode characters**) or delete the image. Other users can zoom but cannot modify another user's records. Zoom shows the caption as plain text below the image. Deleting a currently selected image clears that selection and returns its display to the default rather than leaving a broken URL; deleting all pictures resets both selections. Deletions also remove new image files and thumbnails; identifiable historical profile files are removed too.

[user-photos.ts](uhub-api/server/user-photos.ts) defines public metadata/thumbnail retrieval and authenticated owner-only upload, caption and delete endpoints. Size/count checks run server-side too, including a final transactional count check for concurrent requests. The media parser is shared with MemeBox, but limits and accepted formats are separate. Photo-library retrieval failures and save failures are explicit; they are not converted into successful empty results.

### Input protection and upload sanitization

[media-sanitizer.ts](uhub-api/server/media-sanitizer.ts) verifies file contents, not just extensions. JPG/PNG/GIF are decoded and re-encoded through Sharp, stripping copied metadata and honoring EXIF display orientation without resizing or changing proportions; GIF animation is preserved. Sharp's protective pixel limit remains enabled, so pathological/decompression-bomb images can be rejected even below the byte limit. Sanitization is not byte-for-byte preservation, antivirus scanning, or a promise that every possible codec/file is supported.

MP4 inputs must have an MP4 container header; FFmpeg remuxes the video/audio tracks into a clean MP4, removing global metadata, chapters and nonmedia streams. It uses file-only input protocols and argument arrays, not shell interpolation, and does not transcode codecs. Production [uhub-api/Dockerfile](uhub-api/Dockerfile) installs FFmpeg; rebuild the API image, not only the frontend. Native/noncontainer runs need `ffmpeg` on PATH or `FFMPEG_PATH` set to its executable. The development test dependency provides a local executable for real media regression tests. MemeBox comment-image data URLs are also validated and sanitized. Existing stored historical media is preserved by migration rather than silently rewritten.

[input-validation.ts](uhub-api/server/input-validation.ts) rejects malformed text-field types, prototype-shaped keys, excessive nesting and unsupported control characters at HTTP entry; Socket.IO input is checked too, and streamed upload fields are validated after parsing. Plain captions/posts/messages remain text and are escaped by React when rendered. SQL-like apostrophes and punctuation are not stripped: query **values are parameterized** through Kysely or bound SQLite statements, including the new caption/ownership queries. Rich site-page HTML uses a parser-based tag/attribute/style/URL allowlist rather than regex-only removal. This is defense in depth, not a guarantee against every future vulnerability or an instruction to concatenate user values into SQL.

### Reported HTTP 500 errors and schema compatibility

The supplied older schema was missing product columns such as `store_id` and `is_in_trash`, broadcast-image columns such as `image_url`, and the `user_stores` / `chatroom_unread_status` tables. These omissions reproduced the reported store, gallery and unread-status HTTP 500s in an isolated startup test. [init-data.cjs](uhub-api/scripts/init-data.cjs) now adds the required fields/tables idempotently without replacing existing records; main-store products get their expected store-0 reference. Existing timestamps are preserved, while new product/gallery rows get timestamps through compatibility triggers.

This is a confirmed local reproduction, not inspection of the live server database or logs. Deployment must run the normal `npm start` initialization path before serving the API. If production still returns 500s afterward, inspect the corresponding API server logs rather than guessing from browser stack traces. Frontend unread-status loading now checks HTTP status instead of announcing an empty successful load on a failed request.

Requested informational messages for archive visibility, initial gallery fetching and pending-friend-request counts are commented as retired debug output; uncomment only for debugging. Actual request/storage failures remain logged.

Run from the relevant package directory (PowerShell on Windows can use `npm.cmd`):

| Changed source | Command / output |
|---|---|
| uHub, or pantry components imported into uHub | In `includes\uhub`: `npm.cmd run build` -> `dist\uhub.js`, `dist\uhub.css` |
| Standalone pantry | In `includes\pantry-finder`: `npm.cmd run build` -> `dist` |
| uHub API | In `uhub-api`: `npm.cmd run build` -> `dist`; use `npx.cmd tsc --project tsconfig.server.json --noEmit` for an unmasked type check |
| Pantry API | In `pantry-api`: `npm.cmd run build` -> `dist` |

The uHub API build runs TypeScript without masking errors; compilation failures stop the build. Frontend Vite builds do not substitute for full TypeScript checks.

### Launch the live browser / local preview

When the user asks an AI to **"launch the live browser"**, **"open the live view"** or **"start the local preview"**, use this Testing002 repository, run the launcher below, and open **http://localhost:4002/**. This replaces the former Testing000 preview at the same address; do not launch Testing000 alongside it. This is local development, not a production deployment or a Testing01 data migration.

Prerequisites: Docker Desktop running Linux containers, Windows PowerShell, Node/npm, and installed frontend dependencies. If dependencies are missing, run `npm.cmd ci` in the affected frontend package before retrying. The first launch needs internet access to pull Docker images and install the Astra parent theme.

From the repository root:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\local-preview\launch.ps1
```

[launch.ps1](local-preview/launch.ps1) builds both frontends, builds/starts [docker-compose.preview.yml](docker-compose.preview.yml), initializes local WordPress when needed, installs Astra if missing, activates the child theme and checks the home page responds successfully. Wait for its ready message before opening the browser. If startup fails, inspect `docker compose -f docker-compose.preview.yml logs --tail 100`; do not use the production Compose configuration as a fallback.

The preview uses project name `uminion-preview`, reusing the existing local WordPress/MariaDB volumes from the former Testing000 preview without deleting them. It runs its own uHub and Pantry APIs with separate local SQLite/media volumes and its own Docker network; Testing000's API containers are no longer required. It does **not** attach production databases, migration directories, private deployment mounts or the external production network. WordPress alone is published, on loopback port 4002. The local PHP connector deliberately disables legacy external account-database access, so this preview is not validation of those production-only integrations.

For a newly initialized preview only, WordPress administration at `http://localhost:4002/wp-admin/` uses `preview-admin` / `local-preview-only`; existing local administrator accounts are left unchanged. Preview database/JWT values are deliberately local-only, not production credentials. Never deploy this preview configuration publicly.

The preview image contains this repository's child theme, rebuilt frontend bundles, emojis and default assets. Its shared [startup script](scripts/start-wordpress.sh) refreshes only those application assets in the WordPress volume each time the container starts, preserving WordPress configuration and uploads. This avoids stale files in the persistent volume and does not require Windows drive sharing or manual `docker cp`. After frontend, backend, theme or Docker edits, rerun the launcher and refresh the browser (hard refresh if cached); this is a built preview, not hot-module reloading. The launcher also verifies the served frontend contains the updated message. The shared broadcast carousel now displays exactly **"Coming Soon This Week!!!"** when empty; existing uploaded images still render normally. Mobile More uses **"Social Links & Promotions"**.

Validation: the complete Windows launcher passed; the served home page, frontend bundle, main-store products, chat health and Pantry endpoints returned HTTP 200. The served bundle contains both updated labels. All 10 focused mobile-dashboard tests passed, including empty/default carousel messaging and preservation of populated images. These are local build, component and HTTP checks, not a production deployment or a visual browser walkthrough.

To stop without deleting preview data:

```powershell
docker compose -f docker-compose.preview.yml stop
```

Never use `down -v` unless explicitly intending to erase these local databases/uploads. Do not change production Compose or run migration commands to start this preview. Production takeover remains documented separately in [MIGRATION.md](MIGRATION.md).

### Linux Docker build isolation and production retesting

The uHub service builds with `uhub-api` as its Docker context, so the repository-root `.dockerignore` does not apply to it. Its own [.dockerignore](uhub-api/.dockerignore) excludes host `node_modules`, local runtime data, precompiled output, environment files and logs, while retaining `seed`, source, scripts and the lockfile. This prevents `COPY . .` from overwriting Linux-installed dependencies with tracked Windows launchers/native modules, which caused `sh: tsc: Permission denied` (exit 126).

[uhub-api/Dockerfile](uhub-api/Dockerfile) installs the locked dependencies with `npm ci --include=dev` in the builder and `npm ci --omit=dev` in the runtime. Do not fix this by adding `chmod` to the copied host dependencies or restoring `|| true`; both hide rather than solve the context problem. Commit the new context-local ignore file along with the Dockerfile changes.

After pulling these changes, first run `docker compose build --no-cache uhub-api` on the deployment host without bringing down the existing stack. Start/recreate services only after the build succeeds. For the Testing01 takeover, use the completed migration directory and migration Compose commands in [MIGRATION.md](MIGRATION.md), not an unconfigured base Compose invocation. Retain the private `.env.migration` and both Compose files for subsequent builds/starts. This build fix does not itself migrate production data or change volumes, credentials or URLs.

Validation on 2026-10-19: no-cache Linux uHub image builds passed for both Testing002 (through Compose) and Testing000. Disposable, network-isolated runtime checks with synthetic account data passed the chat health endpoint, main-store products and photo-library API; native SQLite, sharp image encoding and system FFmpeg worked, and the runtime excluded TypeScript. No existing containers or data volumes were replaced. npm also reported four dependency advisories (one moderate, two high, one critical); these are unresolved dependency-audit findings, not fixed by build isolation. Passing these checks makes the reported build blocker ready for production retesting, not a claim that every production feature or dependency is cleared for launch.

For this upgrade, run `npm.cmd test` in `uhub-api` after an unmasked `npx.cmd tsc --project tsconfig.server.json`. The suite covers database migration/restart behavior, ownership, sanitized real images/GIF/MP4, upload and caption limits, deletion/default reset, explicit-save behavior, auth synchronization, lazy-library cleanup and all six reported API routes against schema-only fixtures. No live user records are copied into those fixtures. Boundary checks use metadata/small fixtures, not actual 25/50 GiB uploads. Full frontend type-checking still reports pre-existing errors in legacy/other components; the production frontend build and focused new-code checks must be distinguished from that unresolved baseline.

[Dockerfile](Dockerfile) stages built frontends, the child theme and selected public assets outside WordPress's persistent document root. The shared [startup script](scripts/start-wordpress.sh) copies just those application files into the document root before normal WordPress startup, so a reused anonymous/named WordPress volume cannot hide the new frontend. It does not erase WordPress configuration, parent themes, plugins, uploads or private mounts. The backend Dockerfiles compile their services. Source edits without rebuilding do not update the served frontend bundles. Ensure generated assets are included in delivery; never hand-edit minified output.

[docker-compose.yml](docker-compose.yml) defines WordPress, both APIs, persistent volumes and database browsers. WordPress uses the existing external MySQL/network and private bind mounts. Pantry/uHub API ports are internal; database browsers are loopback-bound on 8091/8092/8093. Preserve these boundaries and inspect the active deployment configuration before restarting services.

### SQLite database browsers over SSH

The production Compose stack provides the same `sqlite-web` interface for these databases:

| VPS port | Service | Database | Contents |
| --- | --- | --- | --- |
| 8091 | `sqlite-web` | Pantry `database.sqlite` | Pantry data |
| 8092 | `uhub-sqlite-web` | uHub `database.sqlite` | Accounts, UnionNews carousel and other uHub data |
| 8093 | `memebox-sqlite-web` | uHub `memebox.sqlite` | MemeBox posts, media URLs, comments, votes and favorites |

After pushing/merging this upgrade, the normal VPS deployment starts the persistent MemeBox browser automatically. It restarts with Docker/the host, waits for a healthy uHub API, and refuses to open a missing/empty database rather than creating a misleading blank one. The migration override gives it the same migrated directory as the API and accounts browser. No data import or schema change is required. This service belongs to production Compose, not the isolated local-preview stack.

On your computer, open the MemeBox tunnel:

```bash
ssh -o ExitOnForwardFailure=yes -L 8093:127.0.0.1:8093 root@72.61.7.100
```

Keep that SSH session open, then visit **http://localhost:8093/** in your computer's browser. Use `MemeImplementation001Posts` for titles/descriptions/uploader IDs and `MemeImplementation001Images` for media URLs. Actual media files remain in the API data directory's `uploads/memes/`, not inside SQLite. This is separate from UnionNews carousel uploads, which remain in the main uHub database on 8092.

To tunnel all three browsers in one SSH session:

```bash
ssh -o ExitOnForwardFailure=yes -L 8091:127.0.0.1:8091 -L 8092:127.0.0.1:8092 -L 8093:127.0.0.1:8093 root@72.61.7.100
```

Open `http://localhost:8091/`, `http://localhost:8092/` or `http://localhost:8093/` as needed. WordPress uses external **MySQL**, not SQLite, and is not included in these browsers. Like the existing browsers, the MemeBox interface allows database edits; inspect carefully and back up before changing anything. None of these ports should be exposed publicly or opened in the VPS firewall.

If starting just the new browser manually on the VPS after updating the checkout, use the configuration that matches the running API:

```bash
# With the existing migration configuration:
docker compose --env-file .env.migration -f docker-compose.yml -f docker-compose.migration.yml up -d --wait --wait-timeout 180 memebox-sqlite-web

# Only for a deployment that does NOT use .env.migration:
docker compose up -d --wait --wait-timeout 180 memebox-sqlite-web
```

If a temporary browser from the earlier `docker run` instructions is still using VPS port 8093, stop that specific temporary container before deployment. Do not stop the website or remove data volumes. Diagnose startup with `docker compose logs --tail=80 memebox-sqlite-web` (include the migration flags above on migrated deployments).

Regression coverage: `node --test uhub-api/tests/memebox-browser.test.mjs` checks both base and migration Compose configurations, shared API/browser data sources, loopback-only ports, API readiness dependency, missing-database guard and the browser health check (requires Docker Compose). An isolated container check also verified that the real sqlite-web UI lists a synthetic MemeBox table and stored post, its health check succeeds, and a missing database fails explicitly. No production data or running website containers were used for that check.

### Automatic VPS deployment after merging

[deploy.yml](.github/workflows/deploy.yml) is the only automatic workflow: each push/merge to `main` creates one **Deploy to VPS** run. Opening/updating a pull request or pushing a feature branch does not start a separate run or deploy production. Validation and deployment remain two jobs inside that single run; deployment waits for validation to pass. It can also be rerun manually on `main` from Actions. Keep using the existing push-branch, merge-on-GitHub workflow; no routine VPS login is required for nonconflicting server edits.

The confirmed failure in VPS run `39376735582` was `cannot pull with rebase: You have unstaged changes`. Git synchronization belongs in the deployment workflow, not a Dockerfile. The workflow fetches `main` and runs [deploy-vps.sh](scripts/deploy-vps.sh) from the triggering commit, even if the server still has the older workflow/script checked out. It:

1. Serializes GitHub deployments and takes a VPS-side lock. The checkout must already be on `main`; divergent/server-only commits or existing unresolved conflicts produce explicit failures, never a reset.
2. Stashes tracked server edits only when needed. Untracked/ignored files, including private `.env.migration`, are left in place; it never uses `git clean`, `reset --hard` or `stash --all`.
3. Fast-forwards to the exact triggering merge commit. This is the fetch/update equivalent of `git pull --ff-only`, without the server's `pull.rebase` setting interfering or silently deploying a later commit.
4. Restores the exact stash, including staged edits, before building; drops that stash only after successful restoration, leaving older stashes untouched. If an update fails, restoration is attempted before exiting. A restore conflict preserves the stash and stops before Docker runs: conflicts cannot safely be auto-resolved by choosing either version. Inspect the Actions error and resolve those exceptional conflicts explicitly.
5. Validates Compose, runs `build --no-cache`, then `up -d --wait --wait-timeout 180`. There is no `docker compose down`: current containers keep serving during source synchronization/build. Failed builds do not stop them. Service replacement can still cause a brief interruption; startup failures are surfaced, not automatically rolled back.
6. Uses `.env.migration` and both Compose files whenever that private file exists, preserving the migrated data binding. Without it, the existing base Compose setup is used. Do not remove that file after migration.
7. Checks the home page, store/chat/Pantry endpoints and compares the HTTP-served uHub JavaScript byte-for-byte with the deployment bundle before reporting success. A stale volume/cache or unsuccessful endpoint fails deployment explicitly.

The workflow allows 40 minutes for remote commands and 45 minutes for its job, rather than the SSH action's former 10-minute default. The VPS needs Bash, Git, Docker Compose with `--wait` support, `flock`, `curl` and `cmp`. Keep application data in the existing Docker volumes/private mounts or completed migration directory, not in tracked source files. Server-local edits are preserved, not silently made the repository's authoritative source: commit intentional code changes through GitHub when practical.

The frontends remain built artifacts copied by the production Dockerfile. Include rebuilt `includes/uhub/dist` and any changed Pantry bundle in the commit; `docker compose build` does not run their Vite builds. **"Coming Soon This Week!!!"** is the visible marker for this deployment test. The local preview does not prove GitHub-to-VPS deployment: after merging, check **Deploy to VPS** in Actions and hard-refresh the public site to confirm the three exclamation marks.

[AutoDeployWebsite.yml](.github/workflows/AutoDeployWebsite.yml) is retained as **Legacy FTP deployment (manual only)**, with no push or pull-request trigger. It no longer runs alongside VPS deployments after merges. Use its manual Actions button only when intentionally updating the separate legacy FTP target. Its last observed connection timeout is not repaired by disabling automatic runs; do not treat this retained workflow as a second required VPS deployment. Historical runs remain visible in GitHub; trigger changes affect future events after merging.

Deployment regression checks use disposable local Git repositories and mocked Docker/HTTP commands (never production data): `node --test uhub-api/tests/deploy-vps.test.mjs`. They cover dirty/clean checkouts, staged edits, older stash preservation, migration arguments, conflicts, untracked collisions, divergent commits, locking, failed builds/startups/HTTP and stale frontend detection. They run before the SSH deployment within the single VPS workflow, not as separate pull-request runs.

Local validation for this deployment upgrade: all 20 focused deployment/mobile-dashboard tests passed; workflow YAML checks and the frontend build passed. A production WordPress image was built and its asset refresh tested against synthetic existing configuration, plugins, uploads and private files, all preserved. The local preview serves the three-exclamation bundle and its home/store/chat/Pantry checks return HTTP 200. No commit was pushed, GitHub deployment triggered or VPS changed by these local checks; end-to-end production confirmation remains the first merged run.

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

Carousel help text describes the shared random scheduler and its five-second gap between visits, not independent three-to-six-second rotations. The cover's first change selects its second saved entry (initially the pantry ad); subsequent changes and other locations are random. Default entries can be edited, reordered or removed like other entries.

This README is the maintained architecture reference. Update it whenever implementation changes. Older guides with an OUTDATED notice are historical context, not an implementation specification. Privileged-tool details remain outside this public guide.

### Saved image collections and startup refresh

[init-data.cjs](uhub-api/scripts/init-data.cjs) imports previously hard-coded display entries into `UhubManagedCarouselItems` once per slot. `UhubCarouselDefaultsImported` records completion, including intentionally emptied collections. Existing side collections are preserved instead of replaced; the former additive cover, anchor and bottom defaults are inserted ahead of their existing entries. Subsequent startup does not reinsert removed entries. Default captions, prices, links and images are now ordinary SQL records; the event-date caption is imported as editable text, not recomputed each visit.

Display and editing use the same `/api/carousels/:slot/items` records. Locations start empty until their SQL-backed response arrives, without flashing outdated hard-coded entries. A successful empty response stays empty instead of restoring deleted content. Limits include all entries: 10 per collection, or 49 for the center. While the original default-cover entry exists, a member's own cover is substituted for that entry; deleting or replacing it removes that substitution. Collection saves delete removed rows before inserting new rows so new uploads survive the replacement transaction. Static source assets are not deleted from disk when their entries are removed.

#### Clickable Up/Down banner ads

The desktop bottom banner row is **100px tall** (2.5× its former 40px `h-10`). The row, the linked-image wrapper and the image all use `h-[100px]`. The desktop top banner stays **160px** (`md:h-40`). A trial 1.5× increase for both banners (240px/150px) was judged too large and reverted. The mobile top cover (`h-32` and `.uhub-mobile-cover`) is unchanged. Widths, `object-cover` fitting and arrows are unchanged. Saved top and bottom banners retain their original `object-cover` fitting; personal top covers retain their original `object-contain` fitting. Button associations must not resize the slots or force captioned images to occupy half the available width.

The supplied red umiMatch and blue Food & Clothing Pantry images live in [public](includes/uhub/public/) and are copied into the built assets. `food-clothing-pantry-banner.jpg` must be the **blue lion** image (top, button 5) and `umimatch-banner.jpg` the **red heart** image (bottom, button 3). An earlier build had the two files' contents swapped (red showed on top with the pantry action); the contents were swapped back with no database change, because the saved rows reference the file names.

**Mobile.** The bottom banner row is not shown on mobile. Instead, the mobile top cover plays the top (Up) entries in saved order, then every bottom (Down) entry that has an image (caption-only entries are skipped), then loops top → bottom → top. Mobile uses this sequential order; desktop keeps the random-after-first-change order. Linked bottom images remain clickable in the mobile cover.

When a banner (or numbered button) opens umiMatch, Find-a-Pantry, Million-Pixel or Beta-Button on mobile, that feature takes the MemeBox's place on the Front Page, which is scrolled into view. A **Close & back to MemeBox** button above the feature (or the feature's own exit) restores the MemeBox. A MemeBox returning from such a feature starts on a random post that the main MemeBox has not shown during this page visit; once all have been shown, the list resets. The first MemeBox load and desktop behavior are unchanged. On API startup, the one-time `banner-button-links-v1` migration adds nullable `button_number` to `UhubManagedCarouselItems` and:

- Replaces only the unedited, unlinked bottom default-cover placeholder with the red ad linked to **button 3 / heart**. The membership caption and other bottom entries remain.
- Inserts the blue ad linked to **button 5 / lion** immediately after the first cover entry, retaining existing entries and IDs. This is only done when the original default cover remains and there is room within the 10-entry limit. Intentionally customized/full/empty collections are not overwritten.
- Records completion in `UhubCarouselDefaultsImported`. Restarting does not duplicate ads, restore deleted ads, or overwrite later admin edits.

The first top-cover change selects the second saved entry, then resumes random selection. The initial cover remains the member's personal cover substituted for the saved default, or the default itself. Personal covers no longer prevent the remaining saved ads from rotating. The shared five-second gap between locations, four-second load timeout, bottom hover/manual pauses and arrows are unchanged; this is not an independent five-second timer per banner.

In the pink **Up** and purple **Down** image editors, each image has **"Would you like to associate this image with a button?"**. Check it, choose a whole number **1-10,000**, then save. Unchecking and saving removes the association; it is optional for both new and existing images. Caption-only bottom entries do not offer image associations. Image actions do not replace separate caption website links.

Both banners invoke the same dispatcher as the numbered feature buttons, resolving the associated button's own page even if the visitor is currently browsing a different button page. Button 3 opens/toggles umiMatch and button 5 opens/toggles Find-a-Pantry exactly like their normal controls. Existing authentication, disabled-feature and page-visibility restrictions still apply; associating an unavailable button does not unlock it. Clicks do not change rotation state or timing. Unassociated images remain noninteractive.

`GET /api/carousels/:slot/items` includes `button_number`. The authenticated highest-admin replace endpoint persists it for cover/bottom only, rejects out-of-range/fractional/non-numeric values and caption-only associations, accepts `null` to unlink, and preserves existing associations when older clients omit the property. Data remains in the main **database.sqlite**, not the MemeBox database. Back up the normal destination before deployment; rebuild **both API and uHub frontend** so the startup schema, banner assets and editor agree. The normal merge-triggered full deployment performs these steps.

Validation: `npm.cmd run build` in the API and frontend, then `node --test tests/banner-actions.test.mjs tests/startup-api.test.mjs tests/mobile-dashboard.test.mjs tests/startup-refresh.test.mjs` in the API. These cover fresh/old-schema migration, custom-entry preservation, repeated startup/deletion, actual multipart save/reorder/unlink/auth checks, source-derived shared actions and editors, first cover selection followed by random rotation, the 160px top and 100px bottom rows, the mobile top-then-bottom sequential cover queue, mobile MemeBox replacement/random restore, and existing mobile/refresh behavior (27 tests). Whole-frontend type-checking still has documented unrelated legacy errors; the production Vite build is separate.

[main.tsx](includes/uhub/src/main.tsx) schedules one full-page reload after 6000 ms on the first application load per tab session. A window-level guard prevents duplicate startup executions from scheduling multiple timers. The existing `uhub:first-load-refresh:v1` session marker is set to `scheduled` before scheduling and to `completed` before reloading; the callback checks its marker so it cannot reload twice. A document whose navigation type is already `reload` never schedules another timer, even if the session marker is missing. Existing session markers remain compatible and are not reset by an upgrade.

The timer does not wait for login or image loading. If session storage is unavailable at scheduling or completion, it logs an error and cancels the automatic refresh rather than risking a loop. No visible countdown is added. `node --test tests/startup-refresh.test.mjs tests/broadcast-carousel.test.mjs tests/mobile-dashboard.test.mjs` from `uhub-api` verifies exactly one 6000ms timer/reload, duplicate startup/callback handling, reload-navigation suppression, retained session markers, blocked storage and the simple fitted image viewer (21 tests).

Validation: all 21 checks passed, the scheduler and simplified image viewer passed targeted strict type-checks, and the rebuilt preview was tested in a fresh actual Edge session. Over 22 seconds there were exactly two main-frame navigations: the initial visit and one automatic reload. A subsequent manual reload with its session marker removed caused no extra automatic reload during the next 10 seconds.

### Main Cart (internal cart)

The Main Cart is uHub's own cart. It lives in the `MainHubUpgradeV001ForInternalCart` table in the main **database.sqlite**. Every uHub add-to-cart button now feeds it. Only logged-in members can use it. A logged-out visitor who presses any cart or add-to-cart button gets the login screen instead.

**Opening it.** The 🛒 next to **Union Store** is the main **View Cart** button. The 🛒 next to **Users' Stores** and the 🛒 in the Store 01–30 headers open the same cart. These buttons have transparent backgrounds and white icons.

- **Desktop:** the cart replaces the MemeBox/center area. Closing it (X) relaunches the MemeBox on a random entry.
- **Mobile:** it opens as a modal like the numbered buttons. Closing it returns the visitor to whatever they were viewing.
- Any code can open it with `window.dispatchEvent(new CustomEvent('uhub-open-main-cart'))`. It also closes on logout.

**Each entry shows:**

- the picture (clicking it opens the product details window);
- the price, the name and the SKU (if there is one);
- **Sold by** the seller (the user who added the product; managed carousel items show *Uminion Union*);
- a quantity when it is above 1;
- a gray **bookmark** (save for later) and a **trash** icon (remove).

The **Saved for later** list sits at the bottom. It shows the same details, but with a **plus** icon that moves the entry back into the cart. An entry whose product was later deleted or trashed shows *No longer available*.

**Checkout is intentionally grayed out** (`disabled`, `.uhub-cart-checkout`). It stays disabled until real store checkout exists. Today the purchase flow is split across pieces that are not connected to uHub:

1. **The external store at `page001.uminion.com/cart`.** Links ending in `?add-to-cart=SKU` open that store's cart in a new tab.
2. **The theme's own add-to-cart buttons.** The old WordPress `front-page.php` has 34 🛒 buttons with `data-sku`. They call `/wp-json/custom/v1/add-to-cart`, which is **not defined in this repository**, and the preview has no WooCommerce. Their "View Cart/Checkout" buttons go to `uminion.com/cart`, not `page001.uminion.com/cart`.

Once WooCommerce (or another payment provider) is connected and the Main Cart can hand its items to a real checkout, enable the Checkout button. **Seller notification TODO:** when a member buys products from another member's store, that seller must automatically receive a message. It must tell them to send the product (with the buyer's shipping details) and what they earned from the sale.

**What each button does:**

| Location | Button | Action |
| --- | --- | --- |
| UnionSAM#20 → Union Store header | 🛒 | Opens the Main Cart |
| UnionSAM#20 → Users' Stores header | 🛒 | Opens the Main Cart |
| Store 01–30 header | 🛒 (transparent, white) | Opens the Main Cart |
| Store 01–30 product rows | 🔍 / 🛒 (transparent, white) | 🔍 opens product details; 🛒 **adds that row's product** to the Main Cart |
| Mountain → Everything list | 🔍 / 🛒 | 🔍 opens product details; 🛒 adds that product to the Main Cart |
| Product details window | 🛒 (transparent, white icon) | Adds that product to the Main Cart |
| Small header/footer carousels | Price button | A price-like label (e.g. `$69.95`) adds that carousel entry to the Main Cart. Any other label (e.g. `u24.gov.ua`) opens the saved website. The title links to the saved website when one exists. |

Adding shows an "Added to your cart" toast in the bottom-right corner. It uses the same gray style as the site's other toasts (`#3f464f` background, `#64748b` border) with white text, and stays above open windows. Adding something already in the cart increases its quantity (1–99) and moves it out of Saved for later.

**API** (`/api/products`, all require login):

- `POST /cart/add {product_id}` adds a real store product (it must exist and not be trashed).
- `POST /cart/add {carousel_item_id}` adds a left/right managed-carousel entry whose price is price-like. It is stored with `product_id = 0` and a snapshot of its name, price, image and SKU. The SKU comes from its `add-to-cart=` link.
- `GET /cart` returns `{items, saved}` with display-ready fields, and `Cache-Control: no-store`.
- `PATCH /cart/:itemId {saved_for_later}` saves an entry for later or moves it back.
- `DELETE /cart/:itemId` removes an entry.

Requests for other members' entries return 403. Banners and website-label carousel entries return 404.

**Schema.** On startup, `scripts/init-data.cjs` adds these columns if they are missing: `saved_for_later` (default 0), `carousel_item_id`, `item_name`, `item_price`, `item_image_url`, `item_sku`. Existing cart rows are kept.

**Frontend files:**

- [internal-cart.ts](includes/uhub/src/lib/internal-cart.ts): API calls, events, the `useMainCart` hook and `isCartPriceLabel`.
- [MainCartView.tsx](includes/uhub/src/features/profile/MainCartView.tsx): the cart UI.
- The dashboard wiring is in [MainUhubFeatureV001ForMyProfileModal.tsx](includes/uhub/src/features/profile/MainUhubFeatureV001ForMyProfileModal.tsx).

**Future upgrade: let logged-out visitors add to cart.** This is not built yet. Logged-out visitors are sent to login on purpose. (Steps when ready:

1. Give each guest a random guest-cart ID in an httpOnly cookie, or keep the guest cart in `localStorage`.
2. Add a nullable `guest_id` column (or a separate guest-cart table) and guest-aware add/view/save/remove endpoints with rate limits.
3. On login or signup, merge the guest cart into the member's cart, combining quantities, then delete the guest rows.
4. Expire abandoned guest carts with a scheduled cleanup.
5. Remove the `requestLogin` gate in `addToMainCart` and `showMainCart`, still requiring login at Checkout if needed.
6. Add tests for guest add, merge and cleanup.)

Still unused/legacy:

- `ProductBox` in the dashboard file and `MyStoreProductSection.tsx` are not displayed.
- `MainHubUpgradeV001ForProductDetailModal.tsx` and `MainHubUpgradeV001ForMyProfileModal.tsx` (which link to `uminion.com/cart`) are not mounted.
- The 34 theme buttons above are untouched.

Validation: `npm.cmd run build` in the API and frontend, then `node --test tests/banner-actions.test.mjs tests/startup-api.test.mjs tests/mobile-dashboard.test.mjs tests/startup-refresh.test.mjs tests/product-images.test.mjs` from `uhub-api` (**36 tests passed**). These cover the API (logged-out 401s, validation, banner and website-label rejection, product and carousel adds, save/move back, re-add, cross-user 403s, delete) and the source wiring. The logged-in desktop and mobile flows, and the logged-out login prompts were checked in Edge against the preview with a temporary account, which was deleted afterwards.

## 10. Navigation and route tracing

Use these search terms within the [main hub](includes/uhub/src/features/profile/MainUhubFeatureV001ForMyProfileModal.tsx) rather than relying on line numbers:

| Surface / state | Search terms and behavior |
|---|---|
| Selected center feature | `centerView`, `broadcastView`, `renderCenterContent`, `BroadcastView` |
| Front page / radio / uploads | `UnionNews#14`, `UnionRadio#15`, `MyBroadcasts`, `UnionRadioPlayer` |
| Embedded tools | `PantryFinderBroadcastView`, `UmiMatchView`, `MillionPixelView` |
| Right store selection | `ALL_STORES`, `centerRightView`; UnionSAM#20 is the union/users-store surface, UnionPolitic#19 includes filtering |
| Desktop layout widths | `leftWidthDesktop`, `centerWidthDesktop`, `rightWidthDesktop` and divider handlers |
| Mobile routing | `useMobileViewport`, `mobileSection`, `mobileContentRef`, `mobileFooterOpen`; breakpoint changes must not violate hook ordering |
| Saved image displays | `RotatingUnionEventCard`, `ManagedProductCarousel`, `HeaderProductCarousel`, `FooterPosterCarousel`, `CoverImageRotator`, `AnchorRotator` |
| Informational content | `SitePageModal`, `useSitePage`, `WelcomeDescription`; public requests use `/api/site-pages/about`, `/api/site-pages/terms`, `/api/site-pages/welcome` |
| Footer links | `socialLinksLeft`, `socialLinksRight`, `socialLinkPagesLeft`, `socialLinkPagesRight` |

The named center states and numbered buttons are not interchangeable: trace a click through state updates into rendering, then trace the rendered component's fetch URL into its route. Avoid copying a new action into several unrelated layouts when a shared handler already owns the behavior.

### Backend route map

Paths are interpreted relative to route mounts in [server/index.ts](uhub-api/server/index.ts); do not add `/api` twice.

| Module | Responsibility |
|---|---|
| [auth.ts](uhub-api/server/auth.ts) | Signup/login/logout, current account and account lookup; current photo uploads belong to the photo routes |
| [friends.ts](uhub-api/server/friends.ts) | Requests, acceptance/rejection, block/report behavior |
| [products.ts](uhub-api/server/products.ts) | Stores/products, user stores, cart/looking-for, trash/restore |
| [memes.ts](uhub-api/server/memes.ts) | MemeBox posts, media, comments, votes and favorites |
| [user-photos.ts](uhub-api/server/user-photos.ts) | Library metadata, thumbnails, photo upload, captions, deletion and current selections |
| [social-posts.ts](uhub-api/server/social-posts.ts) | Post creation, privacy, world/friends/union feeds |
| [broadcasts.ts](uhub-api/server/broadcasts.ts) | Broadcasts, episodes, schedule/calendar, media, archives, managed carousels and site pages |
| [chat.ts](uhub-api/server/chat.ts) | Socket.IO rooms, messages, archives and unread state |
| [umimatch.ts](uhub-api/server/umimatch.ts), [million-pixel.ts](uhub-api/server/million-pixel.ts) | Their respective application features |
| [server/index.ts](uhub-api/server/index.ts) | Remaining upload/gallery/account helpers and service wiring |

Use [db-types.ts](uhub-api/server/db-types.ts) and each dedicated database module for actual column/table names; older docs used conceptual names and are not SQL migration specifications. Existing public reads worth tracing include `/api/carousels/:slot/items`, `/api/episodes/scheduled`, `/api/episodes/calendar`, `/api/feed/world`, `/api/feed/friends` and `/api/feed/union-announcements`.

## 11. Patching, rebuilding and safe delivery

### Before editing

1. Establish the intended workspace and inspect its existing diff. Testing002 and Testing000 are independent workspaces: do not copy an entire folder to port a feature.
2. Identify active imports, shared components, routes, database ownership and generated assets using the maps above. Read surrounding code and existing tests before changing it.
3. Capture relevant validation baselines. If a migration is involved, arrange a consistent backup of all affected SQLite files and uploaded media before startup; do not run real startup scripts simply to test a frontend change.
4. Preserve environment files, secrets, dependency lockfiles unless intentionally changing dependencies, local data, production uploads, private mounts, external networks and database ownership. Do not print or duplicate credential values into documentation.

### Local validation commands

Run these from the project root in PowerShell. They build/test local files, not running services:

```powershell
Set-Location .\includes\uhub
npm.cmd run build
node ..\..\uhub-api\node_modules\typescript\bin\tsc --noEmit --pretty false
Set-Location ..\..\uhub-api
node .\node_modules\typescript\bin\tsc --project tsconfig.server.json --noEmit --pretty false
node --experimental-vm-modules --test tests\mobile-dashboard.test.mjs tests\meme-media.test.mjs tests\profile-editor.test.mjs tests\photo-library-lifecycle.test.mjs
```

For backend/storage/media changes, run `npm.cmd test` in [uhub-api](uhub-api), not just the mobile selectors. Use `npm.cmd run build` there to emit server output, while separately requiring an unmasked compiler check. For standalone pantry changes, build [includes/pantry-finder](includes/pantry-finder); shared pantry components also require rebuilding uHub. For pantry backend changes, build [pantry-api](pantry-api). Install/restore dependencies only when required, with the package's existing manifest and lockfile; do not copy another workspace's dependency directory.

The mobile selectors currently cover 20 tests; counts will change as tests are added. A passing Vite build does not erase the known full-frontend TypeScript baseline. Compare diagnostics by file/code/message, allowing line shifts, and fix any newly introduced failures. `git diff --check` checks patch whitespace. Validate README local paths and table-of-contents anchors after documentation edits.

### Generated assets and deployment boundaries

- Build the source; do not manually edit [includes/uhub/dist](includes/uhub/dist). Include generated JS, CSS and public assets in delivery together, including the mobile custom-button logo. Check the generated output actually changed where intended.
- [Dockerfile](Dockerfile) copies existing frontend build output; it does not run the frontend Vite build. Rebuilding only WordPress with stale local output ships stale UI.
- [uhub-api/Dockerfile](uhub-api/Dockerfile) compiles the API and installs FFmpeg. A profile/media backend upgrade needs that rebuilt API image, not simply a frontend refresh. The normal service start runs schema initialization before the server.
- [docker-compose.yml](docker-compose.yml) expects an external network, external WordPress MySQL and host-specific private bind mounts. It is not a portable clean-machine development launcher. Inspect the intended host's configuration before any Compose operation.
- [deploy.yml](.github/workflows/deploy.yml) is the only automatic workflow on pushes/merges to `main`. Its validation job gates the VPS deployment in the same run. It preserves server edits, fast-forwards, builds without cache while existing containers keep running, then updates services and verifies them; there is no routine Compose `down` or volume deletion. Service replacement may still briefly interrupt requests.
- [AutoDeployWebsite.yml](.github/workflows/AutoDeployWebsite.yml) is manual-only legacy FTP delivery. It uploads selected PHP/includes, existing uHub dist output and the child theme; it is not an API image rebuild and does not run automatically after a merge.
- Rebuilding disk assets alone does not update an existing container volume or a browser already running old code. Verify the intended environment's served asset bytes and browser behavior after an authorized deployment. Do not overwrite Testing000's local preview just to inspect Testing002; asset interception with fixture accounts can validate a Testing002 build without deploying it.

### Data-aware rollback

Keep the previous application build and a consistent pre-migration backup. A frontend-only rollback can restore its prior source/build pair without replacing databases. A backend/schema rollback needs a reviewed compatibility plan and matching data/media backup; do not restore only the main database while leaving dedicated photo/MemeBox databases out of sync. Never use archive prose as an automatic rollback script.

## 12. Troubleshooting and acceptance checklist

| Symptom | Check before changing code |
|---|---|
| UI still looks old after a build | Correct workspace, build success, generated timestamps/content, deployed destination/volume, served JS/CSS/logo, browser cache and open-page reload |
| `/api/auth/me` returns 401 | Expected visitor state versus expired login; distinguish it from 500/database failures |
| Store/gallery/unread request returns 500 | Exact request URL, API logs, deployed server build, `DATA_DIRECTORY`, normal initialization and schema repair; do not hide failure behind empty success |
| New profile picture is delayed or reverts | Successful explicit Save, auth response URLs, photo-change event subscription, current selections in photo DB and compatibility URLs; do not reintroduce forced reloads |
| Empty library or persistent spinner | Metadata/thumbnail HTTP status, ownership, mount lifecycle, abort cleanup and failed requests; do not fetch all users' libraries at startup |
| MP4 upload fails | Content validation, FFmpeg availability/path, API image version, supported container/codecs, disk space and proxy/body/inactivity limits |
| Images stall or transitions hitch | General versus product queue, retained cache exceptions, scheduler timeout and request/decode/render costs; measure before changing concurrency |
| Pantry map is empty or unstyled | Selected feature, three-second fetch delay, filter/batch state, API response, Leaflet styles and shared Tailwind scanning |
| Switching radio/front page crashes | Hooks must run before alternate-view returns; check browser page errors and resize transitions |
| Draft disappears unexpectedly | Account-change reset, refresh/session teardown, successful submission versus a failed request; never persist a draft to SQL just to preserve collapse state |

Acceptance after a mobile change:

1. Check 320/390/430px, portrait scrolling, 1440px desktop and crossing the 767/768px breakpoint in both directions. Desktop should retain its intended layout/actions.
2. Test visitor and fixture-member paths; both Coming Soon placeholders stay disabled. Confirm feature pagination/scroll/actions and About/title navigation.
3. In More, verify the matching Friends / Social links & promotions / Close uHub stack above navigation, pending-count/visitor gating, expanded social contents, Friends view and original close action. No duplicated controls should remain under the heading.
4. Check exact feed widths/heights, outside-click/focus collapse and unsent draft retention across view changes/close/reopen; failed submission keeps text, success clears it, and refresh/logout clears it.
5. Check MemeBox rails, broadcast navigation placement, Stores carousel order, profile/editor overflow, explicit-save and lazy-library request/object-URL cleanup.
6. Intercept writes or use disposable fixtures for browser automation; never change real accounts/posts as a side effect of acceptance testing. Inspect console/network and record runtime errors.
7. Record build/test/type-check results and remaining limits. Real production transfers of 25/50 GiB, deployment and production acceptance are separate work; small/metadata boundary fixtures are not equivalent evidence.

Keep this guide current after changes. Only [README-ARCHIVE.md](README-ARCHIVE.md) owns outdated setup/experiment history; do not create competing current guides.
