/**
 * Global Site Configuration & Contact Details
 * Easily overridden using Environment Variables (.env) in production.
 */

export const SITE_CONFIG = {
  name: "আমারশপ",
  legalName: "Amar Shop in BD",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://online.amarshopinbd.com",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+880 1700-000000",
  supportPhoneRaw: process.env.NEXT_PUBLIC_SUPPORT_PHONE_RAW || "01700000000",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801700000000",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@amarshopinbd.com",
  address: process.env.NEXT_PUBLIC_STORE_ADDRESS || "ঢাকা, বাংলাদেশ",
  social: {
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://facebook.com",
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://youtube.com",
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com",
  },
};
