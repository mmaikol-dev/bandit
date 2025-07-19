interface TrendsChartProps {
  data: Array<{
    date: string;
    incidents: number;
    critical: number;
    resolved: number;
  }>;
}

export function TrendsChart({ data }: TrendsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Incident Trends</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No trend data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.incidents, d.critical, d.resolved)));
  const chartHeight = 200;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Incident Trends (Last 30 Days)</h3>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-2 sm:mt-0">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Total Incidents</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Critical</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Resolved</span>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Chart Container */}
        <div className="overflow-x-auto">
          <div className="min-w-full" style={{ minWidth: `${data.length * 40}px` }}>
            {/* Y-axis labels */}
            <div className="flex items-end justify-between mb-2 text-xs text-gray-500">
              <span>{maxValue}</span>
              <span>{Math.floor(maxValue * 0.75)}</span>
              <span>{Math.floor(maxValue * 0.5)}</span>
              <span>{Math.floor(maxValue * 0.25)}</span>
              <span>0</span>
            </div>

            {/* Chart area */}
            <div className="relative bg-gray-50 rounded-lg p-4" style={{ height: `${chartHeight}px` }}>
              {/* Grid lines */}
              <div className="absolute inset-4">
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                  <div
                    key={ratio}
                    className="absolute w-full border-t border-gray-200"
                    style={{ bottom: `${ratio * 100}%` }}
                  />
                ))}
              </div>

              {/* Data points and lines */}
              <div className="absolute inset-4 flex items-end justify-between">
                {data.map((point, index) => {
                  const incidentHeight = maxValue > 0 ? (point.incidents / maxValue) * (chartHeight - 32) : 0;
                  const criticalHeight = maxValue > 0 ? (point.critical / maxValue) * (chartHeight - 32) : 0;
                  const resolvedHeight = maxValue > 0 ? (point.resolved / maxValue) * (chartHeight - 32) : 0;

                  return (
                    <div key={point.date} className="flex flex-col items-center space-y-1 relative group">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                        <div>{formatDate(point.date)}</div>
                        <div>Total: {point.incidents}</div>
                        <div>Critical: {point.critical}</div>
                        <div>Resolved: {point.resolved}</div>
                      </div>

                      {/* Data bars */}
                      <div className="flex space-x-1 items-end">
                        {/* Total incidents bar */}
                        <div
                          className="w-2 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                          style={{ height: `${incidentHeight}px` }}
                        />
                        {/* Critical incidents bar */}
                        <div
                          className="w-2 bg-red-500 rounded-t hover:bg-red-600 transition-colors"
                          style={{ height: `${criticalHeight}px` }}
                        />
                        {/* Resolved incidents bar */}
                        <div
                          className="w-2 bg-green-500 rounded-t hover:bg-green-600 transition-colors"
                          style={{ height: `${resolvedHeight}px` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              {data.map((point, index) => (
                <span key={point.date} className={index % 5 === 0 ? "block" : "hidden sm:block"}>
                  {formatDate(point.date)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.reduce((sum, d) => sum + d.incidents, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Incidents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {data.reduce((sum, d) => sum + d.critical, 0)}
            </div>
            <div className="text-sm text-gray-600">Critical Incidents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.reduce((sum, d) => sum + d.resolved, 0)}
            </div>
            <div className="text-sm text-gray-600">Resolved Incidents</div>
          </div>
        </div>
      </div>
    </div>
  );
}
