import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
});

export async function getStats() {
  return api.get("/tickets/stats").then((r) => r.data);
}

export async function getTickets(status?: string) {
  return api.get("/tickets/", { params: status ? { status } : {} }).then((r) => r.data);
}

export async function createTicket(data: { title: string; description: string; priority: string }) {
  return api.post("/tickets/", data).then((r) => r.data);
}

export async function updateTicket(id: string, data: object) {
  return api.patch(`/tickets/${id}`, data).then((r) => r.data);
}

export async function analyzeTicket(title: string, description: string) {
  return api.post("/analysis/", { title, description }).then((r) => r.data);
}

export async function uploadKnowledge(file: File, documentType: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("document_type", documentType);
  return api.post("/knowledge/upload", form).then((r) => r.data);
}

export async function analyzeLog(file: File) {
  const form = new FormData();
  form.append("file", file);
  return api.post("/logs/analyze", form).then((r) => r.data);
}
