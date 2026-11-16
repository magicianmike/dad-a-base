import { expect, test } from '@playwright/test'

const joke = {
  id: 'daaUfibh',
  text: 'Why was the big cat disqualified from the race? Because it was a cheetah.',
}

test('the random Joke opens its own page, titled by its opening words', async ({ page }) => {
  await page.goto('/random')
  await expect(page.getByRole('blockquote')).toHaveText(joke.text)
  await page.getByRole('link', { name: joke.text }).click()

  await expect(page).toHaveURL(`/jokes/${joke.id}`)
  await expect(page.getByRole('blockquote')).toHaveText(joke.text)
  await expect(page).toHaveTitle(
    'Why was the big cat disqualified from the race? Because… · Dad-a-base',
  )
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
})

test('a Joke’s page loads from its address', async ({ page }) => {
  await page.goto(`/jokes/${joke.id}`)
  await expect(page.getByRole('blockquote')).toHaveText(joke.text)
  await expect(page.getByText('Reprinted with permission of every dad, everywhere.')).toBeVisible()
})

test('Copy puts the Joke on the clipboard and says so', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Only Chromium lets a test grant and read the clipboard')
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto(`/jokes/${joke.id}`)
  await page.getByRole('button', { name: 'Copy' }).click()

  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible()
  await expect(page.getByRole('status')).toHaveText(/Copied the joke\./)
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(joke.text)
  await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible({ timeout: 3000 })
})

test('Copy always ends with the Joke copied or selected, and a message', async ({ page }) => {
  await page.goto(`/jokes/${joke.id}`)
  await page.getByRole('button', { name: 'Copy' }).click()
  const status = page.getByRole('status')
  await expect(status).toHaveText(/Copied the joke\.|press (⌘C|Ctrl\+C) to copy it/)
  if (/press/.test((await status.textContent()) ?? '')) {
    expect((await page.evaluate(() => getSelection()?.toString()))?.trim()).toBe(joke.text)
  }
})

test('Share copies the link where there’s no share sheet', async ({
  page,
  context,
  browserName,
  isMobile,
}) => {
  test.skip(
    browserName !== 'chromium' || isMobile,
    'Desktop Chromium has no share sheet, and lets a test read the clipboard',
  )
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto(`/jokes/${joke.id}`)
  await page.getByRole('button', { name: 'Share' }).click()

  await expect(page.getByRole('status')).toHaveText(/Copied the link to this joke\./)
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    new URL(`/jokes/${joke.id}`, page.url()).href,
  )
})

test('a Favorite is kept across a reload, and shows on the random Joke too', async ({ page }) => {
  await page.goto(`/jokes/${joke.id}`)
  await page.getByRole('button', { name: 'Fave', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText(/Saved to your favorites\./)

  await page.reload()
  await expect(page.getByRole('button', { name: 'Faved', exact: true })).toBeVisible()

  await page.goto('/random')
  await expect(page.getByRole('blockquote')).toHaveText(joke.text)
  await expect(page.getByRole('button', { name: 'Faved', exact: true })).toBeVisible()
})

test('a Joke that doesn’t exist shows the 404 in place', async ({ page }) => {
  await page.goto('/jokes/nope')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Dad went out for milk. So did this page.',
  )
  await expect(page).toHaveURL('/jokes/nope')
  await expect(page).toHaveTitle('Page not found · Dad-a-base')
})

test('the Joke’s page recovers from an API failure on "Try again"', async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('failed-once')) {
      sessionStorage.setItem('dadabase:mock-failure', '500')
      sessionStorage.setItem('failed-once', '1')
    }
  })
  await page.goto(`/jokes/${joke.id}`)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The printing press has jammed.')
  await page.evaluate(() => sessionStorage.removeItem('dadabase:mock-failure'))
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByRole('blockquote')).toHaveText(joke.text)
})
