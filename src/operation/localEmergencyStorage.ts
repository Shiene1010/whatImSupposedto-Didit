export interface EmergencyMarkdownPayload {
  id: string;               // 대피 로그 유니크 키 (예: 유저닉네임_주차_타임스탬프)
  userNickname: string;
  rawMarkdownContent: string;
  savedAt: string;
  syncStatus: 'PENDING_SYNC' | 'SYNCED';
}

/**
 * LocalEmergencyStorage
 * 외부 API 가동 불가 시 브라우저 내 IndexedDB 로컬 대피소로 분기 라우팅하여 데이터를 보존합니다.
 */
export class LocalEmergencyStorage {
  private dbName = 'DidItEmergencyShelter';
  private storeName = 'markdown_backups';
  private dbVersion = 1;

  /**
   * IndexedDB 인스턴스 초기화 및 오브젝트 스토어 생성
   */
  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(new Error('IndexedDB 초기화 실패'));
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains(this.storeName)) {
          // id 필드를 기본 키로 지정하여 스토어 생성
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * 데이터 대피소 즉각 적재 (Evacuation Put)
   */
  public async evacuateData(userNickname: string, content: string): Promise<EmergencyMarkdownPayload> {
    const db = await this.initDB();
    const payload: EmergencyMarkdownPayload = {
      id: `${userNickname}_${Date.now()}`,
      userNickname,
      rawMarkdownContent: content,
      savedAt: new Date().toISOString(),
      syncStatus: 'PENDING_SYNC'
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(payload);

      request.onsuccess = () => {
        console.log(`🟢 [EMERGENCY SHELTER] 유저 [${userNickname}]의 마크다운 데이터 로컬 IndexedDB 대피 성공.`);
        resolve(payload);
      };
      request.onerror = () => {
        reject(new Error('대피소 데이터 적재 프로세스 실패'));
      };
    });
  }

  /**
   * 백엔드 네트워크 복구 시 원격 서버로 밀어 올리기 위한 미동기 대피 자산 전수 목록 조회
   */
  public async getPendingSyncPayloads(): Promise<EmergencyMarkdownPayload[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const allItems = request.result as EmergencyMarkdownPayload[];
        // 아직 동기화되지 않고 대기 중인 자산만 필터링
        resolve(allItems.filter(item => item.syncStatus === 'PENDING_SYNC'));
      };
      request.onerror = () => reject(new Error('대피소 목록 조회 실패'));
    });
  }
}
