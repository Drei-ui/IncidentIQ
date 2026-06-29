"use client";

import { useQuery } from "@tanstack/react-query";
import { getStats } from "@/lib/api";
import { type Stats } from "@/types";

function StatCard({ label, value, color, loading }: { label: string; value: number; color: string; loading?: boolean }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-1">
      <span className="text-sm text-gray-400">{label}</span>
      {loading ? (
        <div className="h-9 w-16 bg-gray-800 rounded animate-pulse mt-1" />
      ) : (
        <span className={`text-3xl font-bold ${color}`}>{value}</span>
      )}
    </div>
  );
}

export function StatsBar() {
  const { data, isLoading } = useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: getStats,
    refetchInterval: 15000,
  });

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard label="Total Tickets" value={data?.total ?? 0} color="text-white" loading={isLoading} />
      <StatCard label="Resolved" value={data?.resolved ?? 0} color="text-emerald-400" loading={isLoading} />
      <StatCard label="Pending" value={data?.pending ?? 0} color="text-amber-400" loading={isLoading} />
    </div>
  );
}
