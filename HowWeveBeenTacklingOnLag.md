> **OUTDATED IN PART - reviewed 2026-10-16:** Preserve this experiment history, but use [README.md](README.md) for current implementation details. The latest experiment replaces auto-changing carousel displays with single-image placeholders: `useQueuedImageSlot` removes the old image before the shared queue fills that location, preserving random choice, caches and five-second spacing. Earlier claims below are not guarantees: retained images may exceed cache targets; the scheduler advances the selected entry on timeout/failure rather than skipping the slow image; store slices allow in-flight loads to finish; and user observations do not establish a measured root cause.

# How We've Been Tackling Lag (Testing002)

Written 10/16/2026. This explains the lag we had, what caused it, what we changed, what we tried that failed, and how to get back to exactly this state. Day-to-day pages: uHub (`includes/uhub`), plus the `uhub-api` backend.

## 1. What the lag was

Visitors saw the page freeze or stutter, mostly right after it opened and again whenever images changed. The causes, in the order we found them:

1. **Startup request flood.** When the uHub modal opened, it fetched products for stores 1-30 one after another, plus `/api/products/everything/all`, whether or not anyone opened those stores.
2. **Everything loaded at once.** Dozens of images (carousels, covers, avatar, store images) started downloading together and fought for the network and the main thread.
3. **Six MemeBoxes mounted at once.** Only MemeBox 1 is needed at start.
4. **Polling.** UnionRadio asked the server every 15 seconds if an episode was due, the calendar refreshed every 30 seconds, and an old WordPress video loop re-checked a schedule over and over.
5. **Retry loops.** Union Store and Users' Stores kept retrying failed image and product loads, which kept the page busy.
6. **Carousels all changing at once.** Several carousels each ran their own timer (3 to 6 seconds), so images changed together and on slow connections the page stuttered each time.

## 2. What we did, in order

### Round 1-3: stop the startup flood (Testing000 first, then ported)
- Commented out the startup fetch of stores 1-30 and Everything. Products now load only when a store is opened (the old code is kept commented so it can be turned back on for diagnosis).
- Added a shared image queue (`includes/uhub/src/lib/image-load-queue.ts`) plus the `QueuedImage` component. Images are loaded a few at a time, in priority order: **critical** (avatar, watermark, cover) first, **carousel** next, **normal** last. Product and MemeBox images stay outside this queue.
- Decoded images are kept in an LRU cache (max 40 images / 48 MB) so rotating images do not blank out or reload.
- MemeBox 1 stays mounted; MemeBoxes 2-6 mount only when the dropdown is clicked and unmount when hidden.
- Union Store and Users' Stores got their own cache and queue (`includes/uhub/src/lib/product-image-cache.ts`), with spinners instead of retry or "Load Everything" buttons. If no new images arrive, they stop retrying and the spinner stays on.
- The 401 from `/api/auth/me` is logged as "This Means No User is Logged In" (normal for visitors, not an error).

### Round 4-7: stop the polling
- UnionRadio fetches the next scheduled episode once and sets one timer for its `scheduled_at` time (`next_scheduled_at` field). It refetches only on the `uhub:episodes-changed` event (when mybroadcasts saves, edits or deletes) and when the browser tab regains focus.
- The old 15-second and 30-second pollers and the WordPress video loop are commented out with retirement dates.

### Round 8: the cache removal that FAILED
We removed the caches for the top-left, bottom-left and right carousels because they seemed slow. **The lag came straight back in prod.** The cache was what was preventing the lag. Never remove it again. We restored it exactly as before.

### Queue tuning that did not help
- Raised `MAX_CONCURRENT_IMAGE_LOADS` from 3 to 7: did not work. We use **4**.
- Raising the carousel images to `critical` priority to make them "faster": caused more lag. Reverted. Carousels use `carousel` priority again. (Critical remains for the center anchor, bottom-left promo logo, avatar and cover banner.)
- Preloading the next carousel image before showing it: caused lag. Removed.

### Carousel rotation queue (what fixed the carousel lag)
File: `includes/uhub/src/lib/carousel-rotation-queue.ts`. Carousels no longer have their own timers. One scheduler runs on a single 5-second clock:
- It visits one carousel at a time in a loop: top-left, bottom-left, right, center, cover(s), bottom promo.
- Each visit picks a **random** other image from that carousel, loads it into the cache first, then rotates the carousel to it.
- It waits 5 seconds, then moves to the next carousel.
- Every carousel's images are retained in the cache up front (`retainQueuedImages`).
- A hovered carousel is skipped. An image slower than 4 seconds is skipped (the carousel still rotates).
- Each carousel instance gets its own id (the top and bottom covers share a name).
- The old per-carousel timers are commented out with 10/16/26 notes. The bottom promo's 7-second timer is retired too.

### Union Store and Users' Stores queue (latest version)
In `product-image-cache.ts`:
- One store at a time, 2-second turns: Union Store first, then Users' Stores, alternating.
- An unfinished store goes to the back of the queue and keeps taking turns until all of its images are in.
- Each store may have at most 2 entries in the queue at once (extra images join an existing entry).
- Before a return turn, if the last turn put up no new images, it stops retrying and the spinner stays on.

## 3. The state to get back to
| Setting | Value | File |
|---|---|---|
| `MAX_CONCURRENT_IMAGE_LOADS` | 4 | `lib/image-load-queue.ts` |
| Decoded image cache | 40 images / 48 MB | `lib/image-load-queue.ts` |
| Carousel scheduler step | 5000 ms, load timeout 4000 ms | `lib/carousel-rotation-queue.ts` |
| Store turn length | 2000 ms, max 2 entries per store | `lib/product-image-cache.ts` |
| Product concurrent loads | 3 | `lib/product-image-cache.ts` |
| Carousel image priority | `carousel` (not `critical`) | `MainUhubFeatureV001ForMyProfileModal.tsx` |
| Startup store fan-out | commented out | `MainUhubFeatureV001ForMyProfileModal.tsx` |

Carousels use `retainQueuedImages` and `QueuedImage` with `keepPreviousWhileLoading`, driven by `useQueuedCarouselRotation`.

After any source change: run `npm run build` in `includes/uhub` (the `dist` bundle is committed and served by Hostinger) and `npm run build` in `uhub-api` when API files change.

## 4. Known remaining lag
A small hitch can still happen at the moment an image or carousel transitions. If it needs more work, levers to try, one at a time:
1. Change the scheduler step (5 s) or the load timeout (4 s).
2. Change the image queue limit (4, try 5).
3. Cap how many images each carousel retains instead of all of them.
4. Skip the visit when a carousel's offscreen.

## 5. Things to avoid
- Do not remove the carousel caches.
- Do not raise carousel images to `critical` priority.
- Do not preload the next carousel image before the scheduler's turn.
- Do not bring back the startup fetch of stores 1-30 / Everything, or the 15 s / 30 s pollers.
- Known 500s (`union-news-14/images`, `products/store/0`, `products/everything/all`, `chat/unread-status`, `products/user/1/stores`) are backend errors handled separately; they are not part of this lag work.
