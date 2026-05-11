const plans = {
  mini_audit: {
    id: 'mini_audit',
    name: 'Mini Audit',
    amount: 999,
    description: 'For freelancers and solo founders who want a simple AI tool spend check.'
  },
  business_audit: {
    id: 'business_audit',
    name: 'Business Audit',
    amount: 4999,
    description: 'For agencies and small teams that need a full AI cost saving report.'
  },
  monthly_monitor: {
    id: 'monthly_monitor',
    name: 'Monthly Monitor',
    amount: 9999,
    description: 'Monthly AI cost review and savings tracker for active teams.'
  }
};

const getPlan = (planId) => plans[planId] || null;

module.exports = { plans, getPlan };

