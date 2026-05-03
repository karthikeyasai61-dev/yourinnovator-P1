import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginPageClient from "./LoginPageClient";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";
  const isStudent = !!cookieStore.get("student_auth")?.value;

  if (isAdmin) redirect("/admin/dashboard");
  if (isStudent) redirect("/");

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <LoginPageClient />
    </div>
  );
}
