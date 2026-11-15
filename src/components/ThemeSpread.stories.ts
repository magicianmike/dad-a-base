import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import ThemeSpread from './ThemeSpread.vue'

const meta = {
  component: ThemeSpread,
  render: () => ({
    components: { ThemeSpread },
    template: '<ThemeSpread v-slot="{ theme }"><p>Rendered in {{ theme }}</p></ThemeSpread>',
  }),
} satisfies Meta<typeof ThemeSpread>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Rendered in light')).toBeInTheDocument()
    await expect(canvas.getByText('Rendered in dark')).toBeInTheDocument()
    const sides = canvasElement.querySelectorAll('[data-theme]')
    await expect([...sides].map((side) => side.getAttribute('data-theme'))).toEqual([
      'light',
      'dark',
    ])
    // Each side really takes its theme's surface colour.
    const [light, dark] = [...sides].map((side) => getComputedStyle(side).backgroundColor)
    await expect(light).not.toBe(dark)
  },
}
