/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdfjs-dist'],
  webpack: (config, { isServer }) => {
    // Handle PDF.js and other browser-only libraries
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        encoding: false,
        fs: false,
        path: false,
        os: false,
      };
      
      // Mock PDF.js on server side
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdfjs-dist': false,
      };
    }
    
    // Ignore build errors for deployment
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; 