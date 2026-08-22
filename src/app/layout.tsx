import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import FloatingButtons from "@/components/FloatingButtons";
import CartDrawer from "@/components/CartDrawer";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
});

export const metadata: Metadata = {
  title: "আমারশপ — খাঁটি ও প্রাকৃতিক পণ্যের অনলাইন দোকান",
  description: "মধু, সরিষার তেল, ঘি, খেজুর — খাঁটি ও প্রাকৃতিক পণ্য অর্ডার করুন Cash on Delivery সুবিধায়।",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" className={`h-full antialiased ${hindSiliguri.variable}`}>
      <body className="min-h-full flex flex-col has-mobile-nav">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileNav />
        <FloatingButtons />
        <CartDrawer />
      </body>
    </html>
  );
}
