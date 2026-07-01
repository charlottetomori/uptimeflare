import type { MonitorTarget } from '../../types/config'

type NotificationContext = {
  monitor: MonitorTarget
  isUp: boolean
  timeIncidentStart: number
  timeNow: number
  reason: string
  timeZone: string
}

export function shouldSendNotification() {
  return true
}

// 通知区域修改开始
const WEBHOOK_URL = 'https://api.chuckfang.com/%E7%AC%AC%E4%BA%94%E4%B8%AA%E5%AD%A3%E8%8A%82'
const WEBHOOK_TIMEOUT_MS = 10000
const WEBHOOK_HEADERS: Record<string, string> = {}

function buildNotificationMessage({
  monitor,
  isUp,
  timeIncidentStart,
  timeNow,
  reason,
  timeZone,
}: NotificationContext) {
  const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  })

  const downtimeMinutes = Math.round((timeNow - timeIncidentStart) / 60)
  const timeNowFormatted = dateFormatter.format(new Date(timeNow * 1000))
  const timeIncidentStartFormatted = dateFormatter.format(new Date(timeIncidentStart * 1000))

  if (isUp) {
    return `[${monitor.name}] 已恢复正常\n服务中断约 ${downtimeMinutes} 分钟，现在已经恢复。`
  }

  if (timeNow === timeIncidentStart) {
    return `[${monitor.name}] 当前不可用\n发现时间：${timeNowFormatted}\n原因：${reason || '未说明'}`
  }

  return `[${monitor.name}] 仍然不可用\n开始时间：${timeIncidentStartFormatted}\n已持续：${downtimeMinutes} 分钟\n原因：${reason || '未说明'}`
}

function buildWebhookBody(message: string) {
  return {
    msg: message,
  }
}
// 通知区域修改结束

async function fetchWithTimeout(url: string, ms: number, options: RequestInit = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)

  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

export async function sendNotification(context: NotificationContext) {
  if (!shouldSendNotification()) {
    console.log(`Notification disabled, skipping ${context.monitor.name}`)
    return
  }

  const message = buildNotificationMessage(context)
  const body = buildWebhookBody(message)

  try {
    const response = await fetchWithTimeout(WEBHOOK_URL, WEBHOOK_TIMEOUT_MS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...WEBHOOK_HEADERS },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.log(
        `Notification failed: ${response.status} ${response.statusText}, ${await response.text()}`
      )
      return
    }

    console.log(`Notification sent for ${context.monitor.name}`)
  } catch (error) {
    console.log('Notification request failed: ' + error)
  }
}
