/** WCAG 2 contrast ratio between two opaque hex colours, such as `#2b2b2b`. */
export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (lighter + 0.05) / (darker + 0.05)
}

/** The colour a fraction `t` of the way from `a` to `b`, mixed in sRGB as a CSS gradient is. */
export function mix(a: string, b: string, t: number): string {
  const [from, to] = [channels(a), channels(b)]
  return `#${from
    .map((c, i) =>
      Math.round(c + (to[i]! - c) * t)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

function channels(hex: string): [number, number, number] {
  const match = hex.match(/^#([\da-f]{3}|[\da-f]{6})$/i)
  if (!match) throw new Error(`Not a hex colour: ${hex}`)
  const digits = match[1]!.length === 3 ? [...match[1]!].map((d) => d + d).join('') : match[1]!
  return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16)) as [number, number, number]
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((value) => {
    const channel = value / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
