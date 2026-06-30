import { MaintenanceConfig, MonitorState, MonitorTarget } from '@/types/config'
import { Collapse, Button } from '@mantine/core'
import { IconCheck, IconX, IconAlertCircle, IconActivity, IconHistory } from '@tabler/icons-react'
import { useState } from 'react'
import MaintenanceAlert from './MaintenanceAlert'
import IncidentsDrawer from './IncidentsDrawer'
import { useTranslation } from 'react-i18next'
import { pageConfig } from '@/uptime.config'

export default function OverallStatus({
  state,
  maintenances,
  monitors,
}: {
  state: MonitorState
  maintenances: MaintenanceConfig[]
  monitors: MonitorTarget[]
}) {
  const { t } = useTranslation('common')

  let statusString = ''
  let statusColor = 'text-stone-500'
  let statusTone = 'bg-stone-950'
  let StatusIcon = IconAlertCircle

  if (state.overallUp === 0 && state.overallDown === 0) {
    statusString = t('No data yet')
    statusColor = 'text-stone-500'
  } else if (state.overallUp === 0) {
    statusString = t('All systems not operational')
    statusColor = 'text-rose-700'
    statusTone = 'bg-rose-600'
    StatusIcon = IconX
  } else if (state.overallDown === 0) {
    statusString = t('All systems operational')
    statusColor = 'text-emerald-700'
    statusTone = 'bg-emerald-600'
    StatusIcon = IconCheck
  } else {
    statusString = t('Some systems not operational', {
      down: state.overallDown,
      total: state.overallUp + state.overallDown,
    })
    statusColor = 'text-amber-700'
    statusTone = 'bg-amber-500'
  }

  const totalMonitors = state.overallUp + state.overallDown
  const uptimeTone = state.overallDown === 0 && totalMonitors > 0 ? 'text-emerald-700' : statusColor

  const [expandUpcoming, setExpandUpcoming] = useState(false)
  const [drawerOpened, setDrawerOpened] = useState(false)

  const now = new Date()

  const activeMaintenances: (Omit<MaintenanceConfig, 'monitors'> & {
    monitors?: MonitorTarget[]
  })[] = maintenances
    .filter((m) => now >= new Date(m.start) && (!m.end || now <= new Date(m.end)))
    .map((maintenance) => ({
      ...maintenance,
      monitors: maintenance.monitors?.map(
        (monitorId) => monitors.find((mon) => monitorId === mon.id)!
      ),
    }))

  const upcomingMaintenances: (Omit<MaintenanceConfig, 'monitors'> & {
    monitors?: (MonitorTarget | undefined)[]
  })[] = maintenances
    .filter((m) => now < new Date(m.start))
    .map((maintenance) => ({
      ...maintenance,
      monitors: maintenance.monitors?.map(
        (monitorId) => monitors.find((mon) => monitorId === mon.id)!
      ),
    }))

  return (
    <div className="py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-end">
        <div className="text-left">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm backdrop-blur">
            <span className={`status-pulse h-2.5 w-2.5 rounded-full ${statusTone}`} />
            <span>10 分钟自动检查</span>
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl">
            {pageConfig.title || '服务状态'}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            看一眼就知道自己的服务是否正常。这里展示可用率、延迟和最近 30 天运行记录。
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              component="a"
              href="#monitor-manager"
              variant="filled"
              size="sm"
              styles={{ root: { backgroundColor: '#020617', borderRadius: 999 } }}
            >
              添加网站
            </Button>
            <Button
              variant="default"
              size="sm"
              leftSection={<IconHistory size={15} />}
              onClick={() => setDrawerOpened(true)}
              styles={{ root: { borderRadius: 999, borderColor: '#d1d5db', color: '#111827' } }}
            >
              {t('Incidents')}
            </Button>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className={`flex items-center gap-3 text-lg font-semibold ${statusColor}`}>
            <StatusIcon stroke={2.5} size={28} />
            <span>{statusString}</span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-5">
            <div>
              <div className={`text-4xl font-semibold tracking-[-0.05em] ${uptimeTone}`}>
                {state.overallUp}
              </div>
              <div className="mt-1 text-sm text-slate-500">在线服务</div>
            </div>
            <div>
              <div className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">
                {totalMonitors}
              </div>
              <div className="mt-1 text-sm text-slate-500">监测总数</div>
            </div>
          </div>
          <div className="mt-7 flex items-start gap-2 border-t border-slate-200 pt-4 text-sm text-slate-500">
            <IconActivity className="mt-0.5 shrink-0" size={15} />
            <span>
              {t('Last updated on', {
                date: new Date(state.lastUpdate * 1000).toLocaleString(),
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Maintenance */}
      {upcomingMaintenances.length > 0 && (
        <div className="mx-auto mt-8 max-w-3xl text-center">
          <div
            className="mb-2 cursor-pointer text-stone-500 hover:underline"
            onClick={() => setExpandUpcoming(!expandUpcoming)}
          >
            {t('upcoming maintenance', { count: upcomingMaintenances.length })}{' '}
            <span>{expandUpcoming ? t('Hide') : t('Show')}</span>
          </div>

          <Collapse in={expandUpcoming}>
            {upcomingMaintenances.map((maintenance, idx) => (
              <MaintenanceAlert
                key={`upcoming-${idx}`}
                maintenance={maintenance}
                style={{ marginTop: 10 }}
                upcoming
              />
            ))}
          </Collapse>
        </div>
      )}

      {/* Active Maintenance */}
      <div className="mx-auto mt-8 max-w-3xl">
        {activeMaintenances.map((maintenance, idx) => (
          <MaintenanceAlert
            key={`active-${idx}`}
            maintenance={maintenance}
            style={{ marginTop: 10 }}
          />
        ))}
      </div>

      {/* Incidents Drawer */}
      <IncidentsDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        state={state}
        monitors={monitors}
      />
    </div>
  )
}
