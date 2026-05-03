import Header from "@/components/layout/Header";
import OverViewPage from "@/features/overview/components/OverViewPage";

export default function Overview() {
  return (
    <main className="h-full overflow-y-auto scrollbar-hide">
      <Header />
      <OverViewPage />
    </main>
  );
}
