import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
}

/** How long a toast stays, long enough to read twice. */
export const TOAST_DURATION_MS = 5000

/** Short confirmations ("Copied the joke"), announced by the one live region in ToastRegion. */
export const useToastsStore = defineStore('toasts', () => {
  const toasts = ref<Toast[]>([])
  let nextId = 0

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function show(message: string) {
    const id = nextId++
    toasts.value = [...toasts.value, { id, message }]
    setTimeout(() => dismiss(id), TOAST_DURATION_MS)
  }

  return { toasts, show, dismiss }
})
