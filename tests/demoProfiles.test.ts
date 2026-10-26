import { DEMO_PERSONA_PROFILES } from '../src/demo/demoProfiles';
import { analyzeDemoSession } from '../src/demo/demoSession';

describe('demo persona profiles', () => {
  it('keeps the four supported local demo profiles', () => {
    expect(Object.keys(DEMO_PERSONA_PROFILES)).toEqual([
      'easy_peasy',
      'new_year_hero',
      'sara_active',
      'rina_melancholy',
    ]);
  });

  it('provides analyzable sample input for every profile', () => {
    for (const profile of Object.values(DEMO_PERSONA_PROFILES)) {
      const analysis = analyzeDemoSession(profile.goal, profile.log, profile.targetNickname);
      expect(analysis.extractedSpeeches.length).toBeGreaterThan(0);
    }
  });
});
