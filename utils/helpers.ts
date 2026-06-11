/** @type {import('@playwright/test').Page} */
import { Browser, chromium, expect, firefox, Locator, Page, test, webkit } from '@playwright/test'
import { allure } from 'allure-playwright'
import assert from 'assert'
import * as fs from 'fs'
import process from 'node:process'
import path from 'path'
import projectsLanding = require("./projectsLanding")

export const funcHelper = {
    /**
     * Go to urlToGo and wait load page
     * @param page
     * @param urlToGo
     * @param options
     *      @blockImages boolean
     *      @regexpForBlock default /(bmp|png|jpg|jpeg|svg|mp4)$/
     */
    async gotoCustom(page: Page, urlToGo: string = '', options?: { blockImages?, regexpForBlock? }) {
        const waitFor = funcHelper.random.numberFromRange(500)
        await test.step(`Go To custom url, wait ${waitFor}`, async () => {
            if (options?.blockImages) {
                const regexpForBlock = options?.regexpForBlock ? options.regexpForBlock : /(bmp|png|jpg|jpeg|svg|mp4)$/
                await page.route(regexpForBlock, route => route.abort())
            }
            await page.waitForTimeout(waitFor)

            // Если URL относительный (не начинается с http), добавляем базовый URL
            let fullUrl = urlToGo
            if (urlToGo && !urlToGo.startsWith('http')) {
                const baseUrl = this.getURL()
                // Убираем начальный слеш из urlToGo если он есть
                const cleanPath = urlToGo.startsWith('/') ? urlToGo.substring(1) : urlToGo
                fullUrl = cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl
            }

            await page.goto(fullUrl,
                {
                    waitUntil: 'domcontentloaded',
                    timeout: 50000
                }
            )
        })
    },

    // eslint-disable-next-line complexity
    getURL(scopeName = process.env.SCOPE) {
        switch (scopeName) {
            case '':
                return 'https://example.com'
            case 'sdet':
                return 'https://practice.sdetunicorns.com/'
        }
    },

    getDomain() {
        let domain = funcHelper.getURL()
        domain = domain.replace('https://', '')
        domain = domain.replace('http://', '')
        domain = domain.replace('/', '')
        return domain
    },

    workWithENV: {
        checkValueInScope(valueWhereCheck = process.env.SCOPE, valueWhatCheck: string = 'Stage') {
            return valueWhereCheck.includes(valueWhatCheck)
        }
    },

    errors: {
        async analiseError(error) {
            if (process.env.SNAP_ERROR_MESSAGE === 'base') {
                throw error
            }

            // показываем прописанную нами ошибку вместо базовой, для более удобного анализа
            if (process.env.SNAP_ERROR_MESSAGE === 'sorted_to_common') {
                const errorString = error.message
                if (errorString.includes('are different')) {
                    throw new Error('Problem with snapshot: difference in pixels')
                }

                if (errorString.includes('Expected an image')) {
                    throw new Error('Problem with snapshot: difference in image size')
                }

                throw error
            }
        }
    },

    expectSnapshot: {
        /**
         * Create name for store snapshot with file type
         * @param name -
         * @param nameWithScope - boolean, add to file param from SCOPE env
         * @param addToName - additional string for name
         */
        formingName(name: string | string[], nameWithScope: boolean, addToName = '') {
            if (typeof name === 'object') {
                const newName = [ ...name ]
                if (nameWithScope) {
                    newName[newName.length - 1] += ` - ${process.env.SCOPE}`
                }
                newName[newName.length - 1] += `${addToName}.jpeg`
                return newName
            } else {
                if (nameWithScope) {
                    if (name !== '') {
                        name += ` - ${process.env.SCOPE}`
                    }
                }
                name += `${addToName}.jpeg`
                return name
            }
        },
    },

    /**
     * Function to create snapshot (image) to assertForm design
     * @param page      page object for work with browser
     * @param locator   локатор для проверки
     * @param name      name of snapshot, if passed array it will be under folders
     * @param options   опциональные дополнительные настройки
     *      nameWithScope : подставлять ли в название скрина окружение
     *      maskLocators : массив элементов которые будут закрыты заглушкой
     *      resolutions : массив ширин для которых будет меняться вьюпорт и делаться скрин
     *      timeoutBeforeScreen : значение таймаута в миллисекундах перед скрином (для загрузки страницы) По умолчанию 1500
     *      timeoutBeforeNextScreens
     *      animations turn animation on/off, disabled by default
     */
    async expectLocatorSnapshot(page: Page,
        locator: Locator | string,
        name: string | string[],
        options ?: {
            nameWithScope?: boolean,
            maskLocators?: Locator[] | string[],
            resolutions?: number[],
            heights?: number[],
            timeoutBeforeScreen?: number,
            timeoutBeforeNextScreens?: number,
            animations?: boolean,
            maxDiffPixels?: number,
            maxDiffPixelRatio?: number,
            clickLocators?: Locator[] | string[],
            hoverLocators?: Locator[] | string[],
            hoverDelay?: number,
            tabFocusLocators?: Locator[] | string[],
            focusDelay?: number,
            useFigmaMeta?: boolean,
            useResolutionsFromMeta?: boolean,
            addHeightInName?: boolean,
            clipToViewport?: boolean,
            heightAdjustment?: number | number[]
        }) {

        locator = typeof locator === 'string' ? page.locator(locator) : locator

        // Store original mask selectors for re-creation after viewport changes
        const maskSelectors: string[] = (() => {
            const arr = options?.maskLocators
            if (!arr) return []
            if (typeof arr === 'string') return [arr]
            if (Array.isArray(arr)) return arr.map(item => typeof item === 'string' ? item : '')
            return []
        })()

        function convertToLocators(array) {
            if (array) {
                // If it's a string, convert to array first
                if (typeof array === 'string') {
                    return [ page.locator(array) ]
                }
                // If it's already a Locator, convert to array
                if (array.constructor && array.constructor.name === 'Locator') {
                    return [ array ]
                }
                // If it's an array, process each item
                if (Array.isArray(array)) {
                    array.forEach((item: string | Locator, index: string | number) => {
                        if (typeof item === 'string') {
                            array[index] = page.locator(item)
                        }
                    })
                    return array
                }
                return [ page.locator('sometext') ]
            } else {
                return [ page.locator('sometext') ]
            }
        }

        function freshMaskLocators() {
            if (maskSelectors.length > 0) {
                return maskSelectors.filter(s => s).map(s => page.locator(s))
            }
            return convertToLocators(options?.maskLocators)
        }

        const maskLocatorFlag = convertToLocators(options?.maskLocators) // options?.maskLocators ? options.maskLocators : [ page.locator('sometext') ]
        const clickLocatorFlag = options?.clickLocators ? convertToLocators(options.clickLocators) : []
        const hoverLocatorFlag = options?.hoverLocators ? convertToLocators(options.hoverLocators) : []
        const tabFocusLocatorFlag = options?.tabFocusLocators ? convertToLocators(options.tabFocusLocators) : []

        const defaultResolution = page.viewportSize()
        const timeoutBeforeNextScreens = options?.timeoutBeforeNextScreens !== undefined ? options.timeoutBeforeNextScreens : 1500
        const hoverDelay = options?.hoverDelay !== undefined ? options.hoverDelay : 500
        const focusDelay = options?.focusDelay !== undefined ? options.focusDelay : 500

        let counter = 0,
            length = 0,
            timeout = options?.timeoutBeforeScreen !== undefined ? options.timeoutBeforeScreen : 0

        if (options?.resolutions) {
            options.resolutions = process.env.RESOLUTION_ONLY_IT ? [ parseInt(process.env.RESOLUTION_ONLY_IT) ] : options.resolutions
            length = options.resolutions.length
        }

        // Resolve heights (and optionally resolutions) from Figma meta if requested
        let metaHeightsMap: Record<string, number> | null = null
        let heightsFromMeta: number[] | null = null
        let defaultHeightFromMeta: number | undefined
        try {
            if (options?.useFigmaMeta || options?.useResolutionsFromMeta) {
                const baseName = Array.isArray(name) ? name[name.length - 1] : name
                const specFile = test.info().file
                const snapshotDir = `${specFile}-snapshots`
                const metaPath = path.join(snapshotDir, `${baseName}-meta.json`)
                if (fs.existsSync(metaPath)) {
                    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
                    if (meta && meta.map) {
                        metaHeightsMap = meta.map
                        // If useResolutionsFromMeta and no explicit resolutions, use widths from meta
                        if (options?.useResolutionsFromMeta && (!options?.resolutions || options.resolutions.length === 0)) {
                            options.resolutions = Object.keys(meta.map).map(w => parseInt(w, 10)).sort((a, b) => b - a)
                            length = options.resolutions.length
                        }
                    }
                }
                if (metaHeightsMap) {
                    if (length && options?.resolutions) {
                        heightsFromMeta = options.resolutions.map(w => metaHeightsMap[String(w)])
                    } else {
                        defaultHeightFromMeta = metaHeightsMap[String(defaultResolution.width)]
                    }
                }
            }
        } catch (e) {
            // ignore meta errors silently to avoid breaking tests
        }

        await test.step('Function asser snapshots', async () => {
            do {
                await test.step(`Assert snapshot. Cycle ${counter}`, async () => {
                    if (length) {
                        await test.step(`Change screen width to ${options.resolutions[counter]}.`, async () => {
                            const targetWidth = options.resolutions[counter]
                            let targetHeight = options?.heights?.[counter]
                                ?? (heightsFromMeta ? heightsFromMeta[counter] : undefined)
                                ?? defaultResolution.height
                            const adj = Array.isArray(options?.heightAdjustment)
                                ? (options?.heightAdjustment?.[counter] ?? 0)
                                : (options?.heightAdjustment ?? 0)
                            if (typeof adj === 'number' && adj !== 0) {
                                targetHeight = (targetHeight ?? defaultResolution.height) + adj
                            }
                            await page.setViewportSize({
                                width:  targetWidth,
                                height: targetHeight
                            })

                            // Click on elements after resolution change but before screenshot
                            if (options?.clickLocators && options.clickLocators.length > 0) {
                                for (const clickLocator of clickLocatorFlag) {
                                    if (clickLocator && await clickLocator.isVisible()) {
                                        await clickLocator.click()
                                        await page.waitForTimeout(1500) // Increased delay for menu to appear

                                        // Wait for the target locator to become visible after click
                                        try {
                                            await locator.waitFor({ state: 'visible', timeout: 5000 })
                                        } catch (error) {
                                            console.log('Target locator not visible after click, continuing...')
                                        }
                                    }
                                }
                            }

                        })
                    }

                    await test.step('Make Hovers', async () => {
                        // Hover on elements after resolution change but before screenshot
                        if (options?.hoverLocators && options.hoverLocators.length > 0) {
                            for (const hoverLocator of hoverLocatorFlag) {
                                await hoverLocator.scrollIntoViewIfNeeded()
                                await funcHelper.mouseActions.moveIntoElement(page, hoverLocator)
                                if (hoverDelay > 0) {
                                    await page.waitForTimeout(hoverDelay)
                                }
                            }
                        }
                    })

                    await test.step('Make Tab Focus', async () => {
                        // Focus on elements via Tab key navigation
                        if (options?.tabFocusLocators && options.tabFocusLocators.length > 0) {
                            for (const focusLocator of tabFocusLocatorFlag) {
                                await focusLocator.scrollIntoViewIfNeeded()
                                await focusLocator.focus()
                                if (focusDelay > 0) {
                                    await page.waitForTimeout(focusDelay)
                                }
                            }
                        }
                    })

                    // disabled for dymanic screens with timeout = 0
                    if (timeout>0) {
                        await test.step('Custom Wait. Check Visible', async () => {
                            await page.waitForTimeout(timeout)
                            await expect(locator).toBeVisible({ timeout: 20000 })
                        })
                    }

                    // For single-resolution case, optionally adjust height from meta before screenshot
                    if (!length && (options?.heights?.length || defaultHeightFromMeta)) {
                        let singleHeight = options?.heights?.[0] ?? defaultHeightFromMeta
                        const adj = Array.isArray(options?.heightAdjustment)
                            ? (options?.heightAdjustment?.[0] ?? 0)
                            : (options?.heightAdjustment ?? 0)
                        if (typeof adj === 'number' && adj !== 0) {
                            singleHeight = (singleHeight ?? defaultResolution.height) + adj
                        }
                        if (singleHeight && singleHeight > 0) {
                            await page.setViewportSize({ width: defaultResolution.width, height: singleHeight })
                        }
                    }

                    await locator.scrollIntoViewIfNeeded()

                    try {
                        // Get clip dimensions from meta if useFigmaMeta is enabled
                        let clipRect = undefined
                        if (options?.clipToViewport && options?.useFigmaMeta && metaHeightsMap) {
                            const currentWidth = length ? options.resolutions[counter] : defaultResolution.width
                            const currentHeight = metaHeightsMap[String(currentWidth)]
                            if (currentWidth && currentHeight) {
                                clipRect = { x: 0, y: 0, width: currentWidth, height: currentHeight }
                            }
                        }

                        const buffer = options?.clipToViewport
                            ? await page.screenshot({
                                fullPage:   false,
                                animations: options?.animations === true ? 'allow' : 'disabled',
                                type:       'jpeg',
                                clip:       clipRect
                            })
                            : await locator.screenshot({
                                animations: options?.animations === true ? 'allow' : 'disabled',
                                mask:       freshMaskLocators(),
                                type:       'jpeg'
                            })
                        expect.soft(buffer).toMatchSnapshot(
                            funcHelper.expectSnapshot.formingName(
                                name,
                                options?.nameWithScope ? options.nameWithScope : false,
                                (() => {
                                    const widthPart = length ? `_x${options.resolutions[counter]}` : `_x${defaultResolution.width}`
                                    let heightUsed = length
                                        ? (options?.heights?.[counter] ?? (heightsFromMeta ? heightsFromMeta[counter] : undefined))
                                        : (options?.heights?.[0] ?? defaultHeightFromMeta)
                                    const adjForName = Array.isArray(options?.heightAdjustment)
                                        ? (length ? (options?.heightAdjustment?.[counter] ?? 0) : (options?.heightAdjustment?.[0] ?? 0))
                                        : (options?.heightAdjustment ?? 0)
                                    if (typeof heightUsed === 'number' && typeof adjForName === 'number' && adjForName !== 0) {
                                        heightUsed = heightUsed + adjForName
                                    }
                                    if (options?.addHeightInName && heightUsed) {
                                        return `${widthPart}x${heightUsed}`
                                    }
                                    return widthPart
                                })()
                            ),
                            {
                                ...(options?.maxDiffPixelRatio
                                    ? { maxDiffPixelRatio: options.maxDiffPixelRatio }
                                    : { maxDiffPixels: options?.maxDiffPixels ?? 10 })
                            })
                    } catch (error) {
                        await funcHelper.errors.analiseError(error)
                    }

                    counter++
                    timeout = timeoutBeforeNextScreens
                })
            }
            while (counter < length)

            await page.setViewportSize(defaultResolution)
        })
    },

    random: {
        number() {
            return Math.random()
        },

        /**
         * Функция возвращает случайно сформированную строку заданной длины из переданных символов
         * @param length
         * @param symbols
         */
        string(length: number, symbols = 'qwertyuiopasdfghjklzxcvbnm') {
            let str = ''
            for (let i = 0; i < length; i++) {
                str += symbols.charAt(Math.floor(funcHelper.random.number() * symbols.length))
            }
            return str
        },

        numberFromRange(max: number, min = 0) {
            return Math.trunc(min + funcHelper.random.number() * (max - min))
        }

    },

    // additional actions by mouse: moving, hover
    mouseActions: {
        /**
         * TODO: make for Locator
         * hover consequent locators - works only with string[] | string, not with Locator
         * @param page
         * @param locators
         */
        async hoverElements(page: Page, locators) {
            await test.step('Hover elements in series', async () => {
                if (typeof locators === 'object') {
                    if (locators.length > 0) {
                        for (let i = 0; i < locators.length; i++) {
                            if (locators[i] === 'string') {
                                await page.locator(locators[i]).scrollIntoViewIfNeeded()
                            }
                            await funcHelper.mouseActions.moveIntoElement(page, locators[i])
                        }
                    }
                } else {
                    await page.locator(locators).scrollIntoViewIfNeeded()
                    await funcHelper.mouseActions.moveIntoElement(page, locators)
                }
            })
        },

        /**
         * Move mouse into element
         * @param page
         * @param locator   string / locator
         * @param x new coordinate from left into box element
         * @param y new coordinate from top into box element
         */
        async moveIntoElement(page: Page, locator: string | Locator) {
            await test.step('Move mouse element on page', async () => {
                const box = typeof locator === 'string' ? await page.locator(locator).boundingBox() : await locator.boundingBox()
                const x = box.width / 2
                const y = box.height / 2
                await page.mouse.move(box.x + x, box.y + y)
            })
        },

        async scrollManyWheel(page: Page, count = 20, deltaY = 100, options?: { home?: boolean }) {
            await test.step('Preparing: Scroll by wheel mouse.', async () => {
                for (let i = 0; i < count; i++) {
                    await page.mouse.wheel(0, deltaY)
                }

                if (options?.home) {
                    await page.keyboard.down('Home')
                }
            })
        },
    },

    /**
     * click consequent locators
     * @param page
     * @param locators
     * @param options - timeout to wait for opening menu before 2nd, and next clicks
     */
    async clickButtons(page: Page, locators = [], options?: {
        // timeout before clicking buttons
        timeout?: number;
    }) {
        const timeout = options?.timeout !== undefined ? options.timeout : 0

        await test.step('Click buttons in series', async () => {
            if (locators.length > 0) {
                for (let i = 0; i < locators.length; i++) {
                    if (typeof locators[i] === 'string') {
                        await page.locator(locators[i]).scrollIntoViewIfNeeded()
                        await page.locator(locators[i]).click()
                    } else {
                        // requires to scroll to section since it appears when in viewport
                        await locators[i].scrollIntoViewIfNeeded()
                        await locators[i].click()
                    }
                    await page.waitForTimeout(timeout)
                }
            }
        })
    },

    objects: {
        /**
         * Если поиск по name, то возвращает содержимое указанного свойства, все другие случаи false
         * @param {object} object
         * @param {{name?: string}} options
         * @returns {any}
         */
        getValueFromProperty(object: object,
            options: {
                name?: string,
                value?,
                contentInValue?: string
            }) {

            for (const [ key, value ] of Object.entries(object)) {
                if (typeof value === 'object') {
                    const searchResult = funcHelper.objects.getValueFromProperty(value, options)
                    if (searchResult) {
                        return searchResult
                    }
                }
                if (key == options.name) {
                    // возвращаем значение если часть его контента равна поиску в содержимом
                    if (options.contentInValue) {
                        if (String(value).includes(options.contentInValue)) {
                            return value
                        }
                    } else if (options.value) {
                        return options.value === value
                    } else {
                        return value
                    }
                }
            }

            return false
        },

        getArrayValuesFromProperty(object: object, options: { name?: string, }) {
            const arrayWithValues = []
            for (const [ key, value ] of Object.entries(object)) {
                if (typeof value === 'object') {
                    arrayWithValues.push(funcHelper.objects.getValueFromProperty(value, options))
                }
                if (key == options.name)
                    arrayWithValues.push(value)
                // return value
            }
            return arrayWithValues
        },

        deepClone(object: object): object {
            return JSON.parse(JSON.stringify(object))
        }
    },

    files: {
        writeObject(fullFilePathName = './tests', objectToWrite) {
            fs.writeFileSync(fullFilePathName, JSON.stringify(objectToWrite, null, 4))
        },

        readObject(filePathName) {
            if (fs.existsSync(filePathName)) {
                return JSON.parse(fs.readFileSync(filePathName, 'utf8'))
            }
            return false
        },
    },

    forReport: {
        /**
         * Function to add additional annotation (like variables to report as for jenkins as for PW html)
         * @param name
         * @param value
         */
        async addAnnotation(name: string, value) {
            value = JSON.stringify(value)
            test.info().annotations.push({ type: name, description: value })
            await allure.parameter(name, value)
        }
    },

    qr: {
        async loadImgFromFile(pathToImg) {
            const buffer = fs.readFileSync(pathToImg)
            const image = await Jimp.read(buffer)

            return image
        },
        /**
         *
         * @param image - loaded file with image
         * @param strForAssert
         */
        async assertStringInQR(image, strForAssert: string) {
            const qr = new QrCode()
            qr.callback = async function (err, value) {
                if (err) {
                    assert(false, 'error: problem with qr img ' + err)
                }
                expect(value.result).toEqual(strForAssert)
                return
            }
            await qr.decode(image.bitmap)
        },

        /**
         * Function to asser string data under image with QR code
         * @param page
         * @param locatorWithImg
         * @param strForAssert
         */
        async assert(page: Page, locatorWithImg: string, strForAssert: string) {
            await test.step('Asser string in QR element', async () => {
                // const pathToFile = 'temp/image_with_qr.png'
                // await page.locator(locatorWithImg).screenshot({ path: pathToFile })
                // const buffer = fs.readFileSync(pathToFile)

                const buffer = await page.locator(locatorWithImg).screenshot()
                const image = await Jimp.read(buffer)

                const qr = new QrCode()
                qr.callback = async function (err, value) {
                    if (err) {
                        assert(false, 'Error: problem with qr img. ' + err)
                    }
                    expect(value.result).toEqual(strForAssert)
                    return
                }
                await qr.decode(image.bitmap)
            })
        }
    },

    browser: {
        async openBrowser(browserName: 'safari' | 'chrome' | 'firefox', options?: object) {

            let browser: Browser

            switch (browserName) {
                case 'chrome':
                    browser = await chromium.launch()
                    break
                case 'safari':
                    browser = await webkit.launch()
                    break
                case 'firefox':
                    browser = await firefox.launch()
                    break
            }
            const context = await browser.newContext(options)
            return context.newPage()
        }
    }
}

export const characters = {
    numbers:                       '0123456789',
    latinLetters:                  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    russianLetters:                'абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',
    minSpecial:                    '. -',
    fewSpecial:                    '. -\'',
    mediumSpecial:                 '; ,/?:@&=+$-_.!~*\'()#',
    allSpecial:                    '[ ]\\/!@#<>№-"$%^&*()_+=-~|\';:.,?',
    withMinSpecial:                '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ. -',
    withFewSpecial:                '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ. -\'',
    withMediumSpecial:             '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ; ,/?:@&=+$-_.!~*\'()#',
    withMediumSpecialWithoutSpace: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ;,/?:@&=+$-_.!~*\'()#',
    website:                       '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ;,/?:@&=+$-_.!~*\'()#',
    withAllSpecial:                '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ[ ]\\/!@#<>№-"$%^&*()_+=-~|\';:.,?',
    withoutSpecial:                '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    all:                           'бЯbZáQるçẵ您0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ[ ]\\/!@#<>№-"$%^&*()_+=-~|\';:.,?',
    allWithoutSpace:               'бЯbZáQるçẵ您0aA[]\\/!@#<>№-"$%^&*()_+=-~|\';:.,?',
    phone:                         '0123456789',
    email:                         '!#$%&\'*+-/=?^_`{|}~0123456789abcdefghijklmnopqrstuvwxyz',
    emailWithoutSpecial:           '0123456789abcdefghijklmnopqrstuvwxyz',
}
