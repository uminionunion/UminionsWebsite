> **OUTDATED - reviewed 2026-10-16:** This earlier guide contains superseded deployment and loading descriptions. In particular, the carousel cache has retention exceptions, the scheduler advances even after its four-second wait expires, and FTP and SSH are separate deployment paths. Use [README.md](README.md) as the maintained architecture reference. Keep this file for historical context.

# How Everything Is Set Up (Developer and AI Guide)

Keep this file updated as the site grows. It explains what each part of the site is, where its code lives, and how to change it. Line numbers are approximate and drift, so search for the named function or constant instead.

Scope: this guide covers the public and logged-in member experience. Admin-level tools are deliberately not documented here.

## 1. The big picture

| Part | What it is | Where |
|---|---|---|
| WordPress site | PHP/Apache page shell with an Astra child theme. Serves the home page and loads the uHub app | `wp-content/themes/astra-child/` |
| uHub front end | React + Vite + Tailwind app (the modal with the carousels, buttons, broadcasts, stores, chat) | `includes/uhub/` |
| uHub API | Express + Socket.IO + SQLite (Kysely) backend | `uhub-api/` |
| Pantry Finder front end | React map app, imported straight into uHub as a component | `includes/pantry-finder/` |
| Pantry API | Express + SQLite backend for pantries, politicians, candidates, geocoding | `pantry-api/` |
| Legacy PHP | Old WordPress-era audio/video/archive scripts | `includes/*.php` |
| Deploy/proxy | Docker Compose, Apache reverse-proxy configs, GitHub Actions | repo root, `.github/workflows/` |

Request flow: the browser loads the WordPress page (`front-page.php`), which loads the built uHub bundle (`/uhub/dist/uhub.js` and `uhub.css`). The bundle calls `/api/...` and `/socket.io/...` (proxied to the uHub API on port 4001) and `/pantry-api/...` (proxied to the Pantry API on port 4000). WordPress also uses an external MySQL database for its own content.

## 2. Repository layout

```
.github/workflows/      deploy.yml, AutoDeployWebsite.yml  (deploy to the VPS over SSH)
apache-uhub-proxy.conf  /api/, /socket.io/, /data/ -> uhub-api:4001
apache-pantry-proxy.conf /pantry-api/ -> pantry-api:4000
docker-compose.yml      wordpress, pantry-api, uhub-api, sqlite-web services
Dockerfile              WordPress image (copies the theme, includes, built bundles)
includes/               legacy PHP, uhub/, pantry-finder/
pantry-api/             pantry backend (server/, data/, dist/)
uhub-api/               uHub backend (server/, data/, scripts/, seed/, dist/)
wp-content/themes/astra-child/   functions.php, style.css, front-page.php
```

Persistent data lives in Docker volumes (`uhub_data`, `pantry_data`) and in host folders mounted into the WordPress container (images, uploads). Do not put secrets in files that are committed.

## 3. The WordPress page (`front-page.php`)

- Very large file. It holds the home page markup, header, footer, and legacy scripts.
- It sets `window.PANTRY_API_BASE_URL = '/pantry-api'` and loads `/uhub/dist/uhub.css` and `/uhub/dist/uhub.js` as a module (search for `uhub/dist`).
- Launcher layout (the uHub, Login, Signup, avatar buttons) is CSS under `#uhub-launcher-layout` and `#uhub-footer-launcher`.
- Header colour is `#111827`; footer is `#1f2937` (search for those values; the inner footer strip uses the footer colour).
- Old WordPress-era schedule pollers (UnionRadio due-check, calendar refresh) and the WordPress video loop are commented out with retirement dates. Do not restore them; UnionRadio now uses one timer (see section 8).

## 4. uHub front end (`includes/uhub`)

### Build and run
- `npm run build` in `includes/uhub` produces `dist/uhub.js` and `dist/uhub.css` (entry `index.html`, output names set in `vite.config.js`).
- The `dist` folder is committed and is what production serves. After any source change, rebuild and commit `dist`.
- Static assets (default images, icons) are in `includes/uhub/public/` and are copied into `dist`.

### Source map (`includes/uhub/src`)
- `main.tsx`, `App.tsx`: app entry.
- `features/profile/MainUhubFeatureV001ForMyProfileModal.tsx`: **the main modal**. Nearly everything visible in uHub is in this one file (see below).
- `features/profile/additional-hard-coded-custom-button-pages.ts`: button pages 73 to 715.
- `features/profile/CreateBroadcastView.tsx`: MyBroadcasts upload/record/schedule screen.
- `features/profile/WorldFeed.tsx`, `FeedEntryCard.tsx`: World Feed.
- `features/profile/MainUhubFeatureV001For*.tsx`: user profile, friends, settings, product add/edit/detail modals.
- `features/profile/MyStore*.tsx`, `UserStoresQuadrantView.tsx`, `EverythingProductsList.tsx`: stores and products.
- `features/profile/TheMemeBoxImplementation001.jsx` plus `TheMemeBoxRenderer.tsx`: MemeBoxes.
- `features/profile/BroadcastCarousel*.tsx`: broadcast image carousel and zoom.
- `components/QueuedImage.tsx`, `ProductQueuedImage.tsx`: image components wired to the loading queues.
- `lib/image-load-queue.ts`, `product-image-cache.ts`, `carousel-rotation-queue.ts`: loading and lag control (section 10).
- `hooks/useAuth.tsx`: login state (`/api/auth/me`). A 401 here means no one is logged in and is normal for visitors.
- `hooks/usePaginatedFeed.ts`: feed paging.
- `index.css`: global uHub styles.

### Where things are in the main modal (search by name)
| Thing | Name to search |
|---|---|
| The modal component | `MainUhubFeatureV001ForMyProfileModal` |
| Store list 0 to 30 | `ALL_STORES` |
| Social icon links (left and right) | `socialLinksLeft`, `socialLinksRight` |
| Union Radio player and schedule | `UnionRadioPlayer` |
| Pantry Finder view | `PantryFinderBroadcastView` |
| UmiMatch view | `UmiMatchView` |
| Million-Pixel view | `MillionPixelView` |
| Beta page view | `BetaButtonView` |
| Top-left carousel | `RotatingUnionEventCard` |
| Bottom-left and right-side product carousels | `ManagedProductCarousel`, `HeaderProductCarousel`, `FooterPosterCarousel` |
| Cover images (top and bottom) | `CoverImageRotator` |
| Center anchor image carousel | `AnchorRotator` |
| About Us / Terms pop-ups | `SitePageModal`, `useSitePage` |
| Welcome sentence | `WelcomeDescription` |
| Front page social area | `FrontPageSocial`, `WorldFeed` |
| Center broadcast panel and its views | `BroadcastView` and the `broadcastView ===` checks |
| The broadcasts list | `const broadcasts = {` |
| Button pages and click handling | `customizableButtonPage`, `hardCodedCustomButtonPages` |

## 5. The 10,000 buttons (button pages)

The button grid in the left column is paged. Each page is a 4 by 4 grid. There are **715 pages**; page and button numbers are set in code, not in the database.

- **Page 1** is the main uHome-Hub page with special buttons 1 to 16 (heart, palm, lion, microphone, steering wheel, movie, external links, and so on). Its click logic is a chain of `if (customizableButtonPage === 1 && buttonNumber === N)` checks in the button `onClick`.
- **Pages 2 to 7** are defined by the `CustomButtonsPage00Ns...PageButton` constants near the top of the component.
- **Pages 8 to 72** are in `hardCodedCustomButtonPages` inside the modal.
- **Pages 73 to 715** are in `additional-hard-coded-custom-button-pages.ts` (merged into the same object with a spread).
- Each entry is a 16-slot array in this order: four rows of `[a, b, g, h]`, `[c, d, i, j]`, `[e, f, k, l]`, then `[PreviousPageButton, m, n, NextPageButton]`. The previous and next entries are strings like `CustomButtonsPage073sPreviousPageButton`.
- Numbering: from page 8 on, the first button on page N is `100 + (N - 8) * 14`, and each page holds 14 numbered buttons. Page 715 ends with 9998 (About Us), 9999 (Terms of Use & Service), 10000 (opens uminion.com) and 10001 to 10012 (reserved, disabled; 10011 is the Beta page for a limited audience).
- Paging: the up/down handlers clamp the page number between 1 and 715, and the grid scrolls smoothly to the page (`customButtonPageHeight`).

### How to give a button a job
1. Find the button's page and number in the arrays above.
2. In the button `onClick` (search for `customizableButtonPage === 715 && (buttonNumber === 9998`), add a check such as `if (customizableButtonPage === N && buttonNumber === X) { ...; return; }`. Typical actions: open a link with `window.open`, open a modal with a `useState` flag, or switch the center panel with `setCenterView('broadcasts')` and `setBroadcastView('Name')`.
3. Set its label or icon in the label expression below the `onClick` (search for the `GroupIcon` usage for an example).
4. If it must be unavailable for some people, add its condition to the `disabled=` expression.
5. If it opens a new center view, add an entry to `const broadcasts = {` and a `broadcastView === 'Name'` check in `BroadcastView`.
6. Rebuild the bundle.

## 6. Center and right panels

- `centerView` and `broadcastView` pick what the center panel shows. Names in use: `UnionNews#14`, `UnionRadio#15`, `Find-a-Pantry#13`, `UmiMatch#22`, `Million-Pixel#23`, `Beta-Button-10,011`, plus `MyBroadcasts`.
- Page 1 buttons toggle views: heart opens UmiMatch#22, palm opens Million-Pixel#23 (restricted until payments are finished), lion opens Find-a-Pantry#13. Clicking again returns to UnionNews#14.
- The right panel (`centerRightView`, from `ALL_STORES`) pages between stores/sections. Number 20 is UnionSAM#20 (Union Store and Users' Stores), number 19 is UnionPolitic#19 (has a Filter button).
- The Union Store and Users' Stores spinners and image queue only run while UnionSAM#20 or the Quadrants (stores) modal is open.

## 7. uHub API (`uhub-api`)

- Entry: `server/index.ts` (Express, Socket.IO, cookie JWT auth, file upload). Routers are mounted there. Static serving is in `server/static-serve.ts`.
- Build and run: `npm run build` (runs `tsc`, which does not fail the build on type errors, so check `dist/` timestamps) and `npm start` (`scripts/init-data.cjs` then `dist/server/index.js`).
- Database: SQLite via Kysely. File `data/database.sqlite`. Table types are in `server/db-types.ts`; connection in `server/db.ts`.
- Port 4001 (proxied from `/api/`, `/socket.io/`, `/data/`).

### Route files
| File | Covers |
|---|---|
| `auth.ts` | signup, login, logout, `/me`, profile image, user lookup |
| `friends.ts` | requests, accept/reject, block, report |
| `products.ts` | products, stores, user stores, cart, "looking for", trash/restore |
| `memes.ts` | MemeBox posts, votes, favorites, comments |
| `social-posts.ts` | social posts, privacy, friends/union/world feeds |
| `broadcasts.ts` | broadcasts, episodes, calendar, scheduled episodes, archive, carousel items, site pages |
| `chat.ts` | Socket.IO chat rooms, archives, unread status |
| `umimatch.ts` | UmiMatch profiles, discover, like/skip, matches, messages |
| `million-pixel.ts` | pixels, inventory, changes |
| `index.ts` | uploads, username lookup, UnionNews#14 images, chat helpers, account delete |

### Main tables (see `db-types.ts` for columns)
Users, Friends, BlockedUsers, Reports, Messages, UserChatrooms, ChatroomUnreadStatus, ChatMessageArchives, ChatResetSchedule; stores and products (`MainHubUpgradeV001For...`, `UserStores`); social posts, votes, favorites, comments, privacy settings; `MemeImplementation001*`; `UserBroadcasts`, `UserBroadcastEpisodes`, plays/media/votes/favorites/comments; `UmiMatch*`; `MillionPixels*`; and `UhubManagedCarouselItems`, which stores carousel images by `slot` (`left-top`, `left`, `right`, `cover`, `bottom`, `center`) and also stores the About/Terms/Welcome page text in private slots named `page-about`, `page-terms`, `page-welcome`.

### Public endpoints worth knowing
- `GET /api/carousels/:slot/items`: the images for a carousel slot.
- `GET /api/site-pages/:key`: About, Terms and Welcome page content (`about`, `terms`, `welcome`).
- `GET /api/episodes/scheduled`, `GET /api/episodes/calendar`: UnionRadio schedule data (`next_scheduled_at` tells the player when to wake).
- `GET /api/feed/world`, `/api/feed/friends`, `/api/feed/union-announcements`: feeds.

## 8. UnionRadio and scheduling

- `UnionRadioPlayer` fetches the next scheduled episode once and sets a single timer for its `scheduled_at` time. It does not poll.
- It refetches the episode and calendar when the app dispatches `uhub:episodes-changed` (MyBroadcasts saves, edits or deletes) and when the browser tab regains focus.
- Uploading and scheduling happen in `CreateBroadcastView.tsx` (MP3 and Video buttons, then Record Audio and Record Video on the next row).
- Old WordPress audio/video schedule scripts in `includes/*.php` still exist but are retired from the page.

## 9. Pantry Finder

- Front end: `includes/pantry-finder/src`. `pages/pantry-feature/the-food-pantry-feature.tsx` is the main component (buttons, filters, map). `pages/home/map.tsx` is the Leaflet map. Filters and countries are in `pantry-controls.tsx` and `countries-data.ts`. Add/host form: `pages/home/host-pantry-form.tsx`. Details: `pantry-details-view.tsx`.
- It is imported into uHub, not built separately. `PantryFinderBroadcastView` in the main modal supplies the data.
- Data comes from the Pantry API (`/pantry-api/api/pantries`, SQLite in the `pantry_data` volume). The API also has politicians, candidates, geocoding. Routes are in `pantry-api/server/index.ts`.
- Loading (leaky bucket): the view only exists while Find-a-Pantry#13 is open. The pantry request starts 3 seconds after it opens and is cancelled and dropped when it closes. The map then shows 50 matching pantries at a time, adding 50 more every 3 seconds until all are shown. Changing a filter restarts the flow with only the matching pantries.
- "Running for Office?" and the candidate/politician checkboxes are disabled and commented out (look for the retirement note). Politicians and candidates are not requested while they are off.
- The Leaflet stylesheet and the Tailwind scan setting (`tailwind.config.js`) must stay in place or the map will not render.

## 10. Lag control (summary; see `HowWeveBeenTacklingOnLag.md` for the full story)

- **Image queue** (`lib/image-load-queue.ts`): at most 4 images load at once. Priorities: critical (avatar, watermark, cover), carousel, normal. A bounded cache keeps decoded images (40 images / 48 MB). `QueuedImage` shows the previous image while the next loads.
- **Carousel scheduler** (`lib/carousel-rotation-queue.ts`): carousels have no timers of their own. One scheduler, on a 5-second clock, visits them one at a time, loads a random next image into the cache, rotates the carousel to it, then moves on. Every carousel image is retained in the cache up front. Do not remove the carousel caches; doing so brought lag back.
- **Store images** (`lib/product-image-cache.ts`): Union Store and Users' Stores load one at a time in 2-second turns, Union Store first, at most 2 queue entries per store. If a turn brings no new images, it stops retrying and the spinner stays on.
- **Start-up**: store products load only when a store is opened. MemeBox 1 is mounted at start; MemeBoxes 2 to 6 mount when the dropdown is opened.
- **Console**: a 401 from `/api/auth/me` logs "This Means No User is Logged In" (normal).

## 11. Public pop-ups and content pages

- About Us (button 9998) and Terms of Use & Service (button 9999) open `SitePageModal`. Their text is loaded from `/api/site-pages/about` and `/api/site-pages/terms`. They show as disabled when switched off.
- The welcome sentence above the UnionNews#14 panel is the saved Welcome page text if one exists; otherwise the built-in default sentence in `const broadcasts` (`description`) is shown.
- Groups of social icons and links are plain arrays (`socialLinksLeft`, `socialLinksRight`) and are paged in the footer.

## 12. Deploying changes

1. Edit the source.
2. `npm run build` in `includes/uhub` (and in `uhub-api` if API files changed). Confirm the `dist` file timestamps are new.
3. Commit source and `dist` together. Pushing to the deploy branch runs the GitHub Actions workflow, which pulls on the VPS and rebuilds the Docker containers.
4. After deploy, test in a logged-out browser and a logged-in browser and check the console.

## 13. Known issues (not part of the lag work)

These API calls currently return 500 and are handled separately: `/api/broadcasts/union-news-14/images`, `/api/products/store/0`, `/api/products/everything/all`, `/api/chat/unread-status`, and `/api/products/user/:id/stores`.

## 14. Editing tips

- The main modal file is very large. Search by the names in section 4 rather than scrolling.
- When several layouts repeat similar lines, include extra surrounding context so edits hit the right one.
- Commented-out code is kept on purpose, with a date and a short reason, so it can be brought back.
- Add new routes in the matching router file and a table type in `db-types.ts`; the SQLite file is created from `scripts/init-data.cjs` and the seeds.
