interface RetryConfig {
  maxAttempts?: number;
  delayMs?: number;
  backoffFactor?: number;
  shouldRetry?: (error: any) => boolean;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffFactor: 2,
  shouldRetry: (error: any) => true,
};

export async function retry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: any;
  let attempt = 1;
  let delay = finalConfig.delayMs;

  while (attempt <= finalConfig.maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === finalConfig.maxAttempts || !finalConfig.shouldRetry(error)) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= finalConfig.backoffFactor;
      attempt++;
    }
  }

  throw lastError;
}

export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config: RetryConfig = {}
): T {
  return (async (...args: Parameters<T>) => {
    return retry(() => fn(...args), config);
  }) as T;
}
