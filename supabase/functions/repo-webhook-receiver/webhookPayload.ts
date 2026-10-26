export interface PushSummary {
  repositoryFullName: string;
  commitCount: number;
  poolFileCount: number;
}

const POOL_PREFIX = 'assets/stage_05_repository_pool/';
const FILE_CHANGE_TYPES = ['added', 'modified', 'removed'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parsePushSummary(payload: unknown): PushSummary | null {
  if (!isRecord(payload) || !isRecord(payload.repository)) {
    return null;
  }

  const repositoryFullName = payload.repository.full_name;
  if (
    typeof repositoryFullName !== 'string'
    || repositoryFullName.length === 0
    || !Array.isArray(payload.commits)
  ) {
    return null;
  }

  const changedPoolFiles = new Set<string>();

  for (const commit of payload.commits) {
    if (!isRecord(commit)) {
      return null;
    }

    for (const changeType of FILE_CHANGE_TYPES) {
      const files = commit[changeType];
      if (!Array.isArray(files) || !files.every((file) => typeof file === 'string')) {
        return null;
      }

      for (const file of files) {
        if (file.startsWith(POOL_PREFIX)) {
          changedPoolFiles.add(file);
        }
      }
    }
  }

  return {
    repositoryFullName,
    commitCount: payload.commits.length,
    poolFileCount: changedPoolFiles.size,
  };
}
