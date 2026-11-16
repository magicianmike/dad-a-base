import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import ProseLink from './ProseLink.vue'

const meta = {
  component: ProseLink,
  render: (args) => ({
    components: { ProseLink },
    setup: () => ({ args }),
    template: '<ProseLink v-bind="args">A link</ProseLink>',
  }),
} satisfies Meta<typeof ProseLink>

export default meta
type Story = StoryObj<typeof meta>

/** One of the app's pages, through the router. */
export const Internal: Story = {
  args: { href: '/random' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'A link' })).toHaveAttribute('href', '/random')
  },
}

/** Anywhere else, as a plain link. */
export const External: Story = {
  args: { href: 'https://icanhazdadjoke.com' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'A link' })).toHaveAttribute(
      'href',
      'https://icanhazdadjoke.com',
    )
  },
}
