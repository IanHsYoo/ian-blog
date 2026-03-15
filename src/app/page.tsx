import Link from 'next/link'
import type { Metadata } from 'next'
import { PostList } from '@/components/blog/PostList'
import { getPublishedPosts } from '@/lib/notion/queries'

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Blog',
  description: `Personal blog by ${process.env.NEXT_PUBLIC_AUTHOR_NAME ?? 'Ian'}`,
}

const RECENT_POSTS_LIMIT = 6

export default async function HomePage() {
  const allPosts = await getPublishedPosts()
  const recentPosts = allPosts.slice(0, RECENT_POSTS_LIMIT)

  const authorName = process.env.NEXT_PUBLIC_AUTHOR_NAME ?? 'Ian'
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Blog'

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="mb-16 flex flex-col gap-5"
        aria-labelledby="hero-heading"
        data-testid="hero-section"
      >
        <div className="space-y-1">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Welcome to
          </p>
          <h1
            id="hero-heading"
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
          >
            {siteName}
          </h1>
        </div>

        <p className="max-w-xl text-lg text-muted-foreground">
          Hi, I&apos;m <span className="font-medium text-foreground">{authorName}</span>.
          I write about software development, cloud infrastructure, and things I find interesting.
          Posts are managed with{' '}
          <span className="font-medium text-foreground">Notion</span> and deployed on{' '}
          <span className="font-medium text-foreground">AWS</span>.
        </p>

        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            data-testid="hero-cta-blog"
          >
            Read the blog
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/about"
            className="inline-flex items-center rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            data-testid="hero-cta-about"
          >
            About me
          </Link>
        </div>
      </section>

      {/* ─── Recent Posts ─────────────────────────────────────────────────── */}
      <section aria-labelledby="recent-posts-heading" data-testid="recent-posts-section">
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="recent-posts-heading"
            className="text-xl font-semibold text-foreground"
          >
            Recent Posts
          </h2>

          {allPosts.length > RECENT_POSTS_LIMIT && (
            <Link
              href="/blog"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              data-testid="view-all-posts-link"
            >
              View all →
            </Link>
          )}
        </div>

        <PostList
          posts={recentPosts}
          emptyMessage="No posts yet. Check back soon!"
        />
      </section>
    </div>
  )
}
