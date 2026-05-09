# Code Generation Plan — blog-v2 (Notion + 마크다운 하이브리드)

## Unit Context
- **Unit**: blog-v2 (전체 v2 기능 완성)
- **Goal**: Notion + Markdown 하이브리드 콘텐츠 레이어 + 미구현 페이지(/blog, /blog/[slug], /about, /categories, /tags) + SEO/RSS/sitemap
- **Dependencies**: main-page (Phase A~F 완료) — 홈페이지/레이아웃/Notion 단일 어댑터 코드 존재
- **Stories covered**: FR-01 ~ FR-09 (NFR은 별도 plan)

---

## 결정 사항 (요약)
- **콘텐츠 소스 전략**: Notion + Markdown 어댑터 패턴
- **소스 충돌 정책**: **소스 분리 (겹침 금지)** — 동일 slug 양쪽 존재 시 빌드 실패
- **인프라(Terraform/CI)**: 본 plan 범위 외, 별도 plan에서 처리
- **참조**:
  - 상위 plan: `.omc/plans/notion-markdown-hybrid-v2-plan.md`
  - Notion 셋업: `aidlc-docs/construction/blog-v2/notion-setup-guide.md`
  - 애플리케이션 설계: `aidlc-docs/inception/application-design/*`

---

## Step-by-Step Plan

### Phase G — 도메인 타입 및 인터페이스 확장 ✅
- [x] Step 1: `src/types/index.ts` — `BlogPost`에 `category: string`, `source: 'notion' | 'markdown'` 필드 추가
- [x] Step 2: `src/lib/content/types.ts` (신규) — `RawPost`, `ContentSourceAdapter`, `SlugCollisionError` 정의

### Phase H — 마크다운 어댑터 구축 ✅
- [x] Step 3: `package.json` — `gray-matter@4.0.3`, `glob@13.0.6` 추가
- [x] Step 4: `src/lib/content/adapters/markdown-adapter.ts` — frontmatter 파서 + Date 강제 변환(`coerceDate`)
- [x] Step 5: `content/posts/welcome-to-blog.md` 검증용 샘플 포스트
- [x] Step 6: `.gitignore` 점검 완료 — `content/posts/` 커밋 가능 확인

### Phase I — Notion 어댑터 리팩터링 ✅
- [x] Step 7: `src/lib/content/adapters/notion-adapter.ts` (신규, 기존 `src/lib/notion/*` 통합 재배치)
- [x] Step 8: `Category` (select) 속성 처리 헬퍼 추가, 누락 시 normalize에서 `'Uncategorized'` 폴백
- [x] Step 9: `mapPageToRawPost`로 변경 — 정규화 책임을 repository로 이관
- [x] Step 10: 기존 `src/lib/notion/` 디렉토리 삭제

### Phase J — ContentRepository(소스 전략) 구축 ✅
- [x] Step 11: `src/lib/content/normalize.ts` — `RawPost → BlogPost` 정규화 + `assertNoSlugCollisions`
- [x] Step 12: `src/lib/content/repository.ts` — 7개 진입점 (`getPublishedPosts`, `getPostBySlug`, `getAllSlugs`, `getAllTags`, `getAllCategories`, `getPostsByTag`, `getPostsByCategory`)
- [x] Step 13: `src/app/page.tsx` import 경로 변경 + 회귀 검증(`yarn type-check`/`lint`/`build` 모두 통과)

### Phase K — Blog 라우트 구현
- [ ] Step 14: `src/components/blog/CategoryBadge.tsx` (신규)
- [ ] Step 15: `src/components/blog/PostContent.tsx` (신규) — react-markdown + remark-gfm + rehype-raw + shiki
- [ ] Step 16: `src/components/blog/BlogListClient.tsx` (신규, `'use client'`) — URL 파라미터 필터
- [ ] Step 17: `src/app/blog/page.tsx` (신규) — 서버 컴포넌트 + 클라이언트 필터 분리
- [ ] Step 18: `src/app/blog/[slug]/page.tsx` (신규) — `generateStaticParams` + `generateMetadata`

### Phase L — 카테고리/태그 라우트
- [ ] Step 19: `src/app/categories/[category]/page.tsx` (신규)
- [ ] Step 20: `src/app/tags/[tag]/page.tsx` (신규)

### Phase M — About 페이지 + 포트폴리오
- [ ] Step 21: `content/portfolio/profile.json` (신규)
- [ ] Step 22: `content/portfolio/projects.json` (신규)
- [ ] Step 23: `content/portfolio/experience.json` (신규)
- [ ] Step 24: `content/portfolio/skills.json` (신규)
- [ ] Step 25: `src/lib/content/portfolio-loader.ts` (신규) — JSON 로드 + 타입 검증
- [ ] Step 26: `src/components/portfolio/ProjectList.tsx` (신규)
- [ ] Step 27: `src/components/portfolio/ExperienceTimeline.tsx` (신규)
- [ ] Step 28: `src/components/portfolio/SkillMatrix.tsx` (신규)
- [ ] Step 29: `src/app/about/page.tsx` (신규)

### Phase N — SEO/피드/사이트맵
- [ ] Step 30: `src/lib/content/metadata.ts` (신규) — sitemap/RSS용 추출 헬퍼
- [ ] Step 31: `src/app/sitemap.ts` (신규)
- [ ] Step 32: `src/app/robots.ts` (신규) 또는 `public/robots.txt`
- [ ] Step 33: `scripts/generate-feed.mjs` (신규) — 빌드 후처리로 `out/feed.xml` 생성
- [ ] Step 34: `package.json` — `build` 스크립트 후처리 체이닝 (`next build && node scripts/generate-feed.mjs`)

### Phase O — 검증 및 문서화
- [ ] Step 35: `scripts/check-slug-conflicts.mjs` (신규) — 사전 충돌 검증 CLI
- [ ] Step 36: `tests/content/repository.test.ts` (신규) — 충돌 감지 케이스
- [ ] Step 37: `tests/content/normalize.test.ts` (신규) — 날짜/readingTime 정규화
- [ ] Step 38: `aidlc-docs/aidlc-state.md` 업데이트 — 진행 상태 반영
- [ ] Step 39: `aidlc-docs/audit.md` 업데이트 — 본 plan 승인 + 단계 완료 로그

---

## 수용 기준 (Acceptance Criteria)

상위 plan(`.omc/plans/notion-markdown-hybrid-v2-plan.md`) §"수용 기준" 동일. 요약:

- [ ] **A. 데이터 레이어**: `ContentRepository` 단일 진입점, slug 충돌 빌드 실패, graceful fallback (Notion-only / Markdown-only)
- [ ] **B. 도메인 모델**: `BlogPost.category`/`source` 추가, ISO-8601 정규화, readingTime 자동 계산
- [ ] **C. 라우팅**: `/blog`, `/blog/[slug]`, `/categories/[category]`, `/tags/[tag]`, `/about` 정적 export 정상 빌드
- [ ] **D. SEO/피드**: sitemap/robots/RSS 빌드 산출
- [ ] **E. 품질 게이트**: `yarn type-check`, `yarn lint`, `yarn build` 통과

---

## 위험 및 완화

상위 plan §"위험 및 완화" 참조. 본 plan 실행 단계의 추가 위험:

| 위험 | 완화 |
|---|---|
| Notion DB 스키마에 `Category` 속성 부재 | Notion 셋업 가이드(§3.2)에 명시. 누락 시 어댑터에서 `'Uncategorized'` 폴백 |
| 기존 `src/lib/notion/*` 사용처 누락 | `grep -r "@/lib/notion"`으로 사용처 전수 조사 후 일괄 변경 |
| `next build` 정적 export에서 동적 라우트 핸들러 제약 | RSS는 `scripts/generate-feed.mjs` 후처리로 우회 |

---

## 검증 단계

상위 plan §"검증 단계" 동일.

핵심 게이트:
1. Phase J 완료 시 — 기존 홈페이지 회귀 동작 확인
2. Phase K 완료 시 — 단건 페이지 정적 빌드 확인 (`out/blog/<slug>/index.html` 존재)
3. Phase N 완료 시 — `out/feed.xml`, `out/sitemap.xml`, `out/robots.txt` 존재

---

## 실행 순서

```text
Phase G (타입/인터페이스)
   └→ Phase H (마크다운 어댑터)
   └→ Phase I (Notion 어댑터 리팩터링) ← Phase H와 병렬 가능
       └→ Phase J (Repository) ← 회귀 게이트
           ├→ Phase K (Blog 라우트)
           ├→ Phase L (카테고리/태그)
           └→ Phase M (About/포트폴리오) ← Phase K~M 병렬 가능
               └→ Phase N (SEO/RSS/sitemap)
                   └→ Phase O (검증/문서화)
```

---

## 범위 외 (Out of Scope)
- Terraform IaC, GitHub Actions CI/CD — 별도 plan
- 댓글/검색/뉴스레터/분석 — v2 범위 외
- Notion DB 스키마 자동 마이그레이션 — Notion 셋업 가이드의 수동 절차로 대체
