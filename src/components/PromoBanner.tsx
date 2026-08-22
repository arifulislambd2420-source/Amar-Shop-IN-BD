import Link from "next/link";
import Image from "next/image";
import type { Banner } from "@/lib/types";

export default function PromoBanner({
  banner,
  fallbackTitle,
  fallbackSubtitle,
  className = "",
}: {
  banner?: Banner;
  fallbackTitle: string;
  fallbackSubtitle: string;
  className?: string;
}) {
  if (!banner) {
    return (
      <Link
        href="/shop"
        className={`block rounded-2xl bg-gradient-to-br from-brand-orange to-brand-orange-dark text-white p-6 flex flex-col justify-center ${className}`}
      >
        <h3 className="text-lg font-bold mb-1">{fallbackTitle}</h3>
        <p className="text-white/80 text-sm">{fallbackSubtitle}</p>
      </Link>
    );
  }

  const content = (
    <div className={`relative rounded-2xl overflow-hidden bg-gray-100 ${className}`}>
      <Image src={banner.image} alt="banner" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
    </div>
  );

  return banner.link ? <Link href={banner.link}>{content}</Link> : content;
}
