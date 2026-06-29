"use client";

import { type AnalysisResult } from "@/types";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, FileText, Ticket } from "lucide-react";

function ConfidenceBadge({ value }: { value: number }) {
  const color =
    value >= 80 ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
    : value >= 50 ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
    : "text-red-400 border-red-500/30 bg-red-500/10";
  return (
    <span className={cn("text-sm font-semibold border rounded-full px-3 py-0.5", color)}>
      {value}% confidence
    </span>
  );
}

export function AnalysisPanel({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="flex flex-col gap-4 bg-gray-900 border border-gray-700 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Possible Cause</p>
          <p className="text-gray-100 font-medium">{analysis.possible_cause}</p>
        </div>
        <ConfidenceBadge value={analysis.confidence} />
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" /> Suggested Steps
        </p>
        <ol className="flex flex-col gap-1.5">
          {analysis.suggested_steps.map((step, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-300">
              <span className="text-gray-600 shrink-0">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-gray-400">
        <Clock className="w-3.5 h-3.5" />
        Estimated time: <span className="text-gray-200">{analysis.estimated_time}</span>
      </div>

      {analysis.similar_tickets.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5" /> Similar Tickets
          </p>
          <div className="flex flex-col gap-2">
            {analysis.similar_tickets.slice(0, 3).map((t) => (
              <div key={t.id} className="bg-gray-800 rounded-lg px-3 py-2">
                <p className="text-sm text-gray-200 font-medium">{t.title}</p>
                {t.resolution && (
                  <p className="text-xs text-gray-400 mt-0.5">{t.resolution}</p>
                )}
                <p className="text-xs text-gray-600 mt-1">Score: {(t.similarity_score * 100).toFixed(0)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.related_documents.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Related Documents
          </p>
          <div className="flex flex-col gap-2">
            {analysis.related_documents.slice(0, 3).map((doc) => (
              <div key={doc.id} className="bg-gray-800 rounded-lg px-3 py-2">
                <p className="text-sm text-blue-400 font-medium">{doc.document_name}</p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{doc.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
