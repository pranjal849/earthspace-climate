/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['flagcdn.com'],
  },
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    }
    return config
  },
  async rewrites() {
    return [
      // Proxy all API calls (except NextAuth) to FastAPI backend
      {
        source: '/api/auth/login',
        destination: 'http://localhost:8000/api/auth/login',
      },
      {
        source: '/api/auth/register',
        destination: 'http://localhost:8000/api/auth/register',
      },
      {
        source: '/api/dashboard/:path*',
        destination: 'http://localhost:8000/api/dashboard/:path*',
      },
      {
        source: '/api/climate-data/:path*',
        destination: 'http://localhost:8000/api/climate-data/:path*',
      },
      {
        source: '/api/climate-data',
        destination: 'http://localhost:8000/api/climate-data',
      },
      {
        source: '/api/countries/:path*',
        destination: 'http://localhost:8000/api/countries/:path*',
      },
      {
        source: '/api/countries',
        destination: 'http://localhost:8000/api/countries',
      },
      {
        source: '/api/analytics/:path*',
        destination: 'http://localhost:8000/api/analytics/:path*',
      },
      {
        source: '/api/analytics',
        destination: 'http://localhost:8000/api/analytics',
      },
      {
        source: '/api/alerts/:path*',
        destination: 'http://localhost:8000/api/alerts/:path*',
      },
      {
        source: '/api/alerts',
        destination: 'http://localhost:8000/api/alerts',
      },
      {
        source: '/api/reports/:path*',
        destination: 'http://localhost:8000/api/reports/:path*',
      },
      {
        source: '/api/reports',
        destination: 'http://localhost:8000/api/reports',
      },
      {
        source: '/api/support/:path*',
        destination: 'http://localhost:8000/api/support/:path*',
      },
      {
        source: '/api/support',
        destination: 'http://localhost:8000/api/support',
      },
      {
        source: '/api/admin/:path*',
        destination: 'http://localhost:8000/api/admin/:path*',
      },
      {
        source: '/api/health',
        destination: 'http://localhost:8000/api/health',
      },
    ]
  },
}

module.exports = nextConfig

