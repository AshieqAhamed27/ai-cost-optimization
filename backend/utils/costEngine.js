const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const calculateAudit = ({ tools = [], teamSize = 1 }) => {
  const cleanTools = tools
    .filter((tool) => tool?.name)
    .map((tool) => ({
      name: String(tool.name).trim(),
      monthlyCost: Math.max(0, toNumber(tool.monthlyCost)),
      seats: Math.max(1, Math.round(toNumber(tool.seats) || 1)),
      usage: ['high', 'medium', 'low', 'unused'].includes(tool.usage) ? tool.usage : 'medium',
      category: tool.category || 'Model API'
    }));

  const monthlySpend = cleanTools.reduce((sum, tool) => sum + tool.monthlyCost, 0);
  const lowUsageSpend = cleanTools
    .filter((tool) => ['low', 'unused'].includes(tool.usage))
    .reduce((sum, tool) => sum + tool.monthlyCost, 0);
  const duplicateEstimate = monthlySpend * 0.1;
  const wrongPlanEstimate = monthlySpend * 0.08;
  const seatWaste = Math.max(0, toNumber(teamSize) - 1) * 350;
  const possibleMonthlySavings = Math.min(monthlySpend * 0.42, lowUsageSpend + duplicateEstimate + wrongPlanEstimate + seatWaste);
  const spendAfterCleanup = Math.max(0, monthlySpend - possibleMonthlySavings);
  const yearlySavings = possibleMonthlySavings * 12;

  const recommendations = [];

  if (lowUsageSpend > 0) {
    recommendations.push({
      title: 'Review low-usage AI cost lines',
      detail: 'Pause, downgrade, cap, or remove cost lines marked as low usage or unused.',
      impact: 'High'
    });
  }

  if (monthlySpend > 10000) {
    recommendations.push({
      title: 'Add model routing and request budgets',
      detail: 'Route simple tasks to cheaper models, set monthly usage budgets, and reserve premium model calls for high-value steps.',
      impact: 'Medium'
    });
  }

  if (toNumber(teamSize) > 3) {
    recommendations.push({
      title: 'Add per-feature cost attribution',
      detail: 'Track spend by customer, workspace, feature, or workflow so expensive usage can be fixed before it hurts margin.',
      impact: 'Medium'
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      title: 'Start monthly AI usage tracking',
      detail: 'Track model API, embeddings, vector database, cloud inference, and observability spend every month.',
      impact: 'Medium'
    });
  }

  return {
    tools: cleanTools,
    monthlySpend,
    possibleMonthlySavings,
    spendAfterCleanup,
    yearlySavings,
    recommendations
  };
};

module.exports = { calculateAudit };
