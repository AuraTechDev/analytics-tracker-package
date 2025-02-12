import crypto from "crypto";

export function generateApiKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
