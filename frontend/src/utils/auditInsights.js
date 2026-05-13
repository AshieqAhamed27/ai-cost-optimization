const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const isModelLine = (tool) =>
  /model|api|llm|openai|anthropic|claude|gemini|gpt|agent|copilot/i.test(`${tool.category} ${tool.name}`);

const isStorageLine = (tool) =>
  /vector|embedding|storage|log|trace|observability|monitor/i.test(`${tool.category} ${tool.name}`);

const addFinding = (findings, finding) => {
  if (!finding.estimatedSavings || finding.estimatedSavings < 1) return;
  findings.push({
    ...finding,
    estimatedSavings: Math.round(finding.estimatedSavings)
  });
};

export function calculateAuditPreview({ tools = [], form = {} }) {
  const filledTools = tools.filter((tool) => tool.name?.trim());
  const monthlySpend = filledTools.reduce((sum, tool) => sum + Math.max(0, toNumber(tool.monthlyCost)), 0);
  const lowUsageSpend = filledTools
    .filter((tool) => ['low', 'unused'].includes(tool.usage))
    .reduce((sum, tool) => sum + Math.max(0, toNumber(tool.monthlyCost)), 0);
  const modelSpend = filledTools
    .filter(isModelLine)
    .reduce((sum, tool) => sum + Math.max(0, toNumber(tool.monthlyCost)), 0);
  const premiumModelSpend = filledTools
    .filter((tool) => tool.modelTier === 'premium' || (isModelLine(tool) && toNumber(tool.monthlyCost) >= monthlySpend * 0.35))
    .reduce((sum, tool) => sum + Math.max(0, toNumber(tool.monthlyCost)), 0);
  const noCacheSpend = filledTools
    .filter((tool) => tool.caching === 'none' || tool.caching === 'unknown')
    .reduce((sum, tool) => sum + Math.max(0, toNumber(tool.monthlyCost)), 0);
  const storageSpend = filledTools
    .filter(isStorageLine)
    .reduce((sum, tool) => sum + Math.max(0, toNumber(tool.monthlyCost)), 0);
  const highTokenSpend = filledTools
    .filter((tool) => toNumber(tool.avgTokens) >= 4000)
    .reduce((sum, tool) => sum + Math.max(0, toNumber(tool.monthlyCost)), 0);

  const monthlyRequests = toNumber(form.monthlyRequests);
  const teamSize = Math.max(1, toNumber(form.teamSize) || 1);
  const routingEstimate = form.hasModelRouting === 'yes'
    ? premiumModelSpend * 0.06
    : premiumModelSpend * 0.2 + modelSpend * 0.04;
  const cachingEstimate = form.hasCaching === 'yes'
    ? noCacheSpend * 0.04
    : noCacheSpend * 0.15 + (monthlyRequests > 10000 ? modelSpend * 0.05 : 0);
  const attributionEstimate = form.hasCostAttribution === 'yes' ? 0 : monthlySpend * 0.06;
  const limitsEstimate = form.hasUsageLimits === 'yes' ? 0 : monthlySpend * 0.05;
  const retentionEstimate = storageSpend * 0.18;
  const tokenEstimate = highTokenSpend * 0.14;

  const findings = [];

  addFinding(findings, {
    title: 'Low-usage or unused spend',
    category: 'Utilization',
    impact: lowUsageSpend >= monthlySpend * 0.25 ? 'High' : 'Medium',
    estimatedSavings: lowUsageSpend * 0.65
  });

  addFinding(findings, {
    title: 'Premium model overuse risk',
    category: 'Model routing',
    impact: premiumModelSpend >= monthlySpend * 0.35 ? 'High' : 'Medium',
    estimatedSavings: routingEstimate
  });

  addFinding(findings, {
    title: 'Repeated work without caching',
    category: 'Caching',
    impact: noCacheSpend >= monthlySpend * 0.35 ? 'High' : 'Medium',
    estimatedSavings: cachingEstimate
  });

  addFinding(findings, {
    title: 'Long context and token waste',
    category: 'Token usage',
    impact: highTokenSpend >= monthlySpend * 0.25 ? 'High' : 'Medium',
    estimatedSavings: tokenEstimate
  });

  addFinding(findings, {
    title: 'Vector, log, and retention growth',
    category: 'Retention',
    impact: storageSpend >= monthlySpend * 0.25 ? 'High' : 'Medium',
    estimatedSavings: retentionEstimate
  });

  addFinding(findings, {
    title: 'Missing cost attribution',
    category: 'Measurement',
    impact: monthlySpend >= 15000 ? 'High' : 'Medium',
    estimatedSavings: attributionEstimate
  });

  addFinding(findings, {
    title: 'No budget guardrails',
    category: 'Controls',
    impact: monthlySpend >= 15000 ? 'High' : 'Medium',
    estimatedSavings: limitsEstimate
  });

  const possibleSavings = Math.round(Math.min(
    monthlySpend * 0.48,
    lowUsageSpend * 0.65 +
      monthlySpend * 0.14 +
      Math.max(0, teamSize - 1) * 250 +
      routingEstimate +
      cachingEstimate +
      attributionEstimate +
      limitsEstimate +
      retentionEstimate +
      tokenEstimate
  ));

  let score = 0;
  if (monthlySpend >= 50000) score += 2;
  else if (monthlySpend >= 15000) score += 1;
  if (possibleSavings >= monthlySpend * 0.3) score += 2;
  else if (possibleSavings >= monthlySpend * 0.15) score += 1;
  ['hasCaching', 'hasModelRouting', 'hasUsageLimits', 'hasCostAttribution'].forEach((key) => {
    if (form[key] === 'no') score += 1;
    if (form[key] === 'unknown') score += 0.5;
  });

  return {
    monthlySpend,
    savings: possibleSavings,
    possibleSavings,
    afterCleanup: Math.max(0, monthlySpend - possibleSavings),
    yearlySavings: possibleSavings * 12,
    wasteFindings: findings.sort((a, b) => b.estimatedSavings - a.estimatedSavings).slice(0, 5),
    riskLevel: score >= 5 ? 'High' : score >= 2.5 ? 'Medium' : 'Low'
  };
}
