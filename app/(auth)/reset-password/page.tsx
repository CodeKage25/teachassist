'use client'

import { useState } from 'react'
import { updatePassword } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError(null)
    const result = await updatePassword(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Set new password</h1>
        <p className="text-muted-foreground text-sm mt-1">Choose a strong password for your account.</p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
            New password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              minLength={8}
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm" className="text-sm font-medium text-foreground/80">
            Confirm password
          </Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            className="h-11"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update password'}
        </Button>
      </form>
    </div>
  )
}
