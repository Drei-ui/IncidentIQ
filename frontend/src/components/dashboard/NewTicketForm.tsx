"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTicket, analyzeTicket } from "@/lib/api";
import { type AnalysisResult } from "@/types";
import { AnalysisPanel } from "./AnalysisPanel";
import { Loader2, CheckCircle } from "lucide-react";

interface Props {
  onSubmitted?: () => void;
  prefill?: { title: string; description: string; priority: string };
}

export function NewTicketForm({ onSubmitted, prefill }: Props) {
  const [title, setTitle] = useState(prefill?.title ?? "");
  const [description, setDescription] = useState(prefill?.description ?? "");
  const [priority, setPriority] = useState(prefill?.priority ?? "medium");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => createTicket({ title, description, priority }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setTitle("");
      setDescription("");
      setPriority("medium");
      setAnalysis(null);
      // Redirect to tickets list after short delay so user sees the success flash
      setTimeout(() => onSubmitted?.(), 1200);
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: () => analyzeTicket(title, description),
    onSuccess: (data) => setAnalysis(data),
  });

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    analyzeMutation.mutate();
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleAnalyze} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. User cannot login after password reset"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail..."
            rows={4}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={analyzeMutation.isPending || createMutation.isPending}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2.5 transition-colors"
        >
          {analyzeMutation.isPending
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            : "Analyze with AI"
          }
        </button>
      </form>

      {analysis && (
        <>
          <AnalysisPanel analysis={analysis} />
          {createMutation.isSuccess ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              Ticket submitted — redirecting to ticket list…
            </div>
          ) : (
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2.5 transition-colors"
            >
              {createMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                : "Submit Ticket"
              }
            </button>
          )}
        </>
      )}
    </div>
  );
}
