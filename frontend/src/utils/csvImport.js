const normalizeHeader = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

const getFirst = (row, keys) => {
  for (const key of keys) {
    if (row[key] !== undefined && String(row[key]).trim() !== '') return row[key];
  }
  return '';
};

const parseNumber = (value) => {
  const cleaned = String(value || '').replace(/[^0-9.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : '';
};

const normalizeValue = (value, allowed, fallback) => {
  const clean = String(value || '').trim().toLowerCase();
  return allowed.includes(clean) ? clean : fallback;
};

export function parseCsv(text) {
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

  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);

  return rows.slice(1).map((row) => headers.reduce((record, header, index) => {
    record[header] = row[index] || '';
    return record;
  }, {}));
}

export function csvRowsToTools(rows) {
  return rows
    .map((row) => {
      const provider = getFirst(row, ['provider', 'vendor', 'platform']);
      const modelName = getFirst(row, ['model', 'modelname', 'service', 'servicename']);
      const name = getFirst(row, ['costline', 'name', 'tool', 'service', 'servicename', 'model', 'modelname']);

      return {
        name: name || [provider, modelName].filter(Boolean).join(' '),
        provider,
        modelName,
        workflow: getFirst(row, ['workflow', 'feature', 'usecase', 'task']),
        customer: getFirst(row, ['customer', 'client', 'tenant', 'account']),
        monthlyCost: parseNumber(getFirst(row, ['monthlycost', 'cost', 'amount', 'spend', 'monthlyspend'])),
        seats: parseNumber(getFirst(row, ['seats', 'units', 'users'])) || 1,
        usage: normalizeValue(getFirst(row, ['usage', 'usagelevel']), ['high', 'medium', 'low', 'unused'], 'medium'),
        category: getFirst(row, ['category', 'type']) || 'Model API',
        monthlyRequests: parseNumber(getFirst(row, ['monthlyrequests', 'requests', 'calls', 'apicalls'])),
        avgTokens: parseNumber(getFirst(row, ['avgtokens', 'averagetokens', 'tokens'])),
        modelTier: normalizeValue(getFirst(row, ['modeltier', 'tier']), ['premium', 'balanced', 'economy', 'mixed', 'unknown'], 'unknown'),
        caching: normalizeValue(getFirst(row, ['caching', 'cache']), ['none', 'partial', 'good', 'unknown'], 'unknown'),
        owner: getFirst(row, ['owner', 'team']),
        department: getFirst(row, ['department', 'dept', 'businessunit', 'businessunitname']),
        region: getFirst(row, ['region', 'geo', 'country', 'market']),
        costCenter: getFirst(row, ['costcenter', 'costcentre', 'budgetcode']),
        budgetLimit: parseNumber(getFirst(row, ['budget', 'budgetlimit', 'monthlybudget']))
      };
    })
    .filter((tool) => tool.name && Number(tool.monthlyCost || 0) >= 0);
}
