import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, waitFor } from 'storybook/test'
import CopyButton from './CopyButton.vue'

const text = 'Bad at golf? Join the club.'

const meta = {
  component: CopyButton,
  args: { text, fallbackTarget: () => document.querySelector('#joke') },
  decorators: [() => ({ template: `<p id="joke">${text}</p><story />` })],
} satisfies Meta<typeof CopyButton>

export default meta
type Story = StoryObj<typeof meta>

export const Copies: Story = {
  beforeEach: () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: fn(async () => {}) },
    })
    return () =>
      original
        ? Object.defineProperty(navigator, 'clipboard', original)
        : delete (navigator as { clipboard?: unknown }).clipboard
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Copy' }))
    await expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text)
    await expect(canvas.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
  },
}

/** When the clipboard is denied, the text is selected for copying by hand. */
export const Denied: Story = {
  beforeEach: () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => Promise.reject(new DOMException('Denied', 'NotAllowedError')),
      },
    })
    return () =>
      original
        ? Object.defineProperty(navigator, 'clipboard', original)
        : delete (navigator as { clipboard?: unknown }).clipboard
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Copy' }))
    await waitFor(() => expect(getSelection()?.toString()).toBe(text))
    await expect(canvas.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
  },
}
