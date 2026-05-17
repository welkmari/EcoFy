import type { Metadata } from "next";
import "@/styles/global.css";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "Ecofy",
  icons: {
    icon: "/image.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-base">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}