import { analyzeDemoSession } from '../src/demo/demoSession';

describe('demo session analysis', () => {
  test('uses the real parser and KPI engine to find a small attempt', () => {
    const result = analyzeDemoSession(
      '매일 영어 회화 한 문장 완벽하게 외우기',
      '오늘 회화 한 문장을 소리 내 읽었어. 완벽하진 않았지만 해냈어.',
    );

    expect(result.prescription.originalTarget).toBe('매일 영어 회화 한 문장 완벽하게 외우기');
    expect(result.report.isAchieved).toBe(true);
    expect(result.report.matchedSpeeches[0].matchedText).toContain('회화 한 문장');
    expect(result.speechCount).toBe(1);
  });

  test('accepts a checklist goal and reports an empty log without a false achievement', () => {
    const result = analyzeDemoSession('- [ ] 책을 펼쳐서 한 쪽 읽기', '');

    expect(result.prescription.originalTarget).toBe('책을 펼쳐서 한 쪽 읽기');
    expect(result.report.isAchieved).toBe(false);
    expect(result.speechCount).toBe(0);
  });
});
