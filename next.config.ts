// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      // ATUALIZE O OBJETO DO SUPABASE PARA ESTA VERSÃO
      {
        protocol: 'https',
        hostname: 'dcwmqivwwfzlixquspah.supabase.co',
        port: '',
        pathname: '/**', // <-- Use '/**' para permitir qualquer imagem deste host
      },
    ],
  },
};

export default nextConfig;