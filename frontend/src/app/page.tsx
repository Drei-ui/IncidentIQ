"use client";

import { useState } from "react";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { TicketList } from "@/components/dashboard/TicketList";
import { NewTicketForm } from "@/components/dashboard/NewTicketForm";
import { KnowledgeUpload } from "@/components/dashboard/KnowledgeUpload";
import { TicketDialog } from "@/components/dashboard/TicketDialog";
import { LogAnalysis } from "@/components/dashboard/LogAnalysis";
import { DashboardCharts } from "@/components/charts/DashboardCharts";
import { type Ticket } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { Zap, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type Tab = "tickets" | "new" | "knowledge" | "logs" | "charts";

interface PrefillTicket {
  title: string;
  description: string;
  priority: string;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("tickets");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [prefill, setPrefill] = useState<PrefillTicket | null>(null);
  const router = useRouter();

  const tabs: { id: Tab; label: string }[] = [
    { id: "tickets", label: "Tickets" },
    { id: "new", label: "New Ticket" },
    { id: "knowledge", label: "Knowledge Base" },
    { id: "logs", label: "Log Analysis" },
    { id: "charts", label: "Analytics" },
  ];

  const handleCreateFromLog = (title: string, description: string, priority: string) => {
    setPrefill({ title, description, priority });
    setTab("new");
  };

  const authEnabled = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Brand */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-lg p-2">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">IncidentIQ</h1>
            <p className="text-xs text-gray-500">AI-powered ticket resolution</p>
          </div>
        </div>
        {authEnabled && (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-2 rounded-lg hover:bg-gray-800"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        )}
      </div>

      <StatsBar />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit flex-wrap">
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
        {tab === "new" && (
          <NewTicketForm
            prefill={prefill ?? undefined}
            onSubmitted={() => { setTab("tickets"); setPrefill(null); }}
          />
        )}
        {tab === "knowledge" && <KnowledgeUpload />}
        {tab === "logs" && <LogAnalysis onCreateTicket={handleCreateFromLog} />}
        {tab === "charts" && <DashboardCharts />}
      </div>

      {selected && (
        <TicketDialog ticket={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
