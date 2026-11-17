# 0013 · Faster CI

CI took about 9 minutes, and 6 of them were Playwright: 384 end-to-end tests, 128 on each of desktop Chromium, mobile WebKit and mobile Chrome, on 2 workers, half the cores of GitHub's 4-core runner. The author asked whether the codebase does too much testing. It doesn't: the tests caught real bugs, and three browsers caught the iOS ones. But some checks ran three times for nothing, and the browsers ran one after another. Issue #28.

## Before and after

|                      | Before (`refactor-shared`, run 43980446934) | After (this PR, run 43984745754) |
| -------------------- | ------------------------------------------- | -------------------------------- |
| CI, start to finish  | **8m 54s**                                  | **3m 31s**                       |
| End-to-end test runs | 384                                         | 269                              |
| Playwright, in CI    | 6m 5s, one job                              | 2m 14s, the slowest of three     |
| Playwright, on a Mac | ~57s                                        | ~41s                             |
| Browsers installed   | all, every run                              | the job's own, cached            |

In the new run, the jobs took:

| Job                    | Time   | Of which, its tests         |
| ---------------------- | ------ | --------------------------- |
| e2e (desktop-chromium) | 3m 28s | 2m 14s (126)                |
| e2e (mobile-webkit)    | 3m 0s  | 1m 28s (80)                 |
| check                  | 2m 26s | 1m 5s, Vitest and Storybook |
| e2e (mobile-chrome)    | 2m 2s  | 1m 6s (63)                  |
| smoke                  | 39s    |                             |

That run started with an empty browser cache, so later runs should install browsers a little faster.

## Decisions

### Defaults, not asked

- **One job per browser project, side by side.** The biggest win, and it drops nothing. Each job builds and previews the app itself, which costs about 15 seconds each, against minutes saved. `fail-fast` is off, so one browser failing doesn't hide another's results, and each uploads its own report on failure.
- **Checks that don't depend on the browser run once,** chosen per test with Playwright tags, and filtered per project in `playwright.config.ts`:
  - **`@axe`**: full-site axe in both themes, and each feature's axe tests, on desktop Chromium only. axe reads the DOM and computed colours, the same in any engine.
  - **`@axe-phone`**: axe on what only a phone shows, the Sections drawer, on mobile Chrome only. Desktop never shows it, so `@axe` alone would have run it nowhere.
  - **`@reflow`**: tests that force a 320px viewport, on desktop Chromium and mobile WebKit. In mobile Chrome they repeated desktop Chromium's layout exactly, same engine and same viewport. WebKit lays out on its own, so it keeps them.
  - **Behaviour runs on all three.** That's where the browsers differ, as the iOS lift bug showed.
- **Tags, not separate spec files.** A tag keeps a check next to the feature it checks, and a test's title stays as it was.
- **Only the browsers a job needs.** `check` installs Chromium for Storybook's component tests; each e2e job installs its own; Firefox and the rest aren't installed. Browsers are cached, keyed on the lockfile.
- **Workers stay at Playwright's default.** Doubling them on a 4-core runner would risk flakiness for less than splitting the browsers gave.
- **No ADR.** This is easy to reverse: the tags and the matrix come out in a few lines.

## Where every check still runs

| Check                                      | Before                       | After                           |
| ------------------------------------------ | ---------------------------- | ------------------------------- |
| Full-site axe and each feature's axe tests | 3 browsers                   | desktop Chromium                |
| axe on the Sections drawer                 | mobile WebKit, mobile Chrome | mobile Chrome                   |
| 320px reflow                               | 3 browsers                   | desktop Chromium, mobile WebKit |
| Everything else                            | 3 browsers                   | 3 browsers                      |

## Tests

- **Playwright:** 248 passed, 21 skipped (269 runs), on a Mac and in CI, the same tests as before, tagged.
- **Vitest and Storybook:** 381 passed, unchanged.

## VoiceOver pass

**Status: not needed.** No app code changed, only the Case Study's text.

## Open

- **Not deployed.** The Case Study's testing section now says how the checks run; it reaches production with the next `vercel --prod`.
