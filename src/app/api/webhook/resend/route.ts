import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate Resend webhook signature here in production
    // e.g., using svix or checking the resend-signature header

    const { type, data } = body;

    // We log the email event into our Audit Logs for tracking
    // For example: "email.delivered", "email.bounced", "email.complained"
    if (type && type.startsWith("email.")) {
      await prisma.auditLog.create({
        data: {
          action: type.toUpperCase(), // e.g., EMAIL.DELIVERED
          entityId: data.email_id || "unknown",
          entityType: "EmailWebhook",
          metadata: JSON.stringify({
            to: data.to,
            subject: data.subject,
            status: type, // "email.delivered"
            timestamp: data.created_at,
          }),
        },
      });

      return NextResponse.json({ success: true, message: "Webhook processed" });
    }

    return NextResponse.json({ message: "Ignored event type" }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook Error", details: error.message },
      { status: 500 }
    );
  }
}
