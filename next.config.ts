import type { NextConfig } from 'next';

// Exportación estática: el frontend se despliega en Vercel (o cualquier hosting estático)
// y consume la API de Django REST definida en NEXT_PUBLIC_API_URL.
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
