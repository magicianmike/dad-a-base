import { screen, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { renderPage } from '@/test/renderPage'
import CaseStudyView from './CaseStudyView.vue'

describe('CaseStudyView', () => {
  it('is one page with one headline, titled for what it is', async () => {
    await renderPage(CaseStudyView, { path: '/case-study' })
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(
      screen.getByRole('heading', { level: 1, name: 'How the Dad-a-base was built' }),
    ).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe('How the Dad-a-base was built'))
  })

  it('lists its chapters, Engineering before Product and UX, each going to a heading that exists', async () => {
    await renderPage(CaseStudyView, { path: '/case-study' })
    const chapters = screen.getByRole('navigation', { name: 'Chapters' })
    const links = within(chapters)
      .getAllByRole('listitem')
      .map((item) => within(item).getByRole('link'))
    expect(links.map((link) => link.textContent)).toEqual([
      'In 60 seconds',
      'Engineering',
      'Product and UX',
      'What I rejected',
    ])
    for (const link of links) {
      const id = link.getAttribute('href')!.split('#')[1]!
      expect(document.getElementById(id)).toHaveRole('heading')
    }
  })

  it('moves focus to a chapter when its link is followed, and back to the top', async () => {
    const { router } = await renderPage(CaseStudyView, { path: '/case-study' })
    await userEvent.click(screen.getByRole('link', { name: 'Engineering' }))
    await waitFor(() => expect(router.currentRoute.value.hash).toBe('#engineering'))
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 2, name: 'Engineering' })).toHaveFocus(),
    )

    // Again, though it's already the address.
    screen.getByRole('link', { name: 'In 60 seconds' }).focus()
    await userEvent.click(screen.getByRole('link', { name: 'Engineering' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Engineering' })).toHaveFocus()

    const [, end] = screen.getAllByRole('link', { name: /Back to top/ })
    await userEvent.click(end!)
    await waitFor(() => expect(router.currentRoute.value.hash).toBe('#top'))
    expect(document.getElementById('top')).toHaveFocus()
  })

  it('shows each Error state live, below the page’s own headline, without retitling the page', async () => {
    await renderPage(CaseStudyView, { path: '/case-study' })
    const picker = screen.getByRole('group', { name: 'Show the Error state for' })
    expect(
      screen.getByRole('heading', { level: 3, name: 'Easy, tiger. Even Dad needs a breather.' }),
    ).toBeInTheDocument()

    await userEvent.click(within(picker).getByRole('radio', { name: '404' }))
    expect(
      screen.getByRole('heading', { level: 3, name: 'Dad went out for milk. So did this page.' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()

    await userEvent.click(within(picker).getByRole('radio', { name: '500' }))
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.getByRole('status')).toHaveTextContent(
      'In the app, this asks the joke service again.',
    )
    await waitFor(() => expect(document.title).toBe('How the Dad-a-base was built'))
  })

  it('shows the Pagination window live, at both ends and in the middle', async () => {
    await renderPage(CaseStudyView, { path: '/case-study' })
    const pages = screen.getByRole('navigation', { name: 'Pages' })
    const numbers = () =>
      within(pages)
        .getAllByRole('link', { name: /^Page/ })
        .map((link) => link.textContent)
    expect(numbers()).toEqual(['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'])

    await userEvent.click(screen.getByRole('radio', { name: 'Page 38' }))
    expect(numbers()).toEqual(['30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40'])
    expect(within(pages).getByRole('link', { name: 'Page 38' })).toHaveAttribute(
      'href',
      '/search?q=pun&page=38',
    )
  })

  it('draws its diagrams as images a screen reader can read', async () => {
    await renderPage(CaseStudyView, { path: '/case-study' })
    expect(
      screen.getByRole('img', { name: 'How a Search reaches the API and comes back' }),
    ).toHaveAccessibleDescription(/apollo-link-rest turns the query into GET \/search/)
    expect(
      screen.getByRole('img', { name: 'One colour through the three token layers' }),
    ).toBeInTheDocument()
  })
})
