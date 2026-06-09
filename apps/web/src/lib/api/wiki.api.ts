import { apiClient } from './client';

export interface WikiPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  isPublished: boolean;
  authorId: string | null;
  lastEditedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type WikiPageSummary = Omit<WikiPage, 'content'>;

export const wikiApi = {
  listPages: () =>
    apiClient.get<WikiPageSummary[]>('/wiki').then((r) => r.data),

  getPage: (slug: string) =>
    apiClient.get<WikiPage>(`/wiki/${slug}`).then((r) => r.data),

  createPage: (data: { slug: string; title: string; content: string }) =>
    apiClient.post<WikiPage>('/wiki', data).then((r) => r.data),

  updatePage: (slug: string, data: { title?: string; content?: string }) =>
    apiClient.put<WikiPage>(`/wiki/${slug}`, data).then((r) => r.data),
};
