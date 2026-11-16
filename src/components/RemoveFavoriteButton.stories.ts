import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn } from 'storybook/test'
import RemoveFavoriteButton from './RemoveFavoriteButton.vue'

const meta = {
  component: RemoveFavoriteButton,
  args: { onClick: fn() },
  // Room above for the tooltip.
  decorators: [() => ({ template: '<div style="padding-top: 3rem"><story /></div>' })],
} satisfies Meta<typeof RemoveFavoriteButton>

export default meta
type Story = StoryObj<typeof meta>

/** Named by its tooltip; pressing the tooltip itself does nothing. */
export const Default: Story = {
  play: async ({ canvas, args, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Remove from favorites' })
    await userEvent.click(button)
    await expect(args.onClick).toHaveBeenCalledOnce()
    await userEvent.click(canvas.getByText('Remove from favorites'))
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}
