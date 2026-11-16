<script setup lang="ts" generic="T">
/**
 * A numbered list of cards, such as Favorites or Groans, where a removed card falls off before it goes and the ones
 * below slide up into its place. Only a removal animates (`falling`): cards a filter or a new page takes away just go.
 * `useFallingRemoval` counts the falls and moves focus.
 */
defineProps<{
  items: readonly T[]
  itemKey: (item: T) => string
  /** The first item's number, on a later page. */
  start?: number
  /** Cards are falling, so leaving animates. */
  falling: boolean
}>()

const emit = defineEmits<{ fallen: [] }>()

/** Pins a falling card where it was, so leaving the flow doesn't move it before it falls. */
function pin(el: Element) {
  const card = el as HTMLElement
  card.style.top = `${card.offsetTop}px`
  card.style.width = `${card.offsetWidth}px`
}
</script>

<template>
  <TransitionGroup
    tag="ol"
    name="fall"
    :css="falling"
    class="list"
    :start="start"
    @before-leave="pin"
    @after-leave="emit('fallen')"
  >
    <li v-for="(item, index) in items" :key="itemKey(item)">
      <slot :item="item" :index="index" />
    </li>
  </TransitionGroup>
</template>

<style scoped>
.list {
  position: relative;
  display: grid;
  gap: var(--space-6);
  margin: var(--space-5) 0 var(--space-6);
  padding: 0;
  list-style: none;
}

/* The cards below a removed one slide up into its place. */
.fall-move {
  transition: transform 300ms ease;
}

/* A removed card, out of the flow and pinned where it was, drops, tilts and fades. After .fall-move, which a
   leaving card can also get, so its fade isn't lost. */
.fall-leave-active {
  position: absolute;
  transition:
    opacity 300ms ease-in,
    transform 300ms ease-in;
}

.fall-leave-to {
  opacity: 0;
  transform: translateY(var(--space-6)) rotate(-4deg);
}

@media (prefers-reduced-motion: reduce) {
  .fall-leave-active,
  .fall-move {
    transition: none;
  }
}
</style>
