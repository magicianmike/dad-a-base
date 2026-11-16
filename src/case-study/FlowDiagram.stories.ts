import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import FlowDiagram from './FlowDiagram.vue'

const meta = {
  component: FlowDiagram,
  args: {
    title: 'Three steps',
    description: 'First leads to second, which leads to third.',
    steps: [
      { title: 'First', detail: ['One line of detail'] },
      { title: 'Second', detail: ['Two lines', 'of detail'], accent: true },
      { title: 'Third' },
    ],
    arrows: ['then', 'and then'],
  },
} satisfies Meta<typeof FlowDiagram>

export default meta
type Story = StoryObj<typeof meta>

/** An image named by its title and described in full, for a screen reader. */
export const Default: Story = {
  play: async ({ canvas, args }) => {
    const image = canvas.getByRole('img', { name: args.title })
    await expect(image).toHaveAccessibleDescription(args.description)
    await expect(image.querySelectorAll('rect')).toHaveLength(3)
  },
}
