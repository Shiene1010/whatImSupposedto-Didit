export interface UserSpeech {
  nickname: string;
  content: string;
  lineNumber: number;
}

/**
 * scriptSplitter
 * 대규모 대화록 문자열에서 특정 유저의 발화(Did) 데이터만 필터링하여 추출합니다.
 */
export function splitScriptByUser(globalScript: string, targetNickname: string): UserSpeech[] {
  const result: UserSpeech[] = [];
  
  if (!globalScript || !targetNickname) return result;

  const lines = globalScript.split('\n');
  
  // 다양한 마크다운 대화 표기법 대응 정규식
  // 패턴 1: **닉네임**: 대사 또는 **닉네임** : 대사
  // 패턴 2: [닉네임] 대사 또는 [닉네임]: 대사
  // 패턴 3: 닉네임: 대사
  const pattern1 = /^\s*\*\*(.*?)\*\*?\s*:\s*(.*)/;
  const pattern2 = /^\s*\[(.*?)\]\s*:?\s*(.*)/;
  const pattern3 = /^\s*([^:\s]+)\s*:\s*(.*)/;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    let detectedNickname = '';
    let speechContent = '';

    // 정규식 매칭 우선순위 검사
    const match1 = trimmedLine.match(pattern1);
    if (match1) {
      detectedNickname = match1[1].trim();
      speechContent = match1[2].trim();
    } else {
      const match2 = trimmedLine.match(pattern2);
      if (match2) {
        detectedNickname = match2[1].trim();
        speechContent = match2[2].trim();
      } else {
        const match3 = trimmedLine.match(pattern3);
        if (match3 && !trimmedLine.startsWith('-') && !trimmedLine.startsWith('>')) {
          detectedNickname = match3[1].trim();
          speechContent = match3[2].trim();
        }
      }
    }

    // 대상 타겟 닉네임과 일치하는 경우 결과 배열에 적재 (대소문자 및 공백 예외 방어)
    if (detectedNickname.toLowerCase() === targetNickname.toLowerCase()) {
      result.push({
        nickname: detectedNickname,
        content: speechContent,
        lineNumber: index + 1 // 1-based index로 저장
      });
    }
  });

  return result;
}
