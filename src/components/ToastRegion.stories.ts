import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor } from 'storybook/test'
import { useToastsStore } from '@/stores/toasts'
import ToastRegion from './ToastRegion.vue'

const meta = { component: ToastRegion } satisfies Meta<typeof ToastRegion>

export default meta
type Story = StoryObj<typeof meta>

export const Messages: Story = {
  play: async ({ canvas, userEvent }) => {
    const region = canvas.getByRole('status')
    const toasts = useToastsStore()
    toasts.show('Copied the joke.')
    toasts.show('Saved to your favorites.')
    await waitFor(() => expect(region).toHaveTextContent('Saved to your favorites.'))

    const [first] = canvas.getAllByRole('button', { name: 'Dismiss' })
    await userEvent.click(first!)
    await waitFor(() => expect(region).not.toHaveTextContent('Copied the joke.'))
    await expect(region).toHaveTextContent('Saved to your favorites.')
  },
}
