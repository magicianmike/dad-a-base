import type { Page } from '@playwright/test'

/**
 * Waits for the page to look as it will stay: its fonts loaded, and every animation that ends, such as a page or a
 * newly loaded Joke fading up as it arrives, finished. It looks again after a couple of frames, since content that
 * loads late starts its own. Axe measures contrast as it finds it, so a half-faded page fails.
 */
export async function settled(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready
    const frames = () =>
      new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    for (let look = 0; look < 10; look++) {
      await frames()
      const ending = document
        .getAnimations()
        .filter(
          (animation) =>
            animation.playState === 'running' &&
            animation.effect?.getComputedTiming().iterations !== Infinity,
        )
      if (ending.length === 0) return
      await Promise.all(ending.map((animation) => animation.finished.catch(() => {})))
    }
  })
}
