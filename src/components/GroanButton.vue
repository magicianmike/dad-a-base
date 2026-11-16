<script setup lang="ts">
import { computed, onScopeDispose, ref, useId } from 'vue'
import type { Joke } from '@/api/schemas'
import { groanAnnouncement, groanLabel, groanScore } from '@/groans/score'
import { useGroanHold } from '@/groans/useGroanHold'
import { useGroansStore } from '@/stores/groans'
import { useToastsStore } from '@/stores/toasts'
import AppButton from './AppButton.vue'

/**
 * Press and hold to Groan at a Joke: the longer the hold, the worse the Joke. It fills with a gradient over 3
 * seconds, its "Ugh" gaining an h every quarter second, and shakes when it's full. Letting go records the Groan,
 * however short, with a comic burst and a toast, and the "Ughhh" stays; sliding off, a scroll taking over, or Escape
 * cancels it. Space and Enter hold it too. Its name is its label, after "Groan: " once it's an "Ughhh", and its
 * tooltip, also its description, says how it works.
 */
const props = defineProps<{ joke: Joke }>()
const groans = useGroansStore()
const toasts = useToastsStore()
const tipId = useId()

/** The Visitor's earlier Groan at this Joke, from 0 to 1, if there is one. */
const previous = computed(() => groans.scoreOf(props.joke.id))

const burst = ref<{ key: number; text: string } | null>(null)
let bursts = 0
let burstTimer: ReturnType<typeof setTimeout> | undefined

function record(fraction: number) {
  groans.groan(props.joke, fraction)
  toasts.show(groanAnnouncement(fraction))
  const score = groanScore(fraction)
  burst.value = { key: bursts++, text: score ? `GROAN! ${score}` : 'GROAN!' }
  clearTimeout(burstTimer)
  burstTimer = setTimeout(() => (burst.value = null), 1400)
  try {
    navigator.vibrate?.(fraction >= 1 ? [40, 60, 40] : 20)
  } catch {
    // No haptics here, which is fine.
  }
}
onScopeDispose(() => clearTimeout(burstTimer))

// A press too short to be a hold shows the tooltip for a moment, since on a phone there's no hover to show it.
const hinting = ref(false)
let hintTimer: ReturnType<typeof setTimeout> | undefined
function hint() {
  hinting.value = true
  clearTimeout(hintTimer)
  hintTimer = setTimeout(() => (hinting.value = false), 2500)
}
onScopeDispose(() => clearTimeout(hintTimer))

const { holding, fraction, full, start, release, cancel, pressed } = useGroanHold(record, {
  onTooShort: hint,
})

/** How full it looks: the hold while it's held, else the earlier Groan, else empty. */
const level = computed(() => (holding.value ? fraction.value : (previous.value ?? 0)))
/** "Groan" until it's groaned at, then the hold's "Ughhh", which stays after it's let go, and comes back next visit. */
const label = computed(() => {
  if (holding.value) return groanLabel(fraction.value)
  return previous.value === undefined ? 'Groan' : groanLabel(previous.value)
})

const name = computed(() => (label.value === 'Groan' ? 'Groan' : `Groan: ${label.value}`))

const HOW = 'Press and hold to groan, the longer the groan the worse the joke.'
const tip = computed(() => {
  if (previous.value === undefined) return HOW
  const score = groanScore(previous.value)
  return score ? `Your groan: ${score}/10. ${HOW}` : `You groaned. ${HOW}`
})

// Escape hides the tooltip until the pointer or focus comes back (WCAG 1.4.13), and cancels a hold.
const dismissed = ref(false)

/*
 * The button grows with its "Ughhh", so it holds on to the pointer while pressed, and a hold is slid off only when
 * the pointer moves away from where it pressed, by more than a touch target, not when the button moves under it.
 * The lift is heard on the whole window, as a pointer or a touch, since Safari on iOS doesn't always send the
 * button its own: a hold that misses its lift would keep going until the next tap.
 */
let pressedAt = { x: 0, y: 0 }

function onPointerdown(event: PointerEvent) {
  if (event.button !== 0) return
  pressedAt = { x: event.clientX, y: event.clientY }
  hinting.value = false
  start()
  listen()
  try {
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  } catch {
    // A pointer that can't be captured still holds; only slide-off is less precise.
  }
}

function lift() {
  unlisten()
  release()
}

function interrupt() {
  unlisten()
  cancel()
}

function listen() {
  addEventListener('pointerup', lift)
  addEventListener('touchend', lift)
  addEventListener('pointercancel', interrupt)
  addEventListener('touchcancel', interrupt)
}

function unlisten() {
  removeEventListener('pointerup', lift)
  removeEventListener('touchend', lift)
  removeEventListener('pointercancel', interrupt)
  removeEventListener('touchcancel', interrupt)
}
onScopeDispose(unlisten)

function onPointermove(event: PointerEvent) {
  if (!pressed()) return
  const away = Math.hypot(event.clientX - pressedAt.x, event.clientY - pressedAt.y)
  if (away > SLIDE_OFF_DISTANCE) interrupt()
}

/** How far a held pointer can wander before the hold is slid off: a touch target's width, in CSS pixels. */
const SLIDE_OFF_DISTANCE = 44

const HOLD_KEYS = [' ', 'Enter']

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    dismissed.value = true
    cancel()
    return
  }
  if (!HOLD_KEYS.includes(event.key)) return
  // The button's own click, on Enter now or Space on release, isn't wanted: the hold is the press.
  event.preventDefault()
  if (event.repeat) return
  hinting.value = false
  start()
}

function onKeyup(event: KeyboardEvent) {
  if (!HOLD_KEYS.includes(event.key)) return
  event.preventDefault()
  release()
}
</script>

<template>
  <!-- A line of its own, and in it the button, with its tooltip and burst beside it, not in it, so its name is only
  its label (WCAG 2.5.3). -->
  <div
    class="groan"
    :class="{
      holding,
      full: holding && full,
      groaned: previous !== undefined,
      dismissed,
      hinting,
      bursting: burst,
    }"
    :style="{ '--groan-level': level }"
  >
    <span class="anchor">
      <AppButton
        class="press"
        :aria-describedby="tipId"
        @pointerdown="onPointerdown"
        @pointermove="onPointermove"
        @contextmenu.prevent
        @keydown="onKeydown"
        @keyup="onKeyup"
        @blur="interrupt"
        @pointerenter="dismissed = false"
        @focus="dismissed = false"
      >
        <span class="meter" aria-hidden="true">
          <span class="fill" />
        </span>
        <!-- A groaning face: eyes rolled up, mouth a wobble. -->
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="9" />
          <circle cx="8.5" cy="10" r="2" />
          <circle cx="15.5" cy="10" r="2" />
          <path class="pupil" d="M8.5 8.6v.1M15.5 8.6v.1" />
          <path d="M7.5 16.5q1.125-1.2 2.25 0t2.25 0 2.25 0 2.25 0" />
        </svg>
        <!-- Once it's an "Ughhh", its name still starts with "Groan", for speech input and screen readers, and still
      holds the label it shows (WCAG 2.5.3). -->
        <span class="visually-hidden">{{ name }}</span>
        <span aria-hidden="true">{{ label }}</span>
      </AppButton>
      <span :id="tipId" class="tip" role="tooltip">{{ tip }}</span>
      <span v-if="burst" :key="burst.key" class="burst" aria-hidden="true">{{ burst.text }}</span>
    </span>
  </div>
</template>

<style scoped>
/* How full the button is, from 0 to 1. Registered, so it can drain back smoothly and the hover nudge can animate it. */
@property --groan-level {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}

.groan {
  display: flex;
  transition: --groan-level 300ms ease-out;
}

/* What the tooltip and burst are placed against: the button, not the line. */
.anchor {
  position: relative;
  display: inline-flex;
}

.press {
  position: relative;
  isolation: isolate;
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
  justify-content: center;

  /* A long press is the point, so it mustn't select text or open the callout menu. */
  user-select: none;
  -webkit-touch-callout: none;
  touch-action: manipulation;
}

/* While held, the fill follows the hold exactly. */
.groan.holding {
  transition: none;
}

.icon {
  flex: none;
  width: var(--space-5);
  height: var(--space-5);
  fill: none;
  stroke: currentcolor;
  stroke-linecap: round;
  stroke-width: 1.75;
}

/* The pupils, dots at the top of each eye. */
.pupil {
  stroke-width: 2.5;
}

/* The fill, clipped to the button, behind the label. The gradient spans the whole button, so it warms as
   the fill reaches further. */
.meter {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
}

.fill {
  position: absolute;
  inset: 0;
  background: var(--groan-fill);
  clip-path: inset(0 calc((1 - var(--groan-level)) * 100%) 0 0);
}

/* Full: it shakes until it's let go. */
.full .press {
  animation: shake 300ms ease-in-out infinite;
}

@keyframes shake {
  25% {
    rotate: -2deg;
  }

  75% {
    rotate: 2deg;
  }
}

/*
 * With a mouse over it, a nudge: the fill jumps a quarter of the way and back as the button bumps, then rests, and
 * again, until the pointer leaves or presses. Not once it's groaned at.
 */
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .groan:not(.groaned, .holding):has(.press:hover) {
    animation: nudge-fill 1.8s ease-out infinite;
  }

  .groan:not(.groaned, .holding) .press:hover {
    animation: nudge-bump 1.8s ease-out infinite;
  }
}

@keyframes nudge-fill {
  0%,
  35%,
  100% {
    --groan-level: 0;
  }

  12% {
    --groan-level: 0.25;
  }
}

@keyframes nudge-bump {
  0%,
  35%,
  100% {
    scale: 1;
    rotate: 0deg;
  }

  8% {
    scale: 1.04;
    rotate: -1.5deg;
  }

  18% {
    rotate: 1.5deg;
  }

  26% {
    scale: 1;
    rotate: 0deg;
  }
}

/* Centred above the button, as the Remove button's is, but wrapping: it's a sentence. */
.tip {
  position: absolute;
  bottom: calc(100% + var(--space-2));
  left: 50%;
  z-index: 1;
  width: max-content;
  max-width: min(18rem, 80vw);
  padding: var(--space-1) var(--space-3);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-text);
  color: var(--color-surface);
  box-shadow: var(--button-shadow);
  font-size: var(--text-sm);
  font-weight: 700;
  letter-spacing: normal;
  text-align: left;
  text-transform: none;

  /* Hidden, it's out of the layout too, so near the screen's edge it can't make the page scroll sideways. */
  display: none;
  opacity: 0;
  cursor: default;
  translate: -50% 0;
  transition:
    opacity 150ms ease,
    display 150ms allow-discrete;
}

/* Bridges the gap, so the pointer can move onto the tooltip without it going. */
.tip::after {
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  height: var(--space-2);
  content: '';
}

/* A press too short to be a hold shows it for a moment, for phones, which have no hover. */
.groan.hinting:not(.holding, .bursting) .tip {
  display: block;
  opacity: 1;

  @starting-style {
    opacity: 0;
  }
}

.groan:not(.dismissed, .holding, .bursting):has(.press:focus-visible) .tip {
  display: block;
  opacity: 1;

  @starting-style {
    opacity: 0;
  }
}

/* Over the button, or the tooltip itself once it shows, not the rest of the line. On touch, a tap leaves :hover
   behind, so only a real pointer's hover shows it. */
@media (hover: hover) {
  .groan:not(.dismissed, .holding, .bursting) .anchor:hover .tip {
    display: block;
    opacity: 1;

    @starting-style {
      opacity: 0;
    }
  }
}

/* The payoff: a comic burst above the button, in the accent, that pops and floats away. */
.burst {
  position: absolute;
  bottom: calc(100% + var(--space-2));
  left: 50%;
  z-index: 2;
  padding: var(--space-1) var(--space-3);
  border: var(--border-width-strong) solid var(--color-border);
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
  box-shadow: var(--button-shadow);
  font-family: var(--headline-font);
  font-size: var(--text-lg);
  letter-spacing: 0.04em;
  white-space: nowrap;
  pointer-events: none;
  translate: -50% 0;
  rotate: -4deg;
  animation: burst 1.4s ease-out forwards;
}

@keyframes burst {
  0% {
    opacity: 0;
    scale: 0.4;
  }

  15% {
    opacity: 1;
    scale: 1.15;
  }

  25% {
    scale: 1;
  }

  75% {
    opacity: 1;
    translate: -50% 0;
  }

  100% {
    opacity: 0;
    translate: -50% calc(-1 * var(--space-4));
  }
}

/* Reduced motion: the fill and label still change, but nothing shakes, nudges or flies. The burst just shows. */
@media (prefers-reduced-motion: reduce) {
  .groan,
  .groan:has(.press:hover),
  .full .press,
  .press:hover {
    transition: none;
    animation: none;
  }

  .burst {
    animation: none;
  }

  .tip {
    transition: none;
  }
}
</style>
