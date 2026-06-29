"use client";

import { useQuery } from "@tanstack/react-query";
import { getTickets } from "@/lib/api";
import { type Ticket } from "@/types";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  open: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  in_progress: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  resolved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const priorityColors: Record<string, string> = {
  low: "text-gray-400",
  medium: "text-yellow-400",
  high: "text-orange-400",
  critical: "text-red-400",
};

export function TicketList({ onSelect }: { onSelect: (ticket: Ticket) => void }) {
  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ["tickets"],
    queryFn: () => getTickets(),
    refetchInterval: 15000,
  });

  if (isLoading) {
    return <div className="text-gray-500 text-sm py-8 text-center">Loading tickets...</div>;
  }

  if (tickets.length === 0) {
    return <div className="text-gray-500 text-sm py-8 text-center">No tickets yet. Submit one to get started.</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {tickets.map((ticket) => (
        <button
          key={ticket.id}
          onClick={() => onSelect(ticket)}
          className="w-full text-left bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-100 truncate">{ticket.title}</p>
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">{ticket.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className={cn("text-xs border px-2 py-0.5 rounded-full", statusColors[ticket.status])}>
                {ticket.status.replace("_", " ")}
              </span>
              <span className={cn("text-xs font-medium", priorityColors[ticket.priority])}>
                {ticket.priority}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
