<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { onMounted, onScopeDispose, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CaseStudy from '@/case-study/CaseStudy.mdx'
import ProseLink from '@/case-study/ProseLink.vue'
import StoryHeading from '@/components/StoryHeading.vue'

useHead({
  title: 'How the Dad-a-base was built',
  meta: [
    {
      name: 'description',
      content:
        'A case study of the Dad-a-base: the product, design and engineering decisions behind a dad-joke site built with Vue 3, Apollo and a design system of tokens.',
    },
  ],
})

/** The Case Study's chapters, in order. Their ids are on the headings in the MDX. */
const chapters = [
  { id: 'in-60-seconds', label: 'In 60 seconds' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'product-and-ux', label: 'Product and UX' },
  { id: 'what-i-rejected', label: 'What I rejected' },
]

const route = useRoute()
const router = useRouter()
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/**
 * Goes to a chapter, or `top`: into the address, scrolled to, and focused, as a new page's headline would be. Again
 * if it's already the address, which the router alone would ignore.
 */
async function go(id: string) {
  await router.push({ hash: `#${id}` })
  const target = document.getElementById(id)
  if (!target) return
  // A smooth scroll between chapters, unless motion is reduced. The top is the top of the page, Masthead and all,
  // though focus goes to the headline.
  const reduced = typeof matchMedia === 'function' && matchMedia(REDUCED_MOTION).matches
  const behavior = reduced ? 'instant' : 'smooth'
  if (id === 'top') scrollTo({ top: 0, behavior })
  else target.scrollIntoView?.({ behavior })
  focusOn(target)
}

/** Focuses a chapter's heading, or the top, making it focusable first, as a new page's headline is. */
function focusOn(target: HTMLElement) {
  target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}

/**
 * Keeps a chapter in view while the page settles after arriving at it: web fonts and live components re-flow what's
 * above it, and Safari has no scroll anchoring to hold its place. Any change in the page's height scrolls back to
 * it, for up to three seconds, or until the visitor scrolls, taps, clicks or presses a key.
 */
const HOLD_MS = 3000
const VISITOR_INPUT = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const
let release = () => {}
function holdInView(target: HTMLElement) {
  if (typeof ResizeObserver !== 'function') return
  const observer = new ResizeObserver(() => target.scrollIntoView())
  const timer = setTimeout(() => release(), HOLD_MS)
  release = () => {
    observer.disconnect()
    clearTimeout(timer)
    for (const input of VISITOR_INPUT) removeEventListener(input, release)
  }
  observer.observe(document.body)
  for (const input of VISITOR_INPUT) addEventListener(input, release, { passive: true })
}
onScopeDispose(() => release())

// Arriving at a chapter's address, the router has scrolled there. Focus follows, and the chapter is held in view.
onMounted(() => {
  const target = route.hash && document.getElementById(route.hash.slice(1))
  if (!target) return
  focusOn(target)
  holdInView(target)
})

/**
 * The chapter being read: the last whose heading has passed the top third of the screen. At the foot of the page
 * it's the last chapter, whose heading may never get that high if the chapter is short.
 */
const current = ref(chapters[0]!.id)
function findCurrent() {
  const atFoot = innerHeight + scrollY >= document.documentElement.scrollHeight - 2
  if (atFoot && scrollY > 0) {
    current.value = chapters.at(-1)!.id
    return
  }
  current.value = chapters.reduce((found, { id }) => {
    const top = document.getElementById(id)?.getBoundingClientRect().top ?? Infinity
    return top <= innerHeight / 3 ? id : found
  }, chapters[0]!.id)
}
let frame = 0
function onScroll() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(findCurrent)
}
onMounted(() => {
  findCurrent()
  addEventListener('scroll', onScroll, { passive: true })
})
onScopeDispose(() => {
  cancelAnimationFrame(frame)
  removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header id="top" tabindex="-1" class="intro">
    <StoryHeading kicker="About">How the Dad-a-base was built</StoryHeading>
    <p class="standfirst">
      A case study of the product, design and engineering decisions behind this site, for the people
      reviewing it.
    </p>
  </header>
  <div class="layout">
    <!-- The chapters stay beside the text as it scrolls past, and mark the one being read. -->
    <nav aria-label="Chapters" class="chapters">
      <ol>
        <li v-for="chapter in chapters" :key="chapter.id">
          <a
            :href="`#${chapter.id}`"
            :aria-current="current === chapter.id ? 'location' : undefined"
            @click.prevent="go(chapter.id)"
            >{{ chapter.label }}</a
          >
        </li>
      </ol>
      <a href="#top" class="to-top" @click.prevent="go('top')">Back to top</a>
    </nav>
    <article class="prose">
      <CaseStudy :components="{ a: ProseLink }" />
      <p class="end">
        <a href="#top" class="to-top" @click.prevent="go('top')"
          ><span aria-hidden="true">↑</span> Back to top</a
        >
      </p>
    </article>
  </div>
</template>

<style scoped>
.intro {
  max-width: var(--measure-reading);
  margin-bottom: var(--space-6);
  scroll-margin-top: var(--space-5);
}

.intro:focus {
  outline: none;
}

.standfirst {
  font-size: var(--text-lg);
}

/* Chapters beside the text on a wide screen; above it, and not sticky, on a narrow one. */
.layout {
  display: grid;
  grid-template-columns: 12rem minmax(0, 1fr);
  gap: var(--space-6);
  align-items: start;
}

.chapters {
  position: sticky;
  top: var(--space-5);
  padding-top: var(--space-4);
  border-top: var(--masthead-rule);
}

.chapters ol {
  margin: 0 0 var(--space-4);
  padding: 0;
  list-style: none;
  counter-reset: chapter;
}

.chapters li {
  counter-increment: chapter;
}

.chapters li a {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  min-height: var(--target-min);
  padding-left: var(--space-3);
  border-left: var(--indicator-width) solid transparent;
  font-weight: 700;
  text-decoration: none;
}

.chapters li a::before {
  color: var(--kicker-color);
  font-family: var(--kicker-font);
  content: counter(chapter) '.';
}

.chapters li a:hover {
  text-decoration: underline;
}

.chapters [aria-current='location'] {
  border-left-color: var(--color-accent);
  color: var(--color-accent);
}

.to-top {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
  min-height: var(--target-min);
  font-weight: 700;
}

.chapters .to-top {
  padding-left: var(--space-3);
  color: var(--caption-color);
  font-family: var(--caption-font);
}

.end {
  margin-top: var(--space-7);
  padding-top: var(--space-4);
  border-top: var(--masthead-rule);
}

@media (width < 56rem) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-5);
  }

  .chapters {
    position: static;
  }

  .chapters .to-top {
    display: none;
  }
}

.prose > :deep(:first-child) {
  margin-top: 0;
  padding-top: 0;
  border-top: 0;
}

/*
 * The MDX renders plain elements, so the article sets their type. Only its own elements, its direct children and
 * what's in them, so the live components inside keep their own styles.
 */
.prose > :deep(*) {
  max-width: var(--measure-reading);
}

/* A live component gets a little more room than the text, so it lays out as it does in the app. */
.prose > :deep(.live) {
  max-width: calc(var(--measure-reading) + 2 * var(--space-5));
}

.prose > :deep(h2) {
  scroll-margin-top: var(--space-5);
  margin-top: var(--space-8);
  padding-top: var(--space-4);
  border-top: var(--masthead-rule);
  font-size: var(--text-2xl);
}

.prose > :deep(h2:focus) {
  outline: none;
}

.prose > :deep(h3) {
  margin-top: var(--space-6);
}

.prose > :deep(p),
.prose > :deep(ul > li) {
  line-height: 1.6;
}

.prose > :deep(ul > li + li) {
  margin-top: var(--space-2);
}

.prose > :deep(:is(p, ul, table) code) {
  padding: 0 var(--space-1);
  background: var(--color-surface-raised);
  font-size: 0.9em;
  overflow-wrap: anywhere;
}

.prose > :deep(:is(p, table) kbd) {
  padding: 0 var(--space-1);
  line-height: 1;
  border: var(--border-width) solid var(--color-border);
  font-family: inherit;
  font-weight: 700;
}

.prose > :deep(table) {
  width: 100%;
  margin: var(--space-5) 0;
  border-collapse: collapse;
}

.prose > :deep(table :is(th, td)) {
  padding: var(--space-2) var(--space-3);
  border-bottom: var(--border-width) solid var(--color-border);
  text-align: left;
  vertical-align: top;
}

.prose > :deep(table th) {
  font-family: var(--headline-font);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
</style>
