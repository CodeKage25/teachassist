import { MarketingNav } from '@/components/layout/MarketingNav'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} TeachAssist. Built for educators, by educators.</p>
      </footer>
    </div>
  )
}
