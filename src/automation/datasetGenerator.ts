import * as fs from 'fs';
import * as path from 'path';
import { PERSONA_REGISTRY, generatePersonaPromptContext } from './personaProfile';

interface GeneratorConfig {
  apiKey: string;
  outputDir: string;
}

/**
 * datasetGenerator
 * 페르소나별 가상 상태에 빙의된 마크다운 목표 파일과 글로벌 대화록 스크립트를 대량 합성 생성합니다.
 */
export async function runDatasetGenerator(config: GeneratorConfig): Promise<void> {
  const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
  const targetDir = path.resolve(config.outputDir);

  if (!apiKey) throw new Error('데이터 양산을 위한 OpenAI API Key가 없습니다.');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 등록된 모든 핵심 페르소나 순회 가동
  for (const personaId of Object.keys(PERSONA_REGISTRY)) {
    const persona = PERSONA_REGISTRY[personaId];
    const personaContext = generatePersonaPromptContext(personaId);

    const systemPrompt = `
${personaContext}
당신은 위 유저에 최적화된 통합 테스트용 마크다운 자산 쌍을 제조하는 자동화 팩토리입니다.
반드시 아래의 구조화된 텍스트 양식 그대로 단 하나의 분리 기호(===)를 기준으로 두 종류의 텍스트를 한 번에 출력하세요.

[양식 구조]
---
persona: ${persona.id}
version: synthetic_v1
---
> 여기에 유저 성향에 맞는 애매한 목표 문장 작성
- [ ] 첫 번째 할일 행동 지침
- [x] 이미 수행해버린 행동 지침
===
**${persona.name.split(' ')[0]}**: 여기에 실전 단톡방에서 유저가 뱉을 법한 리얼한 행동 인증 및 변명 발화 작성
**OtherUser**: 힘내세요!
`;

    try {
      const response = await fetch('https://openai.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'system', content: systemPrompt }],
          temperature: 0.8 // 다양한 변형 비정형 텍스트 유도를 위한 높은 온화도 설정
        })
      });

      if (!response.ok) continue;

      const data = await response.json();
      const rawOutput = data.choices[0].message.content as string;

      // 구분자(===)를 기준으로 목표 파일 데이터와 발화 스크립트 데이터 분리
      const [targetContent, scriptContent] = rawOutput.split('===');

      if (targetContent && scriptContent) {
        // 물리 파일 디스크 덤프 실행
        const targetPath = path.join(targetDir, `${personaId}_synthetic_target.md`);
        const scriptPath = path.join(targetDir, `${personaId}_synthetic_script.md`);

        fs.writeFileSync(targetPath, targetContent.trim(), 'utf-8');
        fs.writeFileSync(scriptPath, scriptContent.trim(), 'utf-8');

        console.log(`[양산 성공] 페르소나 [${personaId}] 가상 자산 덤프 완료.`);
      }
    } catch (error) {
      console.error(`페르소나 [${personaId}] 자산 양산 중 실패:`, error);
    }
  }
}
