import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { adminDb } from "../../../lib/firebase-admin";
import styles from "./page.module.css";
import CheckoutForm from "./CheckoutForm";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("student_auth")?.value;
  if (!studentId) redirect("/login");

  const resolvedParams = await params;
  const [courseDoc, studentDoc] = await Promise.all([
    adminDb.collection("courses").doc(resolvedParams.id).get(),
    adminDb.collection("students").doc(studentId).get(),
  ]);
  const course = courseDoc.exists ? { id: courseDoc.id, ...courseDoc.data() } as any : null;
  const student = studentDoc.exists ? { id: studentDoc.id, ...studentDoc.data() } as any : null;
  if (!course) notFound();

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  const slots = course.timeSlots.split(",").map((s: string) => s.trim()).filter(Boolean);

  return (
    <div className="main-content">
      <nav style={{ padding: "1rem 0", borderBottom: "1px solid var(--border-color)" }}>
        <div className="container">
          <Link href="/" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>
            &larr; Back to Courses
          </Link>
        </div>
      </nav>

      <div className="container animate-fade-in">
        <header className={styles.courseHeader}>
          <span className={styles.courseType}>{course.type}</span>
          <h1 className={styles.courseTitle}>{course.title}</h1>
          <div className={styles.coursePrice}>{formatINR(course.price)}</div>
        </header>

        <div className={styles.contentLayout}>
          <div>
            {course.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={course.imageUrl} alt={course.title} className={styles.courseImage} />
            )}
            <h2 className={styles.sectionTitle}>About This Course</h2>
            <p className={styles.courseDesc}>{course.description}</p>
          </div>

          <aside>
            <div className={`glass-card ${styles.checkoutCard}`}>
              <h3 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>Enroll Now</h3>
              <CheckoutForm
                courseId={course.id}
                courseTitle={course.title}
                price={course.price}
                slots={slots}
                studentName={student?.name ?? ""}
                studentEmail={student?.email ?? ""}
                studentPhone={student?.phone ?? ""}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
