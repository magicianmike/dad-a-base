# Dad-a-base: spec

Dad-a-base is a quirky, comedic dad-joke site built on the [icanhazdadjoke](https://icanhazdadjoke.com/api) REST API, for the brief in [`brief.md`](brief.md). It's a take-home interview project. Beyond the brief, it aims to show depth in the Vue ecosystem, product ownership, and UX and design craft. A Case Study inside the app explains how and why it was built.

## Brief, and what it becomes

| Brief                                          | Dad-a-base                                                                       |
| ---------------------------------------------- | -------------------------------------------------------------------------------- |
| Search for a joke                              | `/search`: search as you type, with the query and page in the URL                |
| Pagination, nice to have                       | Numbered pagination with an 11-number window                                     |
| Handle no results gracefully                   | An inline empty state with suggestions                                           |
| A random joke                                  | `/random`, plus a joke of the moment on `/`                                      |
| An individual joke page with copy to clipboard | `/jokes/:id`: copy, share and favorite                                           |
| A header and footer with navigation            | A site shell with skip links and a theme toggle                                  |
| Nicely laid out                                | A design system built from tokens, light and dark, accessible by construction    |
| Additional pages                               | Favorites, the Case Study (About), the design system, and a dedicated error page |

## Stack

- **Vue 3** (Composition API, `<script setup>`), **TypeScript** 5.9, **Vite**.
- **vue-router**. Every route's code loads on first visit, and each route sets its own title with `@unhead/vue`. Changing routes scrolls to the top, and back and forward restore the previous position.
- **Apollo Client 3** with **`apollo-link-rest`** 0.9 and **`@vue/apollo-composable`** 4, with no GraphQL server ([ADR 0002](adr/0002-apollo-over-rest.md)). We use the stable Apollo 3 line, not the Apollo 4 prereleases.
- **Pinia** for app state: favorites (saved to localStorage), theme, toasts and recent searches.
- **Zod** is the single source of truth for API types. A `responseTransformer` checks every response at runtime, and the static types come from `z.infer`.
- Plain CSS and CSS Modules over a design system built from tokens ([ADR 0004](adr/0004-design-tokens.md)).
- npm and Node 22 (`.nvmrc`). ESLint (flat config, Vue and TypeScript) with Prettier. Stylelint bans raw `px` and colour values outside the token files.

## Data

The API is called straight from the browser: it allows CORS on GET, and every request sends `Accept: application/json`.

| Need          | Endpoint                         | Operation                                        |
| ------------- | -------------------------------- | ------------------------------------------------ |
| A random joke | `GET /`                          | `RandomJoke`, with `fetchPolicy: 'network-only'` |
| One joke      | `GET /j/{id}`                    | `Joke($id)`, where a 404 means an unknown joke   |
| Search        | `GET /search?term&page&limit=10` | `SearchJokes($term, $page)`                      |

- Jokes are normalised as `Joke:id`, so a joke opened from search, random or favorites is one cache entry. A search result you click opens its detail page from the cache straight away.
- Search pages are cached by term and page number.
- An error link maps HTTP statuses and network failures to a typed `AppError` with a `code`. The views give that code to `ErrorView`.
- We don't use the upstream GraphQL endpoint, because it has no search list and no pagination ([ADR 0002](adr/0002-apollo-over-rest.md)).

## Routes

### `/` Home

- A pun hero.
- The joke of the moment, with "Another one".
- A search box that goes to `/search?q=…`.
- A peek at your favorites, the newest three, when you have some.

### `/search?q&page`

- Search runs as you type, debounced. Typing replaces the history entry instead of adding one, and a new query resets to page 1.
- An empty query shows recent searches and suggested searches.
- No results is an inline empty state, not an error.
- Pagination is a Previous button, an 11-number window, and a Next button:
  - The window is the current page with 5 on each side. It stays full at both ends: page 2 of 40 shows 1–11, page 8 shows 3–13, and page 38 shows 30–40. With 11 pages or fewer, every page is shown.
  - Previous and Next are disabled on the first and last pages.
  - A `?page` past the end, or one that isn't a number, is replaced with the nearest valid page.
  - A summary reads "Jokes 11–20 of 43", and focus moves to the results heading when the page changes.
- Results are joke cards, and each card links to `/jokes/:id`.
- A joke card for a favorite, wherever it shows, wears a heart on its corner.

### `/random`

- "Another one", or the `r` key, fetches a new joke without changing the URL.
- The joke card links to `/jokes/:id`, on home too.

### `/jokes/:id`

- **Copy:** the button reads "Copied!" for about 2 seconds, and a toast announces it in an `aria-live` region. If the clipboard is denied, the joke's text is selected and the toast asks you to press ⌘C or Ctrl+C.
- **Share:** uses the Web Share API, or copies the link where that isn't available.
- **Favorite:** saves or removes the joke, and reads "Favorited" while it's saved.
- An unknown id shows `ErrorView` with a 404.

### `/favorites`

- Shows the jokes saved in the Pinia store, which holds full joke objects so the page makes no API calls. They're written to the Apollo cache, so opening one makes no call either.
- Each joke has a Remove button pinned to its card's corner, with a tooltip. A removed joke falls off the list, and focus moves to the next one's button.
- A search box filters the favorites as you type, in the browser, with the term in the URL as `?q`. No matches is an inline state with links to all favorites and to Search.
- Ten a page, with Search's pagination and `?page`.
- Has its own empty state.

### `/case-study`, linked as "About"

See [Case Study](#case-study).

### `/design-system`

- The tokens, shown live in both themes, with links to Storybook.

### `/error/:code`, and the catch-all

- `ErrorView` normally renders in place and keeps the URL, so retry works and the address stays correct. `/error/:code` also exists so Storybook, Playwright and the Case Study can link to each state.
- Its codes:
  - `404` for a bad route or an unknown joke;
  - `403`;
  - `429`, rate limited, with "Try again";
  - `500` and other server errors;
  - `offline`, a network failure, with retry;
  - `unknown`, for anything else.
- Each code has a pun headline, a plain explanation and a real way to recover.

## Design

- **Brand:** The Dad-a-base, quirky and comedic: a newspaper's Sunday funnies. Live at <https://the-dad-a-base.vercel.app>.
- **Visual direction:** "Sunday funnies", chosen over three rounds of throwaway prototypes ([journal 0001](journal/0001-visual-direction.md)):
  - a blackletter masthead with a dad peeking over his newspaper as its crest;
  - newsprint colours in light, and a "night edition" in dark;
  - Oswald headlines, Comic Neue kickers and captions, and Atkinson Hyperlegible for everything else;
  - each Joke in a halftone comic frame, with an optional caption.
- **No ratings.** The API has no rating for a Joke, so none is invented.
- **Tokens** in three layers: primitive (the raw palette, type and steps), semantic (`--color-surface`, `--space-4`) and domain (`--masthead-font`, `--joke-frame-dots`). Components use only semantic and domain tokens, and a test enforces it.
- **Themes:** light and dark. The page follows the system setting until the visitor presses the theme toggle, a small sun-and-moon switch, a toggle button named "Dark theme". Their choice is saved and applied before first paint, so it doesn't flash. There's no "Auto" option.
- **Navigation** lists only built pages. Each milestone adds its own (`src/navigation.ts`).
- **Voice:** [`voice.md`](voice.md). Copy is punny, but an error always says plainly what happened. A test checks that every error state has both.
- **Extras:** keyboard shortcuts (`/` focuses search, `r` gets a new random joke, `?` lists them), which can be turned off from that list or the footer (WCAG 2.1.4); and pages and new jokes that fade up as they arrive, turned off under `prefers-reduced-motion`.

## Accessibility

Enforced in Playwright on every route and every error state:

- axe in both themes;
- reflow at 320px and at 200% zoom, with no sideways scrolling;
- touch targets of at least 44px;
- visible focus rings;
- skip links.

The author does a VoiceOver pass on a Mac and an iPhone for each milestone, recorded in its journal entry.

## Testing

- **Vitest:** the stores, the Zod schemas, the Apollo cache policies, the pagination window, the error mapping and composables. CI enforces 90% of lines and branches.
- **Storybook:** every component has stories, and every story has a `play` function, run as a component test through `@storybook/addon-vitest` in Chromium.
- **Playwright:** every route end to end, on desktop Chromium, mobile WebKit and mobile Chrome, plus the accessibility checks.
- **MSW** mocks the API in Storybook, Vitest and Playwright. One smoke test hits the real API.
- Storybook is built and served at `/storybook`, marked `noindex`.

## Case Study

`/case-study` is an MDX page with live components in fixed states, inline SVG diagrams, and an Open Graph image made at build time ([ADR 0003](adr/0003-case-study-in-app.md)). It gives more weight to engineering, while still showing product ownership and UX skill. It doesn't link to the code: the repo is internal to onX.

1. **In 60 seconds**
2. **Engineering**
   - The stack, and why
   - Apollo over REST
   - Three homes for state: the Apollo cache, Pinia and the URL
   - A design system built from tokens
   - The testing approach
   - Building with Claude
3. **Product and UX**
   - Owning the brief
   - Designing the flows
   - Look, voice and accessibility
4. **What I rejected:** the upstream GraphQL endpoint, a backend for the frontend, infinite scroll, component libraries and the Apollo 4 prereleases.

Its live embeds are a joke card, the pagination window in fixed states, each error state, and the theme tokens.

It stands apart from the paper: a slim header with the masthead and a link back to the app, no dateline or main navigation, and its chapters in a sticky column beside the text, marking the one being read, with smooth scrolling between them and a link back to the top. It's linked as "About" in the main navigation and "Case study" in the footer.

## Process

- [`CLAUDE.md`](../CLAUDE.md), [`GLOSSARY.md`](../GLOSSARY.md), ADRs in `docs/adr/`, and a journal entry per milestone in `docs/journal/`, with screenshots and a VoiceOver pass.
- Work happens as issues and PRs on `onX-Hiring/interview-project-mike-mccormick`. The hiring team can see everything there, so it's part of the submission.
- GitHub Actions runs CI: lint, typecheck, Vitest with coverage, the build, Storybook tests and Playwright.
- Deploys run from the author's machine with the Vercel CLI (`vercel` for a preview, `vercel --prod` for production), because the org repo can't have Vercel's GitHub app installed.
- The README is written for reviewers. The original brief is in [`brief.md`](brief.md).

## Milestones

0. **Tracer bullet:** scaffold, tooling, CI, the Vercel deploy, and a random joke fetched through Apollo.
1. **Visual direction:** the prototypes, then the tokens and `/design-system`.
2. **The app shell:** header, footer, navigation, theme toggle, skip links and `ErrorView`.
3. **Random and joke detail:** copy, share and favorite toggle.
4. **Search and pagination.**
5. **Favorites.**
6. **Keyboard shortcuts and transitions.**
7. **The Case Study.**
8. **The README and polish,** including a "reveal the punchline" interaction for Jokes with a clear setup and punchline.
