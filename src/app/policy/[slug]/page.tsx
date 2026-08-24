import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const titles: Record<string, string> = {
    about: "আমাদের সম্পর্কে",
    delivery: "ডেলিভারি পলিসি",
    privacy: "প্রাইভেসি পলিসি",
    terms: "ব্যবহারের শর্তাবলী",
    return: "রিটার্ন ও রিফান্ড পলিসি",
    returns: "রিটার্ন ও রিফান্ড পলিসি",
  };
  return {
    title: titles[slug] || "পলিসি ও নিয়মাবলী",
  };
}

export default async function PolicyDynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Seamlessly redirect to the standard canonical pages
  if (slug === "about") redirect("/about");
  if (slug === "delivery") redirect("/delivery");
  if (slug === "privacy") redirect("/privacy");
  if (slug === "terms") redirect("/terms");
  if (slug === "return" || slug === "returns") redirect("/returns");

  // Fallback redirect for other legacy links
  if (slug === "procedure" || slug === "payment") redirect("/delivery");

  notFound();
}
