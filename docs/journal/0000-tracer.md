# 0000 · Tracer: a random Joke through Apollo

Milestone 0. The whole stack, rough but real. `/random` fetches a random Joke from icanhazdadjoke through Apollo Client and `apollo-link-rest`, checks it with Zod and shows it, and "Another one" gets the next. Every tool the later milestones depend on is wired in and passing in CI: lint, typecheck, Vitest with coverage, Storybook tests, Playwright and the deploy config. The spec and ADRs 0001 to 0004 were written first.

## Decisions

**The API reports errors with HTTP 200.** An unknown joke answers `200 OK` with `{"status":404,"message":"Joke with id \"nope\" not found"}` in the body. So `apollo-link-rest`'s own 404 handling, which returns `null`, never runs. `parseResponse`, the link's `responseTransformer`, reads the body's `status` first and throws an `AppError` with its code. Only then does it parse the response against the Zod schema for its `@rest` type. A real HTTP 404, which gives `null`, also becomes an `AppError('404')`.

**One mapping from failures to Error states.** `toAppError` looks through Apollo's `networkError` and each error's `cause` for an `AppError`, an HTTP `statusCode` or a failed `fetch`. It returns one of the glossary's codes: `404`, `403`, `429`, `500` (any 5xx), `offline` or `unknown`. Milestone 2's `ErrorView` takes the code as it is.

**Random Jokes never come from the cache.** `useRandomJoke` uses `network-only`, or "Another one" would return the cached Joke. Each Joke is still written to the cache as `Joke:id`, so later milestones can open it as a detail page with no fetch.

**Mocked everywhere but one test.** MSW answers API calls in Vitest (`msw/node`) and in the Playwright build (`vite build --mode e2e` turns on `VITE_API_MOCKS`, which starts the service worker). The production bundle doesn't contain MSW. `npm run test:smoke` is the one test against the real API. In CI it runs as its own job that can't block a merge, because the API isn't ours.

**Peers listed by hand.** `@vue/apollo-composable` 4 lists the Vue 2 `@vue/composition-api` as an optional peer, and npm 10 reports it as a conflict with Vue 3. `.npmrc` sets `legacy-peer-deps`, so peers (`graphql` 16, `qs`) are listed in `package.json` directly. `graphql` stays on 16, the newest Apollo 3 accepts. TypeScript stays on 5.9, since `vue-tsc` doesn't support 7.

**Placeholder tokens.** The tracer's tokens are plain grays, already in the three layers of ADR 0004, so milestone 1 swaps the primitive values without touching components. Stylelint already bans raw `px` and colour values outside `src/styles/tokens/`.

## Problems found on the way

- **Storybook's tests failed on a cold cache.** Vite found Vue late, re-optimised mid-run and reloaded, which fails the run. Every CI run starts cold. The Storybook project now pre-bundles `vue`, and a run with `node_modules/.vite` and `.cache` deleted passes.
- **Playwright reused another project's server.** A MySous preview on Vite's default port 4173 answered instead. Dadabase previews on 4317.
- **MSW 3 renamed `onUnhandledRequest` to `onUnhandledFrame`.**

## Alternatives considered

- **Mocking in Playwright with `page.route`.** Rejected: a second set of mocks would drift from MSW's handlers. Both suites share `src/mocks/handlers.ts`.
- **A smoke test that blocks CI.** Rejected: an outage at icanhazdadjoke would block every merge.

## Tests

- **Vitest, 25 tests, 100% coverage** (the gate is 90%):
  - `parseResponse`: a Joke, an error sent as HTTP 200, a real 404, a response that fails its schema, and a type with no schema;
  - the client sends `Accept: application/json` and normalises `Joke:abc`;
  - `toAppError` for every path;
  - `RandomView`: a Joke, then another one, an API failure, and a failure on "Another one";
  - the shell from home to random, each page's title, and the scroll behaviour.
- **Storybook:** `JokeCard`, default and long, with axe failing a story's test on any violation.
- **Playwright, 12 tests** on desktop Chromium, mobile WebKit and mobile Chrome: home to random and another one; a deep link to `/random`; and axe on `/` and `/random`.
- **Smoke:** a random Joke from the real API.

## Deploy

`vercel.json` serves `index.html` for every path outside `assets/`, so deep links reach the router. Deploys use the Vercel CLI from the author's machine (see the spec's Process).

- **Live at <https://dadabase-jade.vercel.app>.** `dadabase.vercel.app` was taken, so Vercel picked the alias. A new project's first deploy goes to production, so this one did.
- Each deploy's own URL is behind Vercel's login (Deployment Protection). The alias is public.
- `vercel link` couldn't connect the GitHub repo, as expected, and added `.env*` to `.gitignore`. That would have ignored `.env.e2e`, which the Playwright build needs, so it's narrowed to `.env*.local`.
- Checked live in Chromium against the real API: `/random` shows a Joke, "Another one" shows a different one, the title is right and the console is clean. `/`, `/random` and an unknown path all serve the app.

## Open

- **The bundle is 147 KB gzipped,** most of it Apollo. Each route already loads on its own. Revisit in milestone 8.
- **`mockServiceWorker.js` is in every build.** It never registers outside e2e builds. Leave it, or copy it only for e2e builds, in milestone 8.
- **The VoiceOver pass.** Not needed for this rough shell; milestone 2's shell gets the first one.
