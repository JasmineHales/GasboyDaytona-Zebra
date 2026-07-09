export function isLikelyOnnxBuffer(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 64) return false
  const bytes = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 32))
  const header = String.fromCharCode(...bytes.slice(0, 4))
  if (header === 'ONNX') return true
  // Protobuf wire format — reject HTML/text error pages from SPA fallbacks.
  if (bytes[0] === 0x3c || bytes[0] === 0xef) return false // < or UTF-8 BOM
  return bytes[0] === 0x08 || bytes[0] === 0x0a
}

export async function fetchArrayBufferWithRetry(
  url: string,
  options?: { timeoutMs?: number; retries?: number },
): Promise<ArrayBuffer> {
  const timeoutMs = options?.timeoutMs ?? 12_000
  const retries = options?.retries ?? 1
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(url, { signal: controller.signal })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`)
      }
      return await response.arrayBuffer()
    } catch (error) {
      lastError = error
    } finally {
      window.clearTimeout(timeoutId)
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Failed to fetch ${url}`)
}

export async function safeAsync<T>(label: string, task: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await task()
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`[plate-alpr] ${label} failed`, error)
    }
    return fallback
  }
}

export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(`${label} timed out`)), ms)
    }),
  ])
}
