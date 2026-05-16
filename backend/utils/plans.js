const plans = {
  mini_audit: {
    id: 'mini_audit',
    name: 'Team Pilot',
    amount: 2499,
    description: 'A focused AI cost governance pilot for one product area, workflow, or team.'
  },
  business_audit: {
    id: 'business_audit',
    name: 'Business Command',
    amount: 14999,
    description: 'A full AI usage and infrastructure governance report for companies with active product traffic.'
  },
  monthly_monitor: {
    id: 'monthly_monitor',
    name: 'Global Governance',
    amount: 49999,
    description: 'Ongoing AI spend control, executive reporting, and savings follow-up for larger teams.'
  }
};

const getPlan = (planId) => plans[planId] || null;

module.exports = { plans, getPlan };
