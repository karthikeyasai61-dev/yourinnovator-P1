import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const studentId = cookieStore.get("student_auth")?.value;
    if (!studentId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { amount, courseId, courseName } = await request.json();

    // Razorpay requires amount in paise (1 INR = 100 paise)
    // Receipt must be <= 40 chars
    const receipt = `rcpt_${Date.now().toString().slice(-10)}`;
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt,
      notes: {
        courseId,
        courseName,
        studentId,
      },
    });

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
