const normalizeHeader = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

const cleanText = (value, maxLength = 160) =>
  String(value || '').trim().slice(0, maxLength);

const parseNumber = (value) => {
  const cleaned = String(value || '').replace(/[^0-9.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getFirst = (row, keys) => {
  for (const key of keys) {
    if (row[key] !== undefined && String(row[key]).trim() !== '') return row[key];
  }
  return '';
};

const normalizeChoice = (value, allowed, fallback) => {
  const clean = String(value || '').trim().toLowerCase();
  return allowed.includes(clean) ? clean : fallback;
};

const providerAliases = {
  openai: ['openai', 'gpt', 'chatgpt'],
  anthropic: ['anthropic', 'claude'],
  aws: ['aws', 'bedrock', 'sagemaker', 'amazon'],
  azure: ['azure', 'microsoft'],
  gcp: ['gcp', 'google', 'vertex', 'gemini'],
  invoice: ['invoice', 'bill'],
  csv: ['csv', 'generic']
};

const normalizeProvider = (value = '') => {
  const clean = String(value || '').trim().toLowerCase();
  const match = Object.entries(providerAliases).find(([, aliases]) =>
    aliases.some((alias) => clean.includes(alias))
  );
  return match?.[0] || 'csv';
};

const parseCsv = (text = '') => {
  const rows = [];
  let current = [];
  let value = '';
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && insideQuotes && next === '"') {
      value += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === ',' && !insideQuotes) {
      current.push(value.trim());
      value = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && next === '\n') index += 1;
      current.push(value.trim());
      if (current.some((cell) => cell !== '')) rows.push(current);
      current = [];
      value = '';
      continue;
    }

    value += char;
  }

  current.push(value.trim());
  if (current.some((cell) => cell !== '')) rows.push(current);

  if (rows.length < 2) return { headers: [], rows: [] };

  const headers = rows[0].map(normalizeHeader);
  return {
    headers,
    rows: rows.slice(1).map((row) => headers.reduce((record, header, index) => {
      record[header] = row[index] || '';
      return record;
    }, {}))
  };
};

const providerColumns = {
  provider: ['provider', 'vendor', 'platform', 'publishername', 'billingaccountname', 'serviceprovider'],
  service: [
    'costline', 'name', 'tool', 'service', 'servicename', 'servicedescription', 'productname',
    'productproductname', 'lineitemproductcode', 'metercategory', 'metername', 'skudescription',
    'model', 'modelname', 'modelid', 'operation', 'usagetype', 'lineitemusagetype'
  ],
  workflow: ['workflow', 'feature', 'usecase', 'task', 'project', 'projectname', 'resourcegroup', 'resourcegroupname', 'application'],
  customer: ['customer', 'client', 'tenant', 'account', 'workspace', 'workspacename', 'subscriptionname', 'projectid'],
  amount: [
    'monthlycost', 'cost', 'amount', 'spend', 'monthlyspend', 'costusd', 'totalcost',
    'pretaxcost', 'pretaxcostinbillingcurrency', 'costinbillingcurrency', 'lineitemunblendedcost',
    'unblendedcost', 'amortizedcost', 'netamortizedcost'
  ],
  requests: ['monthlyrequests', 'requests', 'requestcount', 'numrequests', 'nummodelrequests', 'calls', 'apicalls', 'usagequantity', 'lineitemusageamount'],
  tokens: ['tokens', 'totaltokens', 'inputtokens', 'outputtokens', 'prompttokens', 'completiontokens', 'cachecreationinputtokens', 'cachereadinputtokens'],
  owner: ['owner', 'team', 'createdby', 'resourceowner', 'tagowner', 'resourcetagsuserowner'],
  department: ['department', 'dept', 'businessunit', 'businessunitname', 'tagdepartment', 'resourcetagsuserdepartment'],
  region: ['region', 'geo', 'country', 'market', 'location', 'resourcelocation', 'availabilityzone'],
  costCenter: ['costcenter', 'costcentre', 'budgetcode', 'tagcostcenter', 'resourcetagsusercostcenter'],
  budget: ['budget', 'budgetlimit', 'monthlybudget']
};

const detectProvider = (headers, explicitProvider) => {
  const explicit = normalizeProvider(explicitProvider);
  if (explicit && explicit !== 'csv') return explicit;

  const joined = headers.join(' ');
  if (/lineitem|unblended|productproductname|usagetype/.test(joined)) return 'aws';
  if (/metercategory|pretaxcost|subscriptionname|resourcegroup/.test(joined)) return 'azure';
  if (/skudescription|servicedescription|projectid|costusd/.test(joined)) return 'gcp';
  if (/claude|anthropic|inputtokens|outputtokens/.test(joined)) return 'anthropic';
  if (/model|prompttokens|completiontokens|nummodelrequests/.test(joined)) return 'openai';
  return explicit || 'csv';
};

const rowToTool = (row, provider) => {
  const rowProvider = cleanText(getFirst(row, providerColumns.provider)) || provider.toUpperCase();
  const service = cleanText(getFirst(row, providerColumns.service)) || `${rowProvider} spend`;
  const amount = parseNumber(getFirst(row, providerColumns.amount));
  const requests = parseNumber(getFirst(row, providerColumns.requests));
  const totalTokens = providerColumns.tokens.reduce((sum, key) => sum + parseNumber(row[key]), 0);
  const avgTokens = requests ? Math.round(totalTokens / requests) : totalTokens;

  return {
    name: service,
    provider: rowProvider,
    modelName: cleanText(getFirst(row, ['model', 'modelname', 'modelid', 'skudescription', 'metername'])),
    workflow: cleanText(getFirst(row, providerColumns.workflow)),
    customer: cleanText(getFirst(row, providerColumns.customer)),
    monthlyCost: amount,
    seats: 1,
    usage: normalizeChoice(getFirst(row, ['usage', 'usagelevel']), ['high', 'medium', 'low', 'unused'], amount > 0 ? 'high' : 'medium'),
    category: provider === 'aws' || provider === 'azure' || provider === 'gcp' ? 'Cloud AI / Infrastructure' : 'Model API',
    monthlyRequests: requests,
    avgTokens,
    modelTier: /gpt-4|opus|premium|pro|ultra/i.test(service) ? 'premium' : 'unknown',
    caching: normalizeChoice(getFirst(row, ['caching', 'cache']), ['none', 'partial', 'good', 'unknown'], 'unknown'),
    owner: cleanText(getFirst(row, providerColumns.owner)),
    department: cleanText(getFirst(row, providerColumns.department)),
    region: cleanText(getFirst(row, providerColumns.region)),
    costCenter: cleanText(getFirst(row, providerColumns.costCenter)),
    budgetLimit: parseNumber(getFirst(row, providerColumns.budget))
  };
};

const aggregateTools = (tools) => {
  const groups = new Map();

  tools.forEach((tool) => {
    if (!tool.name || tool.monthlyCost < 0) return;
    const key = [
      tool.provider,
      tool.name,
      tool.workflow,
      tool.customer,
      tool.owner,
      tool.department,
      tool.region,
      tool.costCenter
    ].join('|');
    const existing = groups.get(key);

    if (!existing) {
      groups.set(key, { ...tool });
      return;
    }

    existing.monthlyCost += tool.monthlyCost;
    existing.monthlyRequests += tool.monthlyRequests;
    existing.avgTokens = Math.max(existing.avgTokens || 0, tool.avgTokens || 0);
    existing.budgetLimit = Math.max(existing.budgetLimit || 0, tool.budgetLimit || 0);
  });

  return [...groups.values()]
    .map((tool) => ({
      ...tool,
      monthlyCost: Math.round(tool.monthlyCost * 100) / 100
    }))
    .sort((a, b) => b.monthlyCost - a.monthlyCost);
};

const parseUsageImport = ({ csvText = '', provider = '' } = {}) => {
  const parsed = parseCsv(csvText);
  const detectedProvider = detectProvider(parsed.headers, provider);
  const rowTools = parsed.rows.map((row) => rowToTool(row, detectedProvider));
  const tools = aggregateTools(rowTools).filter((tool) => tool.name && tool.monthlyCost >= 0);
  const totalSpend = rowTools.reduce((sum, tool) => sum + (tool.monthlyCost || 0), 0);
  const totalRequests = rowTools.reduce((sum, tool) => sum + (tool.monthlyRequests || 0), 0);
  const warnings = [];

  if (!parsed.rows.length) warnings.push('No data rows found.');
  if (!totalSpend) warnings.push('No spend column was detected.');
  if (!totalRequests) warnings.push('No request or usage quantity column was detected.');

  return {
    provider: detectedProvider,
    columns: parsed.headers,
    rowCount: parsed.rows.length,
    totalSpend: Math.round(totalSpend * 100) / 100,
    totalRequests: Math.round(totalRequests),
    tools,
    warnings
  };
};

module.exports = {
  parseCsv,
  parseUsageImport,
  normalizeProvider
};
