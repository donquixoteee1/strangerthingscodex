import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto('http://127.0.0.1:4173');await page.waitForSelector('.light');
await page.locator('#english').check({force:true});
for(const l of 'HELLO')await page.locator(`[data-letter="${l}"]`).click();
await page.mouse.move(10,10);await page.screenshot({path:'artifacts/preview-hello.png'});
await browser.close();
