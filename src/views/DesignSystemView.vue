<script setup lang="ts">
import { useHead } from '@unhead/vue'
import AppButton from '@/components/AppButton.vue'
import DadIllustration from '@/components/DadIllustration.vue'
import JokeCard from '@/components/JokeCard.vue'
import SiteMasthead from '@/components/SiteMasthead.vue'
import StoryHeading from '@/components/StoryHeading.vue'
import ThemeSpread from '@/components/ThemeSpread.vue'
import { jokes } from '@/mocks/fixtures'
import { resolve, tokens } from '@/styles/tokens/tokens'

useHead({ title: 'Design system' })

const colors = tokens.semanticColor.light.map(({ name }) => name)
const spaces = tokens.semanticShared.filter(({ name }) => name.startsWith('--space-'))

const typeSamples = [
  {
    token: '--font-display',
    label: 'Display: the masthead',
    text: 'The Dad-a-base',
    style: 'display',
  },
  {
    token: '--font-heading',
    label: 'Heading: h1',
    text: 'Local dad says the thing again',
    style: 'h1',
  },
  { token: '--font-heading', label: 'Heading: h2', text: 'Search the archives', style: 'h2' },
  {
    token: '--font-body',
    label: 'Body',
    text: 'Nothing lives at this address. The link may be mistyped.',
    style: 'body',
  },
  {
    token: '--font-label',
    label: 'Label: kickers and captions',
    text: 'Witnesses report groaning.',
    style: 'label',
  },
] as const

const storybookUrl = import.meta.env.DEV ? 'http://localhost:6006' : '/storybook/'
</script>

<template>
  <StoryHeading kicker="The style guide">Design system</StoryHeading>
  <p class="lede">
    Every value here is read from the token stylesheets, so this page can't drift from the code.
    Tokens come in three layers: primitive values, semantic roles, and Dad-a-base's own domain
    tokens. Components use only the last two.
    <a :href="storybookUrl">Browse every component in Storybook</a>.
  </p>

  <section aria-labelledby="ds-colour">
    <h2 id="ds-colour">Colour</h2>
    <p>
      Semantic colours. Themes change only these. Contrast is tested in both themes to WCAG 2.2 AA.
    </p>
    <ThemeSpread v-slot="{ theme }">
      <ul class="swatches">
        <li v-for="name in colors" :key="name" class="swatch">
          <span class="chip" :style="{ background: `var(${name})` }" />
          <code>{{ name }}</code>
          <span class="value">{{ resolve(`var(${name})`, theme) }}</span>
        </li>
      </ul>
    </ThemeSpread>
  </section>

  <section aria-labelledby="ds-type">
    <h2 id="ds-type">Type</h2>
    <dl class="specimens">
      <div v-for="sample in typeSamples" :key="sample.label" class="specimen">
        <dt>
          {{ sample.label }} <code>{{ sample.token }}</code>
        </dt>
        <dd :class="`type-${sample.style}`">{{ sample.text }}</dd>
      </div>
    </dl>
  </section>

  <section aria-labelledby="ds-space">
    <h2 id="ds-space">Space</h2>
    <ul class="spaces">
      <li v-for="{ name, value } in spaces" :key="name">
        <code>{{ name }}</code>
        <span class="bar" :style="{ width: `var(${name})` }" />
        <span class="value">{{ resolve(value, 'light') }}</span>
      </li>
    </ul>
  </section>

  <section aria-labelledby="ds-components">
    <h2 id="ds-components">Components</h2>
    <h3>Masthead</h3>
    <ThemeSpread><SiteMasthead /></ThemeSpread>
    <h3>The dad</h3>
    <ThemeSpread><DadIllustration class="dad" /></ThemeSpread>
    <h3>Buttons</h3>
    <ThemeSpread>
      <div class="buttons">
        <AppButton variant="primary">Another</AppButton>
        <AppButton>Open this joke</AppButton>
      </div>
    </ThemeSpread>
    <h3>Joke card</h3>
    <ThemeSpread><JokeCard :joke="jokes[0]!" caption="Witnesses report groaning." /></ThemeSpread>
  </section>

  <section aria-labelledby="ds-tokens">
    <h2 id="ds-tokens">Domain tokens</h2>
    <p>Dad-a-base's own parts, each built from semantic tokens.</p>
    <div
      class="table-scroll"
      tabindex="0"
      role="region"
      aria-label="Domain tokens table, scrolls sideways"
    >
      <table>
        <thead>
          <tr>
            <th scope="col">Token</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="{ name, value } in tokens.domain" :key="name">
            <td>
              <code>{{ name }}</code>
            </td>
            <td>
              <code>{{ value }}</code>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.lede {
  max-width: var(--measure-reading);
  font-size: var(--text-lg);
}

section {
  margin-top: var(--space-7);
}

h3 {
  margin-top: var(--space-5);
}

code {
  font-size: var(--text-sm);
  overflow-wrap: anywhere;
}

.value {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.swatches {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.swatch {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--space-3);
  align-items: center;
}

.chip {
  width: var(--target-min);
  height: var(--space-6);
  border: var(--border-width) solid var(--color-border);
}

.specimens {
  margin: 0;
}

.specimen {
  padding-block: var(--space-4);
  border-bottom: var(--border-width) solid var(--color-border);
}

.specimen dt {
  margin-bottom: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.specimen dd {
  margin: 0;
}

.type-display {
  font-family: var(--masthead-font);
  font-size: var(--masthead-size);
  line-height: 1;
}

.type-h1,
.type-h2 {
  font-family: var(--headline-font);
  font-weight: 700;
  line-height: 1.05;
  text-transform: uppercase;
}

.type-h1 {
  font-size: var(--text-3xl);
}

.type-h2 {
  font-size: var(--text-xl);
  font-weight: 600;
  letter-spacing: 0.04em;
}

.type-body {
  font-size: var(--text-lg);
}

.type-label {
  color: var(--caption-color);
  font-family: var(--caption-font);
  font-style: italic;
  font-weight: 700;
}

.spaces {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.spaces li {
  display: grid;
  grid-template-columns: 7rem auto 1fr;
  gap: var(--space-3);
  align-items: center;
}

.bar {
  height: var(--space-4);
  background: var(--color-accent);
}

.dad {
  width: 8rem;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: var(--space-2) var(--space-3);
  border-bottom: var(--border-width) solid var(--color-border);
  text-align: left;
  vertical-align: top;
}
</style>
