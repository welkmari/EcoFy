import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-base">
      <Sidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
