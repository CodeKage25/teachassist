'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  async function handleSubmit(formData: FormData) {
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError(null)
    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Create your account</h1>
        <p className="text-slate-500 text-sm mt-1">Set up your school on TeachAssist</p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="full_name" className="text-sm font-medium text-slate-700">
            Full name
          </Label>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            placeholder="Jane Smith"
            required
            autoComplete="name"
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
            Work email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="jane@school.edu"
            required
            autoComplete="email"
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
              className="h-11 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm_password" className="text-sm font-medium text-slate-700">
            Confirm password
          </Label>
          <Input
            id="confirm_password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Repeat your password"
            required
            autoComplete="new-password"
            className="h-11"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 font-semibold bg-blue-700 hover:bg-blue-800 text-white mt-2"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create account'}
        </Button>

        <p className="text-center text-xs text-slate-400">
          By signing up, you agree to our{' '}
          <span className="underline cursor-pointer text-slate-500">Terms of Service</span> and{' '}
          <span className="underline cursor-pointer text-slate-500">Privacy Policy</span>.
        </p>
      </form>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-blue-700 hover:text-blue-800 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
