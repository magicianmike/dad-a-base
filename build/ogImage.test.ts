import { describe, expect, it } from 'vitest'
import { caseStudyHtml, OG_IMAGE_PATH, renderOgImage } from './ogImage'

const index = `<!doctype html>
<html lang="en">
  <head>
    <meta name="description" content="The Dad-a-base: all the jokes that are fit to groan." />
    <title>The Dad-a-base</title>
  </head>
  <body><div id="app"></div></body>
</html>`

describe('caseStudyHtml', () => {
  it('gives the page its own title and description, and the Open Graph tags, and keeps the rest', () => {
    const html = caseStudyHtml(index)
    expect(html).toContain('<title>How the Dad-a-base was built · Dad-a-base</title>')
    expect(html).toContain('<meta name="description" content="A case study of the Dad-a-base')
    expect(html).not.toContain('all the jokes that are fit to groan')
    expect(html).toContain(
      `<meta property="og:image" content="https://the-dad-a-base.vercel.app/${OG_IMAGE_PATH}" />`,
    )
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />')
    expect(html).toContain('<div id="app"></div>')
  })

  it('fails the build rather than ship a page with no tags', () => {
    expect(() => caseStudyHtml('<html></html>')).toThrow(/no <\/head>/)
  })
})

describe('renderOgImage', () => {
  it('renders a 1200 by 630 PNG', async () => {
    const png = await renderOgImage()
    expect(png.subarray(1, 4).toString()).toBe('PNG')
    expect(png.readUInt32BE(16)).toBe(1200)
    expect(png.readUInt32BE(20)).toBe(630)
  })
})
