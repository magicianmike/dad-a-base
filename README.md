# The Dad-a-base

A dad-joke site on the [icanhazdadjoke](https://icanhazdadjoke.com/api) API, styled as a newspaper's Sunday funnies. Built with Vue 3, TypeScript, Apollo Client and Pinia, for [this brief](docs/brief.md).

**Live at <https://the-dad-a-base.vercel.app>**

## Start here

- **[The Case Study](https://the-dad-a-base.vercel.app/case-study):** how and why it was built, with the app's own components live beside the decisions they show. The quickest way in.
- **[The design system](https://the-dad-a-base.vercel.app/design-system):** the tokens in both themes, read from the same stylesheets the app uses.
- **[Storybook](https://the-dad-a-base.vercel.app/storybook/):** every component, each story with an interaction test and an accessibility check.

## What it does

| The brief                     | The Dad-a-base                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| Search for a joke             | Search as you type, with the term and page in the address, and recent and suggested searches      |
| Pagination would be nice      | A Pagination window that stays 11 pages wide, with pages you can link to                          |
| Handle no results             | An inline state with suggestions, distinct from an error                                          |
| A random joke                 | "Another", or the `r` key, and a Joke of the moment on the front page                             |
| A joke's page, with copy      | Copy, with a fallback when the clipboard is blocked, plus Share and Favorite                      |
| Header, footer and navigation | A masthead, a dateline, skip links, a theme toggle, and keyboard shortcuts that can be turned off |
| Nicely laid out               | A design system built from tokens, in light and dark                                              |
| Additional pages              | Favorites, with search and pages; the Case Study; the design system; an Error state for each code |

## Run it

Node 22 (`.nvmrc`) and npm.

```sh
npm install
npm run dev          # the app at http://localhost:5173, against the real API
npm run storybook    # Storybook at http://localhost:6006
```

| Command              | What it does                                                                     |
| -------------------- | -------------------------------------------------------------------------------- |
| `npm run check`      | Lint, typecheck, and the unit and Storybook tests with coverage, as CI runs them |
| `npm test`           | The unit tests (Vitest)                                                          |
| `npm run test:e2e`   | Playwright on three browsers, against a build whose API calls MSW answers        |
| `npm run test:smoke` | The one test that calls the real API                                             |
| `npm run build:site` | The app and Storybook, as Vercel builds them                                     |

## How it's built

- **Vue 3** with `<script setup>` and TypeScript, built with Vite. No component library: the layout is the point of the brief ([ADR 0001](docs/adr/0001-vue-stack.md)).
- **Apollo Client over the REST API,** through `apollo-link-rest`, since icanhazdadjoke's own GraphQL endpoint has no search list or pagination ([ADR 0002](docs/adr/0002-apollo-over-rest.md)). Each Joke is cached once, as `Joke:id`.
- **Zod** checks every response, and is the single source of truth for the API's types.
- **State lives in one of three places:** what you can link to in the URL, what the API said in Apollo's cache, and what the visitor chose in Pinia.
- **A design system built from tokens** in three layers, primitive, semantic and domain, in plain CSS. Tests and Stylelint enforce the layers and WCAG AA contrast in both themes ([ADR 0004](docs/adr/0004-design-tokens.md)).
- **The Case Study is part of the app,** written in MDX so its prose can hold live components, with an Open Graph image made at build time ([ADR 0003](docs/adr/0003-case-study-in-app.md)).

```text
src/
├── api/          # the Apollo client, queries, Zod schemas, and composables such as useSearch
├── case-study/   # the Case Study's MDX, diagrams and live embeds
├── components/   # every component, each with its stories beside it
├── stores/       # Pinia: Favorites, recent searches, the theme, toasts
├── shortcuts/    # the keyboard shortcuts
├── styles/       # global styles, and the tokens, the only place raw values may appear
├── mocks/        # MSW handlers and fixtures, shared by every kind of test
├── views/        # one per route
└── …             # smaller folders for composables, errors, Favorites and Search
build/            # the Open Graph image, made at build time
e2e/              # Playwright
```

## Tested

- **Vitest** for the logic and for each page as the visitor sees it, with the API answered by MSW.
- **Storybook** interaction tests for every component, run in Chromium, with axe failing a story on any violation.
- **Playwright** for every route, on desktop Chromium, mobile WebKit and mobile Chrome, with axe in both themes and reflow at 320px.
- **One smoke test** against the real API, in its own CI job that can't block a merge.

CI runs all of it on every pull request, with a 90% coverage gate.

## How it was made

- **[The spec](docs/spec.md)** came first, then the [ADRs](docs/adr/), the [glossary](GLOSSARY.md) and the [voice guide](docs/voice.md).
- **Nine milestones,** each a GitHub issue and a pull request, with a [journal entry](docs/journal/) recording its decisions, the alternatives considered, its tests and screenshots. From the app shell on, each also had a VoiceOver pass on a Mac and an iPhone.
- **Built with Claude Code.** [`CLAUDE.md`](CLAUDE.md) holds the rules it worked to, and the Case Study's "Building with Claude" says how.
- **Deployed** with the Vercel CLI from the author's machine.
