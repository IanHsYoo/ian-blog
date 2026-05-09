import { estimateReadingTime } from '@/lib/utils'
import type { BlogPost, ContentSource } from '@/types'
import { SlugCollisionError, type RawPost } from './types'

const DEFAULT_CATEGORY = 'Uncategorized'

function toIsoDate(value: string): string {
  if (!value) return ''
  // Date-only inputs (YYYY-MM-DD) survive new Date() round-trip; full ISO timestamps too.
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toISOString()
}

export function normalize(raw: RawPost): BlogPost {
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    description: raw.description,
    category: raw.category?.trim() || DEFAULT_CATEGORY,
    tags: raw.tags,
    publishedDate: toIsoDate(raw.publishedDate),
    coverImage: raw.coverImage,
    source: raw.source,
    readingTime: raw.content ? estimateReadingTime(raw.content) : undefined,
    content: raw.content,
  }
}

/**
 * Detect slug collisions across multiple sources.
 * Throws SlugCollisionError if any slug appears in more than one source.
 */
export function assertNoSlugCollisions(rawPosts: RawPost[]): void {
  const bySlug = new Map<string, Set<ContentSource>>()
  for (const post of rawPosts) {
    if (!post.slug) {
      throw new Error(`RawPost missing slug: id=${post.id}`)
    }
    const set = bySlug.get(post.slug) ?? new Set<ContentSource>()
    set.add(post.source)
    bySlug.set(post.slug, set)
  }

  for (const [slug, sources] of bySlug) {
    if (sources.size > 1) {
      throw new SlugCollisionError(slug, Array.from(sources))
    }
  }
}

export function sortByPublishedDateDesc(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => b.publishedDate.localeCompare(a.publishedDate))
}
