import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/session";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { EmailVerificationBanner } from "@/components/dashboard/email-verification-banner";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar organizationName={session.user.organizationName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          organizationName={session.user.organizationName}
          userName={session.user.name ?? ""}
          userEmail={session.user.email ?? ""}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 print:p-0">
          {!session.user.emailVerified && (
            <div className="print:hidden">
              <EmailVerificationBanner />
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
