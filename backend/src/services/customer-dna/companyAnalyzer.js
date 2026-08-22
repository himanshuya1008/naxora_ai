import { BUDGET_LEVEL_THRESHOLDS_USD } from './scoringConfig.js';
import { extractCurrencyAmount } from './utils.js';

function bucketBudgetAmount(amountUsd) {
  if (amountUsd == null) return null;
  if (amountUsd < BUDGET_LEVEL_THRESHOLDS_USD.LOW) return 'LOW';
  if (amountUsd < BUDGET_LEVEL_THRESHOLDS_USD.MEDIUM) return 'MEDIUM';
  if (amountUsd < BUDGET_LEVEL_THRESHOLDS_USD.HIGH) return 'HIGH';
  return 'ENTERPRISE';
}

/**
 * Resolves the customer's company profile (size, industry, budget level)
 * from whatever sources already carry it, in order of reliability:
 * explicitly-captured Lead fields (structured extraction from the live
 * conversation) first, then the Visitor record (set at identification time
 * or a prior conversation), then conversation-text signals as a last resort.
 * Never re-guesses a field that's already been reliably captured — this is
 * a resolution/aggregation layer, not a second extraction pass.
 */
export function analyzeCompany({ lead, visitor, conversationSignals }) {
  const companySize = lead?.companySize ?? visitor?.companySize ?? null;
  const industry = lead?.industry ?? visitor?.industry ?? null;

  const leadBudgetAmount = lead?.budget ? extractCurrencyAmount(lead.budget) : null;
  const budgetAmountUsd = leadBudgetAmount ?? conversationSignals?.budgetAmountUsd ?? null;
  const budgetLevel = bucketBudgetAmount(budgetAmountUsd);

  return {
    companySize,
    industry,
    budgetLevel,
    budgetAmountUsd,
    company: lead?.company ?? visitor?.company ?? null,
  };
}
