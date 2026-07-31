import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
// In a real application, ensure this key is 32 bytes and stored securely in environment variables.
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY ||
  crypto.randomBytes(32).toString("hex").slice(0, 32);

if (ENCRYPTION_KEY.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be exactly 32 characters long.");
}

/**
 * Encrypts a text string.
 * @param text The text to encrypt.
 * @returns The encrypted string in the format iv:authTag:encryptedText
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an encrypted string.
 * @param encryptedText The encrypted text in the format iv:authTag:encryptedText
 * @returns The decrypted text.
 */
export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format.");
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
