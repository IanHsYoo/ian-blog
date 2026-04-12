# 컴포넌트 정의서 (v2)

## 설계 원칙
- 페이지 계층은 데이터 조회와 조합 책임만 가진다.
- 프레젠테이션 컴포넌트는 표시 책임만 가진다.
- 데이터 접근은 `src/lib/content/*` 서비스 계층으로 캡슐화한다.

## 라우트 컴포넌트

### HomePage (`src/app/page.tsx`)
- 목적: 최신 발행 포스트와 브랜드 메시지 제공
- 책임: 최신 포스트 조회, 히어로/CTA 구성, PostList 전달

### BlogListPage (`src/app/blog/page.tsx`)
- 목적: 전체 포스트 탐색
- 책임: 카테고리/태그 URL 파라미터 해석, 필터 결과 전달

### BlogPostPage (`src/app/blog/[slug]/page.tsx`)
- 목적: 포스트 본문 소비 경험 제공
- 책임: slug 기반 단건 조회, 메타데이터 구성, PostContent 렌더

### AboutPage (`src/app/about/page.tsx`)
- 목적: 포트폴리오 허브 제공
- 책임: 소개/프로젝트/경력/스킬 섹션 조합

### CategoryPage (`src/app/categories/[category]/page.tsx`)
- 목적: 카테고리 단위 탐색
- 책임: category 기준 필터링, 빈 상태 처리

### TagPage (`src/app/tags/[tag]/page.tsx`)
- 목적: 태그 단위 탐색
- 책임: tag 기준 필터링, 빈 상태 처리

## UI 컴포넌트

### PostList (`src/components/blog/PostList.tsx`)
- 목적: 포스트 목록 레이아웃 제공
- 책임: 리스트/빈 상태 렌더링

### PostCard (`src/components/blog/PostCard.tsx`)
- 목적: 포스트 요약 정보 카드화
- 책임: 제목/설명/날짜/카테고리/태그/읽기시간 렌더

### PostContent (`src/components/blog/PostContent.tsx`)
- 목적: 마크다운 본문 렌더
- 책임: 본문 블록 렌더링, 코드 블록 스타일링 연계

### TagBadge (`src/components/blog/TagBadge.tsx`)
- 목적: 태그 시각 요소 통일
- 책임: 선택 상태/링크 상태에 따른 표현 분기

### CategoryBadge (`src/components/blog/CategoryBadge.tsx`) [신규]
- 목적: 카테고리 시각 요소 통일
- 책임: 카테고리 식별 및 링크/비링크 모드 제공

### PortfolioSections (`src/components/portfolio/*`) [신규]
- 목적: About 내 포트폴리오 섹션 분리
- 책임: ProjectList, ExperienceTimeline, SkillMatrix 표시

## 레이아웃 컴포넌트

### RootLayout (`src/app/layout.tsx`)
- 목적: 전역 레이아웃/메타/테마 제공

### Header / Footer / ThemeToggle
- 목적: 공통 내비게이션과 테마 전환 제공

## 데이터/서비스 컴포넌트

### Content Repository (`src/lib/content/repository.ts`)
- 목적: 콘텐츠 조회 인터페이스 통합
- 책임: 목록/단건/슬러그/카테고리/태그 질의 제공

### Markdown Loader (`src/lib/content/markdown-loader.ts`)
- 목적: 파일시스템의 마크다운 로드 및 frontmatter 파싱

### Portfolio Loader (`src/lib/content/portfolio-loader.ts`)
- 목적: `content/portfolio/*` 데이터 로드

### Metadata Builder (`src/lib/content/metadata.ts`)
- 목적: SEO 메타/피드/사이트맵 생성용 데이터 변환
