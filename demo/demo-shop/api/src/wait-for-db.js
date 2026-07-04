import { pingDatabase } from './db.js';

const maxAttempts = 30;
const delayMs = 2000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForDatabase() {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await pingDatabase();
      return;
    } catch {
      if (attempt === maxAttempts) {
        throw new Error('Database is not reachable');
      }

      await sleep(delayMs);
    }
  }
}
