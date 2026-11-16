import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'
import type { Plugin } from 'vite'

/** Where the image is served, relative to the site's root. */
export const OG_IMAGE_PATH = 'og/case-study.png'

/** The live site. Open Graph wants absolute addresses. */
const SITE = 'https://the-dad-a-base.vercel.app'

const CASE_STUDY = {
  title: 'How the Dad-a-base was built',
  description:
    'A case study of the Dad-a-base: the product, design and engineering decisions behind a dad-joke site built with Vue 3, Apollo and a design system of tokens.',
}

/**
 * The built index.html with the Case Study's own head: its title, description and Open Graph tags. Link previews
 * don't run the app, so they only see what the server sends, and vercel.json sends this for /case-study.
 */
export function caseStudyHtml(index: string): string {
  const tags = [
    `<meta property="og:type" content="article" />`,
    `<meta property="og:site_name" content="The Dad-a-base" />`,
    `<meta property="og:title" content="${CASE_STUDY.title}" />`,
    `<meta property="og:description" content="${CASE_STUDY.description}" />`,
    `<meta property="og:url" content="${SITE}/case-study" />`,
    `<meta property="og:image" content="${SITE}/${OG_IMAGE_PATH}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="The Dad-a-base masthead over the headline ${CASE_STUDY.title}." />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ]
  const html = index
    .replace(/<title>[^<]*<\/title>/, `<title>${CASE_STUDY.title} · Dad-a-base</title>`)
    .replace(
      /<meta name="description" content="[^"]*" \/>/,
      `<meta name="description" content="${CASE_STUDY.description}" />`,
    )
    .replace('</head>', `  ${tags.join('\n    ')}\n  </head>`)
  if (!html.includes('og:image'))
    throw new Error('index.html has no </head> for the Open Graph tags')
  return html
}

/** A path from the project's root, this file being one folder down. */
const root = (path: string) => resolve(dirname(fileURLToPath(import.meta.url)), '..', path)
const font = (name: string) => readFile(root(`node_modules/@fontsource/${name}`))

/** The palette, from the primitive tokens, so the image's colours come from the same place as the site's. */
async function palette() {
  const css = await readFile(root('src/styles/tokens/primitive.css'), 'utf8')
  const value = (name: string) => {
    const found = css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim()
    if (!found) throw new Error(`No primitive token --${name}`)
    return found
  }
  return {
    paper: value('newsprint-100'),
    ink: value('ink-900'),
    muted: value('ink-600'),
    red: value('red-700'),
    yellow: value('yellow-400'),
  }
}

type Node = { type: string; props: { style?: Record<string, unknown>; children?: unknown } }
const el = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: { style, children },
})

/** The Case Study's Open Graph image, 1200 by 630: the Masthead's name and the headline, as the page sets them. */
export async function renderOgImage(): Promise<Buffer> {
  const colour = await palette()
  const svg = await satori(
    el('div', { display: 'flex', width: 1200, height: 630, background: colour.paper }, [
      el(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          // Satori adds padding to a box's width, so the column is sized and placed directly: 1056 wide, inset 72.
          width: 1056,
          height: 630,
          marginLeft: 72,
          paddingTop: 56,
          color: colour.ink,
          fontFamily: 'Atkinson Hyperlegible',
        },
        [
          el(
            'div',
            {
              display: 'flex',
              justifyContent: 'center',
              paddingBottom: 20,
              borderBottom: `6px double ${colour.ink}`,
              fontFamily: 'UnifrakturMaguntia',
              fontSize: 96,
            },
            [
              el('span', {}, 'The Dad'),
              el('span', { color: colour.red }, '-a-'),
              el('span', {}, 'base'),
            ],
          ),
          el(
            'div',
            {
              display: 'flex',
              marginTop: 48,
              color: colour.red,
              fontSize: 30,
              letterSpacing: 4,
              textTransform: 'uppercase',
            },
            'About · A case study',
          ),
          el(
            'div',
            {
              display: 'flex',
              marginTop: 12,
              fontFamily: 'Oswald',
              fontSize: 92,
              fontWeight: 700,
              lineHeight: 1.05,
              textTransform: 'uppercase',
            },
            'How the Dad-a-base was built',
          ),
          el(
            'div',
            {
              display: 'flex',
              marginTop: 36,
              paddingLeft: 20,
              borderLeft: `8px solid ${colour.yellow}`,
              color: colour.muted,
              fontSize: 32,
            },
            'Vue 3 · Apollo over REST · a design system built from tokens',
          ),
        ],
      ),
    ]) as Parameters<typeof satori>[0],
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Atkinson Hyperlegible',
          data: await font(
            'atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-normal.woff',
          ),
          weight: 400,
        },
        {
          name: 'Oswald',
          data: await font('oswald/files/oswald-latin-700-normal.woff'),
          weight: 700,
        },
        {
          name: 'UnifrakturMaguntia',
          data: await font('unifrakturmaguntia/files/unifrakturmaguntia-latin-400-normal.woff'),
          weight: 400,
        },
      ],
    },
  )
  return new Resvg(svg).render().asPng()
}

/**
 * Emits the Case Study's Open Graph image, and its page with the tags that point to it, into the build. Only builds
 * pay for it, not dev or tests. After Vite's own HTML step, so index.html is there to start from.
 */
export function ogImage(): Plugin {
  return {
    name: 'dadabase:og-image',
    apply: 'build',
    generateBundle: {
      order: 'post',
      async handler(_, bundle) {
        const index = bundle['index.html']
        if (index?.type !== 'asset') throw new Error('No index.html in the build')
        this.emitFile({ type: 'asset', fileName: OG_IMAGE_PATH, source: await renderOgImage() })
        this.emitFile({
          type: 'asset',
          fileName: 'case-study.html',
          source: caseStudyHtml(String(index.source)),
        })
      },
    },
  }
}
