# The Visitor's own data stays in this browser, and there's never a shared board

Favorites, Groans, Recent searches, the theme and the shortcuts switch are saved in the Visitor's browser, in `localStorage`, and go nowhere else. There's no account, no server of our own and no shared state between Visitors. In particular the Groan Leaderboard is the Visitor's own: there will never be a global one. Each is saved through one helper, `useStoredRef` (`src/stores/useStoredRef.ts`), which validates what it reads with a Zod schema, falls back when it's missing, broken or blocked, and keeps open tabs in step.

## Considered Options

- **A shared Groan Leaderboard** behind a Vercel function and a Marketplace store, such as Upstash Redis: the whole internet's worst jokes. But with no accounts it would be a board of whoever held longest, or scripted the longest hold, and it needs abuse handling, a backend, its deploys and its tests, for a feature that's there for fun. The author ruled it out when Groans were designed (journal 0011).
- **Accounts,** to sync Favorites and Groans across devices: the most useful, and far beyond a portfolio piece's scope, with sign-in, storage and privacy to own.
- **IndexedDB,** for room to grow: more than a few hundred small records need, with an async API every store would have to wait on.
- **`localStorage`, through one helper (chosen).**

## Consequences

- The app stays static: icanhazdadjoke is the only server it talks to (ADR 0002), and the Case Study can say so.
- A Visitor's data doesn't follow them to another browser or device, and clearing site data clears it. The Favorites and Groan Leaderboard pages say "saved in this browser".
- What's saved is untrusted input: an old shape, another app's key, or a hand edit. Every read goes through a schema, and anything invalid is dropped rather than shown. A schema can also migrate, as Groans drop the taps that only preview deploys ever saved (journal 0012).
- Favorites and Groans keep whole Jokes, not ids, so their pages need no API calls and work offline. The same Joke may be saved twice, once in each, which costs a few bytes.
- Recent searches don't follow other tabs, by choice: each tab remembers its own searching. Everything else does.
- A shared board, accounts or sync would need a new ADR replacing this one.
