export interface FeatureToggle {
  key: string;
  isEnabled: boolean;
  description: string;
  updatedAt: string;
}

/**
 * FeatureFlagEngine
 * 원격 데이터베이스의 설정 스위치를 동적으로 읽어와 특정 모듈의 가동 여부를 무중단 제어합니다.
 */
export class FeatureFlagEngine {
  private cache = new Map<string, { isEnabled: boolean; expiresAt: number }>();
  private cacheTtl = 30000; // 30초 인메모리 캐시 보존으로 DB 커넥션 병목 방어
  private supabaseClient: any;

  constructor(supabaseClient: any) {
    this.supabaseClient = supabaseClient;
  }

  /**
   * 특정 피처 스위치가 켜져 있는지 실시간 확인 (캐시 가드 장착)
   * @param featureKey 검증할 피처 고유 키 (예: 'enable-rina-parser')
   * @param defaultValue 네트워크 장애 시 안전용 복구 기본값
   */
  public async isFeatureEnabled(featureKey: string, defaultValue = true): Promise<boolean> {
    const now = Date.now();
    const cached = this.cache.get(featureKey);

    // 1. 인메모리 캐시 히트(Hit) 검사 및 유효 기한 확인
    if (cached && cached.expiresAt > now) {
      return cached.isEnabled;
    }

    try {
      // 2. 캐시 미스(Miss) 시 Supabase 데이터베이스 원격 config 테이블 조회
      const { data, error } = await this.supabaseClient
        .from('system_feature_flags')
        .select('is_enabled')
        .eq('key', featureKey)
        .single();

      if (error || !data) {
        console.warn(`⚠️ [FEATURE FLAG] 키 [${featureKey}] 조회 실패. 기본값 [${defaultValue}] 적용.`);
        return defaultValue;
      }

      const isEnabled = data.is_enabled;

      // 3. 갱신된 데이터를 캐시에 안전 적재
      this.cache.set(featureKey, {
        isEnabled,
        expiresAt: now + this.cacheTtl
      });

      return isEnabled;

    } catch (dbError) {
      console.error(`🔴 [FEATURE FLAG CRITICAL] Config 인프라 통신 장애:`, dbError);
      return defaultValue;
    }
  }

  /**
   * 실운영 핫픽스용 강제 캐시 퍼지(Purge) - 즉시 반영용
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('🟡 [FEATURE FLAG] 인메모리 스위치 캐시가 완전 강제 초기화되었습니다.');
  }
}
