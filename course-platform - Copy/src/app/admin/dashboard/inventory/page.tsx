import { adminDb } from "../../../../lib/firebase-admin";
import AddCourseForm from "./AddCourseForm";
import CourseActionsClient from "./CourseActionsClient";

export const dynamic = "force-dynamic";

export default async function InventoryManager() {
  const coursesQuery = await adminDb.collection("courses").orderBy("createdAt", "desc").get();
  const courses = coursesQuery.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: "0.5rem" }}>Inventory Manager</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "var(--spacing-lg)" }}>
        Add, edit, or remove courses from the storefront.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "var(--spacing-lg)" }}>
        {/* Add Course Form */}
        <div>
          <div className="glass-card">
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>Add New Course</h2>
            <AddCourseForm />
          </div>
        </div>

        {/* Course List with Edit/Delete */}
        <div>
          <div className="glass-card" style={{ padding: 0, overflowX: "auto" }}>
            <CourseActionsClient courses={courses} />
          </div>
        </div>
      </div>
    </div>
  );
}
