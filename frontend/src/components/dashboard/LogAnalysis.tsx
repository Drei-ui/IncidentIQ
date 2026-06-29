"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { analyzeLog } from "@/lib/api";
import { type LogAnalysisResult } from "@/types";
import {
  Upload, Loader2, AlertTriangle, CheckCircle,
  Server, Zap, Terminal, TicketPlus, ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const severityStyles: Record<string, string> = {
  critical: "bg-red-500/15 text-red-400 border-red-500/40",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/40",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-600/40",
  low: "bg-gray-700/60 text-gray-400 border-gray-600",
};

const priorityStyles: Record<string, string> = {
  critical: "bg-red-600 hover:bg-red-500",
  high: "bg-orange-600 hover:bg-orange-500",
  medium: "bg-blue-600 hover:bg-blue-500",
  low: "bg-gray-700 hover:bg-gray-600",
};

interface ResultProps {
  result: LogAnalysisResult;
  onCreateTicket: (title: string, description: string, priority: string) => void;
}

function AnalysisResult({ result, onCreateTicket }: ResultProps) {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Severity + service header */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={cn("text-xs font-semibold border px-3 py-1 rounded-full uppercase tracking-wide", severityStyles[result.severity] ?? severityStyles.medium)}>
          {result.severity} severity
        </span>
        <span className="flex items-center gap-1.5 text-sm text-gray-400">
          <Server className="w-3.5 h-3.5" />
          {result.affected_service}
        </span>
      </div>

      {/* Root cause */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-blue-400" /> Most Likely Cause
        </p>
        <p className="text-gray-100 font-medium text-sm leading-relaxed">{result.most_likely_cause}</p>
      </div>

      {/* Detected issues */}
      {result.detected_issues.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Detected Issues
          </p>
          <div className="flex flex-col gap-2">
            {result.detected_issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200">{issue.type}</p>
                  {issue.detail && <p className="text-xs text-gray-500 mt-0.5">{issue.detail}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {issue.count != null && (
                    <span className="text-xs text-red-400 font-mono font-bold">{issue.count}x</span>
                  )}
                  {issue.timeframe && (
                    <span className="text-xs text-gray-600">{issue.timeframe}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested actions */}
      {result.suggested_actions.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Suggested Actions
          </p>
          <ol className="flex flex-col gap-1.5">
            {result.suggested_actions.map((action, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-300">
                <span className="text-gray-600 shrink-0 font-mono">{i + 1}.</span>
                {action}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Raw errors collapsible */}
      {result.raw_errors.length > 0 && (
        <div>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            {showRaw ? "Hide" : "Show"} raw error lines ({result.raw_errors.length})
            {showRaw ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showRaw && (
            <div className="mt-2 bg-gray-950 border border-gray-800 rounded-lg p-3 overflow-x-auto">
              {result.raw_errors.map((line, i) => (
                <p key={i} className="text-xs font-mono text-red-400/80 leading-relaxed whitespace-pre">{line}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create ticket CTA */}
      <div className="border-t border-gray-800 pt-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <TicketPlus className="w-3.5 h-3.5" /> Create Ticket from Analysis
        </p>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Title</p>
            <p className="text-sm text-gray-200 font-medium">{result.ticket_suggestion.title}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Description</p>
            <p className="text-sm text-gray-400 leading-relaxed">{result.ticket_suggestion.description}</p>
          </div>
          <button
            onClick={() => onCreateTicket(
              result.ticket_suggestion.title,
              result.ticket_suggestion.description,
              result.ticket_suggestion.priority,
            )}
            className={cn(
              "flex items-center justify-center gap-2 text-white font-medium rounded-lg px-4 py-2.5 transition-colors text-sm",
              priorityStyles[result.ticket_suggestion.priority] ?? priorityStyles.medium,
            )}
          >
            <TicketPlus className="w-4 h-4" />
            Create {result.ticket_suggestion.priority} priority ticket
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  onCreateTicket: (title: string, description: string, priority: string) => void;
}

export function LogAnalysis({ onCreateTicket }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<LogAnalysisResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => analyzeLog(file),
    onSuccess: (data) => setResult(data),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setResult(null);
    }
  };

  const handleAnalyze = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    mutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && fileRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileRef.current.files = dt.files;
      setFileName(file.name);
      setResult(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Upload zone */}
      <div className="flex flex-col gap-3">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-700 hover:border-blue-600/50 rounded-xl p-8 text-center cursor-pointer transition-colors group"
        >
          <Upload className="w-8 h-8 text-gray-600 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
          <p className="text-gray-400 text-sm">
            {fileName
              ? <span className="text-blue-400 font-medium">{fileName}</span>
              : "Drop a log file here or click to browse"
            }
          </p>
          <p className="text-gray-600 text-xs mt-1">Supports .log and .txt files up to 5 MB</p>
          <input
            ref={fileRef}
            type="file"
            accept=".log,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!fileName || mutation.isPending}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2.5 transition-colors"
        >
          {mutation.isPending
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing logs…</>
            : <><Zap className="w-4 h-4" /> Analyze with AI</>
          }
        </button>

        {mutation.isError && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Analysis failed. Check that the backend is running and the file is a valid log.
          </div>
        )}
      </div>

      {/* Results */}
      {result && <AnalysisResult result={result} onCreateTicket={onCreateTicket} />}
    </div>
  );
}
