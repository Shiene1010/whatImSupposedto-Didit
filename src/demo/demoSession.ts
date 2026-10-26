import { parseMarkdown, ParsedMarkdown } from '../core/parser/mdStaticParser';
import { splitScriptByUser, UserSpeech } from '../core/splitter/scriptSplitter';
import { evaluatePurpleKpi, KpiMatchReport } from '../metrics/purpleKpiEngine';

export interface DemoPrescription {
  originalTarget: string;
  fiveYearOldVersion: string;
  cheatKeyAction: string;
  phonicsSound: string;
}

export interface DemoAnalysis {
  prescription: DemoPrescription;
  parsedGoal: ParsedMarkdown;
  extractedSpeeches: UserSpeech[];
  report: KpiMatchReport;
  targetNickname: string;
}

function asGoalMarkdown(goal: string): string {
  const lines = goal.split(/\r?\n/);
  const hasFrontMatter = lines[0]?.trim() === '---';
  let frontMatterDelimiters = 0;
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (hasFrontMatter && trimmed === '---' && frontMatterDelimiters < 2) {
        frontMatterDelimiters++;
        return line;
      }

      if (
        (hasFrontMatter && frontMatterDelimiters === 1)
        || !trimmed
        || trimmed.startsWith('>')
        || /^-\s+\[[ xX]\]/.test(trimmed)
        || trimmed.startsWith('#')
      ) {
        return line;
      }
      return `> ${trimmed}`;
    })
    .join('\n');
}

export function analyzeDemoSession(goal: string, log: string, targetNickname: string): DemoAnalysis {
  const normalizedNickname = targetNickname.trim();
  if (!normalizedNickname) {
    throw new Error('대화록에서 찾을 닉네임을 입력해 주세요.');
  }

  const parsedGoal = parseMarkdown(asGoalMarkdown(goal.trim()));
  const originalTarget = parsedGoal.quotes[0]
    ?? parsedGoal.todoItems.find((item) => !item.completed)?.text
    ?? parsedGoal.todoItems[0]?.text;
  if (!originalTarget) {
    throw new Error('목표를 한 줄 이상 적어주세요.');
  }

  const speeches = splitScriptByUser(log, normalizedNickname);
  const report = evaluatePurpleKpi(normalizedNickname, parsedGoal, speeches);
  const gentlerTarget = simplifyTarget(originalTarget);

  return {
    parsedGoal,
    extractedSpeeches: speeches,
    prescription: {
      originalTarget,
      fiveYearOldVersion: `“${gentlerTarget}” — 딱 한 번만 해봐요.`,
      cheatKeyAction: `지금 1분만 시작해요: ${gentlerTarget}`,
      phonicsSound: '시-작-해-보자',
    },
    report,
    targetNickname: normalizedNickname,
  };
}

function simplifyTarget(target: string): string {
  const simplified = target
    .replace(/완벽하게|완벽히|완벽한|원어민처럼/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return simplified || target;
}
