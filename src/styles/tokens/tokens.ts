import domainCss from './domain.css?raw'
import primitiveCss from './primitive.css?raw'
import semanticCss from './semantic.css?raw'

/** A custom property as written in a token file, with its comment-free value. */
export interface TokenDeclaration {
  name: string
  value: string
}

export type Theme = 'light' | 'dark'

/** The declarations in each `{ … }` block of a stylesheet, keyed by the block's selector. */
export function parseBlocks(css: string): Map<string, TokenDeclaration[]> {
  const blocks = new Map<string, TokenDeclaration[]>()
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const [, rawSelector = '', body = ''] of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = rawSelector.replace(/\s+/g, ' ').trim()
    const declarations = [...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(
      ([, name = '', value = '']) => ({
        name,
        value: value.trim(),
      }),
    )
    if (declarations.length)
      blocks.set(selector, [...(blocks.get(selector) ?? []), ...declarations])
  }
  return blocks
}

function toRecord(declarations: TokenDeclaration[] = []): Record<string, string> {
  return Object.fromEntries(declarations.map(({ name, value }) => [name, value]))
}

const primitive = parseBlocks(primitiveCss)
const semantic = parseBlocks(semanticCss)
const domain = parseBlocks(domainCss)

export const LIGHT_SELECTOR = ":root, [data-theme='light']"
export const DARK_SELECTOR = "[data-theme='dark']"
/** The dark block inside `@media (prefers-color-scheme: dark)`, keyed by its inner selector. */
export const DARK_MEDIA_SELECTOR = ":root:not([data-theme='light'])"

/** The token layers, as declared. Semantic colours have a value per theme; everything else is shared. */
export const tokens = {
  primitive: primitive.get(':root') ?? [],
  semanticColor: {
    light: semantic.get(LIGHT_SELECTOR) ?? [],
    dark: semantic.get(DARK_SELECTOR) ?? [],
    darkBySystem: semantic.get(DARK_MEDIA_SELECTOR) ?? [],
  },
  semanticShared: semantic.get(':root') ?? [],
  domain: domain.get(':root, [data-theme]') ?? [],
}

/** Follows `var()` references down to a raw value, for a theme. */
export function resolve(value: string, theme: Theme): string {
  const scope = {
    ...toRecord(tokens.primitive),
    ...toRecord(tokens.semanticShared),
    ...toRecord(theme === 'light' ? tokens.semanticColor.light : tokens.semanticColor.dark),
    ...toRecord(tokens.domain),
  }
  const seen = new Set<string>()
  let current = value
  for (
    let match = current.match(/^var\((--[\w-]+)\)$/);
    match;
    match = current.match(/^var\((--[\w-]+)\)$/)
  ) {
    const name = match[1]!
    if (seen.has(name) || !(name in scope)) throw new Error(`Can't resolve ${name}`)
    seen.add(name)
    current = scope[name]!
  }
  return current
}
