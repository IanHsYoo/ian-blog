# 요구사항 확인 질문 (범위 확장)

기존 프로젝트의 범위 확장에 대한 확인 질문입니다.
각 질문의 `[Answer]:` 태그 뒤에 선택지 문자를 입력해 주세요.
맞는 옵션이 없으면 마지막 옵션(Other)을 선택하고 설명을 작성해 주세요.

완료되면 알려주세요.

---

## Question 1
포트폴리오 페이지에 어떤 내용을 포함하시겠습니까?

A) 프로젝트 목록 (제목, 설명, 기술스택, 링크)
B) 프로젝트 목록 + 경력/이력 타임라인
C) 프로젝트 목록 + 경력 + 스킬셋/기술 프로필
D) 간단한 이력서 형태 (PDF 다운로드 포함)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 2
포트폴리오 데이터는 어떻게 관리하시겠습니까?

A) 마크다운/JSON 파일로 로컬 관리 (코드와 함께 버전 관리)
B) Notion 데이터베이스에서 가져오기 (블로그와 동일 방식)
C) 별도 CMS나 외부 API 사용
X) Other (please describe after [Answer]: tag below)

[Answer]: A. 추후에는 notion api로 확장시킬 예정

---

## Question 3
마크다운 우선 접근 방식에 대해 확인합니다. 블로그 콘텐츠를 마크다운으로 먼저 작성하고 나중에 Notion 연동으로 전환하시겠습니까?

A) 맞음 — 로컬 마크다운 파일로 시작, 추후 Notion API 연동 추가
B) 마크다운과 Notion을 동시 지원 (하이브리드)
C) 마크다운만 사용 (Notion 연동 계획 없음)
X) Other (please describe after [Answer]: tag below)

[Answer]: A 추후에는 B로 확장 예정

---

## Question 4
미니멀 디자인에 대해 선호하는 레퍼런스가 있습니까?

A) 텍스트 중심의 깔끔한 블로그 (예: Dan Abramov의 overreacted.io 스타일)
B) 카드 기반 레이아웃의 모던 미니멀 (예: Vercel 블로그 스타일)
C) 사이드바 네비게이션이 있는 문서형 레이아웃
D) 특별한 레퍼런스 없음 — 일반적인 미니멀 디자인으로 진행
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 5
기존 요구사항(FR-05)에 `/about` 페이지가 있었습니다. 포트폴리오 페이지 추가에 따라 어떻게 구성하시겠습니까?

A) `/about`과 `/portfolio`를 별도 페이지로 유지
B) `/about`에 포트폴리오 섹션을 통합 (하나의 페이지)
C) `/about`을 제거하고 `/portfolio`로 대체
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 6
블로그 콘텐츠의 카테고리/분류 체계는 어떻게 하시겠습니까?

A) 태그만 사용 (기존 방식 유지)
B) 카테고리 + 태그 (계층 구조)
C) 시리즈/컬렉션 기능 추가 (연재물 묶음)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 7
기존 요구사항에서 유지/변경/제거할 기능을 확인합니다. 다음 중 불필요한 기능이 있습니까?

A) 모두 유지 (RSS, SEO, sitemap, 다크모드, 태그 필터)
B) RSS 피드 제거 — 나머지 유지
C) 일부 기능 보류 — 핵심 기능(블로그, 포트폴리오)부터 구현 후 나머지 추가
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 8 — Security Extension
이 프로젝트에 보안 확장 규칙을 적용해야 합니까?

A) 예 — 모든 SECURITY 규칙을 블로킹 제약으로 적용 (프로덕션 수준 애플리케이션에 권장)
B) 아니오 — 모든 SECURITY 규칙 건너뛰기 (PoC, 프로토타입, 실험적 프로젝트에 적합)
X) Other (please describe after [Answer]: tag below)

[Answer]: B
