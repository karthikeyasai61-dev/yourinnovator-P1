"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "../../../../lib/firebase-admin";
import { cookies } from "next/headers";

async function verifyAuth() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "true") throw new Error("Unauthorized");
}

export async function addCourse(formData: FormData) {
  await verifyAuth();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const type = formData.get("type") as string;
  const duration = (formData.get("duration") as string) || "";
  const timeSlots = formData.get("timeSlots") as string;
  const imageUrl = formData.get("imageUrl") as string;

  await adminDb.collection("courses").add({
    title, description, price, type, duration, timeSlots, imageUrl: imageUrl || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  revalidatePath("/admin/dashboard/inventory");
  revalidatePath("/");
}

export async function deleteCourse(id: string) {
  await verifyAuth();
  await adminDb.collection("courses").doc(id).delete();
  revalidatePath("/admin/dashboard/inventory");
  revalidatePath("/");
}
