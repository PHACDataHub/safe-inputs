// Evaluate accessibility and return URL, incomplete and violation results.
import fs from 'fs';

import AxePuppeteer from '@axe-core/puppeteer';

// Evaluate accessibility for a single url
export async function evaluateAccessibility(url, page) {
  await page.goto(url, { cache: 'no-store' });
  try {
    const results = await new AxePuppeteer(page).analyze();

    // Simplified result (i.e., only incomplete and violations - not including null or pass)
    const simplifiedResult = {
      url: results.url,

      incomplete: (results.incomplete || []).map((item) => ({
        id: item.id,
        description: item.description,
        impact: item.impact,
        helpUrl: item.helpUrl,
        nodes: item.nodes.map((node) => ({
          message:
            node.any.length > 0 ? node.any.map((msg) => msg.message) : null,
          html: node.html,
        })),
      })),

      violations: (results.violations || []).map((item) => ({
        id: item.id,
        description: item.description,
        impact: item.impact,
        helpUrl: item.helpUrl,
        nodes: item.nodes.map((node) => ({
          message:
            node.any.length > 0 ? node.any.map((msg) => msg.message) : null,
          html: node.html,
        })),
      })),
    };

    return simplifiedResult;
  } catch (e) {
    console.log(e);
  }
}
