import { redirect } from 'next/navigation'

export default function RootPage() {
  // Automatically redirect the root URL to the dashboard (or login if not authenticated, which NextAuth middleware handles)
  redirect('/dashboard')
}
