export function rateLimit({ interval, uniqueTokenPerInterval = 500 }: {
  interval: number;
  uniqueTokenPerInterval?: number;
}) {
  const tokenCache = new Map();

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const now = Date.now();
        const windowStart = now - interval;
        
        const tokenCount = tokenCache.get(token) || [];
        const validTokens = tokenCount.filter((timestamp: number) => timestamp > windowStart);
        
        if (validTokens.length >= limit) {
          reject(new Error('Rate limit exceeded'));
        }
        
        validTokens.push(now);
        tokenCache.set(token, validTokens);

        resolve();
      }),
  };
} 