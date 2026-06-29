"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { analyzeTicket, updateTicket } from "@/lib/api";
import { type Ticket, type AnalysisResult } from "@/types";
import { AnalysisPanel } from "./AnalysisPanel";
import { X, Loader2, CheckCircle, Clock, AlertTriangle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const priorityBadge: Record<string, string> = {
  low: "bg-gray-700/60 text-gray-400 border-gray-600",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-600/40",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/40",
  critical: "bg-red-500/15 text-red-400 border-red-500/50",
};

const statusColors: Record<string, string> = {
  open: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  in_progress: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  resolved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

interface Props {
  ticket: Ticket;
  onClose: () => void;
}

export function TicketDialog({ ticket, onClose }: Props) {
  const [resolution, setResolution] = useState(ticket.resolution ?? "");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [localStatus, setLocalStatus] = useState(ticket.status);
  const queryClient = useQueryClient();

  const isResolved = localStatus === "resolved";

  const analyzeMutation = useMutation({
    mutationFn: () => analyzeTicket(ticket.title, ticket.description),
    onSuccess: (data) => setAnalysis(data),
  });

  const resolveMutation = useMutation({
    mutationFn: () => updateTicket(ticket.id, { status: "resolved", resolution }),
    // Optimistic — update UI instantly, sync in background
    onMutate: () => setLocalStatus("resolved"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setTimeout(() => onClose(), 800);
    },
    onError: () => setLocalStatus(ticket.status),
  });

  const inProgressMutation = useMutation({
    mutationFn: () => updateTicket(ticket.id, { status: "in_progress" }),
    onMutate: () => setLocalStatus("in_progress"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tickets"] }),
    onError: () => setLocalStatus(ticket.status),
  });

  useEffect(() => {
    if (!isResolved) analyzeMutation.mutate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={cn(
        "border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transition-colors duration-300",
        isResolved
          ? "bg-gray-950 border-emerald-700/40"
          : "bg-gray-950 border-gray-800"
      )}>
        {/* Resolved banner */}
        {isResolved && (
          <div className="bg-emerald-500/10 border-b border-emerald-700/30 px-6 py-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-emerald-300 text-sm font-medium">This ticket has been resolved</span>
          </div>
        )}

        {/* Header */}
        <div className={cn(
          "sticky top-0 border-b px-6 py-4 flex items-start justify-between gap-4 z-10 transition-colors duration-300",
          isResolved ? "bg-gray-950 border-emerald-800/30" : "bg-gray-950 border-gray-800"
        )}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={cn("text-xs border px-2 py-0.5 rounded-full", statusColors[localStatus])}>
                {localStatus.replace("_", " ")}
              </span>
              <span className={cn("text-xs border px-2 py-0.5 rounded-full font-medium", priorityBadge[ticket.priority])}>
                {ticket.priority}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-white leading-snug">{ticket.title}</h2>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(ticket.created_at).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-200 transition-colors shrink-0 mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">
          {/* Description */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Description</p>
            <p className="text-gray-300 text-sm leading-relaxed">{ticket.description}</p>
          </div>

          {/* Resolution (if resolved) */}
          {isResolved && ticket.resolution && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> Resolution
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">{ticket.resolution}</p>
            </div>
          )}

          {/* AI Analysis */}
          {!isResolved && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-400" /> AI Analysis
              </p>
              {analyzeMutation.isPending && (
                <div className="flex items-center gap-2 text-gray-400 text-sm py-6 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing ticket…
                </div>
              )}
              {analyzeMutation.isError && (
                <div className="text-red-400 text-sm py-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Analysis failed. Check that the backend is running.
                </div>
              )}
              {analysis && <AnalysisPanel analysis={analysis} />}
            </div>
          )}

          {/* Actions */}
          {!isResolved && (
            <div className="flex flex-col gap-3 pt-2 border-t border-gray-800">
              {localStatus === "open" && (
                <button
                  onClick={() => inProgressMutation.mutate()}
                  disabled={inProgressMutation.isPending}
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 w-fit"
                >
                  <Clock className="w-4 h-4" />
                  {inProgressMutation.isPending ? "Updating…" : "Mark as In Progress"}
                </button>
              )}

              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Resolve Ticket</p>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Describe what you did to fix this issue…"
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none text-sm"
              />
              <button
                onClick={() => resolveMutation.mutate()}
                disabled={!resolution.trim() || resolveMutation.isPending}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2.5 transition-colors text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                {resolveMutation.isPending ? "Resolving…" : "Mark as Resolved"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
