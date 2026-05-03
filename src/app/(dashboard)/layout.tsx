import type { Metadata } from "next";
import "@/styles/global.css";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "Ecofy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-base overflow-hidden">
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
