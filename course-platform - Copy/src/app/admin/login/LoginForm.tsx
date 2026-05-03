"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ color: "#ef4444", marginBottom: "1rem", textAlign: "center" }}>{error}</div>}
      
      <div className="form-group">
        <label className="form-label" htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          required
          className="form-input"
          value={formData.username}
          onChange={handleChange}
        />
      </div>

      <div className="form-group" style={{ marginBottom: "2rem" }}>
        <label className="form-label" htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          className="form-input"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
