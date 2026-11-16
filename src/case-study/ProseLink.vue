<script setup lang="ts">
import { computed } from 'vue'

/** A link in the Case Study's prose: the app's own pages through the router, anywhere else as a plain link. */
const props = defineProps<{ href: string }>()
const internal = computed(() => props.href.startsWith('/'))
</script>

<template>
  <RouterLink v-if="internal" :to="href"><slot /></RouterLink>
  <a v-else :href="href"><slot /></a>
</template>
