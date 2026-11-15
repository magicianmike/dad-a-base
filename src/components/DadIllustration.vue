<script setup lang="ts">
/** A dad peeking over his newspaper. Decorative wherever it appears beside the name, so hidden from assistive tech. */
</script>

<template>
  <svg class="dad" viewBox="0 0 140 120" aria-hidden="true" focusable="false">
    <path class="skin" d="M30 64 q0-50 40-50 q40 0 40 50z" />
    <path class="side-hair" d="M30 52 q2-12 10-16 M110 52 q-2-12-10-16" />
    <path class="tuft" d="M66 15 q-2-10 6-12 q-4 6 2 11" />
    <path class="brows" d="M46 34 q8-6 16 0 M78 34 q8-6 16 0" />
    <circle class="lens" cx="54" cy="47" r="10" />
    <circle class="lens" cx="86" cy="47" r="10" />
    <path class="bridge" d="M64 47 h12" />
    <circle class="pupil" cx="56" cy="49" r="3" />
    <circle class="pupil" cx="88" cy="49" r="3" />
    <rect class="paper" x="8" y="62" width="124" height="54" rx="2" />
    <path class="fold" d="M70 62 v54" />
    <text class="headline" x="38" y="81" text-anchor="middle">JOKES</text>
    <path
      class="columns"
      d="M18 88 h40 M18 96 h40 M18 104 h30 M80 74 h42 M80 82 h42 M80 90 h42 M80 98 h42 M80 106 h28"
    />
    <circle class="skin" cx="12" cy="74" r="8" />
    <circle class="skin" cx="128" cy="74" r="8" />
  </svg>
</template>

<style scoped>
.dad {
  display: block;
  stroke: var(--color-border);
  stroke-width: 4;
  fill: none;
}

.skin {
  fill: var(--dad-skin);
}

.side-hair {
  stroke: var(--dad-hair);
  stroke-width: 7;
  stroke-linecap: round;
}

.tuft {
  fill: var(--dad-hair);
  stroke-width: 2;
}

.brows {
  stroke-linecap: round;
}

.lens,
.paper {
  fill: var(--color-surface-raised);
}

.pupil {
  fill: var(--color-border);
  stroke: none;
}

.fold {
  stroke-width: 2;
}

.headline {
  fill: var(--color-accent);
  stroke: none;
  font-family: var(--headline-font);
  font-size: 13px; /* stylelint-disable-line unit-disallowed-list -- SVG user units, scaled with the viewBox */
  font-weight: 700;
}

.columns {
  stroke: var(--color-text-muted);
  stroke-width: 3;
}
</style>
