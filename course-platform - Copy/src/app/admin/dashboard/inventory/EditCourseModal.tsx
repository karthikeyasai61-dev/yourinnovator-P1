"use client";

import { useState } from "react";

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

export default function EditCourseModal({ course, onClose, onSaved }: { course: Course; onClose: () => void; onSaved: (updated: Course) => void }) {
  const [form, setForm] = useState({
    title: course.title,
    description: course.description,
    price: course.price.toString(),
    type: course.type,
    duration: course.duration,
    timeSlots: course.timeSlots,
    imageUrl: course.imageUrl ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      // Pass the updated course back so parent can refresh state immediately
      onSaved(data.course);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
    }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem" }}>Edit Course</h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "1.5rem", cursor: "pointer" }}>x</button>
        </div>

        {error && <div style={{ color: "#ef4444", marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Course Title</label>
            <input name="title" type="text" required className="form-input" value={form.title} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" required className="form-input" rows={3} value={form.description} onChange={handleChange} style={{ resize: "vertical" }}></textarea>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Price (Rs.)</label>
              <input name="price" type="number" step="1" required className="form-input" value={form.price} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Course Type</label>
              <select name="type" required className="form-input" value={form.type} onChange={handleChange} style={{ appearance: "none" }}>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Duration (e.g. 3 Months, 40 Hours)</label>
            <input name="duration" type="text" className="form-input" value={form.duration} onChange={handleChange} placeholder="e.g. 3 Months" />
          </div>
          <div className="form-group">
            <label className="form-label">Time Slots (comma-separated)</label>
            <input name="timeSlots" type="text" required className="form-input" value={form.timeSlots} onChange={handleChange} placeholder="Mon-Wed 10:00 AM, Tue-Thu 2:00 PM" />
          </div>
          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label">Image URL</label>
            <input name="imageUrl" type="text" className="form-input" value={form.imageUrl} onChange={handleChange} placeholder="/uploads/image.jpg" />
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
