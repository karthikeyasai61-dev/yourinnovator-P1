"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  studentId: string;
}

export default function ParentDetailsPopup({ studentId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("Mother");
  const [dismissed, setDismissed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/student/update-parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, parentPhone: phone, parentRelation: relation }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update details");

      // Hide popup on success
      setDismissed(true);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (dismissed) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(8px)",
      zIndex: 9999, // Unclosable, covers everything
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div className="glass-card animate-fade-in" style={{ width: "100%", maxWidth: "400px", border: "1px solid var(--primary)", boxShadow: "0 0 20px rgba(99,102,241,0.2)" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(99,102,241,0.1)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: "1.5rem" }}>
            🛡️
          </div>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Parent/Guardian Details Required</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            For students in School or +12, we require parent contact details before you can access courses.
          </p>
        </div>

        {error && (
          <div style={{ color: "#ef4444", marginBottom: "1rem", textAlign: "center", fontSize: "0.85rem", padding: "0.5rem", background: "rgba(239,68,68,0.1)", borderRadius: "8px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="popup-relation">Relation</label>
            <select id="popup-relation" className="form-input" value={relation} onChange={(e) => setRelation(e.target.value)}>
              <option value="Mother">Mother</option>
              <option value="Father">Father</option>
              <option value="Guardian">Guardian</option>
            </select>
          </div>
          
          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label" htmlFor="popup-phone">Parent Mobile Number</label>
            <input 
              id="popup-phone" 
              type="tel" 
              className="form-input" 
              placeholder="+91 98765 43210" 
              required 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "0.85rem" }} disabled={loading}>
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
