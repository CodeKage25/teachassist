import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendTeacherWelcomeEmail({
  to,
  teacherName,
  schoolName,
  email,
  password,
  loginUrl,
}: {
  to: string
  teacherName: string
  schoolName: string
  email: string
  password: string
  loginUrl: string
}) {
  if (!resend) {
    // Graceful fallback: no email service configured
    console.warn('RESEND_API_KEY not set — skipping welcome email for', to)
    return { skipped: true }
  }

  const { data, error } = await resend.emails.send({
    from: 'TeachAssist <onboarding@resend.dev>',
    to,
    subject: `Your ${schoolName} teacher account is ready`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 0;">
  <div style="max-width: 480px; margin: 40px auto; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
    <div style="background: #1d4ed8; padding: 28px 32px;">
      <h1 style="color: #fff; margin: 0; font-size: 20px; font-weight: 700;">Welcome to ${schoolName}</h1>
      <p style="color: #bfdbfe; margin: 6px 0 0; font-size: 14px;">Your teacher account has been created</p>
    </div>
    <div style="padding: 32px;">
      <p style="color: #374151; font-size: 15px; margin: 0 0 24px;">Hi ${teacherName},</p>
      <p style="color: #374151; font-size: 15px; margin: 0 0 24px;">
        Your school administrator has set up a TeachAssist account for you. Use the credentials below to sign in.
      </p>
      <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="margin-bottom: 14px;">
          <p style="color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">Email</p>
          <p style="color: #0f172a; font-family: monospace; font-size: 15px; margin: 0;">${email}</p>
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 14px;">
          <p style="color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">Password</p>
          <p style="color: #0f172a; font-family: monospace; font-size: 15px; margin: 0;">${password}</p>
        </div>
      </div>
      <a href="${loginUrl}" style="display: inline-block; background: #1d4ed8; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; margin-bottom: 24px;">
        Sign in to TeachAssist →
      </a>
      <p style="color: #94a3b8; font-size: 13px; margin: 0;">
        Please change your password after your first login for security.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  })

  if (error) {
    console.error('Failed to send teacher welcome email:', error)
    return { error }
  }

  return { data }
}
