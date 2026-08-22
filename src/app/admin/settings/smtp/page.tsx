import SmtpAdmin from "@/components/admin/SmtpAdmin";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const SMTP_KEYS = [
  "mail_mailer",
  "mail_host",
  "mail_port",
  "mail_username",
  "mail_password",
  "mail_encryption",
  "mail_from_address",
  "mail_from_name",
];

export default async function AdminSmtpPage() {
  const settings = await getSettings(SMTP_KEYS);
  const masked = { ...settings, mail_password: settings.mail_password ? "********" : "" };
  return <SmtpAdmin initialSettings={masked} />;
}
