import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn } from 'storybook/test'
import SearchBox from './SearchBox.vue'

const meta = {
  component: SearchBox,
  args: { onSubmit: fn(), 'onUpdate:modelValue': fn() },
} satisfies Meta<typeof SearchBox>

export default meta
type Story = StoryObj<typeof meta>

export const Typing: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const input = canvas.getByRole('searchbox', { name: 'Search the jokes' })
    await userEvent.type(input, 'cat')
    await expect(args['onUpdate:modelValue']).toHaveBeenLastCalledWith('cat')
    await userEvent.keyboard('{Enter}')
    await expect(args.onSubmit).toHaveBeenCalledWith('cat')
  },
}

export const WithATerm: Story = {
  args: { modelValue: 'golf', label: 'Search the archives' },
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByRole('searchbox', { name: 'Search the archives' })).toHaveValue('golf')
    await userEvent.click(canvas.getByRole('button', { name: 'Search' }))
    await expect(args.onSubmit).toHaveBeenCalledWith('golf')
  },
}
