import Header from "@/components/layout/Header";
import OverViewPage from "@/features/overview/components/OverViewPage";

export default function Overview() {
  return (
    <main className="h-full overflow-y-auto pb-24 scrollbar-hide md:pb-0">
      <Header />
      <OverViewPage />
    </main>
  );
}
