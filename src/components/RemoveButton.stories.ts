import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn } from 'storybook/test'
import RemoveButton from './RemoveButton.vue'

const meta = {
  component: RemoveButton,
  args: { label: 'Remove from favorites', icon: 'heart', onClick: fn() },
  // Room above for the tooltip.
  decorators: [() => ({ template: '<div style="padding-top: 3rem"><story /></div>' })],
} satisfies Meta<typeof RemoveButton>

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

/** On the Groan Leaderboard: a cross, not a broken heart, and its own name. */
export const Groan: Story = {
  args: { label: 'Remove from groans', icon: 'cross' },
  play: async ({ canvas, args, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Remove from groans' })
    await expect(button.querySelector('svg')).toHaveClass('cross')
    await userEvent.click(button)
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}
