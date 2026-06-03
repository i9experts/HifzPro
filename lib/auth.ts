// lib/auth.ts
// JWT token generation, verification, and cookie management

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "HifzPro2026SecureJWTKeyAuthentication";
const JWT_EXPIRES_IN = "7d";
const COOKIE_NAME = "hifzpro_token";

export interface TokenPayload {
  userId:        string;
  role:          string;
  institutionId: string | null;
  campusId:      string | null;
  name:          string;
}

// ── Generate JWT token ──
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// ── Verify JWT token ──
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// ── Get token from request ──
export function getTokenFromRequest(req: NextRequest): string | null {
  // Check cookie first
  const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
  if (cookieToken) return cookieToken;

  // Check Authorization header
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}

// ── Get current user from cookies (server component) ──
export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

// ── Cookie options ──
export const cookieOptions = {
  name:     COOKIE_NAME,
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge:   60 * 60 * 24 * 7, // 7 days
  path:     "/",
};

// ── Generate 6-digit OTP ──
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
