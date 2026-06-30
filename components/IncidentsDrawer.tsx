import { Drawer, Group, Select, Button, Stack, Card, Text, Badge, Pagination } from '@mantine/core'
import {
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
  IconFilter,
  IconAlertTriangle,
  IconClock,
} from '@tabler/icons-react'
import { MonitorState, MonitorTarget } from '@/types/config'
import { maintenances, workerConfig } from '@/uptime.config'
import { useState } from 'react'
import MaintenanceAlert from './MaintenanceAlert'
import NoIncidentsAlert from './NoIncidents'
import { useTranslation } from 'react-i18next'

type DisplayIncident = {
  monitorId: string
  monitorName: string
  start: number
  end: number | null
  errors: { start: string; end: string; error: string }[]
  duration: number
}

function getSelectedMonth() {
  const now = new Date()
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
}

function getPrevNextMonth(monthStr: string) {
  const [year, month] = monthStr.split('-').map(Number)
  const date = new Date(year, month - 1)
  const prev = new Date(date)
  prev.setMonth(prev.getMonth() - 1)
  const next = new Date(date)
  next.setMonth(next.getMonth() + 1)
  return {
    prev: prev.getFullYear() + '-' + String(prev.getMonth() + 1).padStart(2, '0'),
    next: next.getFullYear() + '-' + String(next.getMonth() + 1).padStart(2, '0'),
  }
}

function formatDuration(seconds: number) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const parts = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  if (s > 0 || parts.length === 0) parts.push(`${s}s`)
  return parts.join(' ')
}

function extractIncidents(
  state: MonitorState,
  monitors: MonitorTarget[],
  monthStr: string
): DisplayIncident[] {
  const [year, month] = monthStr.split('-').map(Number)
  const monthStart = new Date(year, month - 1, 1).getTime() / 1000
  const monthEnd = new Date(year, month, 1).getTime() / 1000
  const currentTime = Math.round(Date.now() / 1000)

  const incidents: DisplayIncident[] = []

  for (const monitor of monitors) {
    const monitorIncidents = state.incident[monitor.id]
    if (!monitorIncidents) continue

    for (const incident of monitorIncidents) {
      const incidentStart = incident.start[0]
      const incidentEnd = incident.end ?? currentTime

      // 仅保留与选定月份有交叉的故障
      if (incidentEnd < monthStart || incidentStart >= monthEnd) continue

      const errors: { start: string; end: string; error: string }[] = []
      for (let i = 0; i < incident.error.length; i++) {
        const partStart = incident.start[i]
        const partEnd =
          i === incident.error.length - 1 ? incident.end ?? currentTime : incident.start[i + 1]

        errors.push({
          start: new Date(partStart * 1000).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          end: new Date(partEnd * 1000).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          error: incident.error[i],
        })
      }

      incidents.push({
        monitorId: monitor.id,
        monitorName: monitor.name,
        start: incidentStart,
        end: incident.end,
        errors,
        duration: incidentEnd - incidentStart,
      })
    }
  }

  // 按开始时间倒序排列
  incidents.sort((a, b) => b.start - a.start)
  return incidents
}

function filterMaintenancesByMonth(monthStr: string) {
  return maintenances
    .filter((m) => {
      const d = new Date(m.start)
      const mMonth = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
      return mMonth === monthStr
    })
    .map((e) => ({
      ...e,
      monitors: (e.monitors || []).map((id) => workerConfig.monitors.find((mon) => mon.id === id)!),
    }))
}

function IncidentCard({
  incident,
  t,
}: {
  incident: DisplayIncident
  t: (key: string, opts?: any) => string
}) {
  const isOngoing = incident.end === null
  const startStr = new Date(incident.start * 1000).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const endStr = isOngoing
    ? t('Ongoing')
    : new Date(incident.end! * 1000).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

  return (
    <div className="rounded-[1.35rem] border border-slate-200/80 bg-white/85 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.07)] backdrop-blur">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${isOngoing ? 'bg-rose-500' : 'bg-amber-400'}`} />
            <IconAlertTriangle
              className={isOngoing ? 'text-red-500' : 'text-amber-500'}
              size={18}
              strokeWidth={2}
            />
            <span
              className={`font-semibold text-sm ${isOngoing ? 'text-red-600' : 'text-amber-600'}`}
            >
              {incident.monitorName}
            </span>
          </div>
          <Badge
            size="sm"
            variant="light"
            color={isOngoing ? 'red' : 'yellow'}
            style={{ textTransform: 'none' }}
          >
            {isOngoing ? t('Ongoing') : t('Resolved')}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <div className="flex items-center gap-1">
            <IconCalendar size={14} className={isOngoing ? 'text-red-400' : 'text-amber-400'} />
            <span>{startStr}</span>
          </div>
          <span className="text-gray-400">→</span>
          <div className="flex items-center gap-1">
            <IconClock size={14} className={isOngoing ? 'text-red-400' : 'text-amber-400'} />
            <span>{endStr}</span>
          </div>
          <span className="text-gray-400">|</span>
          <span className="font-medium">{formatDuration(incident.duration)}</span>
        </div>

        {incident.errors.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-1">
            {incident.errors.map((err, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-slate-50/80 p-3"
              >
                {incident.errors.length > 1 && (
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-1.5 py-0.5 rounded text-xs font-mono font-medium ${
                        isOngoing ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {err.start} - {err.end}
                    </div>
                  </div>
                )}
                <div className="break-all font-mono text-xs text-slate-600">{err.error}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function IncidentsDrawer({
  opened,
  onClose,
  state,
  monitors,
}: {
  opened: boolean
  onClose: () => void
  state: MonitorState
  monitors: MonitorTarget[]
}) {
  const { t } = useTranslation('common')
  const [selectedMonitor, setSelectedMonitor] = useState<string | null>('')
  const [selectedMonth, setSelectedMonth] = useState(getSelectedMonth())
  const [activePage, setPage] = useState(1)

  const handleMonitorChange = (val: string | null) => {
    setSelectedMonitor(val)
    setPage(1)
  }

  const handleMonthChange = (val: string) => {
    setSelectedMonth(val)
    setPage(1)
  }

  // 从 state 提取真实故障数据
  const realIncidents = extractIncidents(state, monitors, selectedMonth)
  const filteredIncidents = selectedMonitor
    ? realIncidents.filter((i) => i.monitorId === selectedMonitor)
    : realIncidents

  // 静态维护事件（保留原有功能）
  const maintenanceEvents = filterMaintenancesByMonth(selectedMonth)

  const { prev, next } = getPrevNextMonth(selectedMonth)

  const monitorOptions = [
    { value: '', label: t('All') },
    ...monitors.map((monitor) => ({
      value: monitor.id,
      label: monitor.name,
    })),
  ]

  const itemsPerPage = 20
  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage)
  const paginatedIncidents = filteredIncidents.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  )

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="xl"
      title={
        <div>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.24em' }}>
            History
          </Text>
          <Text size="xl" fw={800} mt={4}>
            历史故障
          </Text>
        </div>
      }
      padding="xl"
      styles={{ content: { background: '#f8fafc' }, header: { background: '#f8fafc' } }}
    >
      <Stack gap="lg">
        <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
          <Select
            placeholder={t('Select monitor')}
            data={monitorOptions}
            value={selectedMonitor}
            onChange={handleMonitorChange}
            clearable
            leftSection={<IconFilter size={16} />}
            radius="xl"
          />
        </div>

        <Card padding="lg" radius="xl" withBorder style={{ borderColor: '#e2e8f0', background: 'rgba(255,255,255,0.82)' }}>
          <Group justify="space-between" mb="xl" wrap="nowrap">
            <Button
              variant="subtle"
              leftSection={<IconChevronLeft size={18} />}
              onClick={() => handleMonthChange(prev)}
              color="gray"
            >
              {t('Backwards')}
            </Button>

            <Group gap="xs">
              <IconCalendar size={20} style={{ opacity: 0.5 }} />
              <Text fw={800} size="xl">
                {selectedMonth}
              </Text>
            </Group>

            <Button
              variant="subtle"
              rightSection={<IconChevronRight size={18} />}
              onClick={() => handleMonthChange(next)}
              color="gray"
            >
              {t('Forward')}
            </Button>
          </Group>

          <Stack gap="md">
            {maintenanceEvents.map((m, i) => (
              <MaintenanceAlert key={`m-${i}`} maintenance={m} />
            ))}

            {filteredIncidents.length === 0 && maintenanceEvents.length === 0 ? (
              <NoIncidentsAlert />
            ) : (
              paginatedIncidents.map((incident, i) => (
                <IncidentCard key={`i-${i}`} incident={incident} t={t} />
              ))
            )}

            {totalPages > 1 && (
              <Group justify="center" mt="md">
                <Pagination total={totalPages} value={activePage} onChange={setPage} />
              </Group>
            )}
          </Stack>
        </Card>
      </Stack>
    </Drawer>
  )
}
