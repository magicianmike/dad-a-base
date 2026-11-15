import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import StoryHeading from './StoryHeading.vue'

const meta = {
  component: StoryHeading,
  args: { kicker: "Today's top story" },
  render: (args) => ({
    components: { StoryHeading },
    setup: () => ({ args }),
    template: '<StoryHeading v-bind="args">Local dad says the thing again</StoryHeading>',
  }),
} satisfies Meta<typeof StoryHeading>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Local dad says the thing again',
    )
    await expect(canvas.getByText("Today's top story")).toBeInTheDocument()
  },
}
