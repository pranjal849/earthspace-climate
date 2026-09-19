'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { User, Mail, Lock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export default function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await res.json()

      if (!result.success) {
        setError(result.error)
      } else {
        toast.success('Account created! Please sign in.')
        router.push('/login')
      }
    } catch (err) {
      setError('Registration failed. Please try again.')
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
          <User className="absolute left-3 top-[38px] w-4 h-4 text-text-muted" />
          <Input
            label="Full Name"
            placeholder="Your name"
            className="pl-10"
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-[38px] w-4 h-4 text-text-muted" />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
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
            placeholder="At least 6 characters"
            className="pl-10"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-[38px] w-4 h-4 text-text-muted" />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            className="pl-10"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Create Account
      </Button>
    </form>
  )
}
