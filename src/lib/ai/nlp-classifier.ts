/**
 * NLP.js Classifier Module
 * Standalone NLP.js singleton for Czech intent classification.
 * Used as the primary classifier in intent-classifier.ts (Plan 02 integration).
 *
 * Server-only: Node.js APIs used by @nlpjs packages are not Edge/client compatible.
 */
import 'server-only';
import { dockStart } from '@nlpjs/basic';
import { LangCs } from '@nlpjs/lang-cs';
import trainingData from './training-data.json';

export interface NlpResult {
  intent: string;
  confidence: number;
  entities: any[];
}

// Global var survives Next.js dev hot reload; in production module cache is sufficient
declare global {
  // eslint-disable-next-line no-var
  var _nlpClassifier: NlpClassifier | undefined;
}

export class NlpClassifier {
  private nlp: any;
  private ready = false;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    // Prevent concurrent init calls (lazy double-check)
    if (this.ready) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const dock = await dockStart({ use: ['Basic'] });
      this.nlp = dock.get('nlp');
      this.nlp.container.use(LangCs);
      this.nlp.addLanguage('cs');
      // addCorpus accepts a plain object (NLP.js corpus format)
      await this.nlp.addCorpus(trainingData as any);
      await this.nlp.train();
      this.ready = true;
    })();

    return this.initPromise;
  }

  async classify(text: string): Promise<NlpResult> {
    if (!this.ready) await this.init();
    const result = await this.nlp.process('cs', text);
    return {
      intent: result.intent ?? 'None',
      // NOTE: NLP.js v4 exposes result.score, NOT result.confidence (Pitfall 1)
      confidence: result.score ?? 0,
      entities: result.entities ?? [],
    };
  }
}

export function getNlpClassifier(): NlpClassifier {
  if (!global._nlpClassifier) {
    global._nlpClassifier = new NlpClassifier();
  }
  return global._nlpClassifier;
}
