import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "../../../../lib/firebase-admin";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();
    const cookieStore = await cookies();

    // Admin login
    if (username === "admin" && password === "admin123") {
      cookieStore.set("admin_auth", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return NextResponse.json({ success: true, role: "admin" });
    }

    // Student login
    if (email && password) {
      const studentsQuery = await adminDb.collection("students").where("email", "==", email).get();
      if (studentsQuery.empty) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }
      const studentDoc = studentsQuery.docs[0];
      const student = { id: studentDoc.id, ...studentDoc.data() } as any;
      const valid = await bcrypt.compare(password, student.password);
      if (!valid) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }
      cookieStore.set("student_auth", student.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      cookieStore.set("student_name", student.name, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return NextResponse.json({ success: true, role: "student", name: student.name });
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
