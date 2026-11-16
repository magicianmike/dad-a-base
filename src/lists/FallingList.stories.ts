import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { expect, waitFor } from 'storybook/test'
import RemoveButton from '@/components/RemoveButton.vue'
import FallingList from './FallingList.vue'
import { useFallingRemoval } from './useFallingRemoval'

const meta = {
  // No `component`: FallingList is generic, which Storybook's types can't take. The title comes from the path.
  // A list with Remove buttons and useFallingRemoval wired up, as Favorites and the Groan Leaderboard have.
  render: () => ({
    components: { FallingList, RemoveButton },
    setup() {
      const items = ref(['First clipping', 'Second clipping', 'Third clipping'])
      const list = ref<HTMLElement | null>(null)
      const heading = ref<HTMLElement | null>(null)
      const emptyHeading = ref<HTMLElement | null>(null)
      const { falling, empty, remove, fallen } = useFallingRemoval({
        list,
        count: () => items.value.length,
        heading,
        emptyHeading,
      })
      const take = (item: string) => () => (items.value = items.value.filter((i) => i !== item))
      return { items, list, heading, emptyHeading, falling, empty, remove, fallen, take }
    },
    template: `
      <h2 v-if="empty" ref="emptyHeading" tabindex="-1">Nothing left</h2>
      <section v-else ref="list" style="max-width: 24rem; padding-top: 3rem">
        <h2 ref="heading" tabindex="-1">Clippings</h2>
        <FallingList
          v-slot="{ item, index }"
          :items="items"
          :item-key="(item) => item"
          :falling="falling > 0"
          @fallen="fallen"
        >
          <p style="display: flex; gap: 1rem; align-items: center; justify-content: space-between">
            {{ item }}
            <RemoveButton label="Remove" icon="cross" @click="remove(index, take(item))" />
          </p>
        </FallingList>
      </section>`,
  }),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Removing one: it falls, focus moves to the next Remove, and the last leaves the empty state focused. */
export const Removing: Story = {
  play: async ({ canvas, userEvent }) => {
    const removes = () => canvas.queryAllByRole('button', { name: 'Remove' })
    await userEvent.click(removes()[0]!)
    await waitFor(() => expect(removes()).toHaveLength(2))
    await expect(removes()[0]).toHaveFocus()
    await expect(canvas.getAllByRole('listitem')[0]).toHaveTextContent('Second clipping')

    await userEvent.click(removes()[1]!)
    await waitFor(() => expect(removes()).toHaveLength(1))
    await expect(removes()[0]).toHaveFocus()

    await userEvent.click(removes()[0]!)
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'Nothing left' })).toHaveFocus())
  },
}
