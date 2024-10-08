import fs from 'fs';

// Load ignored URLs and whitelisted violations and incompletes from the config
const configPath = './whitelist-config.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// console.log('config.ignoreViolations', config.ignoreViolations);

export async function processAxeReport(allResults) {
  const urlsWithViolations = [];
  const urlsWithSeriousImpact = [];
  const filteredResults = [];

  console.log('\nProcessing results.');

  for (const { url, results } of allResults) {
    // console.log(`Processing results for ${url}`);

    // Filter out ignored violations and incomplete issues from the result
    const filteredViolations = results.violations.filter(
      (violation) => !config.ignoreViolations.includes(violation.id),
    );

    const filteredIncomplete = results.incomplete.filter(
      (incomplete) => !config.ignoreIncomplete.includes(incomplete.id),
    );

    // Extract violation IDs for each URL
    const violationIds = filteredViolations.map((violation) => violation.id); //  This is temp to compare with other methods

    // Store the filtered results for the current URL
    filteredResults.push({
      url,
      violations: filteredViolations,
      violationIds, //  This is temp to compare with other methods
      incomplete: filteredIncomplete,
    });

    // Check if there are any violations left after filtering
    if (filteredViolations.length > 0) {
      urlsWithViolations.push(url, violationIds);
    }

    // Extract serious violations and their IDs
    const seriousViolationIds = filteredViolations
      .filter((violation) => violation.impact === 'serious')
      .map((violation) => violation.id);

    if (seriousViolationIds.length > 0) {
      // Include the serious impact violation IDs with each URL
      urlsWithSeriousImpact.push(url, seriousViolationIds);
    }
  }

  // REPORT
  // Generate a timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Replaces colons and periods with dashes to make it file-safe

  // Prepare the result object
  const result = {
    exemptedViolationIds: config.ignoreViolations || [],
    exemptedIncompleteIds: config.ignoreIncomplete || [],
    exemptedUrls: config.blacklistUrls || [],
    urlsWithViolations,
    urlsWithSeriousImpact,
    fullResults: filteredResults,
  };

  // Save the results to a file named axe_results_{timestamp}.json
  const resultsDir = './axe-results';
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }
  const filename = `./axe-results/ci_axe_results_${timestamp}.json`;
  fs.writeFileSync(filename, JSON.stringify(result, null, 2), 'utf8');

  console.log(`Results saved to ${filename}`);

  return { urlsWithViolations, urlsWithSeriousImpact, filteredResults };
}
