"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analyzeTicket, updateTicket, api } from "@/lib/api";
import { type Ticket, type AnalysisResult } from "@/types";
import { AnalysisPanel } from "@/components/dashboard/AnalysisPanel";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle, Clock, Zap, AlertTriangle } from "lucide-react";
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

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [resolution, setResolution] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const { data: ticket, isLoading, isError } = useQuery<Ticket>({
    queryKey: ["ticket", id],
    queryFn: () => api.get(`/tickets/${id}`).then((r) => r.data),
  });

  const analyzeMutation = useMutation({
    mutationFn: () => analyzeTicket(ticket!.title, ticket!.description),
    onSuccess: (data) => setAnalysis(data),
  });

  const resolveMutation = useMutation({
    mutationFn: () => updateTicket(id, { status: "resolved", resolution }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const inProgressMutation = useMutation({
    mutationFn: () => updateTicket(id, { status: "in_progress" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket", id] }),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse flex flex-col gap-6">
          <div className="h-4 bg-gray-800 rounded w-24" />
          <div className="h-8 bg-gray-800 rounded w-2/3" />
          <div className="h-32 bg-gray-900 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-red-400 font-medium">Ticket not found.</p>
        <Link href="/" className="text-blue-400 text-sm mt-2 inline-block hover:underline">← Back to dashboard</Link>
      </div>
    );
  }

  const isResolved = ticket.status === "resolved";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Back nav */}
      <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      {/* Header */}
      <div className={cn("border rounded-2xl p-6 flex flex-col gap-3", isResolved ? "border-emerald-700/40 bg-gray-900/50" : "border-gray-800 bg-gray-900/50")}>
        {isResolved && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
            <CheckCircle className="w-4 h-4" /> Resolved
          </div>
        )}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-white leading-snug flex-1">{ticket.title}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-xs border px-2.5 py-1 rounded-full", statusColors[ticket.status])}>
              {ticket.status.replace("_", " ")}
            </span>
            <span className={cn("text-xs border px-2.5 py-1 rounded-full font-medium", priorityBadge[ticket.priority])}>
              {ticket.priority}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Created {new Date(ticket.created_at).toLocaleString()} · Updated {new Date(ticket.updated_at).toLocaleString()}
        </p>
      </div>

      {/* Description */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Description</p>
        <p className="text-gray-300 text-sm leading-relaxed">{ticket.description}</p>
      </div>

      {/* Resolution */}
      {isResolved && ticket.resolution && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
          <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Resolution
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">{ticket.resolution}</p>
        </div>
      )}

      {/* AI Analysis */}
      {!isResolved && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-400" /> AI Analysis
            </p>
            {!analysis && !analyzeMutation.isPending && (
              <button
                onClick={() => analyzeMutation.mutate()}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Run analysis →
              </button>
            )}
          </div>

          {analyzeMutation.isPending && (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-6 justify-center bg-gray-900 border border-gray-800 rounded-xl">
              <Loader2 className="w-4 h-4 animate-spin" /> Analyzing ticket…
            </div>
          )}
          {analyzeMutation.isError && (
            <div className="flex items-center gap-2 text-red-400 text-sm p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertTriangle className="w-4 h-4" /> Analysis failed. Check the backend is running.
            </div>
          )}
          {analysis && <AnalysisPanel analysis={analysis} />}
        </div>
      )}

      {/* Actions */}
      {!isResolved && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Actions</p>

          {ticket.status === "open" && (
            <button
              onClick={() => inProgressMutation.mutate()}
              disabled={inProgressMutation.isPending}
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 w-fit"
            >
              <Clock className="w-4 h-4" />
              {inProgressMutation.isPending ? "Updating…" : "Mark as In Progress"}
            </button>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Resolution notes</label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Describe what you did to fix this issue…"
              rows={3}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none text-sm"
            />
            <button
              onClick={() => resolveMutation.mutate()}
              disabled={!resolution.trim() || resolveMutation.isPending}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2.5 transition-colors text-sm w-full"
            >
              <CheckCircle className="w-4 h-4" />
              {resolveMutation.isPending ? "Resolving…" : "Mark as Resolved"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
