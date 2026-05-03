import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SignupClient from "./SignupClient";

export default async function SignupPage() {
  const cookieStore = await cookies();
  const isStudent = !!cookieStore.get("student_auth")?.value;
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";
  if (isStudent || isAdmin) redirect("/");

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <SignupClient />
    </div>
  );
}
