/**
 * SSE protocol for POST /api/enhance when `stream: true` or `Accept: text/event-stream`.
 *
 * Events (Server-Sent Events `event` field):
 * - `delta` — `{ text: string }` incremental raw model tokens
 * - `done`  — `{ success: true, data: EnhanceStreamDoneData }` final purified text + metadata
 * - `error` — `{ success: false, error: { code, message } }` terminal failure (may follow deltas)
 */

export type EnhanceSSEEventType = 'delta' | 'done' | 'error'

export interface EnhanceStreamDoneData {
  enhancedText: string
  tokensUsed: number
  language: string
  routeId?: string
  detectionSummary?: string
  usageLogId?: string
  retryUsed?: boolean
}

export interface EnhanceSSEDeltaPayload {
  text: string
}

export interface EnhanceSSEDonePayload {
  success: true
  data: EnhanceStreamDoneData
}

export interface EnhanceSSEErrorPayload {
  success: false
  error: {
    code: string
    message: string
    reason?: string
    tier?: string
  }
}

export function formatEnhanceSSE(event: EnhanceSSEEventType, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export function wantsEnhanceStream(
  body: { stream?: boolean },
  acceptHeader: string | null
): boolean {
  if (body.stream === true) return true
  if (acceptHeader?.includes('text/event-stream')) return true
  return false
}

export async function consumeEnhanceSSE(
  response: Response,
  handlers: {
    onDelta: (text: string) => void
    onDone: (data: EnhanceStreamDoneData) => void
    onError: (error: EnhanceSSEErrorPayload['error']) => void
  }
): Promise<void> {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('text/event-stream')) {
    const json = (await response.json()) as EnhanceSSEDonePayload | EnhanceSSEErrorPayload
    if ('success' in json && json.success && 'data' in json && json.data) {
      handlers.onDone(json.data)
      return
    }
    const errPayload = json as EnhanceSSEErrorPayload
    handlers.onError(
      errPayload.error ?? { code: 'INTERNAL_ERROR', message: 'Enhancement failed' }
    )
    return
  }

  if (!response.ok && !response.body) {
    handlers.onError({ code: 'INTERNAL_ERROR', message: response.statusText })
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    handlers.onError({ code: 'INTERNAL_ERROR', message: 'No response body' })
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''

  const dispatchBlock = (block: string) => {
    const lines = block.split('\n')
    let eventType: EnhanceSSEEventType | null = null
    let dataLine = ''

    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim() as EnhanceSSEEventType
      } else if (line.startsWith('data:')) {
        dataLine += line.slice(5).trim()
      }
    }

    if (!eventType || !dataLine) return

    try {
      const payload = JSON.parse(dataLine) as unknown
      if (eventType === 'delta') {
        const delta = payload as EnhanceSSEDeltaPayload
        if (delta.text) handlers.onDelta(delta.text)
      } else if (eventType === 'done') {
        const done = payload as EnhanceSSEDonePayload
        if (done.success && done.data) handlers.onDone(done.data)
      } else if (eventType === 'error') {
        const err = payload as EnhanceSSEErrorPayload
        handlers.onError(
          err.error ?? { code: 'INTERNAL_ERROR', message: 'Stream error' }
        )
      }
    } catch {
      handlers.onError({ code: 'INTERNAL_ERROR', message: 'Invalid stream data' })
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let boundary = buffer.indexOf('\n\n')
    while (boundary !== -1) {
      const block = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)
      if (block.trim()) dispatchBlock(block)
      boundary = buffer.indexOf('\n\n')
    }
  }

  if (buffer.trim()) dispatchBlock(buffer)
}
