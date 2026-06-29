"use client";

import { useQuery } from "@tanstack/react-query";
import { getTickets } from "@/lib/api";
import { type Ticket } from "@/types";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

const statusColors: Record<string, string> = {
  open: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  in_progress: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  resolved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const priorityBadge: Record<string, string> = {
  low: "bg-gray-700/60 text-gray-400 border-gray-600",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-600/40",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/40",
  critical: "bg-red-500/15 text-red-400 border-red-500/50",
};

function SkeletonRow() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-800 rounded w-2/3" />
          <div className="h-3 bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-800 rounded w-4/5" />
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="h-5 w-16 bg-gray-800 rounded-full" />
          <div className="h-5 w-12 bg-gray-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function TicketList({ onSelect }: { onSelect: (ticket: Ticket) => void }) {
  const { data: tickets = [], isLoading, isError } = useQuery<Ticket[]>({
    queryKey: ["tickets"],
    queryFn: () => getTickets(),
    refetchInterval: 15000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-sm font-medium">Could not connect to the server.</p>
        <p className="text-gray-600 text-xs mt-1">Make sure the backend is running on port 8000.</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl">
        <p className="text-gray-400 text-sm font-medium">No tickets yet</p>
        <p className="text-gray-600 text-xs mt-1">Go to New Ticket to submit one.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tickets.map((ticket) => (
        <button
          key={ticket.id}
          onClick={() => onSelect(ticket)}
          className="group w-full text-left bg-gray-900 border border-gray-800 hover:border-blue-600/50 hover:bg-gray-900/80 rounded-xl p-4 transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-100 group-hover:text-white truncate transition-colors">
                {ticket.title}
              </p>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ticket.description}</p>
              <p className="text-xs text-gray-700 mt-2">
                {new Date(ticket.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className={cn("text-xs border px-2 py-0.5 rounded-full", statusColors[ticket.status])}>
                {ticket.status.replace("_", " ")}
              </span>
              <span className={cn("text-xs border px-2 py-0.5 rounded-full font-medium", priorityBadge[ticket.priority])}>
                {ticket.priority}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-blue-400 flex items-center gap-0.5">
              View details <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
