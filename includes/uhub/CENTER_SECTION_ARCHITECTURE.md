# uHub Center Section Architecture

This document describes the rules for adding center-section features without changing the behavior of the existing navigation.

## Two kinds of center content

The center has one normal broadcast cycle and several temporary button-launched takeovers.

The normal cycle is controlled by `broadcastKeys` in `MainUhubFeatureV001ForMyProfileModal.tsx` and currently contains:

- `UnionNews#14`
- `UnionRadio#15`
- `MyBroadcasts`

User-created broadcasts belong in this cycle when they are added to the broadcast data source. They must not be mixed with button-only feature pages.

Takeovers include `Find-a-Pantry#13`, `UmiMatch#22`, `Million-Pixel#23`, and `Beta-Button-10,011`. A takeover is selected by its owning icon or button. It must never be added to `broadcastKeys`.

## Navigation rule

The center arrows call `navigateBroadcast('left' | 'right')`. That function:

1. Finds the current item in the normal broadcast cycle.
2. If the current page is a takeover, starts from the normal cycle instead of advancing through the takeover list.
3. Clears the active takeover icon state.
4. Selects the next or previous normal broadcast.

When adding a new normal broadcast, add its configuration to `broadcasts` and add its key to `broadcastKeys` in the desired order. Do not add feature takeover keys to that list.

## Adding a button takeover

For a new button-launched page:

1. Add a named entry to `broadcasts` only if it needs shared title metadata.
2. Add the page-specific React view near the other feature views.
3. Add one explicit button handler that sets `centerView` to `broadcasts` and sets `broadcastView` to the takeover key.
4. Add a matching branch near the top of `BroadcastView`.
5. Add an exit handler that clears the button state and returns to `UnionNews#14`.
6. Do not add the takeover key to `broadcastKeys`.

This makes the takeover appear only when its own control is used. Clicking a center arrow exits it and returns to the normal broadcast cycle.

## Adding user-created broadcasts

`MyBroadcasts` renders `CreateBroadcastView`. New broadcasts and episodes are persisted through the broadcast API. A future implementation that displays each user-created broadcast in the center cycle should load those records, append stable keys after the built-in entries, and keep the resulting list separate from takeover pages.

Episodes are scheduled and played by `UnionRadioPlayer`. The scheduled endpoint supplies the active episode and its media list. Media advances within the episode on `ended`; the episode is marked played after its final media item.

## MemeBox and carousel performance

The UnionNews MemeBox is rendered by `TheMemeBoxRenderer.tsx` only while `broadcastView === 'UnionNews#14'`. Leaving UnionNews unmounts it. Each MemeBox uses `IntersectionObserver`, so post loading and automatic rotation run only while that box is visible. Automatic MemeBox rotation waits 10 seconds, and managed header/footer carousels wait 7 seconds. Keep these guards when adding another rotating surface.

## Chatrooms

The left uHome-Hub list is independent from center navigation. Buttons 1 through 30 map to the corresponding `SisterUnion001...SisterUnion030` page name and render `MainUhubFeatureV001ForChatModal`. The chat modal is mounted at the profile root so the Radix dialog works on desktop and mobile. Do not route these buttons through `broadcastKeys`.

## Checklist

- Normal broadcast pages are in `broadcastKeys`.
- Takeover pages are absent from `broadcastKeys`.
- Every takeover has an owning button and an exit/reset path.
- Center arrows clear takeover state.
- MemeBox and carousel timers have visibility/view guards.
- Chat buttons still map 1:1 to the 30 Sister Union names.
- Run `npm run build` in both `includes/uhub` and `includes/pantry-finder` before deployment.
