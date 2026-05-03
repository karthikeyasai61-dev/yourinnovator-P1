import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { adminDb } from "../../../../lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const studentId = cookieStore.get("student_auth")?.value;
    if (!studentId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      selectedSlot,
      name,
      email,
      phone,
    } = body;

    // Verify signature — this confirms the payment is genuine and not tampered
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed — invalid signature" }, { status: 400 });
    }

    // Payment is genuine — create enrollment
    const enrollmentRef = adminDb.collection("enrollments").doc();
    const enrollmentData = {
        studentId,
        studentName: name,
        studentEmail: email,
        studentPhone: phone,
        joinDate: new Date().toISOString(),
        selectedSlot,
        paymentStatus: "PAID",
        courseId,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    await enrollmentRef.set(enrollmentData);
    const enrollment = { id: enrollmentRef.id, ...enrollmentData };

    return NextResponse.json({ success: true, enrollment, paymentId: razorpay_payment_id });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
