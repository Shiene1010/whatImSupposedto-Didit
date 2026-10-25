export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  failureThreshold: number;      // 몇 번 연속 실패했을 때 회로를 열 것인가 (예: 3회)
  timeoutDuration: number;       // 몇 밀리초(ms) 지연 시 타임아웃 장애로 간주할 것인가 (예: 5000ms)
  cooldownPeriod: number;        // 회로가 열린 후 다시 복구를 시도할 대기 시간 (예: 10000ms)
}

/**
 * API CircuitBreaker
 * AI API 및 네트워크 지연 상태를 실시간 감시하여 시스템 장애 확산을 방어합니다.
 */
export class ApiCircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount: number = 0;
  private lastFailureTime: number | null = null;
  
  private config: CircuitBreakerConfig;

  constructor(config?: Partial<CircuitBreakerConfig>) {
    this.config = {
      failureThreshold: config?.failureThreshold ?? 3,
      timeoutDuration: config?.timeoutDuration ?? 5000,
      cooldownPeriod: config?.cooldownPeriod ?? 10000
    };
  }

  /**
   * 회로 상태 동적 반환 및 쿨다운 타이머 체크
   */
  public getState(): CircuitState {
    // OPEN 상태일 때 쿨다운 기간이 경과했다면 하프오픈(HALF_OPEN)으로 전환하여 복구 기회 제공
    if (this.state === 'OPEN' && this.lastFailureTime) {
      const now = Date.now();
      if (now - this.lastFailureTime > this.config.cooldownPeriod) {
        this.state = 'HALF_OPEN';
      }
    }
    return this.state;
  }

  /**
   * 네트워크 요청 원격 프록시 가동 핸들러
   * @param requestFn 실행할 백엔드 API/네트워크 프로미스 함수
   * @param fallbackFn 회로가 열렸을 때 즉각 구동될 Green 로컬 우회 대피소 함수
   */
  public async execute<T>(requestFn: () => Promise<T>, fallbackFn: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    // 1. 회로가 완전히 열린(OPEN) 위험 상태일 경우 외부 요청을 즉시 차단하고 대피소 라우터 가동
    if (currentState === 'OPEN') {
      console.warn('⚠️ [CIRCUIT OPEN] AI API 지연 임계치 초과 상태입니다. 즉시 로컬 가드레일로 우회합니다.');
      return fallbackFn();
    }

    // 2. 강제 5초 타임아웃 가드 프로미스 생성
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), this.config.timeoutDuration);
    });

    try {
      // 실제 API 요청과 5초 타임아웃 레이어 경쟁 유도
      const result = await Promise.race([requestFn(), timeoutPromise]);
      
      // 요청 성공 시 상태 원상 복구 및 초기화
      this.onSuccess();
      return result;

    } catch (error: any) {
      this.onFailure(error);
      
      // 실패 컨텍스트를 삼키고 유저에게는 정상적으로 로컬 우회 데이터셋 제공
      return fallbackFn();
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED';
    console.log('🟢 [CIRCUIT CLOSED] 모든 백엔드 파이프라인 시스템 정상 가동 중.');
  }

  private onFailure(error: Error) {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    console.error(`🔴 [CIRCUIT FAILURE] 장애 기록 수립 (${this.failureCount}/${this.config.failureThreshold}). 사유: ${error.message}`);

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN';
      console.error('🚨 [CIRCUIT BREAKER CRITICAL] 연속 장애 임계치 도달! 회로를 차단합니다 (OPEN).');
    }
  }
}
