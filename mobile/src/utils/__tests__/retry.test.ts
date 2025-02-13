import { withRetry } from '../retry';

describe('withRetry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return result immediately on success', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    const wrappedFn = withRetry(mockFn, { maxAttempts: 3, delayMs: 1000 });
    
    const result = await wrappedFn();
    
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const mockFn = jest.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValue('success');
    
    const wrappedFn = withRetry(mockFn, { maxAttempts: 3, delayMs: 1000 });
    
    const resultPromise = wrappedFn();
    
    // Fast-forward through delays
    jest.runAllTimers();
    
    const result = await resultPromise;
    
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should throw after max attempts', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('persistent failure'));
    const wrappedFn = withRetry(mockFn, { maxAttempts: 3, delayMs: 1000 });
    
    const resultPromise = wrappedFn();
    
    // Fast-forward through delays
    jest.runAllTimers();
    
    await expect(resultPromise).rejects.toThrow('persistent failure');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should respect shouldRetry function', async () => {
    const mockFn = jest.fn()
      .mockRejectedValueOnce(new Error('retry'))
      .mockRejectedValueOnce(new Error('do not retry'))
      .mockResolvedValue('success');
    
    const wrappedFn = withRetry(mockFn, {
      maxAttempts: 3,
      delayMs: 1000,
      shouldRetry: (error) => error.message === 'retry',
    });
    
    const resultPromise = wrappedFn();
    
    // Fast-forward through delays
    jest.runAllTimers();
    
    await expect(resultPromise).rejects.toThrow('do not retry');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should use exponential backoff', async () => {
    const mockFn = jest.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValue('success');
    
    const delayMs = 1000;
    const wrappedFn = withRetry(mockFn, { maxAttempts: 3, delayMs });
    
    const resultPromise = wrappedFn();
    
    // First retry should wait delayMs
    jest.advanceTimersByTime(delayMs);
    expect(mockFn).toHaveBeenCalledTimes(2);
    
    // Second retry should wait delayMs * 2
    jest.advanceTimersByTime(delayMs * 2);
    expect(mockFn).toHaveBeenCalledTimes(3);
    
    const result = await resultPromise;
    expect(result).toBe('success');
  });

  it('should pass arguments to wrapped function', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    const wrappedFn = withRetry(mockFn, { maxAttempts: 3, delayMs: 1000 });
    
    await wrappedFn('arg1', 'arg2', { key: 'value' });
    
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', { key: 'value' });
  });

  it('should handle non-Error rejections', async () => {
    const mockFn = jest.fn().mockRejectedValue('string error');
    const wrappedFn = withRetry(mockFn, { maxAttempts: 3, delayMs: 1000 });
    
    const resultPromise = wrappedFn();
    
    // Fast-forward through delays
    jest.runAllTimers();
    
    await expect(resultPromise).rejects.toBe('string error');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });
});
