# 스토리 생성 계획

## 개요
ian-blog v2 범위 확장에 대한 User Stories 생성 계획.
요구사항(requirements.md v2) 기반으로 사용자 중심 스토리와 페르소나를 생성한다.

---

## 실행 체크리스트

### Part 1: 계획 (Planning)
- [x] Step 1: User Stories 필요성 평가
- [x] Step 2: 사용자 답변 수집 및 분석
- [x] Step 3: 페르소나 생성 (personas.md)
- [x] Step 4: User Stories 생성 (stories.md)
- [x] Step 5: 스토리-페르소나 매핑 검증

### Part 2: 생성 (Generation)
- [x] stories.md 생성 완료 (총 12개 스토리, 5개 에픽)
- [x] INVEST 점검 완료 (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- [x] 각 스토리별 수용 기준(Given/When/Then) 작성 완료
- [x] 페르소나 매핑 표 작성 및 personas.md와 정합성 검증 완료

---

## 스토리 분류 접근 방식

이 프로젝트에 다음 접근 방식을 제안합니다:

| 접근 방식 | 설명 | 장점 | 단점 |
|---|---|---|---|
| **사용자 여정 기반** | 사용자 워크플로우 순서로 스토리 구성 | 사용자 경험 흐름 파악 용이 | 기술 관점 부족 |
| **기능 기반** | 시스템 기능별 스토리 구성 | 구현 매핑 용이 | 사용자 맥락 부족 |
| **페르소나 기반** | 사용자 유형별 스토리 그룹화 | 다양한 사용자 니즈 포착 | 중복 가능성 |
| **하이브리드** | 기능 기반 + 페르소나 매핑 | 균형 잡힌 접근 | 약간 복잡 |

---

## 질문

아래 질문에 답변해 주세요. `[Answer]:` 태그 뒤에 선택지를 입력해 주세요.

### Question 1
스토리 분류 접근 방식으로 어떤 것을 선호하십니까?

A) 사용자 여정 기반 — 블로그 방문자의 탐색 흐름 중심
B) 기능 기반 — 시스템 기능(블로그, 포트폴리오, 카테고리 등) 중심
C) 하이브리드 — 기능 기반 구성 + 페르소나별 매핑
X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 2
블로그의 주요 방문자(대상 독자)는 누구입니까?

A) 개발자/엔지니어 — 기술 블로그 독자
B) 채용 담당자/HR — 포트폴리오 확인 목적
C) 일반 독자 — 다양한 주제에 관심
D) A + B — 개발자와 채용 담당자 모두
X) Other (please describe after [Answer]: tag below)

[Answer]: D

### Question 3
포트폴리오 섹션에서 가장 중요한 사용자 행동은 무엇입니까?

A) 프로젝트 상세 확인 후 GitHub/Demo 링크로 이동
B) 경력 타임라인을 통해 전체 이력 파악
C) 기술 스택 확인 후 연락/채용 의사결정
D) 위 모두 동일하게 중요
X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 4
블로그 콘텐츠의 카테고리를 어떻게 구성할 계획입니까?

A) 기술 중심 (Development, DevOps, Architecture 등)
B) 주제 혼합 (Development, Design, Life, Career 등)
C) 아직 미정 — 일반적인 구조로 시작
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
스토리의 수용 기준(acceptance criteria) 상세도를 어느 수준으로 원하십니까?

A) 간결 — 핵심 조건 2~3개 (빠른 개발 우선)
B) 표준 — Given/When/Then 형식, 조건 3~5개
C) 상세 — Given/When/Then + 에지 케이스 + 모바일 조건 포함
X) Other (please describe after [Answer]: tag below)

[Answer]: C
