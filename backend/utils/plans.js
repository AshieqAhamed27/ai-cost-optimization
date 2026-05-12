const plans = {
  mini_audit: {
    id: 'mini_audit',
    name: 'Mini Audit',
    amount: 999,
    description: 'A focused AI API and usage review for a small product or workflow.'
  },
  business_audit: {
    id: 'business_audit',
    name: 'Business Audit',
    amount: 4999,
    description: 'A full AI usage and infrastructure cost report for startups with active product traffic.'
  },
  monthly_monitor: {
    id: 'monthly_monitor',
    name: 'Monthly Monitor',
    amount: 9999,
    description: 'Ongoing monthly AI cost monitoring, report updates, and savings follow-up.'
  }
};

const getPlan = (planId) => plans[planId] || null;

module.exports = { plans, getPlan };
