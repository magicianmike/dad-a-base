import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref, type ConcreteComponent } from 'vue'
import { expect } from 'storybook/test'
import StatePicker from './StatePicker.vue'

// Storybook's types can't follow a generic component, so it's given as a plain one.
const meta = {
  component: StatePicker as unknown as ConcreteComponent,
  render: () => ({
    components: { StatePicker },
    setup: () => ({
      chosen: ref('b'),
      options: [
        { value: 'a', label: 'First' },
        { value: 'b', label: 'Second' },
        { value: 'c', label: 'Third' },
      ],
    }),
    template:
      '<StatePicker v-model="chosen" legend="Show" :options="options" /><p>Showing {{ chosen }}</p>',
  }),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** A radio group: one choice at a time, and the arrow keys move it. */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('group', { name: 'Show' })
    await expect(group).toBeInTheDocument()
    await expect(canvas.getByRole('radio', { name: 'Second' })).toBeChecked()
    await userEvent.click(canvas.getByRole('radio', { name: 'Second' }))
    await userEvent.keyboard('{ArrowRight}')
    await expect(canvas.getByRole('radio', { name: 'Third' })).toBeChecked()
    await expect(canvas.getByText('Showing c')).toBeInTheDocument()
  },
}
