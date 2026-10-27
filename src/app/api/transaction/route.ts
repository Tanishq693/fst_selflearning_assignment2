import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { TransactionalEmail } from "@/emails/TransactionalEmail";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_123");

export async function POST(req: Request) {
  try {
    // 1. Get user context passed down from middleware
    const role = req.headers.get("x-user-role");
    
    // Simulate getting user ID from session context
    const body = await req.json();
    const { amount, userId } = body;

    if (!amount || !userId) {
      return NextResponse.json({ error: "Missing amount or userId" }, { status: 400 });
    }

    // 2. Perform Database Mutation using Prisma
    const transaction = await prisma.transaction.create({
      data: {
        amount: Number(amount),
        userId: userId,
        status: "COMPLETED",
      },
      include: {
        user: true,
      },
    });

    // 3. Trigger Automated Transactional Notification via Resend & React Email
    let emailResponse = null;
    if (process.env.RESEND_API_KEY && transaction.user?.email) {
      emailResponse = await resend.emails.send({
        from: "Acme Finance <onboarding@resend.dev>",
        to: transaction.user.email,
        subject: "Transaction Completed",
        react: TransactionalEmail({
          userName: transaction.user.name || "Member",
          transactionId: transaction.id,
          amount: transaction.amount,
          status: transaction.status,
        }),
      });
    }

    // Log the action (Audit Trail)
    await prisma.auditLog.create({
      data: {
        action: "TRANSACTION_CREATED",
        entityId: transaction.id,
        entityType: "Transaction",
        userId: userId,
        metadata: JSON.stringify({ role, emailSent: !!emailResponse?.data }),
      },
    });

    return NextResponse.json({
      success: true,
      transaction,
      emailResponse,
    });
  } catch (error: any) {
    console.error("Transaction Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
