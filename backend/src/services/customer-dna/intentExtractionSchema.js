import { z } from 'zod';

// Mirrors OBJECTION_KEYWORD_MAP's categories (scoringConfig.js) so LLM output
// can never produce a value the keyword-fallback path wouldn't also produce.
export const intentExtractionSchema = z.object({
  painPoints: z
    .array(z.string())
    .describe(
      'Specific problems, challenges, or frustrations the VISITOR (not the AI) stated. Keep each in the visitor\'s own words/language exactly as said — do not translate or paraphrase into English. Empty array if none were mentioned.'
    ),
  objections: z
    .array(z.enum(['PRICE', 'TRUST', 'TIMING', 'COMPETITOR', 'FEATURE_GAP', 'AUTHORITY', 'OTHER']))
    .describe('Sales objection categories the visitor raised, if any. Empty array if none.'),
});
