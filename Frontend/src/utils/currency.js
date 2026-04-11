export const CURRENCY_CONFIG = {
  USD: { code: 'USD', locale: 'en-US', rateFromUSD: 1 },
  EUR: { code: 'EUR', locale: 'de-DE', rateFromUSD: 0.92 },
  GBP: { code: 'GBP', locale: 'en-GB', rateFromUSD: 0.79 },
  INR: { code: 'INR', locale: 'en-IN', rateFromUSD: 83.5 },
};

export const convertFromUSD = (amount, currencyCode = 'USD') => {
  const cfg = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.USD;
  return Number(amount || 0) * cfg.rateFromUSD;
};

export const formatCurrencyFromUSD = (amount, currencyCode = 'USD') => {
  const cfg = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.USD;
  return new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency: cfg.code,
    maximumFractionDigits: 2,
  }).format(convertFromUSD(amount, currencyCode));
};
