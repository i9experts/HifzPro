// app/api/auth/parent/send-otp/route.ts
// Send WhatsApp OTP to parent for authentication

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { generateOTP } from "@/lib/auth";
import { errorResponse, successResponse, serverErrorResponse } from "@/lib/api";

const sendOtpSchema = z.object({
  phone: z.string().min(10, "Enter a valid phone number"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = sendOtpSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(result.error.errors[0].message);
    }

    const { phone } = result.data;

    // Normalize phone number
    const normalizedPhone = phone.replace(/\s+/g, "").replace(/^0/, "+92");

    // Find user by phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: normalizedPhone },
          { whatsapp: normalizedPhone },
          { phone: phone },
          { whatsapp: phone },
        ],
      },
    });

    if (!user) {
      // For security, don't reveal if number exists or not
      // Still return success but don't send OTP
      return successResponse({
        message: "If this number is registered, you will receive an OTP shortly.",
        phone: normalizedPhone,
      });
    }

    if (!user.isActive) {
      return errorResponse("Your account has been deactivated. Contact your institution.");
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await prisma.otpToken.create({
      data: {
        userId:    user.id,
        token:     otp,
        expiresAt,
      },
    });

    // Send WhatsApp message
    await sendWhatsAppOTP(normalizedPhone, otp, user.name);

    return successResponse({
      message: "OTP sent to your WhatsApp number.",
      phone: normalizedPhone,
      // In development, return OTP for testing
      ...(process.env.NODE_ENV === "development" && { devOtp: otp }),
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    return serverErrorResponse();
  }
}

async function sendWhatsAppOTP(phone: string, otp: string, name: string) {
  const whatsappToken = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // If WhatsApp not configured, log OTP for testing
  if (!whatsappToken || !phoneNumberId) {
    console.log(`
    ═══════════════════════════════
    HIFZPRO OTP (Dev Mode)
    Phone: ${phone}
    Name:  ${name}
    OTP:   ${otp}
    ═══════════════════════════════
    `);
    return;
  }

  // Send via WhatsApp Business API
  try {
    const message = `*HifzPro Login*\n\nAs-salamu alaykum ${name},\n\nYour login code is: *${otp}*\n\nThis code expires in 10 minutes.\n\n_Do not share this code with anyone._`;

    await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${whatsappToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message },
      }),
    });
  } catch (error) {
    console.error("WhatsApp send error:", error);
    // Don't throw — OTP is still saved, user can try again
  }
}
