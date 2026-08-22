export function formatTaka(amount: number): string {
  return `৳${amount.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

// Flat delivery charge, added to every order's total in src/lib/orders.ts.
export const SHIPPING_FEE = 70;
