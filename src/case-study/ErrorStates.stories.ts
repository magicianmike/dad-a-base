import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import ErrorStates from './ErrorStates.vue'

const meta = { component: ErrorStates } satisfies Meta<typeof ErrorStates>

export default meta
type Story = StoryObj<typeof meta>

/** Each code in turn, its headline a level-3 heading. */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('heading', { level: 3 })).toHaveTextContent(/Even Dad needs/)
    await userEvent.click(canvas.getByRole('radio', { name: 'Offline' }))
    await expect(canvas.getByRole('heading', { level: 3 })).toHaveTextContent(/paper boy/)
  },
}
