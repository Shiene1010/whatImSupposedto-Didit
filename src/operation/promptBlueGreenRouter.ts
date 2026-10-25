import { ParsedMarkdown } from '../core/parser/mdStaticParser';
import { UserSpeech } from '../core/splitter/scriptSplitter';
import { PrescriptionResult } from '../core/engine/aiContrastEngine';

export interface PromptVersionMeta {
  versionCode: 'v2.0_BLUE' | 'v2.1_GREEN';
  systemPrompt: string;
  temperature: number;
}

/**
 * PromptBlueGreenRouter
 * 실운영 서비스 가동 중, 라이브 다운타임 없이 프롬프트 엔진 버전을 블루/그린으로 원격 전환합니다.
 */
export class PromptBlueGreenRouter {
  private supabaseClient: any;
  
  // 1. 고정형 블루(Blue) 구버전 프롬프트 자산 정의
  private bluePrompt: PromptVersionMeta = {
    versionCode: 'v2.0_BLUE',
    systemPrompt: `당신은 코어 분석 엔진 v2.0_BLUE입니다. 유저의 목표와 발화를 분석하여 4단 처방전을 JSON으로 출력하세요.`,
    temperature: 0.3
  };

  // 2. 진화형 그린(Green) 신버전 프롬프트 자산 정의 (포닉스 사운드 하이픈 결합 규칙 고도화 버전)
  private greenPrompt: PromptVersionMeta = {
    versionCode: 'v2.1_GREEN',
    systemPrompt: `당신은 고도화된 분석 엔진 v2.1_GREEN입니다. 음절 간의 하이픈(-) 연결 무결성을 극대화하여 4단 처방전을 초정밀 JSON으로 뱉으세요.`,
    temperature: 0.2 // 정밀도 향상을 위한 온화도 하향 조정 가드레일
  };

  constructor(supabaseClient: any) {
    this.supabaseClient = supabaseClient;
  }

  /**
   * 라이브 라우팅 타겟 프롬프트 메타 동적 확보
   */
  public async getActivePromptVersion(): Promise<PromptVersionMeta> {
    try {
      // Supabase 원격 시스템 설정 테이블에서 현재 활성화된 배포 컬러 스위치('BLUE' 혹은 'GREEN') 획득
      const { data, error } = await this.supabaseClient
        .from('system_routing_config')
        .select('active_color')
        .eq('config_id', 'prompt_deployment_gate')
        .single();

      if (error || !data) {
        console.warn('⚠️ [PROMPT ROUTER] 배포 플래그 조회 실패. 안전 자산 [BLUE] 버전을 강제 가동합니다.');
        return this.bluePrompt;
      }

      // 컬러값에 따른 무다운타임 실시간 라우터 스위칭 분기
      if (data.active_color === 'GREEN') {
        return this.greenPrompt;
      }
      
      return this.bluePrompt;

    } catch (err) {
      console.error('🔴 [PROMPT ROUTER CRITICAL] 라우터 제어 인프라 통신 붕괴. 블루 가드레일 작동.', err);
      return this.bluePrompt;
    }
  }

  /**
   * 무다운타임 실시간 스위칭 통합 프록시 실행 엔진
   */
  public async routeAndExecute(
    parsedMd: ParsedMarkdown,
    userSpeeches: UserSpeech[],
    apiKey: string
  ): Promise<{ prescription: PrescriptionResult; deployedVersion: string }> {
    
    // 실시간 라우팅 버전 확정
    const activePrompt = await this.getActivePromptVersion();
    console.log(`🔵 [LIVE ROUTING SUCCESS] 현재 실시간 적용 중인 분석 프롬프트: [${activePrompt.versionCode}]`);

    // 본 연동 런타임 레이어에서는 확정된 프롬프트 메타가 적용되어 외부 AI 통신이 안전하게 트리거됩니다.
    // (데모 시뮬레이션을 위한 결과 스크릿 구조체 즉각 반환 조치)
    return {
      prescription: {
        originalTarget: parsedMd.quotes.join('') || "Live Target",
        fiveYearOldVersion: "신속히 단어장 열기",
        cheatKeyAction: "스마트폰 뒤집어놓기",
        phonicsSound: activePrompt.versionCode === 'v2.1_GREEN' ? "초-정-밀-소-리" : "구-버-전-소-리"
      },
      deployedVersion: activePrompt.versionCode
    };
  }
}
