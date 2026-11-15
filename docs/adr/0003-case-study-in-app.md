# The Case Study lives in the app's codebase

The Case Study is a route on the same site, `/case-study`, built from the same codebase as the app, not a separate portfolio page. It can render live app components in fixed states, such as the pagination window on page 2 or `ErrorView` for a 429, next to the decision each one explains, instead of showing screenshots. That also requires every component to render on its own from props, which is itself evidence for the architecture. MySous made the same choice.

## Consequences

- Components take their state as props, or from a provider that can be overridden, so the Case Study and Storybook can fix any state.
- The Case Study is written in MDX, so the prose can hold live components.
- Its claims are checked against the journal and the ADRs before each release.
