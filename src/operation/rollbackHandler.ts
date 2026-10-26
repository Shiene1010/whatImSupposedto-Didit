interface TransactionPayload {
  userId: string;
  originalTarget: string;
  fiveYearOldVersion: string;
  cheatKeyAction: string;
  phonicsSound: string;
}

type TransactionResult =
  | { success: true; status: 'TRANSACTION_COMMITTED' }
  | { success: false; status: 'TIMEOUT_INDETERMINATE' | 'TRANSACTION_FAILED' };

interface RpcError {
  message: string;
}

interface RpcResponse {
  data: unknown;
  error: RpcError | null;
}

interface RpcRequest {
  abortSignal(signal: AbortSignal): PromiseLike<RpcResponse>;
}

interface SupabaseRpcClient {
  rpc(name: string, args: Record<string, string>): RpcRequest;
}

/**
 * RollbackHandler
 * 8초 데드라인으로 RPC를 중단 요청하고, 서버 측 커밋 여부가 불확실한 타임아웃을 명시합니다.
 */
export class RollbackHandler {
  private supabaseClient: SupabaseRpcClient;
  private deadlineMs: number;

  constructor(supabaseClient: SupabaseRpcClient, deadlineMs = 8000) {
    this.supabaseClient = supabaseClient;
    this.deadlineMs = deadlineMs;
  }

  /**
   * executeWith8SecDeadline Guard
   * Timeout aborts the client request, but does not prove that the database transaction rolled back.
   */
  public async executeWith8SecRollback(payload: TransactionPayload): Promise<TransactionResult> {
    const controller = new AbortController();
    let deadlineExceeded = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        deadlineExceeded = true;
        controller.abort();
        reject(new Error('TRANSACTION_TIMEOUT_8SEC_LIMIT_REACHED'));
      }, this.deadlineMs);
    });

    try {
      const request = this.supabaseClient
        .rpc('execute_safe_prescription_transaction', {
          p_user_id: payload.userId,
          p_original_target: payload.originalTarget,
          p_five_year_old: payload.fiveYearOldVersion,
          p_cheat_key: payload.cheatKeyAction,
          p_phonics_sound: payload.phonicsSound,
        })
        .abortSignal(controller.signal);

      const { error } = await Promise.race([request, timeoutPromise]);
      if (error) {
        console.error(`DB_RPC_FAILED: ${error.message}`);
        return { success: false, status: 'TRANSACTION_FAILED' };
      }

      console.log(`🔵 [RPC] 유저 [${payload.userId}] 트랜잭션 데드라인 내 정상 처리 완료.`);
      return { success: true, status: 'TRANSACTION_COMMITTED' };
    } catch (error) {
      if (deadlineExceeded) {
        console.error('RPC deadline exceeded; database commit status is indeterminate');
        return { success: false, status: 'TIMEOUT_INDETERMINATE' };
      }

      console.error('DB_RPC_FAILED:', error);
      return { success: false, status: 'TRANSACTION_FAILED' };
    } finally {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    }
  }
}
