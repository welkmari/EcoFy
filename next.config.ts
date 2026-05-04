import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Garante que as variáveis NEXT_PUBLIC_ estejam disponíveis
  // no Edge Runtime (onde o middleware é executado)
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
};

export default nextConfig;
