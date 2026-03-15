# Code Generation Plan — Main Page (Unit: main-page)

## Unit Context
- **Unit**: main-page (Home page + foundational project setup)
- **Goal**: Bootstrap Next.js project and implement the Home page with hero + recent posts
- **Dependencies**: None (first unit)
- **Stories covered**: FR-01 (Notion data layer), FR-02 (Main page)

---

## Step-by-Step Plan

### Phase A — Project Bootstrap
- [x] Step 1: `package.json` — dependencies, scripts
- [x] Step 2: `tsconfig.json` — strict TypeScript + path aliases
- [x] Step 3: `next.config.js` — static export + security headers
- [x] Step 4: `tailwind.config.ts` — dark mode class, content paths, custom tokens
- [x] Step 5: `postcss.config.js`
- [x] Step 6: `.env.example` — documented env vars
- [x] Step 7: `.gitignore` updates

### Phase B — Foundation
- [x] Step 8: `src/styles/globals.css` — Tailwind base + CSS custom properties (light + dark tokens)
- [x] Step 9: `src/types/index.ts` — `BlogPost` domain type
- [x] Step 10: `src/lib/utils.ts` — `cn()`, `formatDate()`, `estimateReadingTime()`

### Phase C — Notion Data Layer
- [x] Step 11: `src/lib/notion/client.ts` — SDK singleton
- [x] Step 12: `src/lib/notion/queries.ts` — `getPublishedPosts`, `getAllSlugs`, `getAllTags`, `getPostBySlug`, `getPostsByTag`
- [x] Step 13: `src/lib/notion/renderer.ts` — `getPostContent()`

### Phase D — Layout Components
- [x] Step 14: `src/components/shared/ThemeToggle.tsx`
- [x] Step 15: `src/components/layout/Header.tsx`
- [x] Step 16: `src/components/layout/Footer.tsx`
- [x] Step 17: `src/app/layout.tsx` — RootLayout

### Phase E — Blog Components
- [x] Step 18: `src/components/blog/TagBadge.tsx`
- [x] Step 19: `src/components/blog/PostCard.tsx`
- [x] Step 20: `src/components/blog/PostList.tsx`

### Phase F — Main Page
- [x] Step 21: `src/app/page.tsx` — HomePage (Hero + PostList)

---

## Completion Criteria
- [ ] `pnpm tsc --noEmit` passes with zero errors
- [ ] `pnpm build` generates `/out` directory
- [ ] Main page renders hero section + post grid
- [ ] Dark mode toggle functional
- [ ] No client-side Notion calls
