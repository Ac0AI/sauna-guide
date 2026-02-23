import { test, expect } from '@playwright/test'

// ─── Page Loading ───────────────────────────────────────────────

test.describe('All pages load correctly', () => {
  const pages = [
    ['/', 'Sauna Guide'],
    ['/saunas', 'Sauna Directory'],
    ['/guides', 'Protocols'],
    ['/gear', 'Gear'],
    ['/sauna-brands', 'Sauna Brands'],
    ['/challenge', 'Reset'],
    ['/welcome', 'Welcome'],
  ]

  for (const [path, titleFragment] of pages) {
    test(`${path} returns 200 and has title`, async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
      await expect(page).toHaveTitle(new RegExp(titleFragment, 'i'))
    })
  }
})

// ─── Dynamic Routes ─────────────────────────────────────────────

test.describe('Dynamic pages load', () => {
  test('/saunas/[id] loads a sauna', async ({ page }) => {
    const response = await page.goto('/saunas/loyly-helsinki')
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toContainText(/löyly/i)
  })

  test('/guides/[slug] loads a guide', async ({ page }) => {
    const response = await page.goto('/guides/sauna-dry-january')
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('/gear/[slug] loads a product', async ({ page }) => {
    await page.goto('/gear')
    const firstLink = page.locator('a[href^="/gear/"]').first()
    const href = await firstLink.getAttribute('href')
    expect(href).toBeTruthy()
    const response = await page.goto(href!)
    expect(response?.status()).toBe(200)
  })

  test('/sauna-brands/[slug] loads a brand', async ({ page }) => {
    const response = await page.goto('/sauna-brands/harvia')
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toContainText(/harvia/i)
  })
})

// ─── Navigation ─────────────────────────────────────────────────

test.describe('Navigation works', () => {
  test('header nav links are present', async ({ page }) => {
    await page.goto('/')
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
    await expect(nav.locator('a[href="/saunas"]')).toBeVisible()
    await expect(nav.locator('a[href="/guides"]')).toBeVisible()
  })

  test('mobile menu opens and closes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const menuButton = page.locator('button[aria-label="Toggle menu"]')
    await expect(menuButton).toBeVisible()
    await menuButton.click()
    // Mobile menu links have "block" class
    const mobileLink = page.locator('.md\\:hidden a[href="/saunas"]')
    await expect(mobileLink).toBeVisible()
  })

  test('footer links are present', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer.locator('a[href="/saunas"]')).toBeVisible()
    await expect(footer.locator('a[href="/guides"]')).toBeVisible()
    await expect(footer.locator('a[href="/gear"]')).toBeVisible()
  })
})

// ─── Homepage Hero ──────────────────────────────────────────────

test.describe('Homepage content', () => {
  test('hero section renders with heading', async ({ page }) => {
    await page.goto('/')
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
  })

  test('newsletter signup form is present', async ({ page }) => {
    await page.goto('/')
    const emailInput = page.locator('input[type="email"]').first()
    await expect(emailInput).toBeVisible()
  })

  test('sauna cards are displayed', async ({ page }) => {
    await page.goto('/')
    const cards = page.locator('a[href^="/saunas/"]')
    expect(await cards.count()).toBeGreaterThan(0)
  })
})

// ─── Images ─────────────────────────────────────────────────────

test.describe('Images', () => {
  test('hero image loads on homepage', async ({ page }) => {
    await page.goto('/')
    const heroImg = page.locator('img').first()
    await expect(heroImg).toBeVisible()
    const src = await heroImg.getAttribute('src')
    expect(src).toBeTruthy()
  })

  test('all images have alt attributes', async ({ page }) => {
    await page.goto('/')
    const images = page.locator('img')
    const count = await images.count()
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      expect(alt, `Image ${i} missing alt attribute`).not.toBeNull()
    }
  })
})

// ─── SEO Meta Tags ──────────────────────────────────────────────

test.describe('SEO meta tags', () => {
  const pages = ['/', '/saunas', '/guides', '/gear', '/sauna-brands', '/challenge']

  for (const path of pages) {
    test(`${path} has meta description`, async ({ page }) => {
      await page.goto(path)
      const desc = page.locator('meta[name="description"]')
      await expect(desc).toHaveAttribute('content', /.+/)
    })

    test(`${path} has og:title`, async ({ page }) => {
      await page.goto(path)
      const ogTitle = page.locator('meta[property="og:title"]')
      await expect(ogTitle).toHaveAttribute('content', /.+/)
    })
  }
})

// ─── Structured Data ────────────────────────────────────────────

test.describe('Structured data', () => {
  test('homepage has Organization JSON-LD', async ({ page }) => {
    await page.goto('/')
    const jsonLd = page.locator('script[type="application/ld+json"]')
    const count = await jsonLd.count()
    expect(count).toBeGreaterThan(0)
    const content = await jsonLd.first().textContent()
    const data = JSON.parse(content!)
    expect(data['@type']).toBeTruthy()
  })

  test('guide page has Article JSON-LD', async ({ page }) => {
    await page.goto('/guides/sauna-dry-january')
    const jsonLd = page.locator('script[type="application/ld+json"]')
    const count = await jsonLd.count()
    expect(count).toBeGreaterThan(0)
  })
})

// ─── Newsletter Signup ──────────────────────────────────────────

test.describe('Newsletter signup', () => {
  test('email input accepts text', async ({ page }) => {
    await page.goto('/')
    const emailInput = page.locator('input[type="email"]').first()
    await emailInput.fill('test@example.com')
    await expect(emailInput).toHaveValue('test@example.com')
  })

  test('submit button is present', async ({ page }) => {
    await page.goto('/')
    const form = page.locator('form').first()
    const button = form.locator('button[type="submit"]')
    await expect(button).toBeVisible()
  })
})

// ─── Responsive Design ──────────────────────────────────────────

test.describe('Responsive design', () => {
  test('mobile viewport renders without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const body = page.locator('body')
    const box = await body.boundingBox()
    expect(box?.width).toBeLessThanOrEqual(375)
  })

  test('tablet viewport renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('desktop viewport renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await expect(page.locator('h1').first()).toBeVisible()
  })
})

// ─── 404 Page ───────────────────────────────────────────────────

test('404 page renders for unknown routes', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist')
  expect(response?.status()).toBe(404)
})

// ─── Console Errors ─────────────────────────────────────────────

test.describe('No console errors on key pages', () => {
  const pages = ['/', '/saunas', '/guides', '/gear']

  for (const path of pages) {
    test(`${path} has no JS errors`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (error) => {
        errors.push(error.message)
      })
      await page.goto(path)
      await page.waitForLoadState('domcontentloaded')
      // Give a moment for any async JS errors
      await page.waitForTimeout(1000)
      expect(errors, `JS errors on ${path}: ${errors.join(', ')}`).toHaveLength(0)
    })
  }
})

// ─── CSS & Styling ──────────────────────────────────────────────

test.describe('Tailwind CSS v4 styles applied', () => {
  test('custom colors are applied', async ({ page }) => {
    await page.goto('/')
    const body = page.locator('body')
    const bg = await body.evaluate((el) => getComputedStyle(el).backgroundColor)
    // Should be sauna-paper (#FAFAF8) or close
    expect(bg).toBeTruthy()
    expect(bg).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('custom fonts are loaded', async ({ page }) => {
    await page.goto('/')
    const h1 = page.locator('h1').first()
    const fontFamily = await h1.evaluate((el) => getComputedStyle(el).fontFamily)
    expect(fontFamily).toContain('Cormorant')
  })

  test('animations are defined', async ({ page }) => {
    await page.goto('/')
    const hasAnimations = await page.evaluate(() => {
      const sheets = document.styleSheets
      for (let i = 0; i < sheets.length; i++) {
        try {
          const rules = sheets[i].cssRules
          for (let j = 0; j < rules.length; j++) {
            if (rules[j] instanceof CSSKeyframesRule) return true
          }
        } catch { /* cross-origin */ }
      }
      return false
    })
    expect(hasAnimations).toBe(true)
  })
})
