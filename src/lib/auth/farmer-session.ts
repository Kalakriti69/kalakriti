import { createHmac, timingSafeEqual } from "crypto";

export const FARMER_SESSION_COOKIE = "kisansetu_farmer_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function getSessionSecret() {
  const secret = process.env.FARMER_SESSION_SECRET;
  if (!secret) throw new Error("FARMER_SESSION_SECRET is not configured.");
  return secret;
}

export function createFarmerSession(phone: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${phone}.${expiresAt}`;
  const signature = createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function getPhoneFromFarmerSession(value: string | undefined) {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;

  const [phone, expiresAt, signature] = parts;
  const payload = `${phone}.${expiresAt}`;
  const expectedSignature = createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
  if (signature.length !== expectedSignature.length) return null;
  const validSignature = timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

  if (!validSignature || Number(expiresAt) < Math.floor(Date.now() / 1000)) return null;
  return phone;
}

export { SESSION_TTL_SECONDS };
