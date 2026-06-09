import { apiClient } from './client';

export type TicketType = 'BUG' | 'BAN_APPEAL' | 'BILLING' | 'GENERAL';
export type TicketStatus = 'OPEN' | 'CLOSED';

export interface TicketAuthor {
  id: string;
  username: string;
  role: string;
  avatarUrl: string | null;
}

export interface Ticket {
  id: string;
  userId: string;
  user?: TicketAuthor;
  title: string;
  type: TicketType;
  status: TicketStatus;
  priority: number;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { messages: number };
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  author: TicketAuthor;
  content: string;
  createdAt: string;
}

export interface TicketsResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  totalPages: number;
}

export const ticketsApi = {
  createTicket: (data: { title: string; type: TicketType; content: string }) =>
    apiClient.post<Ticket>('/tickets', data).then((r) => r.data),

  getMyTickets: (page = 1, status?: TicketStatus, type?: TicketType) =>
    apiClient
      .get<TicketsResponse>('/tickets/me', { params: { page, status, type } })
      .then((r) => r.data),

  getTicket: (id: string) =>
    apiClient.get<Ticket>(`/tickets/${id}`).then((r) => r.data),

  getMessages: (id: string) =>
    apiClient.get<TicketMessage[]>(`/tickets/${id}/messages`).then((r) => r.data),

  sendMessage: (id: string, content: string) =>
    apiClient.post<TicketMessage>(`/tickets/${id}/messages`, { content }).then((r) => r.data),

  updateStatus: (id: string, status: TicketStatus) =>
    apiClient.patch<Ticket>(`/tickets/${id}/status`, { status }).then((r) => r.data),

  adminListTickets: (page = 1, status?: TicketStatus, type?: TicketType) =>
    apiClient
      .get<TicketsResponse>('/tickets/admin', { params: { page, status, type } })
      .then((r) => r.data),
};
