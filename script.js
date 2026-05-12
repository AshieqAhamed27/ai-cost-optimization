const phoneNumber = '919080963704';

const formatCurrency = (value) =>
  `Rs ${Math.round(Number(value || 0)).toLocaleString('en-IN')}`;

const getCleanPhone = (phone = '') => String(phone).replace(/\D/g, '');

const getWhatsAppUrl = (message) => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${getCleanPhone(phoneNumber)}?text=${encodedMessage}`;
};

const inputs = Array.from(document.querySelectorAll('.spend-input'));
const teamSizeInput = document.getElementById('teamSize');
const businessTypeInput = document.getElementById('businessType');
const monthlySpendEl = document.getElementById('monthlySpend');
const monthlySavingsEl = document.getElementById('monthlySavings');
const afterCleanupEl = document.getElementById('afterCleanup');
const yearlySavingsEl = document.getElementById('yearlySavings');
const whatsAppLinks = [
  document.getElementById('heroWhatsApp'),
  document.getElementById('estimateWhatsApp'),
  document.getElementById('footerWhatsApp')
].filter(Boolean);

function calculate() {
  const totalSpend = inputs.reduce((sum, input) => sum + Number(input.value || 0), 0);
  const teamSize = Number(teamSizeInput.value || 1);
  const duplicateWaste = totalSpend * 0.12;
  const wrongPlanWaste = totalSpend * 0.1;
  const seatWaste = Math.max(0, teamSize - 1) * 350;
  const estimatedSavings = Math.min(totalSpend * 0.38, duplicateWaste + wrongPlanWaste + seatWaste);
  const afterCleanup = Math.max(0, totalSpend - estimatedSavings);
  const yearlySavings = estimatedSavings * 12;

  monthlySpendEl.textContent = formatCurrency(totalSpend);
  monthlySavingsEl.textContent = formatCurrency(estimatedSavings);
  afterCleanupEl.textContent = formatCurrency(afterCleanup);
  yearlySavingsEl.textContent = formatCurrency(yearlySavings);

  const message = [
    'Hi, I am interested in a SpendGuard AI API and infrastructure cost audit.',
    `Business type: ${businessTypeInput.value}`,
    `Team size: ${teamSize}`,
    `Estimated monthly AI and infrastructure spend: ${formatCurrency(totalSpend)}`,
    `Possible monthly savings shown: ${formatCurrency(estimatedSavings)}`,
    'Can you check where we may be wasting money?'
  ].join('\n');

  whatsAppLinks.forEach((link) => {
    link.href = getWhatsAppUrl(message);
  });
}

[...inputs, teamSizeInput, businessTypeInput].forEach((input) => {
  input.addEventListener('input', calculate);
  input.addEventListener('change', calculate);
});

calculate();
