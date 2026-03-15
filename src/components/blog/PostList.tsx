import { PostCard } from '@/components/blog/PostCard'
import type { BlogPost } from '@/types'

interface PostListProps {
  posts: BlogPost[]
  emptyMessage?: string
}

export function PostList({
  posts,
  emptyMessage = 'No posts found.',
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <div
        className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border"
        data-testid="post-list-empty"
      >
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="post-list"
    >
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
