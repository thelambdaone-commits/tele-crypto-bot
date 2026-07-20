export function formatAmount(amount) {
  return Number(amount).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

const SUPERSCRIPT = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

function toSuperscript(n) {
  return String(n).split('').map(c => SUPERSCRIPT[parseInt(c, 10)]).join('');
}

export function formatPriceEUR(amount) {
  const num = Number(amount);
  if (Math.abs(num) < 0.001 && num !== 0) {
    const exp = Math.floor(Math.log10(Math.abs(num)));
    const mantissa = num / Math.pow(10, exp);
    const formatted = mantissa.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${formatted}×10⁻${toSuperscript(Math.abs(exp))}`;
  }
  return num.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

export function formatAmountShort(amount) {
  const num = Number(amount);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatSOL(amount) {
  return Number(amount).toFixed(6);
}
