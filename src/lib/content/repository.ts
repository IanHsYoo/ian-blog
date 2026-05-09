import type { BlogPost } from '@/types'
import { markdownAdapter } from './adapters/markdown-adapter'
import { notionAdapter } from './adapters/notion-adapter'
import { assertNoSlugCollisions, normalize, sortByPublishedDateDesc } from './normalize'
import type { ContentSourceAdapter, RawPost } from './types'

const ADAPTERS: ContentSourceAdapter[] = [markdownAdapter, notionAdapter]

async function listAllRawPosts(): Promise<RawPost[]> {
  const enabledAdapters = ADAPTERS.filter((a) => a.enabled)
  const results = await Promise.all(enabledAdapters.map((a) => a.listPosts()))
  return results.flat()
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const raw = await listAllRawPosts()
  assertNoSlugCollisions(raw)
  return sortByPublishedDateDesc(raw.map(normalize))
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  // Probe each enabled adapter; collision means same slug in two sources.
  const enabledAdapters = ADAPTERS.filter((a) => a.enabled)
  const results = await Promise.all(
    enabledAdapters.map((a) => a.getPostBySlug(slug))
  )
  const hits = results.filter((r): r is RawPost => r !== null)

  if (hits.length === 0) return null
  if (hits.length > 1) {
    assertNoSlugCollisions(hits) // throws SlugCollisionError
  }
  return normalize(hits[0])
}

export async function getAllSlugs(): Promise<string[]> {
  const posts = await getPublishedPosts()
  return posts.map((p) => p.slug).filter(Boolean)
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getPublishedPosts()
  const set = new Set<string>()
  posts.forEach((p) => p.tags.forEach((t) => set.add(t)))
  return Array.from(set).sort()
}

export async function getAllCategories(): Promise<string[]> {
  const posts = await getPublishedPosts()
  const set = new Set<string>()
  posts.forEach((p) => set.add(p.category))
  return Array.from(set).sort()
}

export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const posts = await getPublishedPosts()
  return posts.filter((p) => p.tags.includes(tag))
}

export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const posts = await getPublishedPosts()
  return posts.filter((p) => p.category === category)
}
