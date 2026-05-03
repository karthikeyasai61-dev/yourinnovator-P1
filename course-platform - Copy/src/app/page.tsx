import Link from "next/link";
import { cookies } from "next/headers";
import { adminDb } from "../lib/firebase-admin";
import styles from "./page.module.css";
import ParentDetailsPopup from "../components/ParentDetailsPopup";

export const dynamic = "force-dynamic";

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export default async function Home() {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("student_auth")?.value;
  const studentName = cookieStore.get("student_name")?.value;
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";
  const isLoggedIn = !!studentId || isAdmin;

  // Check if student needs parent details popup
  let showParentPopup = false;
  if (studentId) {
    const studentDoc = await adminDb.collection("students").doc(studentId).get();
    if (studentDoc.exists) {
      const student = studentDoc.data();
      if (
        student && 
        student.role === "Student" && 
        (student.educationLevel === "School(1-10)" || student.educationLevel === "+12") && 
        !student.parentPhone
      ) {
        showParentPopup = true;
      }
    }
  }

  const coursesQuery = await adminDb.collection("courses").orderBy("createdAt", "desc").get();
  const courses = coursesQuery.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

  return (
    <div className="main-content">
      {showParentPopup && studentId && <ParentDetailsPopup studentId={studentId} />}
      
      <nav className={styles.nav}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
          <Link href="/" className={styles.logo}>
            Course<span className="text-gradient">Hub</span>
          </Link>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            {isLoggedIn ? (
              <>
                {studentName && (
                  <Link href="/profile" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textDecoration: "none" }}>
                    Welcome, <strong style={{ color: "white" }}>{studentName}</strong>
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/admin/dashboard" className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
                    Admin Panel
                  </Link>
                )}
                <form action="/api/admin/logout" method="POST">
                  <button type="submit" className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="container">
        <header className={`${styles.hero} animate-fade-in`}>
          <h1 className={styles.heroTitle}>
            Master Your Craft with <span className="text-gradient">Premium Courses</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Join thousands of students learning new skills online and offline. Elevate your career today.
          </p>
          {!isLoggedIn && (
            <Link href="/login" className="btn btn-primary">Login to Enroll</Link>
          )}
        </header>

        <section>
          <h2 style={{ marginBottom: "var(--spacing-md)", fontSize: "2rem" }}>Available Courses</h2>
          {courses.length === 0 ? (
            <div className="glass-card" style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
              <h3 style={{ marginBottom: "var(--spacing-sm)" }}>No courses available yet</h3>
              <p style={{ color: "var(--text-secondary)" }}>Check back soon!</p>
            </div>
          ) : (
            <div className={styles.courseGrid}>
              {courses.map((course) => (
                <div key={course.id} className={`glass-card ${styles.courseCard} animate-fade-in`}>
                  {course.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.imageUrl} alt={course.title} className={styles.courseImage} />
                  )}
                  <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <span className={styles.courseType}>{course.type}</span>
                    <h3 className={styles.courseTitle}>{course.title}</h3>
                    <p className={styles.courseDesc}>{course.description}</p>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      {course.duration && <span>Duration: {course.duration}</span>}
                      <span>Slots: {course.timeSlots.split(",").map((s: string) => s.trim()).join(" | ")}</span>
                    </div>
                  </div>
                  <div className={styles.courseFooter}>
                    <span className={styles.coursePrice}>{formatINR(course.price)}</span>
                    <Link href={isLoggedIn ? `/course/${course.id}` : "/login"} className="btn btn-primary">
                      {isLoggedIn ? "Enroll Now" : "Login to Enroll"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
