import { getSetting } from "./settings";

// GTM কনটেইনার আইডি তখনই ফেরত দেয় যখন সেটা সেভ করা আছে এবং kill switch দিয়ে বন্ধ
// করা হয়নি (ENABLE_GTM=false, যেমন dev-এ production ট্যাগ যেন না চলে)। নাহলে null।
export async function getActiveGtmId(): Promise<string | null> {
  if (process.env.ENABLE_GTM === "false") return null;
  const id = (await getSetting("gtm_id"))?.trim();
  return id ? id : null;
}
