export interface ParsedMarkdown {
  frontMatter: Record<string, string>;
  quotes: string[];
  todoItems: {
    text: string;
    completed: boolean;
  }[];
  rawBody: string;
}

/**
 * mdStaticParser
 * 마크다운 파일 문자열을 읽어 Front Matter와 특정 토큰(> , - [ ])을 분리 추출합니다.
 */
export function parseMarkdown(fileContent: string): ParsedMarkdown {
  const result: ParsedMarkdown = {
    frontMatter: {},
    quotes: [],
    todoItems: [],
    rawBody: ''
  };

  if (!fileContent) return result;

  let currentContent = fileContent.trim();
  
  // 1. YAML Front Matter 파싱 (--- 와 --- 사이의 구간)
  if (currentContent.startsWith('---')) {
    const nextTripleDash = currentContent.indexOf('---', 3);
    if (nextTripleDash !== -1) {
      const frontMatterBlock = currentContent.substring(3, nextTripleDash).trim();
      result.rawBody = currentContent.substring(nextTripleDash + 3).trim();

      // 라인별 key: value 분리
      frontMatterBlock.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, ''); // 따옴표 제거
          if (key) result.frontMatter[key] = value;
        }
      });
    } else {
      result.rawBody = currentContent;
    }
  } else {
    result.rawBody = currentContent;
  }

  // 2. 본문 라인별 순회하며 토큰(Quotes, Todo) 추출
  const lines = result.rawBody.split('\n');
  
  lines.forEach(line => {
    const trimmedLine = line.trim();

    // 2-1. 인용구 (> 토큰) 추출
    if (trimmedLine.startsWith('>')) {
      const quoteText = trimmedLine.substring(1).trim();
      if (quoteText) result.quotes.push(quoteText);
    }

    // 2-2. 체크리스트 (- [ ] 또는 - [x] 토큰) 추출
    if (trimmedLine.startsWith('- [')) {
      const isTodoMatch = trimmedLine.match(/^- \[( |x|X)\] (.*)/);
      if (isTodoMatch) {
        const checkMarker = isTodoMatch[1];
        const todoText = isTodoMatch[2].trim();
        
        result.todoItems.push({
          text: todoText,
          completed: checkMarker.toLowerCase() === 'x'
        });
      }
    }
  });

  return result;
}
