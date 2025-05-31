// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   async rewrites() {
//     return [
//       {
//         source: "/api/:path*",
//         destination: "http://localhost:8080/api/:path*", // Proxy to Backend
//       },
//     ];
//   },
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   output: "standalone",
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*", // Proxy to Backend
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "standalone",
  // Experimental feature to control rendering
  experimental: {
    // Force all pages to be dynamically rendered (no SSG)
    forceSwr: true, // Not a direct solution, but influences caching/SSR behavior
  },
};

export default nextConfig;