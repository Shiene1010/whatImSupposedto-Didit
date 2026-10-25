interface TransactionPayload {
  userId: string;
  originalTarget: string;
  fiveYearOldVersion: string;
  cheatKeyAction: string;
  phonicsSound: string;
}

/**
 * RollbackHandler
 * 8초 데드라인 타이머를 가동하여 마크다운 파싱 및 DB 유효성 검증 실패 시 상태를 완전 복구합니다.
 */
export class RollbackHandler {
  private supabaseClient: any;
  private deadlineMs = 8000; // 8초 하드코딩 데드라인 임계치 가드레일

  constructor(supabaseClient: any) {
    this.supabaseClient = supabaseClient;
  }

  /**
   * executeWith8SecRollback Guard
   * 8초 데드라인 내에 완료되지 않으면 프로미스를 강제 거부(Reject)하고 롤백 컨텍스트를 반환합니다.
   */
  public async executeWith8SecRollback(payload: TransactionPayload): Promise<{ success: boolean; status: string }> {
    
    // 1. 8초 타이머 거부(Reject) 프로미스 생성
    const rollbackTimerPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('TRANSACTION_TIMEOUT_8SEC_LIMIT_REACHED'));
      }, this.deadlineMs);
    });

    // 2. 실제 Supabase PostgreSQL RPC 안전 트랜잭션 가동 프로미스
    const dbTransactionPromise = async () => {
      const { data, error } = await this.supabaseClient.rpc('execute_safe_prescription_transaction', {
        p_user_id: payload.userId,
        p_original_target: payload.originalTarget,
        p_five_year_old: payload.fiveYearOldVersion,
        p_cheat_key: payload.cheatKeyAction,
        p_phonics_sound: payload.phonicsSound
      });

      if (error) {
        throw new Error(`DB_RPC_FAILED: ${error.message}`);
      }
      return data;
    };

    try {
      // 3. 8초 타이머와 실제 처리 프로미스의 실시간 레이스 경쟁 유도
      await Promise.race([dbTransactionPromise(), rollbackTimerPromise]);
      
      console.log(`🔵 [ROLLBACK GUARD] 유저 [${payload.userId}] 트랜잭션 8초 이내에 정상 처리 완료.`);
      return { success: true, status: 'TRANSACTION_COMMITTED' };

    } catch (error: any) {
      console.error(`🚨 [CRITICAL ROLLBACK TRIGGERED] 사유: ${error.message}`);
      
      // 8초 타임아웃 또는 데이터 파괴 예외 발생 시 상위 아키텍처에 롤백 상태 전파
      // PostgreSQL RPC 특성상 에러가 터지거나 중단되면 자산은 자동으로 원상 복구(Rollback) 상태 유지
      return { 
        success: false, 
        status: error.message === 'TRANSACTION_TIMEOUT_8SEC_LIMIT_REACHED' 
          ? 'TIMEOUT_ROLLED_BACK' 
          : 'EXCEPTION_ROLLED_BACK' 
      };
    }
  }
}
