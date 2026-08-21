import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "আমারশপ — খাঁটি ও প্রাকৃতিক পণ্যের অনলাইন দোকান",
  description: "মধু, সরিষার তেল, ঘি, খেজুর — খাঁটি ও প্রাকৃতিক পণ্য অর্ডার করুন Cash on Delivery সুবিধায়।",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" className="h-full antialiased">
      <body className="min-h-full flex flex-col has-mobile-nav">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
