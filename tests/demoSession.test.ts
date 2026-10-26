import { analyzeDemoSession } from '../src/demo/demoSession';

describe('demo session analysis', () => {
  test('passes an original multi-speaker transcript and target nickname to the real parser pipeline', () => {
    const result = analyzeDemoSession(
      '매일 영어 회화 한 문장 완벽하게 외우기',
      [
        '**Sara**: 스트레칭을 완료했어요.',
        '**EasyPeasy**: 회화 한 문장을 소리 내 읽었어.',
        '[EasyPeasy]: 크게 읽었습니다.',
        'Rina: 영어 회화를 성공했어요.',
      ].join('\n'),
      ' easypeasy ',
    );

    expect(result.prescription.originalTarget).toBe('매일 영어 회화 한 문장 완벽하게 외우기');
    expect(result.targetNickname).toBe('easypeasy');
    expect(result.report.isAchieved).toBe(true);
    expect(result.report.matchedSpeeches).toHaveLength(2);
    expect(result.report.matchedSpeeches[0].matchedText).toContain('회화 한 문장');
    expect(result.extractedSpeeches).toHaveLength(2);
  });

  test('supports bracket and plain-colon names and ignores non-target speakers', () => {
    const result = analyzeDemoSession(
      '> 책을 펼쳐서 한 쪽 읽기',
      [
        '[Demo]: 책을 읽었어요.',
        'demo: 한 쪽 읽기를 시작했어요.',
        'Other: 책 읽기를 완료했어요.',
      ].join('\n'),
      'Demo',
    );

    expect(result.report.matchedSpeeches).toHaveLength(2);
    expect(result.extractedSpeeches).toHaveLength(2);
    expect(result.report.matchedSpeeches.every((speech) => speech.matchedText !== '책 읽기를 완료했어요.')).toBe(true);
  });

  test('distinguishes an extracted target speaker with no matching signal', () => {
    const result = analyzeDemoSession(
      '> 책을 펼쳐서 한 쪽 읽기',
      '**Demo**: 오늘 창문을 열고 바람을 쐬었어.',
      'Demo',
    );

    expect(result.extractedSpeeches).toHaveLength(1);
    expect(result.report.isAchieved).toBe(false);
    expect(result.report.matchedSpeeches).toHaveLength(0);
  });

  test('documents that a generic KPI trigger can match unrelated speech', () => {
    const result = analyzeDemoSession(
      '> 책을 펼쳐서 한 쪽 읽기',
      '**Demo**: 오늘 업무를 성공적으로 끝냈어.',
      'Demo',
    );

    expect(result.report.isAchieved).toBe(true);
    expect(result.report.matchedSpeeches[0].reason).toContain('트리거');
  });

  test('accepts a checklist goal and reports an empty log without a false achievement', () => {
    const result = analyzeDemoSession('- [ ] 책을 펼쳐서 한 쪽 읽기', '', 'Demo');

    expect(result.prescription.originalTarget).toBe('책을 펼쳐서 한 쪽 읽기');
    expect(result.parsedGoal.todoItems).toEqual([
      { text: '책을 펼쳐서 한 쪽 읽기', completed: false },
    ]);
    expect(result.report.isAchieved).toBe(false);
    expect(result.extractedSpeeches).toHaveLength(0);
  });

  test('uses the first incomplete checklist task when no quote target exists', () => {
    const result = analyzeDemoSession(
      '- [x] 이미 끝낸 일\n- [ ] 지금 시작할 일',
      '',
      'Demo',
    );

    expect(result.prescription.originalTarget).toBe('지금 시작할 일');
    expect(result.prescription.cheatKeyAction).toContain('지금 시작할 일');
  });

  test('keeps a target unchanged when no perfectionist wording can be removed', () => {
    const result = analyzeDemoSession('> 물 한 잔 마시기', '', 'Demo');

    expect(result.prescription.originalTarget).toBe('물 한 잔 마시기');
    expect(result.prescription.fiveYearOldVersion).toBe('“물 한 잔 마시기” — 딱 한 번만 해봐요.');
  });

  test('preserves front matter while parsing quotes and checklist items', () => {
    const result = analyzeDemoSession(
      '---\npersona: easy_peasy\n---\n> 매일 영어 한 문장 읽기\n- [x] 문장 하나 소리 내기',
      '**Demo**: 영어 문장을 읽었어요.',
      'Demo',
    );

    expect(result.parsedGoal.frontMatter.persona).toBe('easy_peasy');
    expect(result.parsedGoal.quotes).toEqual(['매일 영어 한 문장 읽기']);
    expect(result.parsedGoal.todoItems).toEqual([
      { text: '문장 하나 소리 내기', completed: true },
    ]);
  });

  test('does not treat an inline Markdown separator as front matter', () => {
    const result = analyzeDemoSession('오늘은 --- 기호를 쓰고 영어 한 문장 읽기', '', 'Demo');

    expect(result.prescription.originalTarget).toBe('오늘은 --- 기호를 쓰고 영어 한 문장 읽기');
  });

  test('does not parse an unclosed front matter block as a goal', () => {
    expect(() => analyzeDemoSession('---\npersona: demo\nbody without a target', '', 'Demo'))
      .toThrow('목표');
  });

  test('rejects a blank nickname and a goal with no quote or checklist target', () => {
    expect(() => analyzeDemoSession('> 영어 문장 한 개 읽기', '', '   ')).toThrow('닉네임');
    expect(() => analyzeDemoSession('   ', '', 'Demo')).toThrow('목표');
  });
});
