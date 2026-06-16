import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { LinkAnalytics } from "../types";

const PALETTE = ["#4f6ef7", "#34d399", "#f59e0b", "#f87171", "#a78bfa", "#38bdf8"];

interface Props {
  analytics: LinkAnalytics;
}

export function AnalyticsCharts({ analytics }: Props) {
  const { timeSeries, referrerBreakdown, deviceBreakdown } = analytics;

  return (
    <div className="space-y-6">
      {/* Time series */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
          Clicks per day (last 30 days)
        </h3>
        {timeSeries.length === 0 ? (
          <p className="text-gray-400 text-sm">No click data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={timeSeries}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f6ef7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                labelFormatter={(v) => `Date: ${v}`}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#4f6ef7"
                strokeWidth={2}
                fill="url(#colorCount)"
                name="Clicks"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Referrer breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
            Top referrers
          </h3>
          {referrerBreakdown.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={referrerBreakdown}
                  dataKey="count"
                  nameKey="referrer"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ referrer, percent }) =>
                    `${referrer} (${((percent ?? 0) * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {referrerBreakdown.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-gray-600">{value}</span>
                  )}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Device breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
            Device type
          </h3>
          {deviceBreakdown.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet.</p>
          ) : (
            <div className="space-y-3 mt-2">
              {deviceBreakdown.map((d, i) => {
                const total = deviceBreakdown.reduce((s, x) => s + x.count, 0);
                const pct = Math.round((d.count / total) * 100);
                return (
                  <div key={d.device}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-gray-700">{d.device || "desktop"}</span>
                      <span className="font-semibold text-gray-700">{d.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: PALETTE[i % PALETTE.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
