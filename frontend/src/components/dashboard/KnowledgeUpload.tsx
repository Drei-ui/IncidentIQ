"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadKnowledge, api } from "@/lib/api";
import { Upload, CheckCircle, FileText } from "lucide-react";
import { type KnowledgeDoc } from "@/types";

const DOC_TYPES = [
  { value: "sop", label: "SOP" },
  { value: "runbook", label: "Runbook" },
  { value: "api_doc", label: "API Doc" },
  { value: "previous_ticket", label: "Previous Ticket" },
  { value: "other", label: "Other" },
];

const typeColors: Record<string, string> = {
  sop: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  runbook: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  api_doc: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  previous_ticket: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  other: "bg-gray-500/10 text-gray-400 border-gray-600",
};

export function KnowledgeUpload() {
  const [docType, setDocType] = useState("other");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: docs = [] } = useQuery<KnowledgeDoc[]>({
    queryKey: ["knowledge"],
    queryFn: () => api.get("/knowledge").then((r) => r.data),
    staleTime: 0,
  });

  const mutation = useMutation({
    mutationFn: (file: File) => uploadKnowledge(file, docType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
      setFileName(null);
      if (fileRef.current) fileRef.current.value = "";
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleUpload = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    mutation.mutate(file);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Upload form */}
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Document Type</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
          >
            {DOC_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-700 hover:border-blue-600/50 rounded-xl p-8 text-center cursor-pointer transition-colors group"
        >
          <Upload className="w-8 h-8 text-gray-600 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
          <p className="text-gray-400 text-sm">
            {fileName
              ? <span className="text-blue-400 font-medium">{fileName}</span>
              : "Click to upload .txt or .md file"
            }
          </p>
          <p className="text-gray-600 text-xs mt-1">Supported: .txt, .md</p>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!fileName || mutation.isPending}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2.5 transition-colors"
        >
          {mutation.isPending ? "Uploading…" : "Upload to Knowledge Base"}
        </button>

        {mutation.isSuccess && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2.5">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Indexed {mutation.data.chunks_created} chunks from <span className="font-medium">{mutation.data.document_name}</span>
          </div>
        )}

        {mutation.isError && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
            Upload failed. Only .txt and .md files are supported.
          </p>
        )}
      </div>

      {/* Uploaded docs list */}
      {docs.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Indexed Documents ({docs.length})</p>
          <div className="flex flex-col gap-2">
            {docs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-sm text-gray-300 flex-1 truncate">{doc.document_name}</span>
                <span className={`text-xs border px-2 py-0.5 rounded-full shrink-0 ${typeColors[doc.document_type] ?? typeColors.other}`}>
                  {doc.document_type.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {docs.length === 0 && (
        <div className="text-center py-6 border border-dashed border-gray-800 rounded-xl">
          <p className="text-gray-600 text-sm">No documents indexed yet.</p>
        </div>
      )}
    </div>
  );
}
