import {test,expect} from '@playwright/test';
test('ASCII density preserves input',async({page})=>{await page.goto('/');await page.locator('#message').fill('HELLO');await page.locator('#pixel-size').fill('9');await expect(page.locator('#pixel-value')).toHaveText('9/10');await expect(page.locator('#message')).toHaveValue('HELLO');await expect(page.locator('[data-preview-mode]')).toHaveCount(0);});
