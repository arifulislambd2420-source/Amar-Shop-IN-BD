"use client";

import { usePathname } from "next/navigation";

// Storefront-only chrome (header, footer, mobile nav, floating buttons). Hidden
// on /admin routes, which have their own layout.
export default function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
