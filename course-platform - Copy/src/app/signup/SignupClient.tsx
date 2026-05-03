"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    role: "Student",
    educationLevel: "School(1-10)",
    currentDomain: "",
    interestedDomain: "",
    password: "", confirm: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    
    // Validation for domain based on education level
    if (form.role === "Student" && (form.educationLevel === "Diploma" || form.educationLevel === "Engineering") && !form.currentDomain) {
      setError("Please enter your current domain.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = {
        name: form.name, email: form.email, phone: form.phone, password: form.password,
        role: form.role,
        ...(form.role === "Student" ? {
          educationLevel: form.educationLevel,
          currentDomain: (form.educationLevel === "Diploma" || form.educationLevel === "Engineering") ? form.currentDomain : "",
        } : {}),
        interestedDomain: form.interestedDomain,
      };

      const res = await fetch("/api/student/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      // Auto-login after signup
      const loginRes = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      if (loginRes.ok) { router.push("/"); router.refresh(); }
      else router.push("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "480px" }}>
      <div className="glass-card" style={{ padding: "2rem" }}>
        <h1 style={{ textAlign: "center", marginBottom: "0.5rem", fontSize: "2rem" }}>Create Account</h1>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          Join <span className="text-gradient" style={{ fontWeight: 700 }}>CourseHub</span> and start learning
        </p>

        {error && (
          <div style={{ color: "#ef4444", marginBottom: "1rem", textAlign: "center", fontSize: "0.9rem", padding: "0.5rem", background: "rgba(239,68,68,0.1)", borderRadius: "8px" }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Details */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input id="name" name="name" type="text" className="form-input" required value={form.name} onChange={handleChange} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input id="email" name="email" type="email" className="form-input" required value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <input id="phone" name="phone" type="tel" className="form-input" required value={form.phone} onChange={handleChange} placeholder="+91..." />
            </div>
          </div>

          {/* Role Section */}
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "1rem 0 0.5rem" }}>
            Professional Status
          </p>
          <div className="form-group">
            <label className="form-label" htmlFor="role">Role</label>
            <select id="role" name="role" className="form-input" value={form.role} onChange={handleChange}>
              <option value="Student">Student</option>
              <option value="Employed Learner">Employed Learner</option>
            </select>
          </div>

          {/* Conditional Student Fields */}
          {form.role === "Student" && (
            <div className="animate-fade-in" style={{ padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px", marginBottom: "1rem", border: "1px solid var(--border-color)" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="educationLevel">Education Level</label>
                <select id="educationLevel" name="educationLevel" className="form-input" value={form.educationLevel} onChange={handleChange}>
                  <option value="School(1-10)">School (1-10)</option>
                  <option value="+12">+12</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>

              {(form.educationLevel === "Diploma" || form.educationLevel === "Engineering") && (
                <div className="form-group animate-fade-in">
                  <label className="form-label" htmlFor="currentDomain">Current Domain <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>(e.g. Mechanical, CS, IT)</span></label>
                  <input id="currentDomain" name="currentDomain" type="text" className="form-input" required value={form.currentDomain} onChange={handleChange} />
                </div>
              )}
            </div>
          )}

          {/* Always ask Interested Domain */}
          <div className="form-group">
            <label className="form-label" htmlFor="interestedDomain">Interested Domain to Learn <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>(e.g. Web Dev, AI)</span></label>
            <input id="interestedDomain" name="interestedDomain" type="text" className="form-input" required value={form.interestedDomain} onChange={handleChange} />
          </div>

          {/* Password */}
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "1.25rem 0 0.5rem" }}>
            Set Password
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" className="form-input" required minLength={6} value={form.password} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirm">Confirm Password</label>
              <input id="confirm" name="confirm" type="password" className="form-input" required value={form.confirm} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "0.85rem", fontSize: "1.05rem" }} disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: "600" }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
