import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { 
      name, email, password, phone, 
      role, educationLevel, currentDomain, interestedDomain 
    } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    const existing = await adminDb.collection("students").where("email", "==", email).get();
    if (!existing.empty) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const studentRef = adminDb.collection("students").doc();
    const studentData = {
        name, email, password: hashedPassword, phone: phone || null, 
        role: role || null, educationLevel: educationLevel || null, 
        currentDomain: currentDomain || null, interestedDomain: interestedDomain || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    await studentRef.set(studentData);

    return NextResponse.json({ success: true, studentId: studentRef.id, name: studentData.name });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
