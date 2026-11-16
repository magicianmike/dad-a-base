<script setup lang="ts">
import { onScopeDispose, ref, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { mainNavigation } from '@/navigation'

/**
 * On a phone, the main navigation: a three-line button, named "Sections", that opens a drawer from the left. A native modal dialog, so
 * it holds focus, the page behind is inert, and Escape closes it and returns focus to the button. Choosing a
 * section, Close, or a tap on the page beside it closes it too. Wider, the button hides and the header's own row of
 * sections takes over.
 */
const open = ref(false)
const drawer = useTemplateRef<HTMLDialogElement>('drawer')
const button = useTemplateRef<HTMLButtonElement>('button')

watch(open, (isOpen) => {
  if (isOpen && !drawer.value?.open) drawer.value?.showModal()
  if (!isOpen && drawer.value?.open) drawer.value.close()
})

// Focus goes back to the button, as Chrome does on its own and Safari doesn't. Choosing a section then moves it on
// to the new page's headline.
function onClose() {
  open.value = false
  button.value?.focus()
}

// The drawer fills the dialog, so a click on the dialog itself is a click on the backdrop beside it.
function onClick(event: MouseEvent) {
  if (event.target === drawer.value) open.value = false
}

// Back and forward, too, leave it closed.
const route = useRoute()
watch(
  () => route.fullPath,
  () => (open.value = false),
)

// Grown past a phone's width, there's no button to return to, so it closes.
const wide = typeof matchMedia === 'function' ? matchMedia('(width >= 40rem)') : null
function onWide(event: MediaQueryListEvent) {
  if (event.matches) open.value = false
}
wide?.addEventListener('change', onWide)
onScopeDispose(() => wide?.removeEventListener('change', onWide))
</script>

<template>
  <div class="sections-menu">
    <button ref="button" type="button" class="open" aria-haspopup="dialog" @click="open = true">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      <span class="visually-hidden">Sections</span>
    </button>
    <dialog ref="drawer" class="drawer" aria-label="Sections" @click="onClick" @close="onClose">
      <div class="panel">
        <div class="head">
          <button type="button" class="close" @click="open = false">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
            <span class="visually-hidden">Close</span>
          </button>
        </div>
        <!-- Only while open, so the header's own row is the only "Main" navigation otherwise. -->
        <nav v-if="open" aria-label="Main">
          <RouterLink
            v-for="item in mainNavigation"
            :key="item.to"
            :to="item.to"
            @click="open = false"
            >{{ item.label }}</RouterLink
          >
        </nav>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.open,
.close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--target-min);
  min-height: var(--target-min);
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-text);
  cursor: pointer;
}

/* Only on a phone. */
.open {
  display: none;
}

svg {
  width: var(--space-5);
  height: var(--space-5);
  fill: none;
  stroke: currentcolor;
  stroke-linecap: round;
  stroke-width: 2;
}

/* The hamburger a little larger than the Close mark, as the one way in. */
.open svg {
  width: var(--space-6);
  height: var(--space-6);
}

/* A page pulled from the left edge, ruled like a paper's index, its shadow printed on the page beside it. */
.drawer {
  width: min(85%, 20rem);
  max-width: none;
  height: 100%;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  border-right: var(--border-width-strong) solid var(--color-border);
  background: var(--color-surface-raised);
  color: var(--color-text);
  box-shadow: var(--correction-shadow);
  transform: translateX(-100%);
  transition:
    transform 250ms ease-out,
    overlay 250ms allow-discrete,
    display 250ms allow-discrete;
}

.drawer[open] {
  transform: none;

  @starting-style {
    transform: translateX(-100%);
  }
}

.drawer::backdrop {
  background: transparent;
  transition:
    background 250ms ease-out,
    overlay 250ms allow-discrete,
    display 250ms allow-discrete;
}

.drawer[open]::backdrop {
  background: color-mix(in srgb, var(--color-scrim) 55%, transparent);

  @starting-style {
    background: transparent;
  }
}

.panel {
  height: 100%;
  padding: var(--space-3) var(--space-4);
}

.head {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: var(--space-2);
  border-bottom: var(--masthead-rule);
}

nav {
  display: flex;
  flex-direction: column;
}

nav a {
  display: flex;
  align-items: center;
  min-height: var(--target-min);
  padding-block: var(--space-2);
  border-bottom: var(--border-width) solid var(--color-border);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-decoration: none;
  text-transform: uppercase;
}

/* The current section, in the accent and underlined in the word, so it's more than colour alone. */
nav a[aria-current='page'] {
  color: var(--color-accent);
  text-decoration: underline;
  text-decoration-thickness: var(--indicator-width);
  text-underline-offset: var(--space-1);
}

@media (width < 40rem) {
  .open {
    display: inline-flex;
  }
}

@media (prefers-reduced-motion: reduce) {
  .drawer,
  .drawer::backdrop {
    transition: none;
  }
}
</style>
