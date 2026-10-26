import { ParsedMarkdown } from '../core/parser/mdStaticParser.ts';
import { UserSpeech } from '../core/splitter/scriptSplitter.ts';

export interface KpiMatchReport {
  userNickname: string;
  isAchieved: boolean;          // 단 한 번이라도 실전 성취 판정을 받았는지 여부
  matchedSpeeches: {
    lineNumber: number;
    matchedText: string;
    reason: string;
  }[];
  achievementRate: number;      // 발화 기여도 비율 (0 ~ 100%)
  evaluatedAt: string;
}

/**
 * purpleKpiEngine
 * 유저의 마크다운 목표 키워드와 실전 Did 발화 리스트를 대조하여 단 한 번의 실전 성취를 판정합니다.
 */
export function evaluatePurpleKpi(
  targetNickname: string,
  parsedTargetMd: ParsedMarkdown,
  userSpeeches: UserSpeech[]
): KpiMatchReport {
  
  const report: KpiMatchReport = {
    userNickname: targetNickname,
    isAchieved: false,
    matchedSpeeches: [],
    achievementRate: 0,
    evaluatedAt: new Date().toISOString()
  };

  if (!userSpeeches || userSpeeches.length === 0) {
    return report;
  }

  // 1. 목표 마크다운의 인용구(Quotes)와 할 일 항목(Todo)에서 핵심 매칭 키워드 풀(Pool) 추출
  const targetKeywords: string[] = [];
  const targetPhrases: string[] = [];
  
  parsedTargetMd.quotes.forEach((quote: string) => {
    const normalizedQuote = quote.trim();
    if (!normalizedQuote) return;

    targetPhrases.push(normalizedQuote.toLowerCase());

    // 문장 전체를 우선 키워드로 보유하여 의미 단위 매칭을 유지
    targetKeywords.push(normalizedQuote.toLowerCase());

    const words = normalizedQuote.split(/\s+/).filter((w: string) => w.length >= 2);
    targetKeywords.push(...words.map((word) => word.toLowerCase()));
  });

  parsedTargetMd.todoItems.forEach((todo: { text: string }) => {
    if (todo.text) {
      const normalizedTodo = todo.text.trim().toLowerCase();
      targetPhrases.push(normalizedTodo);
      targetKeywords.push(normalizedTodo);
    }
  });

  // 중복 키워드 제거 및 소문자 정규화
  const uniqueKeywords = Array.from(new Set(targetKeywords.map(k => k.toLowerCase())));
  const uniquePhrases = Array.from(new Set(targetPhrases.map(p => p.toLowerCase())));

  // 2. 실전 발화 스트림 순회하며 매칭 대조 (Substring Match)
  userSpeeches.forEach(speech => {
    const speechContentLower = speech.content.toLowerCase();
    let isLineMatched = false;
    let matchReason = '';

    // 검증 규칙 A: 목표 문장/할일의 전체 의미가 실전 발화에 부분적으로라도 반영되었는지 우선 평가
    for (const phrase of uniquePhrases) {
      const phraseWords = phrase.split(/\s+/).filter((word: string) => word.length >= 2);
      const phraseMatched = speechContentLower.includes(phrase) || phraseWords.some((word) => speechContentLower.includes(word));
      if (phraseMatched) {
        isLineMatched = true;
        matchReason = `목표 키워드 [${phrase}] 일치 확인`;
        break;
      }
    }

    if (!isLineMatched) {
      for (const keyword of uniqueKeywords) {
        if (speechContentLower.includes(keyword)) {
          isLineMatched = true;
          matchReason = `목표 키워드 [${keyword}] 일치 확인`;
          break;
        }
      }
    }

    // 검증 규칙 B: 실전 성취 행동 강제 트리거 단어 감지 (했음, 완료, 읽었습니다, 뱉음)
    const actionTriggers = ['완료', '했습', '읽었', '포기 안', '성공'];
    if (!isLineMatched) {
      for (const trigger of actionTriggers) {
        if (speechContentLower.includes(trigger)) {
          isLineMatched = true;
          matchReason = `실전 트리거 행동 표기 [${trigger}] 감지`;
          break;
        }
      }
    }

    if (isLineMatched) {
      report.matchedSpeeches.push({
        lineNumber: speech.lineNumber,
        matchedText: speech.content,
        reason: matchReason
      });
    }
  });

  // 3. 단 한 번이라도 매칭된 발화가 있다면 성취(isAchieved)로 인정
  if (report.matchedSpeeches.length > 0) {
    report.isAchieved = true;
    // 전체 추출 발화 중 매칭 성공 발화 비율 산정
    report.achievementRate = Math.round((report.matchedSpeeches.length / userSpeeches.length) * 100);
  }

  return report;
}
