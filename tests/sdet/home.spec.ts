import { test, expect } from '@playwright/test';
import type HomePage from "../../pages/home.page";

test.describe('Home', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate()
  })

  test('Open HomePage and verify title', async ({ page }) => {
    // verify title
    await expect(page).toHaveTitle('Practice E-Commerce Site – SDET Unicorns');
  })

  test('Open About page and verify title', async ({ page }) => {
    // open url
    await page.goto('https://practice.sdetunicorns.com/about', {waitUntil: "domcontentloaded"});

    // verify title
    await expect(page).toHaveTitle('About – Practice E-Commerce Site');
  })

  test('Click get started button using CSS Selector', async ({ page }) => {
    await expect(page).not.toHaveURL(/.*#get-started/);

    // click the button
    await homePage.getStartedBtn.click()

    // verify url has #get-started
    await expect(page).toHaveURL(/.*#get-started/);
  })

  test('Verify heading text is visible using text selector', async ({ page }) => {
    // find the text locator
    const headingText = await homePage.headingText

    // verify heading text is visible
    await expect(headingText).not.toBeHidden();
    await expect(headingText).toBeVisible();
  })

  test('Verify home link is enabled using text and css selector', async ({ page }) => {
    // find the home text
    const homeText = await homePage.homeLink

    // verify home text is enabled
    await expect(homeText).toBeEnabled();
  })

  test('Verify search icon is visible using xpath selector', async ({ page }) => {
    // find the search icon
    const searchIcon = await homePage.searchIcon

    // verify search icon is visible
    await expect(searchIcon).toBeVisible();
  })

  test('Verify search results', async ({ page }) => {
    const searchIcon = await homePage.searchIcon
    await searchIcon.click()

    const term = 'learn'
    const searchInput = await page.getByPlaceholder('Type & hit Enter …').first()
    await searchInput.fill(term)
    await searchInput.press('Enter')

    expect(page.url()).toContain(`?s=${term}`)
    // new RegExp() - can be ommitted
    await expect(page.locator('.trail-item >span')).toHaveText(new RegExp(`Search results for: ${term}`))
  })

  test('Verify text of all nav links', async ({ page }) => {
    const expectedLinks = [
      "Home",
      "About",
      "Shop",
      "Blog",
      "Contact",
      "My account",
    ];

    // verify nav links text
    expect(await homePage.getNavLinksText()).toEqual(expectedLinks);

    const listItems = page.locator('#zak-primary-nav li[id*=menu]')
    // expect(await listItems.allInnerTexts()).toEqual(expectedLinks)

    const expectedTabTextLinks = [
      {text: "Home", href: 'https://practice.sdetunicorns.com/'},
      {text: "About", href: 'https://practice.sdetunicorns.com/about/'},
      {text: "Shop", href: 'https://practice.sdetunicorns.com/shop/'},
      {text: "Blog", href: 'https://practice.sdetunicorns.com/blog/'},
      {text: "Contact", href: 'https://practice.sdetunicorns.com/contact/'},
      {text: "My account", href: 'https://practice.sdetunicorns.com/my-account/'},
    ];

    // verify nav links text
    for (const [index, listItem] of expectedTabTextLinks.entries()) {
      const link = listItems.nth(index).locator('a')

      await expect(link).toHaveText(listItem.text)
      await expect(link).toHaveAttribute('href', listItem.href)
    }
  })

  test('Verify table is divided into 2 sections with correct number of rows', async ({ page }) => {
    await page.goto('https://www.icc-cricket.com/tournaments/cricketworldcup/standings', {waitUntil: "domcontentloaded"})

    // Count the total number of rows
    const totalRows = page.locator('.si-table-row')
    await expect(totalRows).toHaveCount(11)

    // Verify the 4th row has the boarder class
    await expect(totalRows.nth(4)).toHaveAttribute('style', 'border-color: rgb(51, 0, 117);')
    await expect(totalRows.nth(4)).toHaveClass(/.*si-table-row.*/)
    await expect(totalRows.nth(4)).toHaveCSS('border-bottom','1px solid rgb(51, 0, 117)')
    // * - any expression after
    await expect(totalRows.nth(4)).toHaveCSS('border-bottom',/1px solid.*/)
  })

  test.slow()
  test.skip('Verify link in new tab', async ({ page }) => {
    await page.goto('https://baas.staging.cardpay-aws.net/')

    // click on the link and wait for the new tab to be triggered
    const [newPage] = await Promise.all(([
      page.waitForEvent('popup'),
      page.locator('.navbar__main-menu-link_external').click()
    ]))

    // wait for the new page to load
    await newPage.waitForLoadState();

    // assertion with regex (include string)
    await expect(newPage).toHaveTitle(/Grow your business locally and globally with Unlimit/)

    // close the new tab
    await newPage.close()
  })
})
