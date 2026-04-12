# 컴포넌트 의존성 설계서 (v2)

## 의존성 원칙
- 의존성 방향: `Page -> Service -> Adapter -> Data Source`
- UI 컴포넌트는 서비스 계층에 직접 의존하지 않는다.
- 페이지는 도메인 모델만 받아 UI에 전달한다.

## 의존성 매트릭스

| From | To | 관계 | 통신 방식 |
|---|---|---|---|
| HomePage | ContentQueryService | 조회 의존 | 함수 호출 (서버) |
| BlogListPage | ContentQueryService | 조회 의존 | 함수 호출 (서버) |
| BlogPostPage | ContentQueryService | 조회 의존 | 함수 호출 (서버) |
| BlogPostPage | MetadataOrchestrationService | 메타 생성 | 함수 호출 (서버) |
| AboutPage | PortfolioQueryService | 조회 의존 | 함수 호출 (서버) |
| ContentQueryService | ContentSourceStrategyService | 전략 선택 | 내부 오케스트레이션 |
| ContentSourceStrategyService | MarkdownContentAdapter | 기본 소스 | 어댑터 호출 |
| ContentSourceStrategyService | NotionContentAdapter (옵션) | 대체 소스 | 어댑터 호출 |
| PortfolioQueryService | PortfolioDataAdapter | 데이터 로드 | 어댑터 호출 |
| UI Components | Domain Models | 데이터 표시 | props 전달 |

## 데이터 흐름 다이어그램

```text
Build Time
  Next.js Routes
    -> Query Services
      -> Source Strategy
        -> Markdown Adapter
          -> content/posts/*.md + content/portfolio/*
      -> Normalized Domain Models
    -> UI Components Render
    -> Static HTML Export

Runtime
  Browser
    -> Static HTML/JS from CDN
    -> Theme toggle + URL filter interactions
```

## 페이지별 통신 패턴

### `/`
- HomePage -> ContentQueryService.listPublishedPosts(limit=6)
- 반환값 -> PostList -> PostCard

### `/blog`
- BlogListPage -> ContentQueryService.listPublishedPosts(filters)
- 필터 파라미터(category, tag)는 URL에서 해석

### `/blog/[slug]`
- BlogPostPage -> ContentQueryService.readPost(slug)
- BlogPostPage -> MetadataOrchestrationService.createPostMetadata(post)

### `/about`
- AboutPage -> PortfolioQueryService (profile/projects/experiences/skills)
- 섹션 컴포넌트로 분배

### `/categories/[category]`, `/tags/[tag]`
- 각 페이지 -> ContentQueryService의 전용 조회 메서드 사용

## 결합도/응집도 기준
- 페이지는 유스케이스 단위로 서비스에 의존(높은 응집)
- 서비스는 소스 전략과 어댑터를 통해 외부 데이터 변경에 대응(낮은 결합)
- UI 컴포넌트는 표시 전용으로 유지하여 재사용성 확보
