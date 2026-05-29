import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MobileDashboardNav from "@/components/layout/MobileDashboardNav";
import Sidebar from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-dvh min-h-dvh overflow-hidden bg-base">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">{children}</div>
      <MobileDashboardNav />
    </div>
  );
}
