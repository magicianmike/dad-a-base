# Dad-a-base

A dad-joke site on the icanhazdadjoke REST API, with a Case Study explaining how it was built. The spec is `docs/spec.md`, and the original brief is `docs/brief.md`.

## Working here

- Work in milestones (see the spec). Each is a GitHub issue on `onX-Hiring/interview-project-mike-mccormick` and a PR, managed with `gh`. Everything there is visible to the hiring team: ask the author before pushing, opening issues or PRs, or commenting.
- Each milestone ends with a journal entry in `docs/journal/NNNN-name.md`: its decisions, the alternatives considered, its tests, screenshots and the VoiceOver pass.
- Decisions that are hard to reverse go in `docs/adr/`. Domain terms are in `GLOSSARY.md`; use them as written there.
- Deploys use the Vercel CLI from the author's machine (`vercel`, `vercel --prod`). There's no Git integration.

## Code

- Vue 3 with `<script setup lang="ts">`. All API data goes through Apollo and `apollo-link-rest` (`src/api/`). App state is in Pinia (`src/stores/`), and anything saved in the browser goes through `useStoredRef` (ADR 0005). State you can link to is in the URL.
- Zod schemas in `src/api/schemas.ts` are the single source of truth for API types. Don't write API types by hand.
- Styles use only semantic and domain tokens (ADR 0004). No raw `px` or colour values outside `src/styles/tokens/`.
- Tests never call the real API, apart from the one smoke test: MSW handlers in `src/mocks/`.

## Commands

- `npm run dev`: the app at http://localhost:5173
- `npm run check`: lint, typecheck, and unit and Storybook tests with coverage, as CI runs them
- `npm test`: Vitest
- `npm run test:e2e`: Playwright (builds and previews the app first)
- `npm run storybook`: Storybook at http://localhost:6006
