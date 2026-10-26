import { parseMarkdown } from '../core/parser/mdStaticParser';
import { splitScriptByUser } from '../core/splitter/scriptSplitter';
import { evaluatePurpleKpi, KpiMatchReport } from '../metrics/purpleKpiEngine';

export interface DemoPrescription {
  originalTarget: string;
  fiveYearOldVersion: string;
  cheatKeyAction: string;
  phonicsSound: string;
}

export interface DemoAnalysis {
  prescription: DemoPrescription;
  report: KpiMatchReport;
  speechCount: number;
}

const DEMO_NICKNAME = 'Demo';

function asGoalMarkdown(goal: string): string {
  return goal
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('>') || /^-\s+\[[ xX]\]/.test(trimmed) || trimmed.startsWith('#')) {
        return line;
      }
      return `> ${trimmed}`;
    })
    .join('\n');
}

function asDemoTranscript(log: string): string {
  return log
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `**${DEMO_NICKNAME}**: ${line}`)
    .join('\n');
}

export function analyzeDemoSession(goal: string, log: string): DemoAnalysis {
  const parsedGoal = parseMarkdown(asGoalMarkdown(goal.trim()));
  const originalTarget = parsedGoal.quotes[0] ?? parsedGoal.todoItems[0]?.text;
  if (!originalTarget) {
    throw new Error('목표를 한 줄 이상 적어주세요.');
  }

  const speeches = splitScriptByUser(asDemoTranscript(log), DEMO_NICKNAME);
  const report = evaluatePurpleKpi(DEMO_NICKNAME, parsedGoal, speeches);
  const gentlerTarget = originalTarget
    .replace(/완벽하게|완벽히|완벽한|원어민처럼/g, '')
    .replace(/\s+/g, ' ')
    .trim() || originalTarget;

  return {
    prescription: {
      originalTarget,
      fiveYearOldVersion: `“${gentlerTarget}”을 한 번만 해봐요.`,
      cheatKeyAction: `지금 “${gentlerTarget}”을 완벽하지 않아도 1분만 시작해요.`,
      phonicsSound: '시-작-해-보자',
    },
    report,
    speechCount: speeches.length,
  };
}
