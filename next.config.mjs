/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // 500mb era perigoso — podia derrubar o servidor com 1 upload grande
      // 50mb é suficiente para PDFs, thumbnails e capas de cursos
      bodySizeLimit: "50mb"
    }
  },
  images: {
    // Formatos modernos: WebP e AVIF são 50-80% mais leves que PNG/JPG
    formats: ["image/avif", "image/webp"],
    // Cache de imagens otimizadas por 30 dias no servidor
    minimumCacheTTL: 2592000,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "pjzfqqxkeivrxfnwqswl.supabase.co" }
    ]
  },
  // Headers de cache HTTP para assets estáticos
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // Cache agressivo para imagens estáticas locais (30 dias)
        source: "/(:path*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif))",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
    ]
  },
}

export default nextConfig
