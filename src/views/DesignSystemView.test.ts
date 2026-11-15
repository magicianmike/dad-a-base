import { createHead } from '@unhead/vue/client'
import { render, screen, within } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { tokens } from '@/styles/tokens/tokens'
import DesignSystemView from './DesignSystemView.vue'

async function renderView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: DesignSystemView }],
  })
  await router.push('/')
  return render(DesignSystemView, { global: { plugins: [router, createHead()] } })
}

describe('DesignSystemView', () => {
  it('shows every semantic colour in both themes, with its resolved value', async () => {
    await renderView()
    const colour = screen.getByRole('region', { name: 'Colour' })
    for (const { name } of tokens.semanticColor.light) {
      expect(within(colour).getAllByText(name)).toHaveLength(2)
    }
    expect(within(colour).getByText('#f3eee2')).toBeInTheDocument()
    // Dark's surface and its text on accent share a value.
    expect(within(colour).getAllByText('#1d1f24')).toHaveLength(2)
  })

  it('lists every space step and every domain token', async () => {
    await renderView()
    expect(
      within(screen.getByRole('region', { name: 'Space' })).getAllByRole('listitem'),
    ).toHaveLength(8)
    const table = screen.getByRole('table')
    expect(within(table).getAllByRole('row')).toHaveLength(tokens.domain.length + 1)
  })

  it('links to Storybook', async () => {
    await renderView()
    expect(
      screen.getByRole('link', { name: 'Browse every component in Storybook' }),
    ).toHaveAttribute('href', 'http://localhost:6006')
  })
})
