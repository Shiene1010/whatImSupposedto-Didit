'use client';

import { useState } from 'react';
import { analyzeDemoSession, DemoAnalysis } from '../demo/demoSession';

const SAMPLE_GOAL = '매일 영어 회화 한 문장 완벽하게 외우고 원어민처럼 뱉기';
const SAMPLE_NICKNAME = 'EasyPeasy';
const SAMPLE_LOG = [
  '**Sara**: 오늘 오전 스트레칭을 완료했어요.',
  '**EasyPeasy**: 오늘 영단어랑 회화 한 문장을 간신히 외웠어요. 완벽하진 않았지만 시도했어요.',
  '[EasyPeasy]: 소리 내서 크게 세 번 읽었습니다. 톡-투-미-나우!',
  'Rina: 다음에는 저도 해볼게요.',
].join('\n');

export default function HomePage() {
  const [goal, setGoal] = useState('');
  const [log, setLog] = useState('');
  const [targetNickname, setTargetNickname] = useState('');
  const [analysis, setAnalysis] = useState<DemoAnalysis | null>(null);
  const [error, setError] = useState('');

  function runAnalysis(nextGoal = goal, nextLog = log, nextNickname = targetNickname) {
    setGoal(nextGoal);
    setLog(nextLog);
    setTargetNickname(nextNickname);
    setError('');

    try {
      setAnalysis(analyzeDemoSession(nextGoal, nextLog, nextNickname));
    } catch (analysisError) {
      setAnalysis(null);
      setError(analysisError instanceof Error ? analysisError.message : '분석 중 문제가 생겼어요.');
    }
  }

  function loadSample() {
    runAnalysis(SAMPLE_GOAL, SAMPLE_LOG, SAMPLE_NICKNAME);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="작게, 해냄 홈">
          <span className="brand-mark" aria-hidden="true">ㄷ</span>
          <span>작게, 해냄</span>
        </a>
        <div className="topbar-right">
          <span className="demo-badge"><span /> DEMO SESSION</span>
          <a className="top-link" href="#how-it-works">어떻게 작동하나요?</a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="sparkle">✳</span> 완벽주의를 위한 작은 실행 도구</div>
          <h1>완벽한 계획보다,<br /><span>오늘 한 번의 실행.</span></h1>
          <p className="hero-description">
            이루고 싶은 목표와 실제로 한 일을 나란히 놓아보세요.
            작은 시도도 놓치지 않고, 다음 행동을 가볍게 만들어 드려요.
          </p>
          <div className="privacy-note">
            <span className="lock-icon" aria-hidden="true">▣</span>
            데모 세션 · 입력한 내용은 저장되지 않아요
          </div>
        </div>

        <div className="hero-stamp" aria-hidden="true">
          <span className="stamp-sun">✳</span>
          <span>ONE<br />SMALL<br />STEP</span>
          <span className="stamp-caption">오늘도 충분해요</span>
        </div>
      </section>

      <section className="workbench" aria-label="목표와 실행 기록 입력">
        <div className="section-heading">
          <div>
            <span className="section-kicker">YOUR CHECK-IN</span>
            <h2>오늘의 체크인</h2>
          </div>
          <button className="sample-button" type="button" onClick={loadSample}>
            <span aria-hidden="true">↗</span> 예시로 바로 체험
          </button>
        </div>

        <div className="input-grid">
          <div className="input-card goal-card">
            <span className="field-topline">
              <span className="field-icon goal-icon">01</span>
              <label className="field-label" htmlFor="goal-input">내가 하려던 것</label>
              <span className="field-hint">목표</span>
            </span>
            <textarea
              id="goal-input"
              value={goal}
              onChange={(event) => {
                setGoal(event.target.value);
                setAnalysis(null);
                setError('');
              }}
              placeholder={'예: 매일 영어 회화 한 문장 완벽하게 외우기'}
              rows={5}
              aria-label="이루고 싶은 목표"
            />
            <span className="field-footnote">잘 정리하지 않아도 괜찮아요. 생각난 그대로 적어주세요.</span>
          </div>

          <div className="input-card log-card">
            <span className="field-topline">
              <span className="field-icon log-icon">02</span>
              <label className="field-label" htmlFor="log-input">실제로 해본 것</label>
              <span className="field-hint">기록</span>
            </span>
            <textarea
              id="log-input"
              value={log}
              onChange={(event) => {
                setLog(event.target.value);
                setAnalysis(null);
                setError('');
              }}
              placeholder={'예: 한 문장을 세 번 소리 내 읽었어. 완벽하진 않았지만 해냈어.'}
              rows={5}
              aria-label="실제로 한 일"
            />
            <label className="field-hint nickname-label" htmlFor="nickname-input">분석할 닉네임</label>
            <input
              id="nickname-input"
              className="nickname-input"
              value={targetNickname}
              onChange={(event) => {
                setTargetNickname(event.target.value);
                setAnalysis(null);
                setError('');
              }}
              placeholder="예: EasyPeasy"
              aria-label="대화록에서 분석할 닉네임"
            />
            <span className="field-footnote">작은 시도, 중간에 멈춘 순간도 기록이 될 수 있어요.</span>
          </div>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="submit-row">
          <span className="submit-note"><span aria-hidden="true">✦</span> 완벽함 대신, 시도한 순간을 찾아요</span>
          <button
            className="analyze-button"
            type="button"
            onClick={() => runAnalysis()}
            disabled={!goal.trim() || !targetNickname.trim()}
          >
            오늘의 작은 성취 찾기 <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      {analysis ? (
        <section className="results">
          <div className="result-header">
            <div>
              <span className="section-kicker">YOUR MOMENT</span>
              <h2>오늘의 발견</h2>
            </div>
            <span
              className={`achievement-badge ${analysis.report.isAchieved ? 'achieved' : 'not-achieved'}`}
              role="status"
              aria-live="polite"
            >
              <span aria-hidden="true">{analysis.report.isAchieved ? '✓' : '○'}</span>
              {analysis.report.isAchieved ? '규칙에서 시도 신호를 찾았어요' : '다음 한 걸음이 남아 있어요'}
            </span>
          </div>

          <div className="result-grid">
            <div className="prescription-panel">
              <div className="parse-preview">
                <div className="parse-preview-heading">
                  <span className="section-kicker">PARSED INPUT</span>
                  <h3>이렇게 읽었어요</h3>
                </div>
                {analysis.parsedGoal.frontMatter.persona && (
                  <span className="persona-chip">페르소나 · {analysis.parsedGoal.frontMatter.persona}</span>
                )}
                {analysis.parsedGoal.quotes.length > 0 && (
                  <div className="parsed-group">
                    <span className="parsed-label">목표 인용구</span>
                    {analysis.parsedGoal.quotes.map((quote, index) => (
                      <p className="parsed-quote" key={`${index}-${quote}`}>{quote}</p>
                    ))}
                  </div>
                )}
                {analysis.parsedGoal.todoItems.length > 0 && (
                  <div className="parsed-group">
                    <span className="parsed-label">체크리스트</span>
                    <ul className="parsed-todos">
                      {analysis.parsedGoal.todoItems.map((todo, index) => (
                        <li key={`${index}-${todo.text}`}>
                          <span aria-hidden="true">{todo.completed ? '✓' : '○'}</span>
                          <span>{todo.text}</span>
                          <small>{todo.completed ? '완료 표시' : '미완료 표시'}</small>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="extracted-speeches">
                <div className="parse-preview-heading">
                  <span className="parsed-label">대상 발화 · {analysis.targetNickname}</span>
                  <small>{analysis.extractedSpeeches.length}개</small>
                </div>
                {analysis.extractedSpeeches.length > 0 ? (
                  <ul>
                    {analysis.extractedSpeeches.map((speech) => (
                      <li key={`${speech.lineNumber}-${speech.content}`}>
                        <span>{speech.lineNumber}</span>
                        <p>{speech.content}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-speeches">이 닉네임으로 시작하는 발화를 찾지 못했어요.</p>
                )}
              </div>
              <div className="prescription-heading">
                <span className="prescription-spark">✳</span>
                <div>
                  <span className="section-kicker">A GENTLER PLAN</span>
                  <h3>목표를 가볍게 바꿔보기</h3>
                </div>
                <span className="rule-based-tag">규칙 기반 데모</span>
              </div>
              <div className="steps">
                <article className="step-card">
                  <span className="step-number">01</span>
                  <div><span className="step-label">내가 원한 것</span><p>{analysis.prescription.originalTarget}</p></div>
                </article>
                <article className="step-card">
                  <span className="step-number">02</span>
                  <div><span className="step-label">조금 더 쉽게</span><p>{analysis.prescription.fiveYearOldVersion}</p></div>
                </article>
                <article className="step-card highlight-step">
                  <span className="step-number">03</span>
                  <div><span className="step-label">지금 할 수 있는 치트키</span><p>{analysis.prescription.cheatKeyAction}</p></div>
                </article>
                <article className="step-card sound-step">
                  <span className="step-number">04</span>
                  <div><span className="step-label">시작 소리</span><p>{analysis.prescription.phonicsSound}</p></div>
                </article>
              </div>
            </div>

            <aside className="evidence-panel">
              <div className="evidence-title">
                <span className="evidence-icon" aria-hidden="true">✦</span>
                <div>
                  <span className="section-kicker">DID HAPPEN</span>
                  <h3>기록에서 찾은 순간</h3>
                </div>
              </div>
              {analysis.report.isAchieved ? (
                <>
                  <div className="achievement-meter">
                    <div className="meter-copy">
                      <span>규칙 일치 발화</span>
                      <strong>{analysis.report.matchedSpeeches.length}<small> / {analysis.extractedSpeeches.length}</small></strong>
                    </div>
                    <span className="meter-caption">추출된 대상 발화 중 규칙에 일치한 문장 수예요. 달성률은 아닙니다.</span>
                  </div>
                  <div className="evidence-list">
                    {analysis.report.matchedSpeeches.map((speech) => (
                      <article className="evidence-quote" key={`${speech.lineNumber}-${speech.matchedText}`}>
                        <span className="quote-mark" aria-hidden="true">“</span>
                        <p>{speech.matchedText}</p>
                        <span className="evidence-reason">{speech.reason}</span>
                      </article>
                    ))}
                  </div>
                  <p className="signal-caveat">키워드/행동 단어가 포함됐다는 규칙 신호입니다. 실제 행동을 확인하거나 문맥을 이해한 결과는 아니에요.</p>
                </>
              ) : analysis.extractedSpeeches.length === 0 ? (
                <div className="empty-evidence">
                  <span aria-hidden="true">☁</span>
                  <p>“{analysis.targetNickname}” 닉네임의 발화를 찾지 못했어요.<br />화자 표기와 닉네임을 확인해 주세요.</p>
                </div>
              ) : (
                <div className="empty-evidence">
                  <span aria-hidden="true">☁</span>
                  <p>추출한 발화에서 목표 관련 규칙 신호를 찾지 못했어요.<br />시도한 일을 기록에 더해 다시 살펴볼 수 있어요.</p>
                </div>
              )}
              <div className="privacy-footnote"><span aria-hidden="true">▣</span> 이 분석은 브라우저에서만 실행돼요. 입력한 내용은 저장되지 않습니다.</div>
            </aside>
          </div>
          <p className="demo-disclaimer">성취 신호는 저장소의 키워드 기반 KPI 판정 규칙을 사용합니다. 처방 문구는 AI 생성이 아닌 데모용 템플릿입니다.</p>
        </section>
      ) : (
        <section className="preview-strip" aria-label="분석 미리보기">
          <div className="preview-icon">✳</div>
          <div className="preview-copy">
            <span className="section-kicker">A SMALLER WAY FORWARD</span>
            <p>목표를 작게 나누고, 이미 해낸 순간을 함께 찾아볼게요.</p>
          </div>
          <div className="preview-steps" aria-label="4단계 미리보기">
            <span>원래 목표</span><b>→</b><span>쉬운 말</span><b>→</b><span>작은 행동</span><b>→</b><span>시작 신호</span>
          </div>
        </section>
      )}

      <section className="how-section" id="how-it-works">
        <div className="how-heading">
          <span className="section-kicker">SMALL STEPS COUNT</span>
          <h2>완벽하게 하지 않아도,<br />시작한 건 사라지지 않으니까.</h2>
        </div>
        <div className="how-cards">
          <article><span>01</span><h3>있는 그대로 적기</h3><p>계획과 오늘의 기록을 편하게 입력해요.</p></article>
          <article><span>02</span><h3>작은 시도 발견</h3><p>기록 속에서 실제로 해낸 순간을 찾아요.</p></article>
          <article><span>03</span><h3>다음 행동 가볍게</h3><p>다음 한 걸음을 시작하기 쉽게 바꿔봐요.</p></article>
        </div>
      </section>

      <footer className="footer">
        <span className="footer-brand"><span className="brand-mark" aria-hidden="true">ㄷ</span> 작게, 해냄</span>
        <span>완벽함 말고, 한 번의 시도부터.</span>
      </footer>
    </main>
  );
}
