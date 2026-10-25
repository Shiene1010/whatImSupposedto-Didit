import { parseMarkdown } from '../src/core/parser/mdStaticParser';
import { splitScriptByUser } from '../src/core/splitter/scriptSplitter';

describe('Sprint 1.1 & 1.2 코어 파이프라인 유닛 테스트', () => {
  
  const mockTargetMd = `---
persona: easy_peasy
version: 1.0.0
---
> 이지비지 타겟 설정: 매일 영어 회화 한 문장 외우기
- [x] 완료 행동 체크`;

  const mockGlobalScript = `**EasyPeasy**: 오늘 간신히 한 문장 외웠어요.
**Sara**: 대단해요 이지비지님!`;

  test('parseMarkdown은 YAML 프론트매터와 인용구, 할 일 목록을 정확히 파싱해야 한다', () => {
    const result = parseMarkdown(mockTargetMd);
    
    expect(result.frontMatter.persona).toBe('easy_peasy');
    expect(result.frontMatter.version).toBe('1.0.0');
    expect(result.quotes[0]).toBe('이지비지 타겟 설정: 매일 영어 회화 한 문장 외우기');
    expect(result.todoItems[0].text).toBe('완료 행동 체크');
    expect(result.todoItems[0].completed).toBe(true);
  });

  test('scriptSplitter는 전체 대화록에서 대상 닉네임의 발화만 정확히 발라내야 한다', () => {
    const speeches = splitScriptByUser(mockGlobalScript, 'EasyPeasy');
    
    expect(speeches).toHaveLength(1);
    expect(speeches[0].nickname).toBe('EasyPeasy');
    expect(speeches[0].content).toBe('오늘 간신히 한 문장 외웠어요.');
    expect(speeches[0].lineNumber).toBe(1);
  });
});
