import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "../../../../lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const studentId = cookieStore.get("student_auth")?.value;
    if (!studentId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { imageUrl } = await request.json();
    await adminDb.collection("students").doc(studentId).update({
      profileImage: imageUrl,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update profile image" }, { status: 500 });
  }
}
