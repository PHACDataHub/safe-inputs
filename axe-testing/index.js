import fs from 'fs';
import { AxePuppeteer } from '@axe-core/puppeteer';
import puppeteer from 'puppeteer';

import { processAxeReport } from './src/process-axe-report.js';
import { crawlPage } from './src/crawl-page.js';

import dotenv from 'dotenv';

dotenv.config();
const { HOMEPAGE_URL } = process.env;

const config = JSON.parse(fs.readFileSync('./whitelist-config.json', 'utf8'));
const blacklistUrls = config.blacklistUrls || [];
console.log('Exempted URLs:', blacklistUrls);
const ignoreIncomplete = config.ignoreIncomplete || [];
console.log('Exempted incomplete ids:', ignoreIncomplete);
const ignoreViolations = config.ignoreViolations || [];
console.log('Exempted violation ids:', ignoreViolations);

(async () => {
  const visitedPages = new Set(); // To track visited pages and avoid duplication
  const allResults = []; // Collect all processed results

  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || null; // Use docker puppeteer path if running in container, otherwise, use system degault

  // Launch the browser
  const browser = await puppeteer.launch({
    executablePath: executablePath || undefined, // To work in both docker with local chrome path
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setBypassCSP(true);

  // Navigate to your login page
  await page.goto(HOMEPAGE_URL, { waitUntil: 'networkidle2' }); // Wait until the page is fully loaded

  // Perform accessibility scan on the login page (localhost) before logging in
  console.log('\nAssessing login page:', HOMEPAGE_URL);
  const loginPageResults = await new AxePuppeteer(page).analyze();

  allResults.push({
    url: HOMEPAGE_URL,
    results: loginPageResults,
  });

  // Perform login to move to the next page
  await page.type('#email', 'joe.smith@phac-aspc.gc.ca'); // email field
  await page.click(
    '#react-root > div > div:nth-child(2) > div.chakra-container.css-o2miap > div > form > button', // login button selector
  );

  // Bypass authentication in the dev environment
  const textSelector = await page
    .locator('text/Or click here to complete authentication')
    .waitHandle();

  textSelector.click();

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });

  // Start crawling from the dashboard or starting point
  await crawlPage(
    page,
    browser,
    HOMEPAGE_URL,
    visitedPages,
    allResults,
    blacklistUrls,
  );

  const { urlsWithViolations, urlsWithSeriousImpact, filteredResults } =
    await processAxeReport(allResults);

  console.log('\nResults Summary:');
  console.log('URLs with violations:', urlsWithViolations);
  console.log('URLs with serious impact:', urlsWithSeriousImpact);

  // Close the browser
  await browser.close();
})();
