"use client";

import { useState } from "react";

interface Props {
  studentId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  educationLevel: string;
  currentDomain: string;
  interestedDomain: string;
  parentPhone: string;
  parentRelation: string;
  profileImage: string;
}

export default function ProfileClient({ 
  studentId, name, email, phone, 
  role, educationLevel, currentDomain, interestedDomain,
  parentPhone, parentRelation, profileImage 
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [imgUrl, setImgUrl] = useState(profileImage);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.url) throw new Error("Upload failed");

      // Save profile image URL to student record
      await fetch("/api/student/profile-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: data.url }),
      });

      setImgUrl(data.url);
    } catch {
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap", width: "100%" }}>
      {/* Profile Image */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: "100px", height: "100px", borderRadius: "50%",
          background: "var(--bg-surface-hover)",
          border: "3px solid var(--primary)",
          overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {imgUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: "2.5rem", color: "var(--text-secondary)" }}>
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <label htmlFor="profile-img" style={{
          position: "absolute", bottom: "0", right: "0",
          background: "var(--primary)", color: "white",
          borderRadius: "50%", width: "28px", height: "28px",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: "0.8rem", fontWeight: 700,
        }}>
          {uploading ? "..." : "+"}
        </label>
        <input id="profile-img" type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
      </div>

      {/* Profile Info */}
      <div style={{ flexGrow: 1 }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>
          {name}
          {role && <span style={{ marginLeft: "1rem", fontSize: "0.8rem", padding: "0.2rem 0.6rem", background: "rgba(99,102,241,0.15)", color: "var(--primary)", borderRadius: "999px", verticalAlign: "middle" }}>{role}</span>}
        </h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.75rem" }}>
          <div>Email: <strong style={{ color: "white" }}>{email}</strong></div>
          <div>Phone: <strong style={{ color: "white" }}>{phone || "Not provided"}</strong></div>
          
          {role === "Student" && educationLevel && (
            <div>Education: <strong style={{ color: "white" }}>{educationLevel}</strong></div>
          )}
          
          {currentDomain && (
            <div>Current Domain: <strong style={{ color: "white" }}>{currentDomain}</strong></div>
          )}
          
          {interestedDomain && (
            <div>Interested In: <strong style={{ color: "white" }}>{interestedDomain}</strong></div>
          )}

          {parentPhone && (
             <div>{parentRelation ? `${parentRelation}'s Phone` : "Parent's Phone"}: <strong style={{ color: "white" }}>{parentPhone}</strong></div>
          )}
        </div>
      </div>
    </div>
  );
}
