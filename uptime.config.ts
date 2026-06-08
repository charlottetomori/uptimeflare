import { MaintenanceConfig, PageConfig, WorkerConfig } from './types/config'

const pageConfig: PageConfig = {
  title: '服务状态 - weizwz',
  links: [
    { link: 'https://www.weizwz.com/', label: '主页' },
    { link: 'https://note.weizwz.com/', label: '博客' },
    { link: 'https://github.com/weizwz', label: 'GitHub' },
  ],
  logo: '/logo.png',
  group: {
    基础服务:['grok2api', 'cli-proxy-api', 'qwenpaw_computer', 'subconverter'],
  },
}

const workerConfig: WorkerConfig = {
  monitors: [
    {
      id: 'grok2api',
      name: 'grok2api',
      method: 'GET',
      target: 'https://grok2api-gedi.onrender.com/',
      statusPageLink: 'https://grok2api-gedi.onrender.com/',
      preview: 'https://image.thum.io/get/width/1200/https://grok2api-gedi.onrender.com/',
      hideLatencyChart: false,
      expectedCodes: [200],
      timeout: 15000,
    },
    {
      id: 'cli-proxy-api',
      name: 'cli-proxy-api',
      method: 'GET',
      target: 'https://cli-proxy-api-latest-gd1n.onrender.com/management.html#/',
      statusPageLink: 'https://cli-proxy-api-latest-gd1n.onrender.com/management.html#/',
      preview:
        'https://image.thum.io/get/width/1200/https://cli-proxy-api-latest-gd1n.onrender.com/management.html',
      hideLatencyChart: false,
      expectedCodes: [200],
      timeout: 15000,
    },
    {
      id: 'qwenpaw_computer',
      name: 'qwenpaw_computer',
      method: 'GET',
      target: 'https://modelscope.cn/studios/zhaoyangbxx/zhao',
      statusPageLink: 'https://modelscope.cn/studios/zhaoyangbxx/zhao',
      preview:
        'https://image.thum.io/get/width/1200/https://modelscope.cn/studios/zhaoyangbxx/zhao',
      hideLatencyChart: false,
      expectedCodes: [200],
      timeout: 15000,
    },
    {
      id: 'subconverter',
      name: 'subconverter',
      method: 'GET',
      target: 'https://subconverter-nnie.onrender.com/version',
      statusPageLink: 'https://subconverter-nnie.onrender.com/version',
      preview:
        'https://image.thum.io/get/width/1200/https://subconverter-nnie.onrender.com/',
      hideLatencyChart: false,
      expectedCodes: [200],
      timeout: 15000,
    },
  ],
  notification: {
    webhook: {
      url: 'https://api.chuckfang.com/%E7%AC%AC%E4%BA%94%E4%B8%AA%E5%AD%A3%E8%8A%82',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      payloadType: 'json',
      payload: {
        msg: '$MSG',
      },
      timeout: 10000,
    },
    timeZone: 'Asia/Shanghai',
  },
  callbacks: {
    onStatusChange: async (
      env: any,
      monitor: any,
      isUp: boolean,
      timeIncidentStart: number,
      timeNow: number,
      reason: string
    ) => {
    },
    onIncident: async (
      env: any,
      monitor: any,
      timeIncidentStart: number,
      timeNow: number,
      reason: string
    ) => {
    },
  },
}

const maintenances: MaintenanceConfig[] = []

export { maintenances, pageConfig, workerConfig }
