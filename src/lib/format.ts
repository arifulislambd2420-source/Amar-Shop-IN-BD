export function formatTaka(amount: number): string {
  return `৳${amount.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}
