/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exporta o site como HTML/CSS/JS estático (pasta `out/`) — ideal para
  // hospedagem compartilhada (HostGator/cPanel/Apache), que não roda Node.
  output: "export",
  // Apache serve melhor /rota/ -> /rota/index.html
  trailingSlash: true,
  images: {
    // Sem servidor de otimização no export: as imagens são servidas como estão.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "videos.pexels.com" },
    ],
  },
};

export default nextConfig;
