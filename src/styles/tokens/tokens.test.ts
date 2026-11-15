import { contrastRatio } from './contrast'
import { parseBlocks, resolve, tokens, type Theme } from './tokens'

const themes: Theme[] = ['light', 'dark']

describe('the token layers', () => {
  it('are all parsed', () => {
    expect(tokens.primitive.length).toBeGreaterThan(20)
    expect(tokens.semanticColor.light.length).toBeGreaterThan(5)
    expect(tokens.semanticShared.length).toBeGreaterThan(5)
    expect(tokens.domain.length).toBeGreaterThan(5)
  })

  it('give dark mode the same values by system setting and by data-theme', () => {
    expect(tokens.semanticColor.darkBySystem).toEqual(tokens.semanticColor.dark)
  })

  it('define every semantic colour in both themes', () => {
    const names = (theme: 'light' | 'dark') => tokens.semanticColor[theme].map((t) => t.name).sort()
    expect(names('dark')).toEqual(names('light'))
  })

  it('build semantic tokens only from primitives, and domain tokens only from semantic tokens', () => {
    const primitiveNames = new Set(tokens.primitive.map((t) => t.name))
    const semanticNames = new Set(
      [...tokens.semanticColor.light, ...tokens.semanticShared].map((t) => t.name),
    )
    for (const { value } of [
      ...tokens.semanticColor.light,
      ...tokens.semanticColor.dark,
      ...tokens.semanticShared,
    ]) {
      for (const [, ref] of value.matchAll(/var\((--[\w-]+)\)/g))
        expect(primitiveNames).toContain(ref)
    }
    for (const { value } of tokens.domain) {
      for (const [, ref] of value.matchAll(/var\((--[\w-]+)\)/g))
        expect(semanticNames).toContain(ref)
    }
  })

  it('resolve every token in both themes', () => {
    for (const theme of themes) {
      for (const { value } of [...tokens.semanticShared, ...tokens.domain]) {
        expect(() => resolve(value, theme)).not.toThrow()
      }
    }
  })
})

describe('components', () => {
  // Every stylesheet outside the token files, as text, by path.
  const sources = import.meta.glob(['/src/**/*.vue', '/src/**/*.css', '!/src/styles/tokens/**'], {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>

  it('are found', () => {
    expect(Object.keys(sources)).toContain('/src/App.vue')
  })

  it('use only semantic and domain tokens, never primitives (ADR 0004)', () => {
    const primitiveNames = new Set(tokens.primitive.map((t) => t.name))
    const misuses = Object.entries(sources).flatMap(([path, source]) =>
      [...source.matchAll(/var\((--[\w-]+)/g)]
        .map(([, name]) => name!)
        .filter((name) => primitiveNames.has(name))
        .map((name) => `${path} uses ${name}`),
    )
    expect(misuses).toEqual([])
  })
})

describe('contrast, in both themes (WCAG 2.2 AA)', () => {
  const text = [
    ['--color-text', '--color-surface'],
    ['--color-text', '--color-surface-raised'],
    ['--color-text-muted', '--color-surface'],
    ['--color-text-muted', '--color-surface-raised'],
    ['--color-accent', '--color-surface'],
    ['--color-accent', '--color-surface-raised'],
    ['--color-on-accent', '--color-accent'],
  ] as const
  const nonText = [
    ['--color-border', '--color-surface'],
    ['--color-border', '--color-surface-raised'],
    ['--color-focus', '--color-surface'],
    ['--color-focus', '--color-surface-raised'],
  ] as const

  for (const theme of themes) {
    it.each(text)(`${theme}: %s on %s is at least 4.5:1`, (fg, bg) => {
      expect(
        contrastRatio(resolve(`var(${fg})`, theme), resolve(`var(${bg})`, theme)),
      ).toBeGreaterThanOrEqual(4.5)
    })
    it.each(nonText)(`${theme}: %s on %s is at least 3:1`, (fg, bg) => {
      expect(
        contrastRatio(resolve(`var(${fg})`, theme), resolve(`var(${bg})`, theme)),
      ).toBeGreaterThanOrEqual(3)
    })
  }
})

describe('contrastRatio', () => {
  it('matches known ratios', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21)
    expect(contrastRatio('#fff', '#fff')).toBe(1)
  })

  it('rejects anything but hex', () => {
    expect(() => contrastRatio('red', '#fff')).toThrow('Not a hex colour: red')
  })
})

describe('resolve', () => {
  it('fails on an unknown or circular reference', () => {
    expect(() => resolve('var(--nope)', 'light')).toThrow("Can't resolve --nope")
  })
})

describe('parseBlocks', () => {
  it('merges repeated selectors and ignores comments and blocks without tokens', () => {
    const blocks = parseBlocks(
      '/* a */ :root { --a: 1; } body { margin: 0; } :root { --b: var(--a); }',
    )
    expect(blocks.get(':root')).toEqual([
      { name: '--a', value: '1' },
      { name: '--b', value: 'var(--a)' },
    ])
    expect(blocks.has('body')).toBe(false)
  })
})
