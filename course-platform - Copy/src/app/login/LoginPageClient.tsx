"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPageClient() {
  const router = useRouter();
  const [tab, setTab] = useState<"student" | "admin">("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Student fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Admin fields (hidden by default, shown when tab is "admin")
  const [username, setUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload =
      tab === "admin"
        ? { username, password: adminPassword }
        : { email, password };

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      if (data.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>
      <div className="glass-card">
        <h1 style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "2rem" }}>
          <span className="text-gradient">CourseHub</span> Login
        </h1>

        {/* Tab switcher — admin tab is subtle, not prominent */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "4px" }}>
          <button
            type="button"
            onClick={() => setTab("student")}
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: tab === "student" ? "var(--primary)" : "transparent",
              color: "white",
              fontWeight: "600",
              transition: "background 0.2s",
            }}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setTab("admin")}
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: tab === "admin" ? "var(--primary)" : "transparent",
              color: tab === "admin" ? "white" : "var(--text-secondary)",
              fontWeight: "600",
              fontSize: "0.85rem",
              transition: "background 0.2s",
            }}
          >
            Admin
          </button>
        </div>

        {error && (
          <div style={{ color: "#ef4444", marginBottom: "1rem", textAlign: "center", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {tab === "admin" ? (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="admin-username">Username</label>
                <input id="admin-username" type="text" className="form-input" required value={username} onChange={e => setUsername(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label" htmlFor="admin-password">Password</label>
                <input id="admin-password" type="password" className="form-input" required value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="student-email">Email Address</label>
                <input id="student-email" type="email" className="form-input" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label" htmlFor="student-password">Password</label>
                <input id="student-password" type="password" className="form-input" required value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {tab === "student" && (
          <p style={{ textAlign: "center", marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: "600" }}>
              Sign up free
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
