import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminDb } from "../../lib/firebase-admin";
import Link from "next/link";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

function formatINDate(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  }
  return dateStr;
}

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("student_auth")?.value;
  if (!studentId) redirect("/login");

  const studentDoc = await adminDb.collection("students").doc(studentId).get();
  if (!studentDoc.exists) redirect("/login");
  const student = { id: studentDoc.id, ...studentDoc.data() } as any;

  const enrollmentsQuery = await adminDb.collection("enrollments").where("studentId", "==", studentId).get();
  const enrollments = await Promise.all(enrollmentsQuery.docs.map(async (doc) => {
    const data = doc.data();
    const courseDoc = await adminDb.collection("courses").doc(data.courseId).get();
    return { id: doc.id, ...data, course: { id: courseDoc.id, ...courseDoc.data() } };
  })) as any[];
  
  student.enrollments = enrollments.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const enrolledCourses = student.enrollments.filter((e: any) => !e.completed);
  const completedCourses = student.enrollments.filter((e: any) => e.completed);

  return (
    <div className="main-content">
      <nav style={{ padding: "1rem 0", borderBottom: "1px solid var(--border-color)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>
            &larr; Back to Courses
          </Link>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
              Logout
            </button>
          </form>
        </div>
      </nav>

      <div className="container" style={{ padding: "2rem 1rem" }}>
        {/* Profile Header */}
        <div className="glass-card animate-fade-in" style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap", marginBottom: "2rem" }}>
          <ProfileClient
            studentId={student.id}
            name={student.name}
            email={student.email}
            phone={student.phone ?? ""}
            role={student.role ?? ""}
            educationLevel={student.educationLevel ?? ""}
            currentDomain={student.currentDomain ?? ""}
            interestedDomain={student.interestedDomain ?? ""}
            parentPhone={student.parentPhone ?? ""}
            parentRelation={student.parentRelation ?? ""}
            profileImage={student.profileImage ?? ""}
          />
        </div>

        {/* Enrolled Courses */}
        <h2 style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>Enrolled Courses</h2>
        {enrolledCourses.length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "2rem", marginBottom: "2rem" }}>
            <p style={{ color: "var(--text-secondary)" }}>You have not enrolled in any courses yet.</p>
            <Link href="/" className="btn btn-primary" style={{ marginTop: "1rem", display: "inline-block" }}>
              Browse Courses
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {enrolledCourses.map((e: any) => (
              <div key={e.id} className="glass-card" style={{ padding: "1.25rem" }}>
                {e.course.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.course.imageUrl} alt={e.course.title}
                    style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "0.75rem" }} />
                )}
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{e.course.type}</span>
                <h3 style={{ margin: "0.25rem 0 0.5rem", fontSize: "1.1rem" }}>{e.course.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                  Slot: {e.selectedSlot || "-"}
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                  Enrolled: {formatINDate(e.joinDate)}
                </p>
                {e.course.duration && (
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Duration: {e.course.duration}</p>
                )}
                <div style={{ marginTop: "0.75rem", padding: "0.5rem 1rem", background: "rgba(16,185,129,0.15)", color: "#10b981", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 700, display: "inline-block" }}>
                  Active
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Completed Courses */}
        <h2 style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>Completed Courses</h2>
        {completedCourses.length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ color: "var(--text-secondary)" }}>No completed courses yet. Keep learning!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {completedCourses.map((e: any) => (
              <div key={e.id} className="glass-card" style={{ padding: "1.25rem", opacity: 0.8 }}>
                {e.course.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.course.imageUrl} alt={e.course.title}
                    style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "0.75rem", filter: "grayscale(30%)" }} />
                )}
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{e.course.type}</span>
                <h3 style={{ margin: "0.25rem 0 0.5rem", fontSize: "1.1rem" }}>{e.course.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Enrolled: {formatINDate(e.joinDate)}</p>
                <div style={{ marginTop: "0.75rem", padding: "0.5rem 1rem", background: "rgba(99,102,241,0.15)", color: "var(--primary)", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 700, display: "inline-block" }}>
                  Completed
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
