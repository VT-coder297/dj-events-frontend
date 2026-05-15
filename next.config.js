const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Locks Turbopack to your frontend sub-folder layout explicitly
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

module.exports = nextConfig;
