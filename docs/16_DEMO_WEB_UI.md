# 데모 웹 UI

## 데모 목적

목표 Markdown, 화자별 대화록, 대상 닉네임을 입력해 작은 실행 신호와 다음 행동을 확인합니다. 목표 파싱, 발화 분리, 규칙 신호 평가는 기존 `parseMarkdown`, `splitScriptByUser`, `evaluatePurpleKpi`를 브라우저에서 실행합니다.

## 사용 방법

1. `예시로 바로 체험`을 눌러 다중 화자 샘플과 `EasyPeasy` 닉네임을 불러오거나, 목표 Markdown·화자별 대화록·대상 닉네임을 직접 입력합니다.
2. `오늘의 작은 성취 찾기`를 누르면 파싱된 quote/checklist, 선택된 화자의 발화, 규칙 기반 데모 처방과 match 근거가 표시됩니다.
3. 결과는 “달성률”이 아니라 추출된 대상 발화 중 규칙에 일치한 발화의 수입니다. 키워드/트리거 신호는 의미 이해나 실제 행동 완료를 증명하지 않습니다.
4. 목표, 대화록, 닉네임을 수정하면 이전 분석은 초기화됩니다. 새 입력으로 다시 분석해야 합니다.

## 개인정보와 생성 방식

- 입력값은 React 화면 상태에서만 사용되며 API나 데이터베이스로 전송하거나 저장하지 않습니다.
- 처방 문구는 데모용 템플릿이며 OpenAI 등 외부 AI 호출을 하지 않습니다.
- 화자 발화는 `**nickname**:`, `[nickname]:`, `nickname:` 형식으로 분리하며 원본 대화록을 대상 화자로 임의 변환하지 않습니다.
- 처방 영역에 규칙 기반 데모임을 표시하고, 결과 하단에 실제 KPI 사용과 템플릿 생성 사실을 안내합니다.

## 실행 및 배포

로컬 실행은 `npm run dev`, 검증은 `npm test -- --runInBand` 및 `npm run build`를 사용합니다. 프로젝트의 기존 Vercel 배포 연결을 통해 기본 브랜치 변경 후 배포할 수 있습니다.

## 별도 시연 배포

- 서비스 소개·발표 흐름: [작게, 해냄 서비스 시연](https://what-im-supposed-to-did-it-presenta.vercel.app/) (`presentation/index.html`, Vercel 프로젝트 `what-im-supposed-to-did-it-presentation`)
- MVP 입력·분석 체험: https://what-im-supposed-to-did-it.vercel.app/
- 발표용 사이트는 별도 프로젝트로 배포하며, MVP 체험 링크로 이동할 수 있습니다. 두 페이지의 목적과 배포 단위를 분리합니다.
