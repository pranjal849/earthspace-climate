import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/climate-data/:path*',
    '/countries/:path*',
    '/analytics/:path*',
    '/real-time/:path*',
    '/alerts/:path*',
    '/reports/:path*',
    '/map/:path*',
    '/admin/:path*',
    '/support/:path*',
  ],
}
