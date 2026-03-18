/**
 * NLP.js Classifier Tests
 * Tests for the standalone NLP.js intent classifier module.
 * Covers INTENT-01 through INTENT-06.
 *
 * Also covers Plan 02 integration: no-Haiku path, fallback behavior,
 * param extraction, and keywordFallback removal (INTENT-05).
 *
 * Run with: npx tsx --conditions react-server src/lib/ai/__tests__/nlp-classifier.test.ts
 */

import assert from 'node:assert/strict';
import { getNlpClassifier } from '../nlp-classifier';
import trainingData from '../training-data.json';

const REQUIRED_INTENTS = [
  'checklist_add',
  'checklist_add_multi',
  'checklist_complete',
  'checklist_remove',
  'checklist_update',
  'budget_add',
  'budget_add_multi',
  'budget_update',
  'budget_remove',
  'budget_mark_paid',
  'guest_add',
  'guest_add_multi',
  'guest_update',
  'guest_remove',
  'checklist_query',
  'budget_query',
  'guest_query',
  'status_overview',
  'vendor_search',
  'advice_request',
  'small_talk',
];

let passed = 0;
let failed = 0;

async function runTest(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  FAIL: ${name}`);
    console.error(`        ${err.message}`);
    failed++;
  }
}

async function main() {
  console.log('NLP.js Classifier Tests\n');

  // Coverage test first (no network/init needed)
  await runTest('INTENT-CORPUS: all 20 intent names present in training-data.json', async () => {
    const data = (trainingData as any).data as Array<{ intent: string; utterances: string[] }>;
    const intentNames = new Set(data.map((d) => d.intent));
    for (const required of REQUIRED_INTENTS) {
      assert(intentNames.has(required), `Missing intent in training data: ${required}`);
    }
  });

  // Warm up the classifier (init once to test warm path in latency test)
  const classifier = getNlpClassifier();
  console.log('\n  [Warming classifier -- cold start may take ~200-500ms]');
  await classifier.init();
  console.log('  [Warm start ready]\n');

  // INTENT-01: checklist_update
  await runTest('INTENT-01: "pridej datum k fotografovi" -> checklist_update (>= 0.5)', async () => {
    const result = await classifier.classify('pridej datum k fotografovi');
    assert.equal(
      result.intent,
      'checklist_update',
      `Expected checklist_update, got ${result.intent} (confidence: ${result.confidence})`
    );
    assert(
      result.confidence >= 0.5,
      `Confidence too low: ${result.confidence} (expected >= 0.5)`
    );
  });

  // INTENT-02: budget_mark_paid
  await runTest('INTENT-02: "zaplatil jsem kameramana 15000" -> budget_mark_paid (>= 0.5)', async () => {
    const result = await classifier.classify('zaplatil jsem kameramana 15000');
    assert.equal(
      result.intent,
      'budget_mark_paid',
      `Expected budget_mark_paid, got ${result.intent} (confidence: ${result.confidence})`
    );
    assert(
      result.confidence >= 0.5,
      `Confidence too low: ${result.confidence} (expected >= 0.5)`
    );
  });

  // INTENT-03: checklist_query
  await runTest('INTENT-03: "co mam v checklistu?" -> checklist_query (>= 0.5)', async () => {
    const result = await classifier.classify('co mam v checklistu?');
    assert.equal(
      result.intent,
      'checklist_query',
      `Expected checklist_query, got ${result.intent} (confidence: ${result.confidence})`
    );
    assert(
      result.confidence >= 0.5,
      `Confidence too low: ${result.confidence} (expected >= 0.5)`
    );
  });

  // INTENT-04: guest_query
  await runTest('INTENT-04: "kolik hostu potvrdilo?" -> guest_query (>= 0.5)', async () => {
    const result = await classifier.classify('kolik hostu potvrdilo?');
    assert.equal(
      result.intent,
      'guest_query',
      `Expected guest_query, got ${result.intent} (confidence: ${result.confidence})`
    );
    assert(
      result.confidence >= 0.5,
      `Confidence too low: ${result.confidence} (expected >= 0.5)`
    );
  });

  // INTENT-06: Latency < 50ms on warm path
  await runTest('INTENT-06: warm-start classification < 50ms', async () => {
    const start = Date.now();
    await classifier.classify('pridej fotografa do checklistu');
    const elapsed = Date.now() - start;
    assert(
      elapsed < 50,
      `Classification took ${elapsed}ms (expected < 50ms)`
    );
  });

  // --- Plan 02 Integration Tests (INTENT-05) ---
  console.log('\n  [Plan 02 Integration Tests]\n');

  // INTENT-05 (no-Haiku path): classifyIntent uses NLP.js and does NOT call fetch for high-confidence results
  await runTest('INTENT-05: high-confidence NLP.js result does not call fetch', async () => {
    // Spy on global.fetch to verify it is NOT called
    let fetchCalled = false;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (...args: any[]) => {
      fetchCalled = true;
      return originalFetch(...args);
    };

    try {
      const { classifyIntent } = await import('../intent-classifier');
      const result = await classifyIntent('pridej fotografa do checklistu');

      assert(!fetchCalled, 'fetch was called but NLP.js should have handled this with high confidence');
      assert.equal(
        result.intent,
        'checklist_add',
        `Expected checklist_add, got ${result.intent} (confidence: ${result.confidence})`
      );
      assert(result.confidence >= 0.5, `Confidence too low: ${result.confidence}`);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // Haiku fallback path: NLP.js returns intent "None" for unrecognized input,
  // which intent-classifier.ts treats as no-match and routes to Haiku fallback.
  await runTest('INTENT-05: NLP.js returns "None" intent for nonsense input (triggers fallback path)', async () => {
    const result = await classifier.classify('xyz 123 abc qwerty zxcvbn');
    assert(
      result.intent === 'None' || result.intent === 'none' || result.confidence < 0.5,
      `Expected "None" intent or confidence < 0.5 for nonsense message, got intent=${result.intent} confidence=${result.confidence}`
    );
  });

  // Param extraction: budget_mark_paid with amount
  await runTest('INTENT-05: classifyIntent extracts params for "zaplatil jsem fotografa 25000"', async () => {
    const { classifyIntent } = await import('../intent-classifier');
    const result = await classifyIntent('zaplatil jsem fotografa 25000');
    assert.equal(
      result.intent,
      'budget_mark_paid',
      `Expected budget_mark_paid, got ${result.intent} (confidence: ${result.confidence})`
    );
    assert(
      typeof result.params.amount === 'number' && result.params.amount === 25000,
      `Expected params.amount = 25000, got ${result.params.amount}`
    );
    const name = (result.params.name ?? '').toLowerCase();
    assert(
      name.includes('fotograf'),
      `Expected params.name to contain "fotograf", got "${result.params.name}"`
    );
  });

  // keywordFallback is removed: not exported from intent-classifier
  await runTest('INTENT-05: keywordFallback is not exported from intent-classifier', async () => {
    const intentModule = await import('../intent-classifier');
    assert.equal(
      typeof (intentModule as any).keywordFallback,
      'undefined',
      'keywordFallback should not be exported from intent-classifier'
    );
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
