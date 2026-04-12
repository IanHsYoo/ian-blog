# 컴포넌트 메서드 정의서 (v2)

## 라우트 레벨 메서드

### HomePage
- `getLatestPosts(limit: number): Promise<BlogPostSummary[]>`
  - 목적: 최신 발행 포스트 목록 조회

### BlogListPage
- `getPublishedPosts(filters?: PostFilters): Promise<BlogPostSummary[]>`
  - 입력: `category?`, `tag?`, `page?`
  - 출력: 필터링된 발행 포스트 목록

### BlogPostPage
- `getPostBySlug(slug: string): Promise<BlogPostDetail | null>`
- `getAllSlugs(): Promise<string[]>`
- `buildPostMetadata(slug: string): Promise<PageMetadata>`

### AboutPage
- `getPortfolioProfile(): Promise<ProfileData>`
- `getPortfolioProjects(): Promise<ProjectData[]>`
- `getPortfolioExperiences(): Promise<ExperienceData[]>`
- `getPortfolioSkills(): Promise<SkillGroupData[]>`

### CategoryPage / TagPage
- `getPostsByCategory(category: string): Promise<BlogPostSummary[]>`
- `getPostsByTag(tag: string): Promise<BlogPostSummary[]>`

## 프레젠테이션 컴포넌트 Props 인터페이스

### PostCard
- `post: BlogPostSummary`
- `showCategory?: boolean`
- `showTags?: boolean`

### PostList
- `posts: BlogPostSummary[]`
- `emptyMessage?: string`

### PostContent
- `markdown: string`
- `toc?: TocItem[]`

### Portfolio 컴포넌트
- `ProjectList({ projects: ProjectData[] })`
- `ExperienceTimeline({ experiences: ExperienceData[] })`
- `SkillMatrix({ skillGroups: SkillGroupData[] })`

## 서비스 레이어 메서드 시그니처

### Repository (`src/lib/content/repository.ts`)
- `listPublishedPosts(filters?: PostFilters): Promise<BlogPostSummary[]>`
- `readPost(slug: string): Promise<BlogPostDetail | null>`
- `listSlugs(): Promise<string[]>`
- `listCategories(): Promise<string[]>`
- `listTags(): Promise<string[]>`

### Markdown Loader (`src/lib/content/markdown-loader.ts`)
- `loadPostFiles(): Promise<RawMarkdownDocument[]>`
- `parsePostDocument(raw: RawMarkdownDocument): ParsedPostDocument`
- `validateFrontmatter(meta: Record<string, unknown>): FrontmatterValidationResult`

### Portfolio Loader (`src/lib/content/portfolio-loader.ts`)
- `loadProjects(): Promise<ProjectData[]>`
- `loadExperiences(): Promise<ExperienceData[]>`
- `loadSkills(): Promise<SkillGroupData[]>`

### Metadata Builder (`src/lib/content/metadata.ts`)
- `createPostMetadata(post: BlogPostDetail): PageMetadata`
- `createSitemapItems(posts: BlogPostSummary[]): SitemapItem[]`
- `createFeedItems(posts: BlogPostSummary[]): FeedItem[]`

## 타입 요약
- `BlogPostSummary`: 목록용 최소 정보
- `BlogPostDetail`: 본문/SEO 포함 상세 정보
- `PostFilters`: `category`, `tag`, `status`, `limit`, `cursor`
- `PageMetadata`: `title`, `description`, `openGraph`, `twitter`

## 참고
- 상세 비즈니스 규칙(에러 처리 세부 정책, 우선순위 충돌 해소)은 CONSTRUCTION 단계의 Functional/NFR 설계에서 구체화한다.
