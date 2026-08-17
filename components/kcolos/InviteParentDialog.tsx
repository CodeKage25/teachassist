'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { inviteParent } from '@/lib/actions/kcolos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function InviteParentDialog({
  studentId,
  studentName,
}: {
  studentId: string
  studentName: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', relationship: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.warning('Name and email are required')
      return
    }

    setSaving(true)
    const result = await inviteParent({
      email: form.email,
      fullName: form.fullName,
      studentId,
      relationship: form.relationship,
    })
    setSaving(false)

    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(
      result.isNewAccount
        ? `Invitation sent to ${result.email}`
        : `Existing account linked to ${studentName}`
    )
    setOpen(false)
    setForm({ fullName: '', email: '', relationship: '' })
    router.refresh()
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" />
        Invite parent
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite a parent</DialogTitle>
            <DialogDescription>
              They&apos;ll get login details by email and can follow {studentName}&apos;s
              published reports and attendance.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ip-name">Full name *</Label>
              <Input
                id="ip-name"
                placeholder="e.g. Mrs. Adeola Bello"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ip-email">Email *</Label>
              <Input
                id="ip-email"
                type="email"
                placeholder="parent@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ip-rel">
                Relationship{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="ip-rel"
                placeholder="Mother, Father, Guardian…"
                value={form.relationship}
                onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Send invite
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
