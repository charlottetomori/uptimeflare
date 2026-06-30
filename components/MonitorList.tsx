import { MonitorTarget, MonitorState } from '@/types/config'
import { IconServer, IconApps, IconDeviceDesktop, IconCloud } from '@tabler/icons-react'
import MonitorCard from './MonitorCard'

import { pageConfig } from '@/uptime.config'

export default function MonitorList({
  monitors,
  state,
}: {
  monitors: MonitorTarget[]
  state: MonitorState
}) {
  // Use pageConfig.group to group monitors
  // If a monitor is not in any group, it will be put into 'Ungrouped'
  const monitorMap = new Map(monitors.map((m) => [m.id, m]))
  const processedIds = new Set<string>()

  const sortedGroups: string[] = []
  const groupedMonitors: Record<string, MonitorTarget[]> = {}

  if (pageConfig.group) {
    for (const [groupName, monitorIds] of Object.entries(pageConfig.group)) {
      sortedGroups.push(groupName)
      groupedMonitors[groupName] = []
      monitorIds.forEach((id) => {
        const monitor = monitorMap.get(id)
        if (monitor) {
          groupedMonitors[groupName].push(monitor)
          processedIds.add(id)
        }
      })
    }
  }

  // Handle monitors not in any group
  const ungroupedMonitors = monitors.filter((m) => !processedIds.has(m.id))
  if (ungroupedMonitors.length > 0) {
    sortedGroups.push('Ungrouped')
    groupedMonitors['Ungrouped'] = ungroupedMonitors
  }

  // Helper to get icon for group
  const getGroupIcon = (groupName: string) => {
    if (groupName.includes('基础')) return IconServer
    if (groupName.includes('AI')) return IconCloud
    if (groupName.includes('工具')) return IconApps
    return IconDeviceDesktop
  }

  return (
    <div className="space-y-10">
      {sortedGroups.map((group) => {
        const GroupIcon = getGroupIcon(group)
        return (
          <div key={group}>
            {group !== 'Ungrouped' && (
              <div className="mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-700">
                    <GroupIcon size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      Group
                    </p>
                    <h2 className="text-2xl font-semibold tracking-[-0.035em] text-stone-950">
                      {group}
                    </h2>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {groupedMonitors[group].map((monitor) => (
                <MonitorCard key={monitor.id} monitor={monitor} state={state} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
