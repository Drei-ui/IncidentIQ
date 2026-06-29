"use client";

import { useQuery } from "@tanstack/react-query";
import { getStats } from "@/lib/api";
import { type Stats } from "@/types";

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-1">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
    </div>
  );
}

export function StatsBar() {
  const { data } = useQuery<Stats>({ queryKey: ["stats"], queryFn: getStats, refetchInterval: 30000 });

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard label="Tickets Today" value={data?.total ?? 0} color="text-white" />
      <StatCard label="Resolved" value={data?.resolved ?? 0} color="text-emerald-400" />
      <StatCard label="Pending" value={data?.pending ?? 0} color="text-amber-400" />
    </div>
  );
}
