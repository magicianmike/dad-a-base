<script setup lang="ts">
import DadIllustration from './DadIllustration.vue'
</script>

<template>
  <div class="masthead">
    <div class="layout">
      <p class="ear">Late edition · Partly punny, with a chance of groans</p>
      <RouterLink to="/" class="name-link">
        <DadIllustration class="crest" />
        <span class="name">
          <span class="the">The</span>
          Dad<span class="hyphen">-a-</span>base
        </span>
      </RouterLink>
      <p class="ear">Est. by dads · Price: one groan</p>
    </div>
  </div>
</template>

<style scoped>
/* Sized by its container, not the viewport, so it also fits a half-width panel on /design-system. */
.masthead {
  container-type: inline-size;
}

.layout {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--space-4);
  align-items: center;
}

.ear {
  max-width: 10rem;
  margin: 0;
  padding: var(--space-2) var(--space-3);
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-muted);
  font-family: var(--kicker-font);
  font-size: var(--text-xs);
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.ear:last-child {
  justify-self: end;
}

.name-link {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  color: var(--color-text);
  text-decoration: none;
}

.crest {
  flex: none;
  width: clamp(3.5rem, 12cqi, 6.5rem);
}

.name {
  font-family: var(--masthead-font);
  font-size: var(--masthead-size);
  font-weight: 400;
  line-height: 1;
}

.the {
  display: block;
  font-size: 0.45em;
  text-align: center;
}

.hyphen {
  color: var(--masthead-hyphen-color);
}

@container (width < 48rem) {
  .layout {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .ear {
    display: none;
  }

  /* The Dad above the name, so each can be larger in a narrow column, without pushing the page too far down. */
  .name-link {
    flex-direction: column;
    gap: var(--space-1);
  }

  .crest {
    width: clamp(5rem, 26cqi, 7rem);
  }

  .name {
    font-size: clamp(var(--masthead-size), 15cqi, 4.5rem);
  }
}
</style>
