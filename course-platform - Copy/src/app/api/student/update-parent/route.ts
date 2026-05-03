import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { studentId, parentPhone, parentRelation } = await request.json();

    if (!studentId || !parentPhone || !parentRelation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await adminDb.collection("students").doc(studentId).update({
      parentPhone, parentRelation,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, studentId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update parent details" }, { status: 500 });
  }
}
