"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadKnowledge } from "@/lib/api";
import { Upload, CheckCircle } from "lucide-react";

const DOC_TYPES = [
  { value: "sop", label: "SOP" },
  { value: "runbook", label: "Runbook" },
  { value: "api_doc", label: "API Doc" },
  { value: "previous_ticket", label: "Previous Ticket" },
  { value: "other", label: "Other" },
];

export function KnowledgeUpload() {
  const [docType, setDocType] = useState("other");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => uploadKnowledge(file, docType),
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
        className="border-2 border-dashed border-gray-700 hover:border-gray-500 rounded-xl p-8 text-center cursor-pointer transition-colors"
      >
        <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">
          {fileName ?? "Click to upload .txt or .md file"}
        </p>
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
        {mutation.isPending ? "Uploading..." : "Upload to Knowledge Base"}
      </button>

      {mutation.isSuccess && (
        <div className="flex items-center gap-2 text-emerald-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          Uploaded {mutation.data.chunks_created} chunks from {mutation.data.document_name}
        </div>
      )}

      {mutation.isError && (
        <p className="text-red-400 text-sm">Upload failed. Only .txt and .md files are supported.</p>
      )}
    </div>
  );
}
