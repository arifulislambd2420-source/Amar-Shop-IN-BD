import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import FloatingButtons from "@/components/FloatingButtons";
import CartDrawer from "@/components/CartDrawer";
import { GtmScript, GtmNoScript } from "@/components/GtmScript";
import { getActiveGtmId } from "@/lib/gtm";
import { getSessionUsername } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import AdminEditorInjector from "@/components/editor/AdminEditorInjector";
import ChatbotScript from "@/components/ChatbotScript";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
});

export async function generateMetadata(): Promise<Metadata> {
  const favicon = (await getSetting("site_favicon"))?.trim();
  const logo = (await getSetting("site_logo"))?.trim();
  const iconUrl = favicon || logo;
  return {
    title: {
      default: "আমারশপ — খাঁটি ও প্রাকৃতিক পণ্যের অনলাইন দোকান",
      template: "%s | আমারশপ",
    },
    description: "মধু, সরিষার তেল, ঘি, খেজুর — খাঁটি ও প্রাকৃতিক পণ্য অর্ডার করুন Cash on Delivery সুবিধায়।",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://online.amarshopinbd.com"),
    // Uploaded favicon (or logo) becomes the tab icon; otherwise the default favicon.ico applies.
    ...(iconUrl ? { icons: { icon: iconUrl } } : {}),
    openGraph: {
      title: "আমারশপ — খাঁটি ও প্রাকৃতিক পণ্যের অনলাইন দোকান",
      description: "মধু, সরিষার তেল, ঘি, খেজুর — খাঁটি ও প্রাকৃতিক পণ্য অর্ডার করুন Cash on Delivery সুবিধায়।",
      siteName: "আমারশপ",
      locale: "bn_BD",
      type: "website",
    },
  };
}

// gtm_id সেটিং request-time-এ DB থেকে পড়ি, তাই build-এ static prerender করা যাবে না।
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const gtmId = await getActiveGtmId();
  const username = await getSessionUsername();
  const isAdmin = !!username;
  const logo = (await getSetting("site_logo"))?.trim() || null;

  return (
    <html lang="bn" className={`h-full antialiased ${hindSiliguri.variable}`}>
      <body className="min-h-full flex flex-col has-mobile-nav">
        {gtmId && <GtmNoScript gtmId={gtmId} />}
        <AdminEditorInjector>
          <Header isAdmin={isAdmin} logo={logo} />
          <main className="flex-1">{children}</main>
          <Footer logo={logo} />
          <MobileNav />
          <FloatingButtons />
          <CartDrawer />
        </AdminEditorInjector>
        {gtmId && <GtmScript gtmId={gtmId} />}
        <ChatbotScript />
      </body>
    </html>
  );
}
