const plans = {
  mini_audit: {
    id: 'mini_audit',
    name: 'Mini Audit',
    amount: 999,
    description: 'One focused review for a small workspace.'
  },
  business_audit: {
    id: 'business_audit',
    name: 'Business Audit',
    amount: 4999,
    description: 'A full cost report for teams with multiple AI tools.'
  },
  monthly_monitor: {
    id: 'monthly_monitor',
    name: 'Monthly Monitor',
    amount: 9999,
    description: 'Ongoing spend tracking and savings follow-up.'
  }
};

const getPlan = (planId) => plans[planId] || null;

module.exports = { plans, getPlan };
