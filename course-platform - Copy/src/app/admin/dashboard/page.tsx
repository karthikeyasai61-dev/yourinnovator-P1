import { adminDb } from "../../../lib/firebase-admin";
import styles from "./dashboard.module.css";

export const dynamic = "force-dynamic";

function formatINDate(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  }
  return dateStr;
}

export default async function AdminDashboard() {
  const enrollmentsQuery = await adminDb.collection("enrollments").orderBy("createdAt", "desc").get();
  const enrollments = await Promise.all(enrollmentsQuery.docs.map(async (doc) => {
    const data = doc.data();
    const [courseDoc, studentDoc] = await Promise.all([
      adminDb.collection("courses").doc(data.courseId).get(),
      adminDb.collection("students").doc(data.studentId).get()
    ]);
    return {
      id: doc.id,
      ...data,
      course: courseDoc.exists ? courseDoc.data() : { title: "Unknown", duration: "-" },
      student: studentDoc.exists ? studentDoc.data() : { name: "Unknown", email: "Unknown", phone: "-", parentPhone: null, parentRelation: null }
    };
  })) as any[];

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: "0.5rem" }}>Student Data Sheet</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "var(--spacing-lg)" }}>
        All student enrollments and payment records.
      </p>

      <div className="glass-card" style={{ padding: 0, overflowX: "auto" }}>
        {enrollments.length === 0 ? (
          <div style={{ padding: "var(--spacing-lg)", textAlign: "center" }}>
            <p>No students enrolled yet.</p>
          </div>
        ) : (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Student Phone</th>
                <th>Parent Phone</th>
                <th>Course</th>
                <th>Duration</th>
                <th>Selected Slot</th>
                <th>Enrolled On</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e, idx) => (
                <tr key={e.id}>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>{e.studentName || e.student.name}</td>
                  <td>{e.studentEmail || e.student.email}</td>
                  <td>{e.studentPhone || e.student.phone || "-"}</td>
                  <td>{e.student.parentPhone ? `${e.student.parentPhone} (${e.student.parentRelation || "Parent"})` : "-"}</td>
                  <td>{e.course.title}</td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{e.course.duration || "-"}</td>
                  <td>{e.selectedSlot || "-"}</td>
                  <td>{formatINDate(e.createdAt)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status-${e.paymentStatus}`]}`}>
                      {e.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: "999px",
                      fontSize: "0.75rem", fontWeight: 700,
                      background: e.completed ? "rgba(99,102,241,0.2)" : "rgba(16,185,129,0.2)",
                      color: e.completed ? "var(--primary)" : "#10b981",
                    }}>
                      {e.completed ? "Completed" : "Active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p style={{ marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
        Total enrollments: {enrollments.length}
      </p>
    </div>
  );
}
