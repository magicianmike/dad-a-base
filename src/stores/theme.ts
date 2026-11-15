import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

/** Also read by the inline script in index.html, which applies the theme before first paint. */
export const THEME_STORAGE_KEY = 'dadabase:theme'

const SYSTEM_DARK = '(prefers-color-scheme: dark)'

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

// Storage can throw (private windows, blocked site data). The theme then just isn't remembered.
function read(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(stored) ? stored : null
  } catch {
    return null
  }
}

function write(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Not remembered, but still applied.
  }
}

/**
 * The visitor's theme. Until they choose one, the page follows the system: no `data-theme`, so the stylesheet's
 * media query decides (ADR 0004). Once they toggle, their choice is applied and saved.
 */
export const useThemeStore = defineStore('theme', () => {
  const chosen = ref<Theme | null>(read())
  const systemDark = ref(false)

  const media = typeof matchMedia === 'function' ? matchMedia(SYSTEM_DARK) : null
  if (media) {
    systemDark.value = media.matches
    media.addEventListener('change', (event) => (systemDark.value = event.matches))
  }

  const theme = computed<Theme>(() => chosen.value ?? (systemDark.value ? 'dark' : 'light'))

  function toggle() {
    chosen.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  watch(
    chosen,
    (value) => {
      if (!value) return
      write(value)
      document.documentElement.dataset.theme = value
    },
    { immediate: true },
  )

  return { theme, toggle }
})
