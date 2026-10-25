import * as fs from 'fs';
import * as path from 'path';
import { parseMarkdown } from '../src/core/parser/mdStaticParser';
import { splitScriptByUser } from '../src/core/splitter/scriptSplitter';
import { evaluatePurpleKpi } from '../src/metrics/purpleKpiEngine';
import { PERSONA_REGISTRY } from '../src/automation/personaProfile';

describe('Sprint 4.2: 대량 합성 데이터셋 전수 런타임 신뢰성 검증', () => {
  const generatedDir = path.resolve(__dirname, '../assets/stage_03_generated');

  // 가상 데이터 폴더가 존재하지 않거나 비어있는 경우 테스트 자동 패스 처리 (멱등성 확보)
  const safeGetFiles = (): string[] => {
    if (!fs.existsSync(generatedDir)) return [];
    return fs.readdirSync(generatedDir);
  };

  const fileList = safeGetFiles();

  if (fileList.length === 0) {
    test('양산된 가상 데이터셋 자산이 비어있음 (Phase 3 스킵 상태 확인)', () => {
      console.warn('⚠️ 검증할 합성 데이터셋 파일이 존재하지 않습니다. Phase 3 자산 양산을 먼저 확인하세요.');
    });
    return;
  }

  // 등록된 페르소나별로 양산된 파일 세트를 순회 검증
  Object.keys(PERSONA_REGISTRY).forEach((personaId) => {
    const targetFileName = `${personaId}_synthetic_target.md`;
    const scriptFileName = `${personaId}_synthetic_script.md`;

    const targetPath = path.join(generatedDir, targetFileName);
    const scriptPath = path.join(generatedDir, scriptFileName);

    if (fs.existsSync(targetPath) && fs.existsSync(scriptPath)) {
      test(`페르소나 [${personaId}]의 합성 마크다운 파일 파싱 및 엔진 호환성 무결성 검증`, () => {
        // 1. 물리 파일 스트림 읽기
        const targetRaw = fs.readFileSync(targetPath, 'utf-8');
        const scriptRaw = fs.readFileSync(scriptPath, 'utf-8');

        // 2. Sprint 1.1 정적 파서 엔진 주입 및 크래시 가드 작동 검증
        let parsedMd;
        expect(() => {
          parsedMd = parseMarkdown(targetRaw);
        }).not.toThrow();

        expect(parsedMd).toBeDefined();
        expect(parsedMd?.frontMatter.persona).toBe(personaId);

        // 3. Sprint 1.2 스플리터 엔진 구동 검증
        let userSpeeches;
        expect(() => {
          // 페르소나 메타에 지정된 이름을 기준으로 발화 추출 시도
          const personaName = PERSONA_REGISTRY[personaId].name.split(' ')[0]; // 닉네임 부분만 파싱
          userSpeeches = splitScriptByUser(scriptRaw, personaName);
        }).not.toThrow();

        expect(Array.isArray(userSpeeches)).toBe(true);

        // 4. Sprint 2.2 🟣 Purple KPI 엔진 결합 전수 데이터 안정성 테스트
        if (parsedMd && userSpeeches) {
          let kpiReport;
          expect(() => {
            kpiReport = evaluatePurpleKpi(personaId, parsedMd, userSpeeches);
          }).not.toThrow();

          expect(kpiReport).toHaveProperty('isAchieved');
          expect(kpiReport).toHaveProperty('achievementRate');
          expect(typeof kpiReport?.achievementRate).toBe('number');
        }
      });
    }
  });
});
