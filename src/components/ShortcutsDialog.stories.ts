import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor } from 'storybook/test'
import { SHORTCUTS_STORAGE_KEY, useShortcutsStore } from '@/shortcuts/store'
import ShortcutsDialog from './ShortcutsDialog.vue'

const meta = {
  component: ShortcutsDialog,
  beforeEach: () => () => localStorage.removeItem(SHORTCUTS_STORAGE_KEY),
  // Storybook shares one Pinia across stories, so each opens the list with the shortcuts on.
  decorators: [
    () => {
      const store = useShortcutsStore()
      store.setEnabled(true)
      store.listOpen = false
      setTimeout(() => (store.listOpen = true))
      return { template: '<story />' }
    },
  ],
} satisfies Meta<typeof ShortcutsDialog>

export default meta
type Story = StoryObj<typeof meta>

/** Open: the keys, the switch, and Close. The page behind is inert while it's open. */
export const Open: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const dialog = await waitFor(() => {
      const open = canvasElement.ownerDocument.querySelector<HTMLDialogElement>('dialog[open]')
      if (!open) throw new Error('not open yet')
      return open
    })
    const toggle = dialog.querySelector<HTMLInputElement>('input[type="checkbox"]')!
    await expect(toggle).toBeChecked()
    await userEvent.click(toggle)
    await expect(useShortcutsStore().enabled).toBe(false)
    await expect(localStorage.getItem(SHORTCUTS_STORAGE_KEY)).toBe('off')

    await userEvent.click(dialog.querySelector('button')!)
    await expect(dialog).not.toHaveAttribute('open')
    await expect(useShortcutsStore().listOpen).toBe(false)
  },
}
