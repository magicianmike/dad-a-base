import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn } from 'storybook/test'
import { errorCopy } from '@/errors/copy'
import ErrorView from './ErrorView.vue'

const meta = {
  component: ErrorView,
  args: { code: '500', onRetry: fn() },
} satisfies Meta<typeof ErrorView>

export default meta
type Story = StoryObj<typeof meta>

const retryable: Story['play'] = async ({ canvas, args, userEvent }) => {
  const copy = errorCopy[args.code]
  await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent(copy.headline)
  await expect(canvas.getByText(copy.explanation)).toBeInTheDocument()
  await userEvent.click(canvas.getByRole('button', { name: 'Try again' }))
  await expect(args.onRetry).toHaveBeenCalledOnce()
}

const final: Story['play'] = async ({ canvas, args }) => {
  await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent(
    errorCopy[args.code].headline,
  )
  // Trying again can't fix this, so there's no button, only the ways out.
  await expect(canvas.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
  await expect(canvas.getByRole('link', { name: 'Front page' })).toHaveAttribute('href', '/')
}

export const NotFound: Story = { args: { code: '404' }, play: final }
export const Forbidden: Story = { args: { code: '403' }, play: final }
export const RateLimited: Story = { args: { code: '429' }, play: retryable }
export const ServerError: Story = { args: { code: '500' }, play: retryable }
export const Offline: Story = { args: { code: 'offline' }, play: retryable }
export const Unknown: Story = { args: { code: 'unknown' }, play: retryable }

/** Without a way to retry, a retryable error offers only the ways out. */
export const RetryableWithoutHandler: Story = {
  args: { code: '500', onRetry: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
  },
}
