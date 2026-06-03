// app/api/auth/signout/route.ts
import { NextResponse } from "next/server";
import { cookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true, data: { message: "Signed out successfully" } });
  response.cookies.set(cookieOptions.name, "", { ...cookieOptions, maxAge: 0 });
  return response;
}
