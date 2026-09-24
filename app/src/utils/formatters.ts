/**
 * تنسيق الأرقام والعملات والنسب المئوية
 */

export function formatSAR(amount: number, currencyCode = 'ر.س'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `0.00 ${currencyCode}`;
  }
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currencyCode}`;
}

export function formatPercent(ratio: number): string {
  if (isNaN(ratio) || ratio === null || ratio === undefined) return '0.0%';
  const p = ratio * 100;
  return `${p.toFixed(1)}%`;
}

export function formatNumber(num: number): string {
  if (isNaN(num) || num === null || num === undefined) return '0';
  return num.toLocaleString('en-US');
}

export function formatDateAr(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
