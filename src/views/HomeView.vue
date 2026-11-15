<script setup lang="ts">
import { useHead } from '@unhead/vue'

useHead({ title: '' })
</script>

<template>
  <h1>Dadabase</h1>
  <p>A database of dad jokes, sorted by groan.</p>
  <RouterLink to="/random">Get a random joke</RouterLink>
</template>
