/**
 * NLP.js Classifier Tests
 * Tests for the standalone NLP.js intent classifier module.
 * Covers INTENT-01 through INTENT-06.
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

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
