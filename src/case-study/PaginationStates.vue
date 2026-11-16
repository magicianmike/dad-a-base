<script setup lang="ts">
import { ref } from 'vue'
import SearchPagination from '@/components/SearchPagination.vue'
import LiveFigure from './LiveFigure.vue'
import StatePicker from './StatePicker.vue'

/** The Pagination window at both ends and in the middle of 40 pages: it stays 11 wide throughout. */
const pages = [
  { value: 2, label: 'Page 2' },
  { value: 8, label: 'Page 8' },
  { value: 38, label: 'Page 38' },
] as const

const page = ref<number>(8)
const link = (n: number) => ({ path: '/search', query: { q: 'pun', page: String(n) } })
</script>

<template>
  <LiveFigure
    caption="SearchPagination for 40 pages. Its links go to that page of a real Search for “pun”."
  >
    <StatePicker v-model="page" legend="Show the window on" :options="pages" />
    <SearchPagination :page="page" :total-pages="40" :to="link" />
  </LiveFigure>
</template>
