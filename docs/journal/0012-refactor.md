# 0012 · Consolidating what Favorites and Groans share

A pass after Groans, with no change in behaviour a Visitor would notice. Favorites came first and Groans copied its patterns, so the same logic lived in two places, and sometimes three. The big decisions stay: Apollo over REST, Zod as the source of truth, Pinia, state in the URL, and the token layers. The author asked what in the architecture should change once the project was complete, chose these from the review, and they're issue #25.

## What moved

| Before                                                                        | After                                                                 |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Favorites, Groans and Recent searches each read, parse, save and sync storage | `src/stores/useStoredRef.ts`, one helper, tested once                 |
| Favorites and Groans each fix a bad `?page` and slice their pages             | `src/lists/useLocalPages.ts`                                          |
| Favorites and Groans each count falling cards and move focus after a removal  | `src/lists/useFallingRemoval.ts`                                      |
| Favorites and Groans each own a TransitionGroup, its pinning and its CSS      | `src/lists/FallingList.vue`, with a story                             |
| `src/search/pagination.ts`, used by three pages                               | `src/lists/pagination.ts`                                             |
| `RemoveFavoriteButton`, serving both lists                                    | `RemoveButton`, with `label` and `icon` required                      |
| `GroanButton`'s pointer, touch and key handling                               | `useGroanHold`'s `handlers`, unit-tested without rendering the button |
| A tap's own display: "Groan" on the board, "You groaned" in the tooltip       | Gone: taps are dropped when Groans are read                           |
| No record that the Visitor's data stays in the browser                        | [ADR 0005](../adr/0005-visitor-data-in-the-browser.md)                |

The stores went from 65, 84 and 50 lines to 32, 60 and 34; `FavoritesView` from 285 to 212; `GroansView` from 288 to 211; and `GroanButton` from 475 to 398, nearly all of it now presentation and CSS.

## Decisions

### Defaults, not asked

- **One storage helper, `useStoredRef(key, schema, fallback)`.** It reads through the schema, falls back when what's saved is missing, isn't JSON, doesn't match or can't be read, saves each change, and follows other tabs, removing its listener when its scope ends. A schema can transform as well as check, which is how Groans drop old taps.
- **Recent searches still don't follow other tabs.** They never did, so the helper takes `followTabs: false` for them, rather than change what a Visitor sees. ADR 0005 records it as deliberate.
- **Local pages, not Search's.** Search's pages come from the API, which says how many there are, so `SearchView` keeps its own `?page` logic and shares only `parsePage` and the summary. `useLocalPages` is for lists held in the browser, which can be counted.
- **`FallingList` is generic and owns the fall.** It renders the numbered list, pins a leaving card, and holds the `fall-*` CSS, so both pages animate the same way by construction. A page's own row layout goes in its slot: a scoped style can't reach the `li` another component renders, which is why the leaderboard's row is now a `div` inside it.
- **Its story isn't typed against the component.** Storybook's types can't take a generic component, so the story's meta leaves `component` out and takes its title from the path.
- **`RemoveButton` requires its `label` and `icon`.** A default of "Remove from favorites" would be wrong for any new list, silently.
- **The hold's handlers live with the hold.** `useGroanHold` returns `handlers` (pointer down and move, keys down and up, blur), and the window listeners for the lift. It tells the button when a press begins and when Escape is pressed, so the button can hide its hint and dismiss its tooltip. The iOS fix, hearing the lift anywhere as a pointer or a touch, now has unit tests of its own.
- **Old taps are dropped, not shown.** Before a Groan took a long press, a tap was a Groan too, shown as "Groan". Groans and long press only reached production in the same merge, so only preview deploys ever saved a tap. Dropping them on read removed the tap's display from the button, the toast and the board. It's the one change a Visitor could see, and only one of the testers.
- **ADR 0005,** for a decision two features now rest on: the Visitor's data stays in this browser, and there's never a shared board.

### Found on the way

- **The Favorites empty state said "Press Favorite on any joke",** missed when the button became "Fave". It says "Press Fave" now, and its test with it.

## Tests

The existing tests pass as they were, but for these:

- **Tap tests became drop tests.** The score, the leaderboard and the e2e leaderboard showed a tap as "Groan". They now check that a saved tap is left out, and the e2e board seeds a 1.2 Groan instead.
- **The Favorites empty state's copy,** as above.
- **The Remove button's story** passes the `label` and `icon` it now requires.

New:

- **Vitest:** `useStoredRef` (fallback, load and save, not JSON, invalid, a transforming schema, other tabs, not following tabs, scope end, blocked storage); the hold's handlers (the lift heard anywhere, cancels heard anywhere, only the main button, wobble and slide-off, Space and Enter with repeats and Escape, blur); the Groans store dropping a tap.
- **Storybook:** `FallingList`'s `Removing`, which removes three cards in turn and follows focus to the empty state.
- **Totals:**
  - Vitest and Storybook: 381 passed, 97.2% of statements and 93.8% of branches.
  - Playwright: 361 passed, 23 skipped, unchanged.

## VoiceOver pass

**Status: not needed.** Nothing a screen reader meets changed: the same names, roles, descriptions, announcements and focus moves, which the unchanged tests check.

## After merging

- **A flaky App test, fixed.** "Goes from home to a random joke" failed twice in full runs, once before this refactor and once just before deploying, and passed on its own each time. It's the first test in `App.test.ts`, so it paid for loading each route's code for the first time, and in Vitest that load compiles the view, which under a full parallel run can outlast a query's 1-second wait. The file now loads every route once in `beforeAll`, so no test is timed on a cold compile, rather than raising the wait. Three full runs in a row passed, 381 of 381.

## Deployed

In production at <https://the-dad-a-base.vercel.app> since 2026-11-16, from `master` at `5701402`, with the Sections menu (journal 0010) and Groans (journal 0011).
