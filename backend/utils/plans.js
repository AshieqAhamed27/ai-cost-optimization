const plans = {
  mini_audit: {
    id: 'mini_audit',
    name: 'Mini Audit',
    amount: 999,
    description: 'A focused software spend review for a small team or single workspace.'
  },
  business_audit: {
    id: 'business_audit',
    name: 'Business Audit',
    amount: 4999,
    description: 'A full business cost report for teams using multiple software products.'
  },
  monthly_monitor: {
    id: 'monthly_monitor',
    name: 'Monthly Monitor',
    amount: 9999,
    description: 'Ongoing monthly software spend tracking, report updates, and savings follow-up.'
  }
};

const getPlan = (planId) => plans[planId] || null;

module.exports = { plans, getPlan };
