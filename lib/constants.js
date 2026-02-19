export const STATUS_COLORS = {
  Green: { bg: '#dcfce7', text: '#15803d', dot: '#16a34a' },
  Amber: { bg: '#fef3c7', text: '#92400e', dot: '#d97706' },
  Red:   { bg: '#fee2e2', text: '#991b1b', dot: '#dc2626' },
}
export function getRiskLabel(score) {
  if (score <= 5)  return { label: 'Low',      color: '#16a34a', bg: '#dcfce7' }
  if (score <= 11) return { label: 'Medium',   color: '#d97706', bg: '#fef3c7' }
  if (score <= 19) return { label: 'High',     color: '#dc2626', bg: '#fee2e2' }
  return             { label: 'Critical', color: '#7c3aed', bg: '#ede9fe' }
}
export function formatCurrency(v) {
  if (v == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD',
    notation: Math.abs(v) >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: Math.abs(v) >= 1_000_000 ? 1 : 0 }).format(v)
}
export function formatPct(v) {
  if (v == null) return '—'
  return `${v > 0 ? '+' : ''}${Number(v).toFixed(1)}%`
}
