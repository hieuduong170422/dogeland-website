import { apiClient } from './client';

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  _count: { threads: number };
}

export interface ForumAuthor {
  id: string;
  username: string;
  role: string;
  avatarUrl: string | null;
}

export interface ForumThread {
  id: string;
  title: string;
  authorId: string;
  author: ForumAuthor;
  categoryId: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  _count: { posts: number };
}

export interface ForumReaction {
  id: string;
  userId: string;
  postId: string;
  type: string;
}

export interface ForumPost {
  id: string;
  content: string;
  authorId: string;
  author: ForumAuthor;
  threadId: string;
  createdAt: string;
  updatedAt: string;
  reactions: ForumReaction[];
}

export interface ThreadsResponse {
  threads: ForumThread[];
  total: number;
  page: number;
  totalPages: number;
  category: ForumCategory;
}

export interface PostsResponse {
  posts: ForumPost[];
  total: number;
  page: number;
  totalPages: number;
}

export const forumApi = {
  getCategories: () =>
    apiClient.get<ForumCategory[]>('/forum/categories').then((r) => r.data),

  getThreads: (slug: string, page = 1, search?: string) =>
    apiClient
      .get<ThreadsResponse>(`/forum/categories/${slug}/threads`, {
        params: { page, ...(search ? { search } : {}) },
      })
      .then((r) => r.data),

  getThread: (id: string) =>
    apiClient.get<ForumThread>(`/forum/threads/${id}`).then((r) => r.data),

  createThread: (data: { title: string; content: string; categorySlug: string }) =>
    apiClient.post<ForumThread>('/forum/threads', data).then((r) => r.data),

  deleteThread: (id: string) =>
    apiClient.delete(`/forum/threads/${id}`).then((r) => r.data),

  getPosts: (threadId: string, page = 1) =>
    apiClient
      .get<PostsResponse>(`/forum/threads/${threadId}/posts`, { params: { page } })
      .then((r) => r.data),

  createPost: (threadId: string, content: string) =>
    apiClient
      .post<ForumPost>('/forum/posts', { threadId, content })
      .then((r) => r.data),

  deletePost: (id: string) =>
    apiClient.delete(`/forum/posts/${id}`).then((r) => r.data),

  react: (postId: string, type: 'like' | 'dislike') =>
    apiClient.post('/forum/reactions', { postId, type }).then((r) => r.data),

  updateThread: (id: string, data: { isPinned?: boolean; isLocked?: boolean }) =>
    apiClient.patch(`/forum/threads/${id}`, data).then((r) => r.data),
};
