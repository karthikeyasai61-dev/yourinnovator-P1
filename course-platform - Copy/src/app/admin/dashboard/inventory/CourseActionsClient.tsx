"use client";

import { useState, useEffect } from "react";
import EditCourseModal from "./EditCourseModal";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  duration: string;
  timeSlots: string;
  imageUrl: string | null;
}

export default function CourseActionsClient({ courses: initialCourses }: { courses: Course[] }) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync when server re-renders with new courses (e.g. after add)
  useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch {
      alert("Delete failed. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // Called by EditCourseModal with the freshly-saved course data
  const handleSaved = (updated: Course) => {
    setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
    setEditingCourse(null);
  };

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  return (
    <>
      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSaved={handleSaved}
        />
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>Poster</th>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Duration</th>
            <th style={thStyle}>Price</th>
            <th style={thStyle}>Slots</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                No courses in inventory yet.
              </td>
            </tr>
          ) : (
            courses.map(course => (
              <tr key={course.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={tdStyle}>
                  {course.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.imageUrl} alt={course.title}
                      style={{ width: "60px", height: "40px", objectFit: "cover", borderRadius: "4px" }} />
                  ) : (
                    <div style={{ width: "60px", height: "40px", background: "var(--bg-surface-hover)", borderRadius: "4px" }} />
                  )}
                </td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{course.title}</td>
                <td style={tdStyle}>{course.type}</td>
                <td style={{ ...tdStyle, color: "var(--text-secondary)", fontSize: "0.9rem" }}>{course.duration || "-"}</td>
                <td style={tdStyle}>{formatINR(course.price)}</td>
                <td style={{ ...tdStyle, color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                  {course.timeSlots.split(",").map((s: string) => s.trim()).join(" / ")}
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => setEditingCourse(course)}
                      style={{ padding: "0.3rem 0.75rem", borderRadius: "6px", border: "1px solid var(--primary)", background: "transparent", color: "var(--primary)", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      disabled={deletingId === course.id}
                      style={{ padding: "0.3rem 0.75rem", borderRadius: "6px", border: "1px solid #ef4444", background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, opacity: deletingId === course.id ? 0.5 : 1 }}
                    >
                      {deletingId === course.id ? "..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}

const thStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  textAlign: "left",
  background: "rgba(0,0,0,0.2)",
  color: "var(--text-secondary)",
  fontWeight: 600,
  fontSize: "0.85rem",
};

const tdStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
};
