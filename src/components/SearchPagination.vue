<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { paginationWindow } from '@/lists/pagination'

/**
 * Previous, the Pagination window and Next, as links. `to` gives each page's address. On the first and last pages,
 * Previous and Next are disabled links: still read out, but going nowhere.
 */
const props = defineProps<{
  page: number
  totalPages: number
  to: (page: number) => RouteLocationRaw
}>()

const pages = computed(() => paginationWindow(props.page, props.totalPages))
</script>

<template>
  <nav aria-label="Pages" class="pagination">
    <RouterLink v-if="page > 1" :to="to(page - 1)" class="step">Previous</RouterLink>
    <a v-else role="link" aria-disabled="true" class="step">Previous</a>
    <ol class="pages">
      <li v-for="n in pages" :key="n">
        <RouterLink
          :to="to(n)"
          class="number"
          :aria-label="`Page ${n}`"
          :aria-current="n === page ? 'page' : undefined"
          >{{ n }}</RouterLink
        >
      </li>
    </ol>
    <RouterLink v-if="page < totalPages" :to="to(page + 1)" class="step">Next</RouterLink>
    <a v-else role="link" aria-disabled="true" class="step">Next</a>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-3);
  align-items: center;
  justify-content: center;
}

.pages {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  justify-content: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

.step,
.number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--target-min);
  min-height: var(--target-min);
  padding-inline: var(--space-2);
  font-weight: 700;
}

.step {
  font-size: var(--text-sm);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.number {
  border: var(--border-width) solid transparent;
  text-decoration: none;
}

.number:hover {
  border-color: var(--color-border);
}

.number[aria-current='page'] {
  border-color: var(--color-border);
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
}

.step[aria-disabled='true'] {
  color: var(--color-text-muted);
}
</style>
