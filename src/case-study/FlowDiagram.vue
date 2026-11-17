<script setup lang="ts">
import { computed, useId } from 'vue'

export interface FlowStep {
  title: string
  /** Up to two short lines under the title. SVG text doesn't wrap, so the lines are given. */
  detail?: string[]
  /** Set in the accent, for the step the diagram is about. */
  accent?: boolean
}

/**
 * Steps in a column, top to bottom, joined by arrows: a flow that reads at a phone's width. Drawn with the theme's
 * tokens, so it follows the theme. A screen reader reads its title and description, not the drawing.
 */
const props = defineProps<{
  title: string
  description: string
  steps: FlowStep[]
  /** A label beside each arrow, between step n and n + 1. */
  arrows?: string[]
}>()

const WIDTH = 360
const BOX_X = 30
const BOX_WIDTH = 300
const GAP = 40
const LINE = 17

const id = useId()
const titleId = `${id}-title`
const descId = `${id}-desc`
const arrowId = `${id}-arrow`

const boxes = computed(() => {
  let y = 4
  return props.steps.map((step) => {
    const height = 34 + (step.detail?.length ?? 0) * LINE
    const box = { ...step, y, height }
    y += height + GAP
    return box
  })
})

const height = computed(() => {
  const last = boxes.value.at(-1)
  return last ? last.y + last.height + 8 : 0
})
</script>

<template>
  <svg
    class="flow"
    :viewBox="`0 0 ${WIDTH} ${height}`"
    role="img"
    :aria-labelledby="titleId"
    :aria-describedby="descId"
  >
    <title :id="titleId">{{ title }}</title>
    <desc :id="descId">{{ description }}</desc>
    <defs>
      <marker
        :id="arrowId"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto"
      >
        <path d="M0 0 10 5 0 10Z" class="head" />
      </marker>
    </defs>
    <g v-for="(box, n) in boxes" :key="box.title">
      <rect
        :x="BOX_X"
        :y="box.y"
        :width="BOX_WIDTH"
        :height="box.height"
        :class="['box', { accent: box.accent }]"
      />
      <text :x="BOX_X + 14" :y="box.y + 23" class="title">{{ box.title }}</text>
      <text
        v-for="(line, i) in box.detail"
        :key="line"
        :x="BOX_X + 14"
        :y="box.y + 23 + (i + 1) * LINE"
        class="detail"
      >
        {{ line }}
      </text>
      <template v-if="n < boxes.length - 1">
        <line
          :x1="BOX_X + 40"
          :y1="box.y + box.height + 2"
          :x2="BOX_X + 40"
          :y2="box.y + box.height + GAP - 4"
          class="arrow"
          :marker-end="`url(#${arrowId})`"
        />
        <text
          v-if="arrows?.[n]"
          :x="BOX_X + 54"
          :y="box.y + box.height + GAP / 2 + 5"
          class="label"
        >
          {{ arrows[n] }}
        </text>
      </template>
    </g>
  </svg>
</template>

<style scoped>
.flow {
  display: block;
  width: 100%;
  max-width: var(--flow-diagram-width);
  height: auto;
  font-family: var(--font-body);
}

.box {
  fill: var(--color-surface-raised);
  stroke: var(--color-border);
  stroke-width: 2;
}

.box.accent {
  stroke: var(--color-accent);
  stroke-width: 3;
}

.title {
  fill: var(--color-text);
  font-size: 15px; /* stylelint-disable-line unit-disallowed-list -- SVG user units, scaled with the drawing */
  font-weight: 700;
}

.detail,
.label {
  fill: var(--color-text-muted);
  font-size: 12.5px; /* stylelint-disable-line unit-disallowed-list -- SVG user units, scaled with the drawing */
}

.label {
  font-family: var(--font-label);
  font-style: italic;
}

.arrow {
  stroke: var(--color-border);
  stroke-width: 2;
}

.head {
  fill: var(--color-border);
}
</style>
