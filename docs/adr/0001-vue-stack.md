# Vue 3, TypeScript and Vite, with plain CSS

Dad-a-base is a Vue 3 single-page app, written with the Composition API and `<script setup>` in TypeScript and built with Vite, styled with plain CSS and CSS Modules. The brief leaves the stack open. The job calls for Vue, and a take-home project should show depth in that ecosystem, so the app uses its standard pieces: vue-router, Pinia, `@vue/apollo-composable` and `@unhead/vue`. The brief says it judges how the components are laid out, so the layout is written by hand instead of coming from a component library.

## Considered Options

- **Nuxt**: server rendering and file routing for free, but this app needs no server rendering, and the framework would hide the routing and data wiring a reviewer wants to see.
- **A component library (Vuetify, PrimeVue)**: quick, but it does the layout work the brief asks to see.
- **Tailwind**: fine for layout, but utility classes don't express the semantic and domain tokens of [ADR 0004](0004-design-tokens.md).
- **Vue, Vite, plain CSS (chosen).**

## Consequences

- The site is static. Vercel serves `index.html` for every route, so unknown paths reach the router's catch-all and `ErrorView`.
- Without server rendering, a joke page can't have its own Open Graph image. Only the Case Study gets one, made at build time.
- TypeScript stays on 5.x: `vue-tsc` doesn't support TypeScript 7 yet.
