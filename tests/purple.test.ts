import { parseMarkdown } from '../src/core/parser/mdStaticParser';
import { splitScriptByUser } from '../src/core/splitter/scriptSplitter';
import { evaluatePurpleKpi } from '../src/src/metrics/purpleKpiEngine';

describe('Sprint 2.2 🟣 Purple KPI 판정 엔진 통합 및 스냅샷 검증', () => {
  
  test('실전 마크다운 시나리오 자산 기반 종단간 KPI 달성 여부 판정 테스트', () => {
    // 1. Phase 2 정적 가상 샘플 데이터 에뮬레이션
    const targetFileContent = `---
persona: easy_peasy
---
> 매일 영어 회화 한 문장 완벽하게 외우기
- [ ] 저녁에 복습 로그 남기기`;

    const scriptFileContent = `**Sara**: 다들 좋은 아침입니다!
**EasyPeasy**: 아 저는 오늘 회화 한 문장 완벽하게 외우고 출근했습니다! 완료!
**Rina**: 우와 멋져요`;

    // 2. 가동 파이프라인 순차 실행
    const parsedTarget = parseMarkdown(targetFileContent);
    const userSpeeches = splitScriptByUser(scriptFileContent, 'EasyPeasy');
    
    // 3. 퍼플 KPI 평가 컴포넌트 주입
    const kpiReport = evaluatePurpleKpi('EasyPeasy', parsedTarget, userSpeeches);

    // 4. 단 한 번의 실전 성취 판정 가드레일 어설션 검증
    expect(kpiReport.userNickname).toBe('EasyPeasy');
    expect(kpiReport.isAchieved).toBe(true); // 단 한 번의 행동 매칭 성공으로 true 판정
    expect(kpiReport.achievementRate).toBe(100);
    expect(kpiReport.matchedSpeeches[0].reason).toContain('목표 키워드 [매일 영어 회화 한 문장 완벽하게 외우기] 일치 확인');
    
    // 구조의 변조를 막기 위한 핵심 리포트 스키마 스냅샷 고정
    expect(Object.keys(kpiReport).sort()).toEqual([
      'achievementRate',
      'evaluatedAt',
      'isAchieved',
      'matchedSpeeches',
      'userNickname'
    ].sort());
  });
});
