import { ParsedMarkdown } from '../parser/mdStaticParser';
import { UserSpeech } from '../splitter/scriptSplitter';

export interface PrescriptionResult {
  originalTarget: string;       // 원문: 유저가 제출한 원래 목표/행동 컨텍스트
  fiveYearOldVersion: string;   // 5세: 5세 아이도 직관적으로 이해할 수 있는 극단적 직관화
  cheatKeyAction: string;       // 치트키: 즉시 행동으로 옮길 수 있는 마이크로 트리거
  phonicsSound: string;         // 소리: 실행력을 높이기 위해 입으로 뱉는 하이픈 연결 의성어/소리
}

interface OpenAIConfig {
  apiKey: string;
  modelName?: string;
}

/**
 * aiContrastEngine
 * 파싱된 마크다운 목표와 스플릿된 발화 데이터를 결합하여 GPT-4o 구조화된 4단 처방전을 생성합니다.
 */
export async function generate4StepPrescription(
  parsedMd: ParsedMarkdown,
  userSpeeches: UserSpeech[],
  config: OpenAIConfig
): Promise<PrescriptionResult> {
  
  const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
  const model = config.modelName || 'gpt-4o';

  if (!apiKey) {
    throw new Error('OpenAI API Key가 누락되었습니다.');
  }

  // 1. 유저의 목표 및 발화 데이터를 하나의 텍스트 컨텍스트로 결합
  const targetSummary = parsedMd.quotes.join('\n') || '명시된 목표 없음';
  const speechSummary = userSpeeches.map(s => `- ${s.content}`).join('\n') || '기록된 실전 발화 없음';

  const userContextPrompt = `
[USER TARGET & CONTEXT]
원래 목표: ${targetSummary}
실전 발화/행동 기록(Did):
${speechSummary}
`;

  // 2. 4단 처방전 고정 스키마 주입 및 시스템 프롬프트 구성
  const systemPrompt = `
당신은 'What I'm Supposed to, Did It' 서비스의 코어 분석 엔진입니다.
제공된 유저의 목표와 발화 기록을 대조 분석하여, 실천율을 극대화하는 [4단 처방전]을 JSON 구조로 출력하세요.

반드시 다음 4가지 필드를 포함하는 완벽한 JSON 객체만 반환해야 합니다:
1. originalTarget: 유저의 원래 상태나 목표를 명확히 요약한 문장.
2. fiveYearOldVersion: 5세 아이도 듣고 즉시 이해할 수 있을 만큼 극단적으로 유치하고 직관적으로 쪼갠 행동 목표.
3. cheatKeyAction: 인지적 부하 없이 "그냥 바로 1초 만에 시작할 수 있는" 마이크로 트리거 행동 지침.
4. phonicsSound: 입 밖으로 내뱉어 뇌를 속이는 형태의 소리 표현. 하이픈(-)으로 음절을 연결할 것 (예: "스-따-뜨", "슉-슈-슉").
`;

  try {
    const response = await fetch('https://openai.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContextPrompt }
        ],
        response_format: { type: 'json_object' }, // Structured Outputs 가드레일 활성화
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API HTTP 에러! 상태코드: ${response.status}`);
    }

    const data = await response.json();
    const rawJsonString = data.choices[0].message.content;
    
    // 안전한 JSON 파싱 처리
    const result: PrescriptionResult = JSON.parse(rawJsonString);
    return result;

  } catch (error) {
    console.error('aiContrastEngine 작동 실패:', error);
    // 가드레일용 기본 에러 팩토리 반환
    return {
      originalTarget: targetSummary,
      fiveYearOldVersion: '단어장 펼치기',
      cheatKeyAction: '책상에 앉아 1단어 보기',
      phonicsSound: '에이-비-씨-꼬우'
    };
  }
}
