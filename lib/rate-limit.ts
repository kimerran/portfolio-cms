interface RateLimitEntry {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

export interface RateLimitOptions {
  maxRequests: number
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetTime) {
    const resetTime = now + options.windowMs
    store.set(key, { count: 1, resetTime })
    return { allowed: true, remaining: options.maxRequests - 1, resetTime }
  }

  if (entry.count >= options.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime }
  }

  entry.count++
  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      const now = Date.now()
      for (const [key, entry] of store.entries()) {
        if (now > entry.resetTime) {
          store.delete(key)
        }
      }
    },
    5 * 60 * 1000,
  )
}
