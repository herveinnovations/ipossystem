// Everything a visitor or shop owner sees about prices, contacts and payment lives here.
// Values can also be set as Vercel environment variables (VITE_…), so they can change
// without editing code. Anything left empty is simply hidden on the site.
const env = (k, fallback = '') => (import.meta.env?.[k] ?? fallback).toString().trim();
const num = (k, fallback) => { const v = Number(env(k, '')); return Number.isFinite(v) && v > 0 ? v : fallback; };

const SAMPLE_PAY = {
  mtn: { number: '096 000 0000', name: 'Your business name' },
  airtel: { number: '097 000 0000', name: 'Your business name' },
  bank: { bank: 'Your bank', account: '0000000000000', name: 'Your business name', branch: 'Your branch' },
};
function payDetails() {
  const real = {
    mtn: { number: env('VITE_PAY_MTN_NUMBER'), name: env('VITE_PAY_MTN_NAME') },
    airtel: { number: env('VITE_PAY_AIRTEL_NUMBER'), name: env('VITE_PAY_AIRTEL_NAME') },
    bank: { bank: env('VITE_PAY_BANK'), account: env('VITE_PAY_BANK_ACCOUNT'), name: env('VITE_PAY_BANK_NAME'), branch: env('VITE_PAY_BANK_BRANCH') },
  };
  const anyReal = real.mtn.number || real.airtel.number || real.bank.account;
  return anyReal ? { ...real, sample: false } : { ...SAMPLE_PAY, sample: true };
}

export const SITE = {
  // Business details used on the Terms and Privacy pages.
  legalName: env('VITE_LEGAL_NAME'),            // e.g. "Herve Innovations Limited"
  address: env('VITE_BUSINESS_ADDRESS'),        // e.g. "Plot 123, Cairo Road, Lusaka"
  supportEmail: env('VITE_SUPPORT_EMAIL'),      // e.g. "support@ipos.co.zm"
  whatsapp: env('VITE_WHATSAPP_NUMBER').replace(/\D/g, ''), // international format, e.g. 260971234567

  // Prices (Kwacha).
  price: {
    monthly: num('VITE_PRICE_MONTHLY', 250),       // per shop, includes the main branch
    extraBranch: num('VITE_PRICE_EXTRA_BRANCH', 100), // per extra branch, per month
    yearlyMonths: num('VITE_PRICE_YEARLY_MONTHS', 10), // a year costs this many months (2 free)
    trialDays: 14,
    graceDays: 3,
  },

  // Where shops send payment. Empty = "message us on WhatsApp for payment details".
  // Until the real details are set (Vercel environment variables), clearly-marked
  // SAMPLE details are shown so the screen can be reviewed. Replace before launch.
  pay: payDetails(),

  termsVersion: '2026-11-01',
};

export const whatsappLink = (text = 'Hello, I would like to know more about iPOS.') =>
  SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}` : '';

export const kwacha = n => 'K' + Number(n || 0).toLocaleString('en-ZM', { maximumFractionDigits: 0 });
