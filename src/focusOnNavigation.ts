import { nextTick } from 'vue'
import type { Router } from 'vue-router'

/**
 * After each navigation but the first, moves focus to the new page's h1, so keyboard and screen reader users start
 * at the new content, as they would on a page load. The first page load keeps the browser's own focus, and so does a
 * new query on the same page, such as typing a Search: the page moves focus itself if it needs to.
 */
export function focusOnNavigation(router: Router) {
  router.afterEach(async (to, from, failure) => {
    if (failure || from.matched.length === 0 || to.path === from.path) return
    await nextTick()
    const heading = document.querySelector<HTMLElement>('main h1')
    const target = heading ?? document.querySelector<HTMLElement>('main')
    if (!target) return
    target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  })
}
