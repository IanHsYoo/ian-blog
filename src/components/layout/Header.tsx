import Link from 'next/link'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

const NAV_LINKS = [
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        {/* Logo / Site name */}
        <Link
          href="/"
          className="font-semibold tracking-tight text-foreground transition-opacity hover:opacity-75"
          data-testid="header-logo"
        >
          {process.env.NEXT_PUBLIC_SITE_NAME ?? 'Blog'}
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              data-testid={`nav-link-${label.toLowerCase()}`}
            >
              {label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
