import { FeatureFlagEngine } from './featureFlag';
import { PrescriptionResult } from '../core/engine/aiContrastEngine';

interface RenderOutput {
  componentId: string;
  html: string;
  meta: Record<string, any>;
}

/**
 * ToggleGateway
 * 피처 플래그 원격 토글 상태에 따라 파이프라인 출력 포맷을 무다운타임 실시간 제어합니다.
 */
export class ToggleGateway {
  private flagEngine: FeatureFlagEngine;

  constructor(flagEngine: FeatureFlagEngine) {
    this.flagEngine = flagEngine;
  }

  /**
   * 처방전 데이터의 포닉스 사운드 컴포넌트 동적 렌더링 핸들러
   * 깨짐 리스크 발생 시 하이픈 컴포넌트를 즉각 차단하고 일반 문자열 텍스트로 대체 방어합니다.
   */
  public async renderPhonicsComponent(prescription: PrescriptionResult): Promise<RenderOutput> {
    // 원격 토글 스위치 상태 확인
    const isPhonicsComponentEnabled = await this.flagEngine.isFeatureEnabled(
      'enable-phonics-hyphen-component',
      true // 네트워크 단절 시 기본 활성화 안전책
    );

    if (isPhonicsComponentEnabled) {
      // 정상 상태: 하이픈 음절 분리 가상 컴포넌트 바인딩 출력
      return {
        componentId: 'advanced-phonics-hyphen-v1',
        html: `<div class="sound-chip-active">${prescription.phonicsSound}</div>`,
        meta: { status: 'NORMAL_RUN', style: 'HYPHEN_AESTHETIC' }
      };
    } else {
      // 핫픽스 상태: 하이픈 컴포넌트 오염 리포트 시 즉각 일반 텍스트 라벨로 우회 방어
      console.warn('⚠️ [TOGGLE ACTIVATE] 포닉스 하이픈 컴포넌트 원격 차단 감지. 안전 텍스트 모드로 우회 렌더링합니다.');
      
      // 하이픈 기호(-)를 강제로 제거하여 데이터 깨짐 현상을 원천 방어하는 복구 포맷팅
      const sanitizedSound = prescription.phonicsSound.replace(/-/g, ' ');
      
      return {
        componentId: 'fallback-plain-text-v1',
        html: `<span class="sound-text-fallback">${sanitizedSound}</span>`,
        meta: { status: 'HOTFIX_PROTECTED', style: 'PLAIN_TEXT' }
      };
    }
  }
}
