# 0008 · The README and polish

Milestone 8, the last. The README is written for reviewers, the "reveal the punchline" interaction is dropped, and production builds no longer ship MSW's service worker.

## Decisions

The author asked for the README to be cleaned up and the punchline reveal left out. The rest are defaults.

- **The punchline reveal is dropped,** at the author's call. Planned since milestone 1, where the comic-zine prototype split each Joke into a setup panel and a punchline panel, it would add an interaction to learn and code to maintain, and many Jokes have no natural break, so any rule for finding one would guess wrong. It's in the spec's milestones and the Case Study's "What I rejected".
- **The README is for reviewers.** It points to the Case Study, the design system and Storybook first; maps the basics to what was built; then covers running it, how it's built, how it's tested and how it was made, linking to the spec, the ADRs, the glossary, the voice guide, the journal and `CLAUDE.md`. It doesn't repeat the Case Study.
- **Production builds don't ship `mockServiceWorker.js`** (milestone 0's open item). It's MSW's only public file, so it moved to `public-e2e/`, which only `--mode e2e` builds copy in. Other builds have no public folder. The MSW config, Prettier and ESLint point to the new folder, and `vitest.config.ts` now merges the Vite config as a function of the mode.
- **The bundle stays as it is** (milestone 0's open item, then 147 KB gzipped). The first load is now 131 KB gzipped for the entry, mostly Apollo, GraphQL, Zod and Vue, and 29 KB for a chunk the pages share. The Case Study, the design system and each page load on their own. Cutting further would mean replacing Apollo or Zod, which ADR 0002 and the spec chose on purpose.
- **The Case Study's claims were checked again,** as ADR 0003 asks before a release: nine milestones, three browsers, coverage over 95% against the 90% gate, and the passes from the app shell on all still hold.

## Tests

- No new tests: nothing the visitor sees changed but the Case Study's new paragraph.
- **Builds:** a production build has no `mockServiceWorker.js`, an e2e build has it, and Storybook still builds.
- **Totals:**
  - Vitest and Storybook: 297 passed, 96.9% of statements and 93.9% of branches.
  - Playwright: 293 passed, 7 skipped (as in milestone 7).

## VoiceOver pass

**Not needed.** Nothing interactive changed. The Case Study's new paragraph is text under an existing heading.

## Open

- **The bundle,** as above, if a later change can cut Apollo's weight without losing what it shows.
