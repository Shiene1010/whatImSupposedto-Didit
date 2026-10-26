export const DEMO_PERSONA_PROFILES = {
  easy_peasy: {
    label: '이지비지 (EasyPeasy)',
    targetNickname: 'EasyPeasy',
    goal: '매일 영어 회화 한 문장 완벽하게 외우고 원어민처럼 뱉기',
    log: [
      '**Sara**: 오늘 오전 스트레칭을 완료했어요.',
      '**EasyPeasy**: 오늘 영단어랑 회화 한 문장을 간신히 외웠어요. 완벽하진 않았지만 시도했어요.',
      '[EasyPeasy]: 소리 내서 크게 세 번 읽었습니다. 톡-투-미-나우!',
      'Rina: 다음에는 저도 해볼게요.',
    ].join('\n'),
  },
  new_year_hero: {
    label: '뉴이어 (NewYear)',
    targetNickname: 'NewYear',
    goal: '올해는 매일 운동해서 완벽한 루틴 만들기',
    log: [
      'Sara: 오늘 스트레칭을 완료했어요.',
      '**NewYear**: 운동 계획표를 정리하고 운동화를 꺼내 뒀어요. 오늘은 5분 걸었어요.',
      'Rina: 계획부터 다시 세워야 할 것 같아요.',
    ].join('\n'),
  },
  sara_active: {
    label: '사라 (Sara)',
    targetNickname: 'Sara',
    goal: '매일 아침 가볍게 몸을 움직이기',
    log: [
      '**Sara**: 일어나서 바로 스트레칭했어요! 완료!',
      'NewYear: 루틴 앱을 먼저 찾아볼게요.',
      '[Sara]: 집 앞까지 걷고 왔어요! 해냈다!',
    ].join('\n'),
  },
  rina_melancholy: {
    label: '리나 (Rina)',
    targetNickname: 'Rina',
    goal: '미뤄 둔 책상 정리를 시작하기',
    log: [
      'Sara: 책상 전체를 정리했어요!',
      '**Rina**: 다 하진 못했지만 책 한 권을 치웠어요. 조금 했어요.',
      '[Rina]: 내일은 종이 한 장만 분류해 볼게요.',
    ].join('\n'),
  },
} as const;

export type DemoPersonaId = keyof typeof DEMO_PERSONA_PROFILES;

export function isDemoPersonaId(value: string): value is DemoPersonaId {
  return Object.prototype.hasOwnProperty.call(DEMO_PERSONA_PROFILES, value);
}
