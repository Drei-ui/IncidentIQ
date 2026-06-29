"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";

interface ChartData {
  by_priority: { priority: string; count: number }[];
  by_status: { status: string; count: number }[];
  daily: { day: string; total: number; resolved: number }[];
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "#6b7280",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

const STATUS_COLORS: Record<string, string> = {
  open: "#f59e0b",
  in_progress: "#3b82f6",
  resolved: "#10b981",
};

const tooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid #1f2937",
  borderRadius: "8px",
  color: "#f3f4f6",
  fontSize: "12px",
};

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-40 text-gray-600 text-sm">{label}</div>
  );
}

export function DashboardCharts() {
  const { data, isLoading } = useQuery<ChartData>({
    queryKey: ["charts"],
    queryFn: () => api.get("/tickets/charts").then((r) => r.data),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-52 animate-pulse" />
        ))}
      </div>
    );
  }

  const hasData = data && data.by_priority.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Priority */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Tickets by Priority</p>
          {hasData ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={data.by_priority} barSize={32}>
                <XAxis dataKey="priority" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#1f2937" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.by_priority.map((entry) => (
                    <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] ?? "#6b7280"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="No tickets yet" />
          )}
        </div>

        {/* By Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Tickets by Status</p>
          {hasData ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={data.by_status}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                >
                  {data.by_status.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [v, String(name).replace("_", " ")]} />
                <Legend
                  formatter={(v) => <span style={{ color: "#9ca3af", fontSize: 11 }}>{String(v).replace("_", " ")}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="No tickets yet" />
          )}
        </div>
      </div>

      {/* Daily trend — full width */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Tickets — Last 7 Days</p>
        {data && data.daily.length > 0 ? (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={data.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="day" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip contentStyle={tooltipStyle}
                labelFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })} />
              <Legend formatter={(v) => <span style={{ color: "#9ca3af", fontSize: 11 }}>{v}</span>} />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} name="Total" />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart label="No data for the last 7 days" />
        )}
      </div>
    </div>
  );
}
