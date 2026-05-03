import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./dashboard.module.css";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";
  if (!isAdmin) redirect("/login");

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "white" }}>
              Course<span style={{ color: "var(--primary)" }}>Hub</span>
            </span>
          </Link>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Admin Panel</p>
        </div>
        <nav className={styles.sidebarNav}>
          <Link href="/admin/dashboard" className={styles.navLink}>Student Data</Link>
          <Link href="/admin/dashboard/inventory" className={styles.navLink}>Inventory Manager</Link>
          <form action="/api/admin/logout" method="POST" style={{ marginTop: "auto", padding: "1rem" }}>
            <button type="submit" className={styles.logoutBtn}>Logout</button>
          </form>
        </nav>
      </aside>
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
