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
      // ATUALIZE COM O SEU HOSTNAME DO SUPABASE
      {
        protocol: 'https',
        hostname: 'https://dcwmqivwwfzlixquspah.supabase.co', // <-- Substitua pelo ID do seu projeto
        port: '',
        pathname: 'https://dcwmqivwwfzlixquspah.storage.supabase.co/storage/v1/s3**', // <-- Caminho completo para os buckets públicos
      },
    ],
  },
};

export default nextConfig;