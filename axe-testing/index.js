import fs from 'fs';
import { AxePuppeteer } from '@axe-core/puppeteer';
import puppeteer from 'puppeteer';
import { processAxeReport } from './src/process-axe-report.js';
// import 'dotenv/config.js';
import dotenv from 'dotenv';
// import { config } from 'dotenv-safe';
// config();

dotenv.config();
// dotenv.config({ example: './.env.example' });
const { HOMEPAGE_URL } = process.env;

const config = JSON.parse(fs.readFileSync('./whitelist-config.json', 'utf8'));
const blacklistUrls = config.blacklistUrls || [];
console.log('Blacklist URLs:', blacklistUrls);

// Function to crawl and collect URLs for accessibility checks
async function crawlPage(
  page,
  browser,
  visitedPages,
  urls,
  allResults,
  blacklistUrls,
) {
  const currentUrl = page.url();
  let uniqueUrl = currentUrl;

  console.log('Blacklist URLs:', blacklistUrls);
  console.log('Current URL:', currentUrl);

  // Skip if the URL is blacklisted
  // if (blacklistUrls.includes(currentUrl)) {
  if (Array.isArray(blacklistUrls) && blacklistUrls.includes(currentUrl)) {
    console.log(`Skipping blacklisted URL: ${currentUrl}`);
    return;
  }

  if (visitedPages.has(currentUrl)) {
    console.log(`Skipping already visited page: ${currentUrl}`);
    return;
  }

  console.log(`Crawling page: ${currentUrl}`);
  visitedPages.add(currentUrl); // Mark this page as visited

  if (currentUrl === HOMEPAGE_URL) {
    uniqueUrl += '-post-login';
  }

  urls.push(uniqueUrl); // For reporting later

  // Run Axe accessibility checks on the current page
  const results = await new AxePuppeteer(page).analyze();

  // Add the results to allResults
  allResults.push({
    url: uniqueUrl,
    results,
  });

  // Get all links on the current page
  const links = await page.$$eval('a', (anchors) =>
    anchors.map((anchor) => anchor.href),
  );

  // Crawl through each link found on the current page
  for (const link of links) {
    // Avoid revisiting the same pages or external URLs
    if (!visitedPages.has(link) && link.startsWith(HOMEPAGE_URL)) {
      const newPage = await browser.newPage();
      await newPage.goto(link, { waitUntil: 'networkidle2' });
      await crawlPage(
        newPage,
        browser,
        visitedPages,
        urls,
        allResults,
        blacklistUrls,
      ); // Recursively crawl new pages
      await newPage.close(); // Close new page after crawling
    }
  }
}

(async () => {
  const visitedPages = new Set(); // To track visited pages and avoid duplication
  const urls = []; // collect urls for each Axe scan
  const allResults = []; // Collect all processed results

  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || null; // Use docker puppeteer path if using docker, otherwise, use system degault

  // Launch the browser
  const browser = await puppeteer.launch({
    // executablePath: '/usr/bin/chromium-browser',
    executablePath: executablePath || undefined,
    // headless: false,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setBypassCSP(true); // Bypass content security policies (CSP)

  // Navigate to your login page
  await page.goto(HOMEPAGE_URL, { waitUntil: 'networkidle2' }); // Wait until the page is fully loaded

  // Perform accessibility scan on the login page before logging in
  console.log('Running accessibility scan on the login page...');
  const loginPageResults = await new AxePuppeteer(page).analyze();
  console.log('login page assessed');

  // Push login page axe result
  urls.push(HOMEPAGE_URL); // Add login page URL to the list of URLs for accessibility checks

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
  await crawlPage(page, browser, visitedPages, urls, allResults, blacklistUrls);

  const { urlsWithViolations, urlsWithSeriousImpact, filteredResults } =
    await processAxeReport(allResults);

  console.log('Filtered Results for Each URL:');
  filteredResults.forEach((result) => {
    console.log(`\nFor: ${result.url}`);
    console.log(`Violation IDs:, ${result.violationIds}`); // This is temp to compare with other methods
    // console.log(`Violations:`, JSON.stringify(result.violations, null, 2)); // full results (output to file instead as it can be lengthy)
    // console.log(`Incomplete:`, JSON.stringify(result.incomplete, null, 2)); // full results (output to file instead as it can be lengthy)
  });

  console.log('\nSummary:');
  console.log('URLs with violations:', urlsWithViolations);
  console.log('URLs with serious impact:', urlsWithSeriousImpact);

  // Close the browser
  await browser.close();
})();
