import type { Metadata } from 'next';
import '@/styles/global.css';

export const metadata: Metadata = {
  title: 'Ecofy',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-base">
        {children}
      </body>
    </html>
  );
}