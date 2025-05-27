import { useMemo } from 'react'

const StatsOverview = ({ checklists, sites }) => {
  const stats = useMemo(() => {
    const totalChecklists = checklists.length
    const completedChecklists = checklists.filter(checklist => {
      const completed = parseInt(checklist.completed_items) || 0
      const total = parseInt(checklist.total_items) || 0
      return total > 0 && completed === total
    }).length

    const totalViolationsFound = checklists.reduce((sum, checklist) => {
      return sum + (parseInt(checklist.completed_items) || 0)
    }, 0)

    const activeSites = [...new Set(checklists.map(checklist => checklist.site))].length

    return {
      totalChecklists,
      completedChecklists,
      totalViolationsFound,
      activeSites,
      completionRate: totalChecklists > 0 ? Math.round((completedChecklists / totalChecklists) * 100) : 0
    }
  }, [checklists])

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalChecklists}</div>
          <div className="text-sm text-blue-600">Total Checklists</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.completedChecklists}</div>
          <div className="text-sm text-green-600">Fully Inspected</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{stats.totalViolationsFound}</div>
          <div className="text-sm text-red-600">Violations Found</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.activeSites}</div>
          <div className="text-sm text-purple-600">Active Sites</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{stats.completionRate}%</div>
          <div className="text-sm text-yellow-600">Completion Rate</div>
        </div>
      </div>
    </div>
  )
}

export default StatsOverview