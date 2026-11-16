import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import AppButton from '@/components/AppButton.vue'
import LiveFigure from './LiveFigure.vue'

const meta = {
  component: LiveFigure,
  args: { caption: 'AppButton, as the app renders it.' },
  render: (args) => ({
    components: { LiveFigure, AppButton },
    setup: () => ({ args }),
    template: '<LiveFigure v-bind="args"><AppButton>Another one</AppButton></LiveFigure>',
  }),
} satisfies Meta<typeof LiveFigure>

export default meta
type Story = StoryObj<typeof meta>

/** A figure, captioned, around the live component. */
export const Default: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('figure')).toHaveTextContent(args.caption)
    await expect(canvas.getByRole('button', { name: 'Another one' })).toBeInTheDocument()
  },
}
