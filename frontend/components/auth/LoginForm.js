'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Mail, Lock, AlertCircle } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-input bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-sm text-danger">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-[38px] w-4 h-4 text-text-muted" />
          <Input
            label="Email"
            type="email"
            placeholder="you@earthscape.io"
            className="pl-10"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-[38px] w-4 h-4 text-text-muted" />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            className="pl-10"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Sign in
      </Button>

      <div className="text-center">
        <p className="text-xs text-text-muted mt-4">
          Demo: admin@earthscape.io / password123
        </p>
      </div>
    </form>
  )
}
