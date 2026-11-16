/** How long a hold takes to fill the Groan button: a full, 10.0 Groan. */
export const GROAN_FULL_MS = 3000

/** A press shorter than this is a tap, and records nothing: a Groan takes a long press. */
export const GROAN_TAP_MS = 300

/** A hold as the share of a full one, from 0 to 1. This is what's stored, so Groans sort finely. */
export function groanFraction(heldMs: number): number {
  return Math.min(1, Math.max(0, heldMs / GROAN_FULL_MS))
}

/** A Groan score as shown, out of 10 to a tenth: 1.0–10.0, since a Groan is at least a tap's length. */
export function groanScore(fraction: number): string {
  return (Math.round(fraction * 100) / 10).toFixed(1)
}

/** How many h's "Ugh" gains by a full hold: one every quarter of a second. */
export const GROAN_MAX_HS = 12

/** The button's label for a hold: "Ugh", with another h for every quarter second held, and a "!" when it's full. */
export function groanLabel(fraction: number): string {
  if (fraction >= 1) return `Ugh${'h'.repeat(GROAN_MAX_HS)}!`
  return `Ugh${'h'.repeat(Math.floor(fraction * GROAN_MAX_HS))}`
}

/** What a screen reader hears once a Groan is recorded. */
export function groanAnnouncement(fraction: number): string {
  return `Groan score ${groanScore(fraction)} out of 10.`
}
