import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { ACCESS_EXPIRES_IN, ACCESS_SECRET } from "../../config/env.config";
import { OrganizerRole } from "../../generated/prisma";
import type { AuthPayload } from "../../interfaces/auth-payload.interface";

const derivePassword = (password: string, salt: string): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scryptCallback(password, salt, 64, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString("hex");
  const hash = await derivePassword(password, salt);
  return `scrypt$${salt}$${hash.toString("hex")}`;
};

export const verifyPassword = async (
  password: string,
  storedHash: string,
): Promise<boolean> => {
  const [algorithm, salt, expectedHex] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHex || !/^[a-f0-9]+$/i.test(expectedHex)) {
    return false;
  }

  const expected = Buffer.from(expectedHex, "hex");
  const actual = await derivePassword(password, salt);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

const expirationSeconds = (value: string): number => {
  const match = value.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 60 * 60;

  const amount = Number(match[1]);
  const unitSeconds: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };
  return amount * unitSeconds[match[2]];
};

export const generateAccessToken = (payload: AuthPayload): string => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: issuedAt,
    exp: issuedAt + expirationSeconds(ACCESS_EXPIRES_IN),
  };
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(tokenPayload)).toString("base64url");
  const unsignedToken = `${header}.${body}`;
  const signature = createHmac("sha256", ACCESS_SECRET)
    .update(unsignedToken)
    .digest("base64url");

  return `${unsignedToken}.${signature}`;
};

export const verifyAccessToken = (token: string): AuthPayload | null => {
  const [headerPart, bodyPart, signaturePart, ...extraParts] = token.split(".");
  if (!headerPart || !bodyPart || !signaturePart || extraParts.length > 0) return null;

  try {
    const header = JSON.parse(Buffer.from(headerPart, "base64url").toString("utf8"));
    if (header.alg !== "HS256") return null;

    const expected = createHmac("sha256", ACCESS_SECRET)
      .update(`${headerPart}.${bodyPart}`)
      .digest();
    const actual = Buffer.from(signaturePart, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

    const payload = JSON.parse(Buffer.from(bodyPart, "base64url").toString("utf8"));
    if (
      typeof payload.id !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    if (payload.userType === "CUSTOMER") return payload as AuthPayload;

    if (
      payload.userType === "ORGANIZER" &&
      Object.values(OrganizerRole).includes(payload.role)
    ) {
      return payload as AuthPayload;
    }

    return null;
  } catch {
    return null;
  }
};