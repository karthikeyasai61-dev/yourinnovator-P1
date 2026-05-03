import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "../../../lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const studentId = cookieStore.get("student_auth")?.value;
    if (!studentId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const { selectedSlot, courseId, name, email, phone } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Name, email and phone are required" }, { status: 400 });
    }

    const enrollmentRef = adminDb.collection("enrollments").doc();
    const enrollmentData = {
        studentId,
        studentName: name,
        studentEmail: email,
        studentPhone: phone,
        joinDate: new Date().toISOString(), // auto enrolled date
        selectedSlot,
        paymentStatus: "PAID",
        courseId,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    await enrollmentRef.set(enrollmentData);
    const enrollment = { id: enrollmentRef.id, ...enrollmentData };

    return NextResponse.json({ success: true, enrollment });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json({ error: "Failed to process enrollment" }, { status: 500 });
  }
}
