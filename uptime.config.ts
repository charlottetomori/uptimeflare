import type { MaintenanceConfig, PageConfig, WorkerConfig } from './types/config'

const pageConfig: PageConfig = {
  title: '服务状态',
  links: [],
  favicon: '/favicon.svg',
  logo: '/logo.png',
  group: {
    核心服务: [],
  },
}

const workerConfig: WorkerConfig = {
  kvWriteCooldownMinutes: 10,
  monitors: [],
  notification: {
    timeZone: 'Asia/Shanghai',
  },
}

const maintenances: MaintenanceConfig[] = []

export { maintenances, pageConfig, workerConfig }
