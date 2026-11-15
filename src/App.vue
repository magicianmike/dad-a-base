<script setup lang="ts">
import { useHead } from '@unhead/vue'
import SiteFooter from '@/components/SiteFooter.vue'
import SiteHeader from '@/components/SiteHeader.vue'

useHead({ titleTemplate: (title) => (title ? `${title} · Dad-a-base` : 'The Dad-a-base') })
</script>

<template>
  <div class="page">
    <SiteHeader />
    <main id="main" tabindex="-1" class="main">
      <RouterView />
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  max-width: var(--measure);
  margin-inline: auto;
  padding-inline: var(--space-4);
}

.main {
  flex: 1;
  padding-block: var(--space-6) var(--space-8);
}

.main:focus {
  outline: none;
}
</style>
