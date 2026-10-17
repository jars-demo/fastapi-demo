import { expect, test } from '@playwright/test'

test('home explains the workshop and starts it', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('FastAPI')
  await expect(page.getByRole('img', { name: /shelf of books/i })).toBeVisible()

  await page.getByRole('tab', { name: 'Bad input' }).click()
  await expect(page.getByText('Some fields need attention')).toBeVisible()

  await page.getByRole('link', { name: 'Start the workshop' }).click()
  await expect(page).toHaveURL(/\/workshop\/01-why-fastapi$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Why FastAPI, and what we build')
})

test('the workshop lists every chapter and pages through them', async ({ page }) => {
  await page.goto('/workshop')
  const chapters = page.locator('main ol > li')
  await expect(chapters).toHaveCount(12)

  await chapters.nth(7).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Protect writes with an API key')
  await expect(page.getByRole('button', { name: 'Copy' }).first()).toBeVisible()

  await page.getByRole('link', { name: /Next/ }).click()
  await expect(page).toHaveURL(/09-testing$/)
})

test('nothing scrolls sideways', async ({ page }) => {
  for (const path of ['/', '/workshop', '/workshop/04-pydantic-models']) {
    await page.goto(path)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow, path).toBeLessThanOrEqual(0)
  }
})
