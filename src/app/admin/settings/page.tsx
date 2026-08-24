import Link from "next/link";
import {
  Tag,
  Share2,
  Mail,
  MessageSquare,
  DollarSign,
  Truck,
  PackageCheck,
  ShieldAlert,
  Ban,
  Copy,
  BarChart3,
  Boxes,
  FilePlus,
  Sliders,
  Settings,
  HelpCircle,
  Key,
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminSettingsHubPage() {
  const moduleCards = [
    {
      title: "Tag Manager",
      description: "Add & update your GTM id (Google Tag Manager container ID)",
      actionText: "Update →",
      href: "/admin/gtm",
      icon: Tag,
      iconColor: "text-indigo-600 bg-indigo-50 border border-indigo-100",
    },
    {
      title: "Pixel Manage",
      description: "Add & update your Meta / Facebook Pixel id and tracking events",
      actionText: "Update →",
      href: "/admin/gtm",
      icon: Share2,
      iconColor: "text-blue-600 bg-blue-50 border border-blue-100",
    },
    {
      title: "Mail SMTP",
      description: "Manage your email notifications and outgoing SMTP server configuration",
      actionText: "Update →",
      href: "/admin/settings/smtp",
      icon: Mail,
      iconColor: "text-emerald-600 bg-emerald-50 border border-emerald-100",
    },
    {
      title: "SMS Gateway",
      description: "Add & update your SMS gateway for OTP and order alerts (MimSMS, Greenweb, etc.)",
      actionText: "Update →",
      href: "/admin/settings/courier",
      icon: MessageSquare,
      iconColor: "text-purple-600 bg-purple-50 border border-purple-100",
    },
    {
      title: "Payment Gateway",
      description: "Configure your payment gateway (bKash, Nagad, SSLCommerz, COD)",
      actionText: "Manage →",
      href: "/admin/orders",
      icon: DollarSign,
      iconColor: "text-teal-600 bg-teal-50 border border-teal-100",
    },
    {
      title: "Courier API",
      description: "Integrate shipping services with Steadfast, Pathao, and RedX API",
      actionText: "Manage →",
      href: "/admin/settings/courier",
      icon: Truck,
      iconColor: "text-amber-600 bg-amber-50 border border-amber-100",
    },
    {
      title: "Shipping Charge",
      description: "Add & update your inside/outside city shipping charges and delivery fees",
      actionText: "Create →",
      href: "/admin/settings/courier",
      icon: PackageCheck,
      iconColor: "text-cyan-600 bg-cyan-50 border border-cyan-100",
    },
    {
      title: "Fraud API",
      description: "Integrate fraud check API services to detect high-risk and return-prone numbers",
      actionText: "Update →",
      href: "/admin/settings/fraud-api",
      icon: ShieldAlert,
      iconColor: "text-rose-600 bg-rose-50 border border-rose-100",
    },
    {
      title: "IP Block",
      description: "Manage blocked IP addresses and secure your store from malicious traffic",
      actionText: "Security →",
      href: "/admin/ip-block",
      icon: Ban,
      iconColor: "text-red-600 bg-red-50 border border-red-100",
    },
    {
      title: "Duplicate Order",
      description: "Update your duplicate order prevention and customer spam protection settings",
      actionText: "Update →",
      href: "/admin/orders",
      icon: Copy,
      iconColor: "text-violet-600 bg-violet-50 border border-violet-100",
    },
    {
      title: "Order Reports",
      description: "Check your product order report, sales breakdown, and export CSV data",
      actionText: "Check →",
      href: "/admin/reports",
      icon: BarChart3,
      iconColor: "text-blue-600 bg-blue-50 border border-blue-100",
    },
    {
      title: "Stock Report",
      description: "Check your product stock report, low stock alerts, and inventory value",
      actionText: "Check →",
      href: "/admin/products",
      icon: Boxes,
      iconColor: "text-emerald-600 bg-emerald-50 border border-emerald-100",
    },
    {
      title: "Social Message Manage",
      description: "Manage WhatsApp, Messenger, and live social media messaging channels",
      actionText: "Manage →",
      href: "/admin/banners",
      icon: MessageSquare,
      iconColor: "text-purple-600 bg-purple-50 border border-purple-100",
    },
    {
      title: "Create Page",
      description: "Add & update your landing page, promo banners, and marketing blocks",
      actionText: "Add →",
      href: "/admin/banners",
      icon: FilePlus,
      iconColor: "text-indigo-600 bg-indigo-50 border border-indigo-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">General Setting Pro</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Centralized dashboard for all store integrations, API keys, tracking, and management tools
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* 14 Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {moduleCards.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.title}
              className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${m.iconColor} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                    {m.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {m.description}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                <Link
                  href={m.href}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>{m.actionText}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
