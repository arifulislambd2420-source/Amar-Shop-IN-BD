export async function sendSMS(phone: string, text: string) {
  const apiKey = process.env.SMS_API_KEY;
  const senderId = process.env.SMS_SENDER_ID;
  const apiUrl = process.env.SMS_API_URL || "http://bulksmsbd.net/api/smsapi";

  if (!apiKey || !senderId) {
    console.log(`[MOCK SMS to ${phone}]: ${text}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return;
  }

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        senderid: senderId,
        number: phone,
        message: text,
      }),
    });
    const data = await res.json();
    console.log(`[SMS Response]:`, data);
  } catch (error) {
    console.error("[SMS Error]:", error);
  }
}

// Global OTP store for mock development (in production, use DB or Redis)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export function generateAndStoreOTP(phone: string): string {
  const otp = process.env.NODE_ENV === "production" 
    ? Math.floor(1000 + Math.random() * 9000).toString() 
    : "1234"; 
  otpStore.set(phone, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes validity
  });
  return otp;
}

export function verifyOTP(phone: string, inputOtp: string): boolean {
  const record = otpStore.get(phone);
  if (!record) return false;
  
  if (record.expiresAt < Date.now()) {
    otpStore.delete(phone);
    return false; // expired
  }
  
  if (record.otp === inputOtp) {
    otpStore.delete(phone);
    return true; // valid
  }
  
  return false;
}
