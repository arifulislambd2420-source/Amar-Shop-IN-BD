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
import AdminEditorInjector from "@/components/editor/AdminEditorInjector";
import ChatbotScript from "@/components/ChatbotScript";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
});

export const metadata: Metadata = {
  title: "আমারশপ — খাঁটি ও প্রাকৃতিক পণ্যের অনলাইন দোকান",
  description: "মধু, সরিষার তেল, ঘি, খেজুর — খাঁটি ও প্রাকৃতিক পণ্য অর্ডার করুন Cash on Delivery সুবিধায়।",
};

// gtm_id সেটিং request-time-এ DB থেকে পড়ি, তাই build-এ static prerender করা যাবে না।
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const gtmId = await getActiveGtmId();
  const username = await getSessionUsername();
  const isAdmin = !!username;

  return (
    <html lang="bn" className={`h-full antialiased ${hindSiliguri.variable}`}>
      <body className="min-h-full flex flex-col has-mobile-nav">
        {gtmId && <GtmNoScript gtmId={gtmId} />}
        <AdminEditorInjector>
          <Header isAdmin={isAdmin} />
          <main className="flex-1">{children}</main>
          <Footer />
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
