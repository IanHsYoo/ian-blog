# Plan: Notion + 마크다운 하이브리드 v2 완성

## 메타데이터
- **작성일**: 2026-05-08
- **대상 브랜치**: feature/add-aidlc
- **AI-DLC 단계**: Construction Phase, NFR Requirements (blog-v2) 검토 후 진입
- **참조 문서**:
  - `aidlc-docs/inception/requirements/requirements.md`
  - `aidlc-docs/inception/application-design/application-design.md`
  - `aidlc-docs/inception/application-design/components.md`
  - `aidlc-docs/construction/blog-v2/nfr-requirements/tech-stack-decisions.md`

---

## 요구사항 요약

### 결정된 방향성
- **콘텐츠 소스 전략**: Notion + Markdown 하이브리드, 어댑터 패턴
- **소스 우선순위 정책**: **소스 분리(겹침 금지)** — 같은 slug가 양쪽에 존재하면 빌드 실패
- **범위**: v2 전체 FR(FR-01 ~ FR-09) 완성. 인프라(Terraform/CI)는 별도 plan으로 분리
- **렌더링**: 정적 export(`output: 'export'`) 유지, 빌드 타임에 모든 콘텐츠 사전 페칭

### 현재 상태
- 구현 완료: `src/lib/notion/{client,queries,renderer}.ts`, `src/app/page.tsx`, 레이아웃/블로그 카드 컴포넌트
- 미구현: `/blog`, `/blog/[slug]`, `/about`, `/categories/[category]`, `/tags/[tag]`, RSS, sitemap, robots
- 누락된 데이터 레이어: `src/lib/content/*` (어댑터 패턴), 마크다운 로더, Category 속성, 포트폴리오 로더

---

## 수용 기준 (Acceptance Criteria)

### A. 데이터 레이어
- [ ] `src/lib/content/repository.ts`가 단일 진입점으로 `getPublishedPosts`, `getPostBySlug`, `getAllSlugs`, `getAllTags`, `getAllCategories`, `getPostsByTag`, `getPostsByCategory`를 제공한다.
- [ ] `MarkdownAdapter`와 `NotionAdapter` 두 어댑터가 동일한 `ContentSourceAdapter` 인터페이스를 구현한다.
- [ ] 두 어댑터의 결과가 합쳐질 때 `slug` 충돌이 감지되면 `Error: Slug collision: "${slug}" exists in both Notion and Markdown sources`로 빌드를 실패시킨다.
- [ ] Notion 미설정(env 누락) 시 마크다운만으로 빌드가 정상 진행된다.
- [ ] 마크다운 콘텐츠 디렉토리(`content/posts/`)가 비어 있어도 Notion만으로 빌드가 정상 진행된다.

### B. 도메인 모델
- [ ] `BlogPost` 타입에 `category: string`, `source: 'notion' | 'markdown'` 필드가 추가된다.
- [ ] `BlogPost.publishedDate`는 ISO-8601 문자열로 정규화된다.
- [ ] `BlogPost.readingTime`은 모든 단건 조회 결과에서 계산되어 반환된다.
- [ ] frontmatter 또는 Notion 속성에서 `Category` 누락 시 `'Uncategorized'`로 채워진다.

### C. 라우팅 (Next.js App Router, 정적 export)
- [ ] `/blog/page.tsx`: 모든 발행 포스트를 날짜 내림차순 표시. URL 파라미터 `?category=&tag=` 클라이언트 필터로 동작 (정적 export 호환).
- [ ] `/blog/[slug]/page.tsx`: `generateStaticParams`로 모든 slug pre-render. shiki 구문 강조 + 메타데이터(OG/Twitter) 포함.
- [ ] `/categories/[category]/page.tsx`: `generateStaticParams`로 모든 카테고리 pre-render.
- [ ] `/tags/[tag]/page.tsx`: `generateStaticParams`로 모든 태그 pre-render.
- [ ] `/about/page.tsx`: 프로필 + 프로젝트 + 경력 타임라인 + 스킬셋 섹션 렌더.

### D. SEO/피드
- [ ] `/sitemap.xml`이 빌드 시 자동 생성되며 모든 라우트를 포함한다.
- [ ] `/robots.txt`가 정적 자산으로 노출된다.
- [ ] `/feed.xml` RSS 2.0이 빌드 시 자동 생성되며 모든 발행 포스트의 `title/link/description/pubDate/category`를 포함한다.

### E. 품질 게이트
- [ ] `yarn type-check` 통과
- [ ] `yarn lint` 통과
- [ ] `yarn build` 통과 (정적 export 산출 `out/` 생성)
- [ ] 단위 테스트: slug 충돌 감지, 마크다운 frontmatter 파서, 정규화 로직

---

## 단계별 구현 (Implementation Steps)

### Phase 1: 도메인 타입 및 인터페이스 확장
- **파일**: `src/types/index.ts`
  - `BlogPost`에 `category: string`, `source: 'notion' | 'markdown'` 추가.
  - 신규 타입: `ContentSource`, `RawPost`(어댑터 출력 정규화 전 형태).
- **신규 파일**: `src/lib/content/types.ts`
  - 인터페이스 `ContentSourceAdapter`: `listPosts(): Promise<RawPost[]>`, `getPostBySlug(slug): Promise<RawPost | null>`.

### Phase 2: 마크다운 어댑터 구축
- **신규 파일**: `src/lib/content/adapters/markdown-adapter.ts`
  - 의존성 추가: `gray-matter`(frontmatter 파싱), `glob`(파일 스캔). `package.json` dependencies에 추가.
  - `content/posts/*.md` 스캔 → frontmatter(title/slug/description/category/tags/status/publishedDate/coverImage) + body 파싱.
  - `status === 'published'` 필터, `slug` 누락 시 파일명에서 유도.
- **신규 디렉토리**: `content/posts/` (예시 파일 1개 포함: `welcome-to-blog.md`).
- **gitignore 점검**: `content/posts/`는 커밋 대상이므로 ignore에서 제외.

### Phase 3: Notion 어댑터로 기존 코드 리팩터링
- **이동**: `src/lib/notion/{client,queries,renderer}.ts` → `src/lib/content/adapters/notion-adapter.ts` (또는 `src/lib/content/adapters/notion/{client,queries,renderer}.ts`로 분할).
- 기존 `getPublishedPosts`, `getPostBySlug` 등을 `ContentSourceAdapter` 인터페이스에 맞춰 재구성.
- Notion DB 스키마 확장: `Category` (select) 속성 추가 가정 → `getSelectProperty()` 헬퍼 추가, 누락 시 `'Uncategorized'` 반환.
- 단순 `mapPageToPost` → `mapPageToRawPost`로 변경하여 정규화 책임을 repository로 이관.
- Notion 미설정(env 누락) 시 `listPosts()`는 빈 배열 반환, `getPostBySlug()`는 `null` 반환.

### Phase 4: ContentRepository(소스 전략) 구축
- **신규 파일**: `src/lib/content/repository.ts`
  - `getPublishedPosts()`: 두 어댑터의 `listPosts()` 결과 병합 + slug 충돌 감지 + 정규화 + `publishedDate` 내림차순 정렬.
  - `getPostBySlug(slug)`: 마크다운 → Notion 순서로 조회하되 양쪽 모두 결과가 있으면 충돌 에러.
  - `getAllSlugs()`, `getAllTags()`, `getAllCategories()`, `getPostsByTag()`, `getPostsByCategory()`.
- **신규 파일**: `src/lib/content/normalize.ts`
  - `RawPost → BlogPost` 정규화 (날짜 ISO-8601, 빈 필드 채우기, `readingTime` 계산).
- **충돌 감지 로직**: `Map<slug, source>` 사용해 두 번째 등록 시 명시적 에러 throw.

### Phase 5: 기존 페이지 데이터 소스 교체
- `src/app/page.tsx`: `import { getPublishedPosts } from '@/lib/notion/queries'` → `import { getPublishedPosts } from '@/lib/content/repository'`.
- 동일하게 빌드되는지 확인 (Notion 단독 모드).

### Phase 6: Blog 라우트 구현
- **신규**: `src/app/blog/page.tsx`
  - 서버 컴포넌트로 `getPublishedPosts()` 호출.
  - 클라이언트 필터링 컴포넌트 `<BlogListClient>` 분리(`'use client'`) — URL 파라미터(`category`, `tag`) 읽어 필터링.
- **신규**: `src/app/blog/[slug]/page.tsx`
  - `generateStaticParams` → `getAllSlugs()` 사용.
  - `generateMetadata` → 동적 OG/Twitter 메타.
  - shiki로 코드 블록 사전 하이라이트(빌드 타임), `react-markdown` + `remark-gfm` + `rehype-raw`로 렌더.
- **신규 컴포넌트**:
  - `src/components/blog/PostContent.tsx`: 마크다운 본문 렌더러 래퍼.
  - `src/components/blog/CategoryBadge.tsx`: 카테고리 뱃지.
  - `src/components/blog/BlogListClient.tsx`: 클라이언트 필터.

### Phase 7: 카테고리/태그 라우트 구현
- **신규**: `src/app/categories/[category]/page.tsx` + `generateStaticParams`로 `getAllCategories()` 사용.
- **신규**: `src/app/tags/[tag]/page.tsx` + `generateStaticParams`로 `getAllTags()` 사용.
- 빈 상태 처리 (포스트 없음 메시지).

### Phase 8: About 페이지 + 포트폴리오
- **신규 디렉토리**: `content/portfolio/`
  - `profile.json`(name, tagline, bio)
  - `projects.json`(title, description, stack, github, demo)
  - `experience.json`(period, role, company, description)
  - `skills.json`(category, items[])
- **신규 파일**: `src/lib/content/portfolio-loader.ts` — JSON 로드 + 타입 검증.
- **신규 컴포넌트**:
  - `src/components/portfolio/ProjectList.tsx`
  - `src/components/portfolio/ExperienceTimeline.tsx`
  - `src/components/portfolio/SkillMatrix.tsx`
- **신규 페이지**: `src/app/about/page.tsx` — 위 섹션 조합.

### Phase 9: SEO/피드/사이트맵
- **신규**: `src/app/sitemap.ts` (Next.js 16 sitemap 컨벤션 사용).
- **신규**: `src/app/robots.ts` 또는 `public/robots.txt`.
- **신규**: `src/app/feed.xml/route.ts` — Next.js 정적 export 호환을 위해 빌드 스크립트로 생성하거나 `export const dynamic = 'force-static'` 설정.
  - 정적 export에서 라우트 핸들러는 제약이 있으므로, 대안으로 `scripts/generate-feed.ts`를 만들어 `next build` 후 `out/feed.xml`로 출력하는 방식 채택. `package.json`의 `build` 스크립트에 후처리 추가.
- **신규 파일**: `src/lib/content/metadata.ts` — sitemap/RSS용 데이터 추출 헬퍼.

### Phase 10: 검증 및 문서화
- 단위 테스트(추후 도입 가능, 우선 `node --test` 또는 `vitest`):
  - `tests/content/repository.test.ts` — 충돌 감지 케이스
  - `tests/content/markdown-adapter.test.ts` — frontmatter 누락/잘못된 형식
  - `tests/content/normalize.test.ts` — 날짜 정규화, readingTime 계산
- AI-DLC 산출물 갱신:
  - `aidlc-docs/construction/blog-v2/functional-design/` (간이) — 어댑터 인터페이스 명세
  - `aidlc-docs/construction/blog-v2/code-generation-plan.md` — 본 plan을 AI-DLC 형식으로 옮기고 체크박스 동기화
  - `aidlc-docs/aidlc-state.md` 진행 상태 업데이트
  - `aidlc-docs/audit.md` 사용자 입력 로그 추가

---

## 위험 및 완화 (Risks and Mitigations)

| 위험 | 영향 | 완화 |
|---|---|---|
| Notion API 빌드 시 호출 실패(네트워크/레이트리밋) | 빌드 실패 | 어댑터 단에서 재시도(지수 백오프 3회) + 명확한 에러 메시지. CI에서 `NOTION_API_KEY` 누락 시 마크다운만으로 빌드되도록 graceful fallback 유지 |
| 정적 export에서 RSS/sitemap 라우트 핸들러 제약 | RSS 미생성 | `scripts/generate-feed.ts` 후처리 방식 채택. `next build && node scripts/generate-feed.mjs` 체이닝 |
| Notion DB에 Category 속성이 없음 | 빌드 시 카테고리 누락 | `getSelectProperty()`에서 누락 시 `'Uncategorized'` 폴백. Notion DB 스키마 확장 가이드 README에 명시 |
| 마크다운 frontmatter와 Notion 속성 이름 불일치 | 정규화 단계에서 누락 | `normalize.ts`에서 양쪽 입력을 동일한 `RawPost` 형태로 강제. 누락 필수 필드 발견 시 빌드 실패 (slug, title, publishedDate) |
| 같은 slug 충돌 빌드 실패 운영 부담 | 콘텐츠 발행 차단 | CLI 스크립트 `scripts/check-slug-conflicts.mjs` 제공. PR 단계에서 GitHub Actions로 사전 검증 추가 권장 |
| `output: 'export'`와 클라이언트 필터(URL 파라미터)의 SEO 영향 | 카테고리/태그 페이지가 우선 노출 | `/blog`는 클라이언트 필터, `/categories/[category]` `/tags/[tag]`는 정적 라우트로 보강하여 SEO 커버 |
| `notion-to-md` 결과의 마크다운 품질 차이 | 코드 블록/이미지 렌더 불일치 | `PostContent`에서 `remark-gfm` + `rehype-raw` + shiki 일관 적용. 회귀 검증을 위해 샘플 포스트 1편(Notion/Markdown 각각)을 회귀 테스트 케이스로 보존 |
| 추가 의존성(`gray-matter`, `glob`) 도입 부담 | 번들 크기/감사 부담 | 둘 다 빌드 타임 전용(서버 컴포넌트 only). 클라이언트 번들에 포함되지 않도록 `import` 위치 검증 |

---

## 검증 단계 (Verification Steps)

1. **로컬 단독 모드 검증**
   - `.env.local`에서 Notion 변수 제거 → `yarn dev` → 마크다운 포스트만 노출되는지 확인.
   - `content/posts/` 비우고 Notion 변수 설정 → Notion 포스트만 노출되는지 확인.
2. **충돌 감지 검증**
   - 동일 `slug`의 마크다운 파일 + Notion 페이지 동시 존재 → `yarn build` 실패 + 명확한 에러 메시지 확인.
3. **정적 빌드 검증**
   - `yarn build` 성공 → `out/` 생성 → `out/blog/[slug]/index.html`이 모든 발행 포스트에 대해 존재 확인.
   - `out/feed.xml`, `out/sitemap.xml`, `out/robots.txt` 존재 확인.
4. **SEO 메타 검증**
   - 단건 페이지 HTML에서 `og:title`, `og:description`, `twitter:card` 메타 존재 확인.
5. **품질 게이트**
   - `yarn type-check`, `yarn lint`, `yarn build` 3종 통과.
6. **수용 기준 체크리스트**
   - 위 A~E 섹션 체크박스를 모두 [x]로 마감.

---

## 실행 순서 권장

```text
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 (회귀 확인)
        → Phase 6 → Phase 7 → Phase 8 → Phase 9 → Phase 10
```

- Phase 5 완료 시 기존 홈페이지가 새 repository로 정상 동작하는지 한 번 확인하는 것이 핵심 회귀 게이트.
- Phase 6~8은 페이지별로 독립적이라 병렬 작업 가능.
- Phase 9는 모든 페이지가 안정화된 후 마지막에 진행.

---

## 범위 외 (Out of Scope, 본 plan)

- Terraform/AWS 인프라 프로비저닝 — 별도 plan
- GitHub Actions CI/CD 워크플로 — 별도 plan
- 댓글/뉴스레터/검색/분석 통합 — v2 범위 외 (기존 결정 유지)
- Notion DB 스키마 마이그레이션 도구화 — 수동 가이드로 대체
