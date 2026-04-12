# NFR 요구사항 명세 (blog-v2)

## 범위
- 대상: 블로그 v2 (홈/목록/상세/About/카테고리/태그)
- 배포 모델: Next.js 정적 export + AWS S3/CloudFront
- 콘텐츠 소스: 로컬 마크다운 우선, Notion 확장 가능

## NFR-01 성능
- 정적 빌드 산출물 기준 첫 화면 LCP 목표:
  - 데스크탑 p75 <= 2.5s
  - 모바일 p75 <= 3.0s
- Lighthouse Performance 점수:
  - 홈/목록/상세 핵심 페이지 >= 90
- 이미지 최적화:
  - 원본 대비 네트워크 전송량 30% 이상 절감 목표
  - 커버 이미지에 width/height 정보 제공
- 빌드 시간 목표:
  - CI 기준 `yarn build` 5분 이내 (콘텐츠 100개 포스트 기준)

## NFR-02 가용성/복구
- 서비스 가용성 목표: CloudFront + S3 기준 월간 99.9% 이상
- 배포 실패 시 복구:
  - 직전 정상 아티팩트 재배포로 15분 이내 롤백
- CDN 캐시 무효화 실패 시:
  - 재시도 정책(최소 2회) + 수동 무효화 절차 문서화

## NFR-03 신뢰성
- 콘텐츠 파싱 신뢰성:
  - 필수 frontmatter 누락/형식 오류는 빌드 단계에서 실패 처리
- 라우팅 신뢰성:
  - slug 중복 시 빌드 실패
  - 존재하지 않는 slug/category/tag 접근 시 안전한 Not Found 또는 빈 상태 보장
- 데이터 누락 내성:
  - 포트폴리오 섹션 일부 누락 시 전체 페이지 실패 없이 부분 렌더링

## NFR-04 보안
- 시크릿 관리:
  - AWS 자격증명은 GitHub Secrets만 사용
  - `.env.local`은 저장소 커밋 금지
- 배포 보안:
  - S3 퍼블릭 액세스 차단
  - CloudFront를 통한 배포만 허용
- 정적 사이트 보안 헤더:
  - `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy` 적용
- 서드파티 키 노출 방지:
  - Notion 키/토큰이 클라이언트 번들에 포함되지 않도록 빌드 검증

## NFR-05 유지보수성/운영성
- 계층 분리:
  - Page -> Service -> Adapter -> Data Source 방향 준수
- 코드 품질 게이트:
  - `yarn type-check`, `yarn lint`, `yarn build` 모두 성공해야 배포 진행
- 문서 동기화:
  - 설계 변경 시 `aidlc-docs` 산출물 업데이트 필수

## NFR-06 사용성/접근성
- 반응형:
  - sm/md/lg/xl 구간에서 레이아웃 붕괴 없음
- 접근성:
  - 키보드 탐색 가능(주요 링크/버튼 focus 상태 확인 가능)
  - 텍스트 대비 WCAG AA 준수 목표
- 읽기 경험:
  - 코드 블록은 모바일에서 가로 스크롤 또는 줄바꿈 정책으로 가독성 보장

## NFR-07 확장성
- 소스 확장:
  - 마크다운 우선 구조를 유지한 채 Notion 어댑터 추가 가능해야 함
- 콘텐츠 증가 대응:
  - 포스트 500건까지 빌드/라우팅 구조가 동작해야 함
  - 목록/필터 로직은 O(n) 처리 유지, 불필요한 중복 파싱 금지

## 품질 게이트 요약
1. CI 게이트: type-check/lint/build 통과
2. 콘텐츠 게이트: frontmatter/slug 유효성 검증 통과
3. UX 게이트: 핵심 페이지 모바일/데스크탑 수동 점검 통과
4. 배포 게이트: S3 sync + CloudFront invalidation 성공
