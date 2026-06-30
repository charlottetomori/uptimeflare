import { MonitorTarget, RuntimeBindings, WorkerConfig } from '../types/config'
import { workerConfig } from '../uptime.config'

export type RuntimeEnv = RuntimeBindings & Record<string, unknown>
const STORED_MONITORS_KEY = 'runtime_monitors'
const STORE_TABLE = 'uptimeflare'

export function getWorkerConfig(env?: RuntimeEnv): WorkerConfig {
  return {
    ...workerConfig,
  }
}

export async function getStoredMonitors(env?: RuntimeEnv): Promise<MonitorTarget[]> {
  const kv = env?.UPTIMEFLARE_CONFIG
  if (kv) {
    try {
      const value = await kv.get(STORED_MONITORS_KEY)
      if (!value) return []
      const monitors = JSON.parse(value) as MonitorTarget[]
      return Array.isArray(monitors) ? monitors : []
    } catch (error) {
      console.error('Failed to read stored monitors from KV:', error)
      return []
    }
  }

  const db = env?.UPTIMEFLARE_D1 as D1Database | undefined
  if (!db) return []

  try {
    const result = await db
      .prepare(`SELECT value FROM ${STORE_TABLE} WHERE key = ?`)
      .bind(STORED_MONITORS_KEY)
      .first<{ value: string }>()

    if (!result?.value) return []
    const monitors = JSON.parse(result.value) as MonitorTarget[]
    return Array.isArray(monitors) ? monitors : []
  } catch (error) {
    console.error('Failed to read stored monitors:', error)
    return []
  }
}

export async function setStoredMonitors(env: RuntimeEnv, monitors: MonitorTarget[]): Promise<void> {
  const kv = env.UPTIMEFLARE_CONFIG
  if (kv) {
    await kv.put(STORED_MONITORS_KEY, JSON.stringify(monitors))
    return
  }

  const db = env.UPTIMEFLARE_D1 as D1Database | undefined
  if (!db) throw new Error('KV or D1 binding is missing')

  await db.exec(
    `CREATE TABLE IF NOT EXISTS ${STORE_TABLE} (key VARCHAR(255) PRIMARY KEY, value BLOB NOT NULL);`
  )

  await db
    .prepare(
      `INSERT INTO ${STORE_TABLE} (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value;`
    )
    .bind(STORED_MONITORS_KEY, JSON.stringify(monitors))
    .run()
}

export async function getEffectiveWorkerConfig(env?: RuntimeEnv): Promise<WorkerConfig> {
  const config = getWorkerConfig(env)
  const storedMonitors = await getStoredMonitors(env)

  return {
    ...config,
    monitors: [...config.monitors, ...storedMonitors],
  }
}
