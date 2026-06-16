import { customAlphabet } from "nanoid";
import { Link } from "../models/Link";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const CODE_LENGTH = 7;
const MAX_RETRIES = 5;

const generate = customAlphabet(ALPHABET, CODE_LENGTH);

export async function generateUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const code = generate();
    const exists = await Link.exists({ code });
    if (!exists) return code;
  }
  throw new Error("Failed to generate a unique short code after max retries");
}

const SAFE_SCHEMES = ["http:", "https:"];

export function isSafeUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return SAFE_SCHEMES.includes(url.protocol);
  } catch {
    return false;
  }
}
