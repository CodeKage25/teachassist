'use client'

import { useState } from 'react'
import { inviteTeacher } from '@/lib/actions/teachers'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, UserPlus, Copy, Check, KeyRound } from 'lucide-react'

interface AddTeacherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddTeacherDialog({ open, onOpenChange }: AddTeacherDialogProps) {
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedPassword, setCopiedPassword] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await inviteTeacher(formData)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else if (result?.email && result?.password) {
      setCredentials({ email: result.email, password: result.password })
    }
  }

  async function copyText(text: string, type: 'email' | 'password') {
    await navigator.clipboard.writeText(text)
    if (type === 'email') {
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    } else {
      setCopiedPassword(true)
      setTimeout(() => setCopiedPassword(false), 2000)
    }
  }

  function handleClose() {
    setCredentials(null)
    onOpenChange(false)
  }

  // Step 2: Show credentials after creation
  if (credentials) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
                <KeyRound className="h-3.5 w-3.5 text-white" />
              </div>
              Teacher account created
            </DialogTitle>
            <DialogDescription>
              Share these login credentials with the teacher. The password cannot be retrieved later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Email</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-slate-900 flex-1 truncate">{credentials.email}</p>
                  <button
                    onClick={() => copyText(credentials.email, 'email')}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    {copiedEmail ? <Check className="h-4 w-4 text-teal-600" /> : <Copy className="h-4 w-4 text-slate-500" />}
                  </button>
                </div>
              </div>
              <div className="border-t border-slate-200" />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Password</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-slate-900 flex-1">{credentials.password}</p>
                  <button
                    onClick={() => copyText(credentials.password, 'password')}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    {copiedPassword ? <Check className="h-4 w-4 text-teal-600" /> : <Copy className="h-4 w-4 text-slate-500" />}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              The teacher should change their password after first login.
            </p>
          </div>

          <Button
            onClick={handleClose}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white cursor-pointer"
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    )
  }

  // Step 1: Invite form
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-700" />
            Add Teacher
          </DialogTitle>
          <DialogDescription>
            A login account will be created immediately with a generated password.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              name="full_name"
              placeholder="Jane Smith"
              required
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="jane@school.edu"
              required
              className="h-10"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-700 hover:bg-blue-800 text-white cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Create Account'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
