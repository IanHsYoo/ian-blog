import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import { TagBadge } from '@/components/blog/TagBadge'
import type { BlogPost } from '@/types'

interface PostCardProps {
  post: BlogPost
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
      data-testid="post-card"
    >
      {/* Cover image */}
      {post.coverImage && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} href={`/tags/${encodeURIComponent(tag)}`} />
            ))}
          </div>
        )}

        {/* Title */}
        <Link href={`/blog/${post.slug}`} data-testid="post-card-title-link">
          <h2 className="text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {/* Description */}
        {post.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {post.description}
          </p>
        )}

        {/* Meta: date + reading time */}
        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
          <time dateTime={post.publishedDate} data-testid="post-card-date">
            {formatDate(post.publishedDate)}
          </time>
          {post.readingTime && (
            <>
              <span aria-hidden="true">·</span>
              <span>{post.readingTime} min read</span>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
