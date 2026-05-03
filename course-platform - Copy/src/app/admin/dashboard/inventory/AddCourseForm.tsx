"use client";

import { useState, useTransition, useRef } from "react";
import { addCourse } from "./actions";

export default function AddCourseForm() {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [slots, setSlots] = useState(["", "", ""]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setUploadedUrl(data.url);
    } catch {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSlotChange = (index: number, value: string) => {
    const updated = [...slots];
    updated[index] = value;
    setSlots(updated);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("timeSlots", slots.filter(Boolean).join(", "));
    formData.set("imageUrl", uploadedUrl);
    startTransition(async () => {
      await addCourse(formData);
      formRef.current?.reset();
      setImagePreview(null);
      setUploadedUrl("");
      setSlots(["", "", ""]);
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="title">Course Title</label>
        <input type="text" id="title" name="title" required className="form-input" />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">Description</label>
        <textarea id="description" name="description" required className="form-input" rows={3} style={{ resize: "vertical" }}></textarea>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="form-group">
          <label className="form-label" htmlFor="price">Price (Rs.)</label>
          <input type="number" step="1" id="price" name="price" required className="form-input" placeholder="e.g. 4999" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="type">Course Type</label>
          <select id="type" name="type" required className="form-input" style={{ appearance: "none" }}>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="duration">Duration</label>
        <input type="text" id="duration" name="duration" className="form-input" placeholder="e.g. 3 Months, 40 Hours" />
      </div>

      <div className="form-group">
        <label className="form-label">Time Slots (up to 3)</label>
        {slots.map((slot, i) => (
          <input key={i} type="text" className="form-input" style={{ marginBottom: "0.5rem" }}
            placeholder={`Slot ${i + 1} — e.g. Mon & Wed 10:00 AM`}
            value={slot} onChange={(e) => handleSlotChange(i, e.target.value)} />
        ))}
      </div>

      <div className="form-group" style={{ marginBottom: "1.5rem" }}>
        <label className="form-label">Course Poster Image</label>
        <label htmlFor="image-upload" style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "1.5rem", border: "2px dashed var(--border-color)", borderRadius: "8px",
          cursor: "pointer", background: "rgba(0,0,0,0.2)", minHeight: "100px",
        }}>
          {imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagePreview} alt="Preview" style={{ width: "100%", maxHeight: "150px", objectFit: "cover", borderRadius: "6px" }} />
          ) : (
            <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              {uploading ? "Uploading..." : "Click to upload poster image"}
            </span>
          )}
        </label>
        <input id="image-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={isPending || uploading}>
        {isPending ? "Adding..." : "Add Course"}
      </button>
    </form>
  );
}
