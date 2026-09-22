import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
// In a real application, ensure this key is 32 bytes and stored securely in environment variables.
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || "anchor_fashion_secure_key_32chr";
  if (key.length === 32) {
    return Buffer.from(key, "utf8");
  }
  return crypto.createHash("sha256").update(key).digest();
}

/**
 * Encrypts a text string.
 * @param text The text to encrypt.
 * @returns The encrypted string in the format iv:authTag:encryptedText
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

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

  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
