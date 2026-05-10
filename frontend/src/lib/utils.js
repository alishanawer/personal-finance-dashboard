import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function convertAmount(amount, options = {}) {
  const value = Number(amount ?? 0);
  const baseCurrency = options.baseCurrency?.toUpperCase();
  const targetCurrency = options.targetCurrency?.toUpperCase();

  if (!options.rates || !baseCurrency || !targetCurrency) {
    return value;
  }

  if (baseCurrency === targetCurrency) {
    return value;
  }

  const rate = options.rates[targetCurrency];
  if (typeof rate !== "number") {
    return value;
  }

  return value * rate;
}

export function formatCurrency(amount, currency = "USD", options = {}) {
  const safeCurrency =
    typeof currency === "string" && currency.trim()
      ? currency.trim().toUpperCase()
      : "USD";

  const converted = convertAmount(amount, {
    rates: options.rates,
    baseCurrency: options.baseCurrency,
    targetCurrency: safeCurrency,
  });

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  } catch {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  }
}
