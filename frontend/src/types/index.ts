export type TicketStatus = "open" | "in_progress" | "resolved";
export type TicketPriority = "low" | "medium" | "high" | "critical";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  resolution: string | null;
  created_at: string;
  updated_at: string;
}

export interface Stats {
  total: number;
  resolved: number;
  pending: number;
}

export interface SimilarTicket {
  id: string;
  title: string;
  description: string;
  resolution: string | null;
  similarity_score: number;
}

export interface RelatedDocument {
  id: string;
  document_name: string;
  content: string;
  similarity_score: number;
}

export interface AnalysisResult {
  possible_cause: string;
  confidence: number;
  suggested_steps: string[];
  estimated_time: string;
  similar_tickets: SimilarTicket[];
  related_documents: RelatedDocument[];
}
