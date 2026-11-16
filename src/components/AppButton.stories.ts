import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn } from 'storybook/test'
import AppButton from './AppButton.vue'

const meta = {
  component: AppButton,
  args: { onClick: fn() },
  render: (args) => ({
    components: { AppButton },
    setup: () => ({ args }),
    template: '<AppButton v-bind="args">Another</AppButton>',
  }),
} satisfies Meta<typeof AppButton>

export default meta
type Story = StoryObj<typeof meta>

export const Secondary: Story = {
  play: async ({ canvas, args, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Another' })
    await expect(button).toHaveAttribute('type', 'button')
    await userEvent.click(button)
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

export const Primary: Story = {
  args: { variant: 'primary' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button')).toHaveClass('primary')
  },
}

export const Submit: Story = {
  args: { type: 'submit' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button')).toHaveAttribute('type', 'submit')
  },
}

/** Unavailable, as while it's working: it keeps focus but ignores presses. */
export const Disabled: Story = {
  args: { variant: 'primary', disabled: true },
  play: async ({ canvas, args, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Another' })
    await expect(button).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(button)
    await expect(args.onClick).not.toHaveBeenCalled()
    await expect(button).toHaveFocus()
  },
}
