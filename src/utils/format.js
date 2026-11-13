export function formatAmount(value) {
  return Number(value).toLocaleString('es', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
