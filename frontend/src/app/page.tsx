"use client";

import { useState } from "react";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { TicketList } from "@/components/dashboard/TicketList";
import { NewTicketForm } from "@/components/dashboard/NewTicketForm";
import { KnowledgeUpload } from "@/components/dashboard/KnowledgeUpload";
import { TicketDialog } from "@/components/dashboard/TicketDialog";
import { type Ticket } from "@/types";
import { Zap } from "lucide-react";

type Tab = "tickets" | "new" | "knowledge";

export default function Home() {
  const [tab, setTab] = useState<Tab>("tickets");
  const [selected, setSelected] = useState<Ticket | null>(null);

  const tabs: { id: Tab; label: string }[] = [
    { id: "tickets", label: "Tickets" },
    { id: "new", label: "New Ticket" },
    { id: "knowledge", label: "Knowledge Base" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 rounded-lg p-2">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">IncidentIQ</h1>
          <p className="text-xs text-gray-500">AI-powered ticket resolution</p>
        </div>
      </div>

      <StatsBar />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {tab === "tickets" && <TicketList onSelect={setSelected} />}
        {tab === "new" && <NewTicketForm onSubmitted={() => setTab("tickets")} />}
        {tab === "knowledge" && <KnowledgeUpload />}
      </div>

      {selected && (
        <TicketDialog ticket={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
