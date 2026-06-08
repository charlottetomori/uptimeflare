import { MonitorState, MonitorTarget } from '@/types/config'
import { getColor } from '@/util/color'
import { Box, Tooltip, Drawer, Stack, Text, Badge } from '@mantine/core'
import { useResizeObserver } from '@mantine/hooks'
import { IconAlertTriangle, IconCalendar, IconClock } from '@tabler/icons-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function DetailBar({
  monitor,
  state,
}: {
  monitor: MonitorTarget
  state: MonitorState
}) {
  const { t } = useTranslation('common')
  const [barRef, barRect] = useResizeObserver()
  const [drawerOpened, setDrawerOpened] = useState(false)
  const [drawerTitle, setDrawerTitle] = useState('')
  const [drawerIncidents, setDrawerIncidents] = useState<
    { start: string; end: string; error: string }[]
  >([])
  const [drawerDowntime, setDrawerDowntime] = useState('')

  const overlapLen = (x1: number, x2: number, y1: number, y2: number) => {
    return Math.max(0, Math.min(x2, y2) - Math.max(x1, y1))
  }

  const formatDuration = (seconds: number) => {
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)

    const parts = []
    if (d > 0) parts.push(`${d}d`)
    if (h > 0) parts.push(`${h}h`)
    if (m > 0) parts.push(`${m}m`)
    if (s > 0) parts.push(`${s}s`)
    return parts.join(' ') || '0s'
  }

  const uptimePercentBars = []
  const incidents = state.incident[monitor.id] ?? []

  const currentTime = Math.round(Date.now() / 1000)
  const monitorStartTime = incidents[0]?.start[0] ?? currentTime

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  for (let i = 89; i >= 0; i--) {
    const dayStart = Math.round(todayStart.getTime() / 1000) - i * 86400
    const dayEnd = dayStart + 86400

    const dayMonitorTime = overlapLen(dayStart, dayEnd, monitorStartTime, currentTime)
    let dayDownTime = 0

    let incidentReasons: { start: string; end: string; error: string }[] = []

    for (let incident of incidents) {
      const incidentStart = incident.start[0]
      const incidentEnd = incident.end ?? currentTime

      const overlap = overlapLen(dayStart, dayEnd, incidentStart, incidentEnd)
      dayDownTime += overlap

      // Incident history for the day
      if (overlap > 0) {
        for (let i = 0; i < incident.error.length; i++) {
          let partStart = incident.start[i]
          let partEnd =
            i === incident.error.length - 1 ? incident.end ?? currentTime : incident.start[i + 1]
          partStart = Math.max(partStart, dayStart)
          partEnd = Math.min(partEnd, dayEnd)

          if (overlapLen(dayStart, dayEnd, partStart, partEnd) > 0) {
            const startStr = new Date(partStart * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
            const endStr = new Date(partEnd * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
            incidentReasons.push({
              start: startStr,
              end: endStr,
              error: incident.error[i],
            })
          }
        }
      }
    }

    const dayPercent = (((dayMonitorTime - dayDownTime) / dayMonitorTime) * 100).toPrecision(4)

    uptimePercentBars.push(
      <Tooltip
        multiline
        key={i}
        position="top"
        withArrow
        transitionProps={{ transition: 'pop-bottom-left' }}
        label={
          Number.isNaN(Number(dayPercent)) ? (
            t('No Data')
          ) : (
            <Stack gap={2} p={4}>
              <Text size="xs" fw={700}>
                {new Date(dayStart * 1000).toLocaleDateString()}
              </Text>
              <Text size="xs">
                {t('percent at date', { percent: dayPercent, date: '' }).replace('  ', ' ')}
              </Text>
              {dayDownTime > 0 && (
                <Text size="xs" c="red.3">
                  {t('Down for', {
                    duration: formatDuration(dayDownTime),
                  })}
                </Text>
              )}
            </Stack>
          )
        }
      >
        <div
          className={`${getColor(
            dayPercent
          )} h-8 flex-1 rounded-sm mx-px opacity-80 transition-all duration-200 ease-in-out ${
            dayDownTime > 0 ? 'cursor-pointer' : 'cursor-default'
          }`}
          style={{}}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.transform = 'scaleY(1.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.8'
            e.currentTarget.style.transform = 'scaleY(1)'
          }}
          onClick={() => {
            if (dayDownTime > 0) {
              setDrawerTitle(
                t('incidents at', {
                  name: monitor.name,
                  date: new Date(dayStart * 1000).toLocaleDateString(),
                })
              )
              setDrawerDowntime(formatDuration(dayDownTime))
              setDrawerIncidents(incidentReasons)
              setDrawerOpened(true)
            }
          }}
        />
      </Tooltip>
    )
  }

  return (
    <>
      <Drawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        position="right"
        size="xl"
        title={
          <Text size="xl" fw={800}>
            {drawerTitle}
          </Text>
        }
        padding="xl"
      >
        <Stack gap="md">
          {/* 总宕机时间 */}
          <div className="bg-red-50 border-l-4 border-l-red-500 rounded-lg shadow-sm shadow-slate-200 border border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <IconAlertTriangle className="text-red-500" size={18} strokeWidth={2} />
              <span className="font-semibold text-sm text-red-600">{t('Total downtime')}</span>
              <Badge size="sm" variant="light" color="red" style={{ textTransform: 'none' }}>
                {drawerDowntime}
              </Badge>
            </div>
          </div>

          {/* 故障记录列表 */}
          {drawerIncidents.map((reason, index) => (
            <div
              key={index}
              className="bg-amber-50 border-l-4 border-l-amber-500 rounded-lg shadow-sm shadow-slate-200 border border-slate-200 px-4 py-3"
            >
              <div className="flex flex-col gap-2">
                {/* 时间范围 */}
                <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
                  <div className="flex items-center gap-1">
                    <IconCalendar size={14} className="text-amber-400" />
                    <span>{reason.start}</span>
                  </div>
                  <span className="text-gray-400">→</span>
                  <div className="flex items-center gap-1">
                    <IconClock size={14} className="text-amber-400" />
                    <span>{reason.end}</span>
                  </div>
                </div>

                {/* 错误详情 */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-col gap-1 p-2 rounded-md border border-slate-100 bg-white/60">
                    <div className="text-xs text-slate-600 font-mono break-all">{reason.error}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Stack>
      </Drawer>
      <Box
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          marginTop: '10px',
          marginBottom: '5px',
        }}
        visibleFrom="540"
        ref={barRef}
      >
        {uptimePercentBars.slice(Math.floor(Math.max(9 * 90 - barRect.width, 0) / 9), 90)}
      </Box>
    </>
  )
}
