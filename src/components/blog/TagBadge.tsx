import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TagBadgeProps {
  tag: string
  active?: boolean
  href?: string
  className?: string
}

export function TagBadge({ tag, active, href, className }: TagBadgeProps) {
  const baseClass = cn(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
    active
      ? 'bg-primary text-primary-foreground'
      : 'bg-muted text-muted-foreground hover:bg-muted/80',
    className
  )

  if (href) {
    return (
      <Link href={href} className={baseClass} data-testid={`tag-badge-${tag}`}>
        {tag}
      </Link>
    )
  }

  return (
    <span className={baseClass} data-testid={`tag-badge-${tag}`}>
      {tag}
    </span>
  )
}
