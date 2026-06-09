import { apiClient } from './client';

export type ShopItemType = 'ITEM' | 'CRATE' | 'RANK' | 'COSMETIC';

export interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  type: ShopItemType;
  serverId: string | null;
  imageUrl: string | null;
  sortOrder: number;
  soldCount: number;
  isActive?: boolean;
}

export interface ShopItemsResponse {
  items: ShopItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PurchaseResult {
  message: string;
  purchase: {
    id: string;
    itemName: string;
    quantity: number;
    totalPrice: number;
    balanceAfter: number;
  };
}

export interface PurchaseHistory {
  id: string;
  quantity: number;
  totalPrice: number;
  serverId: string | null;
  deliveredAt: string | null;
  createdAt: string;
  item: {
    id: string;
    name: string;
    type: ShopItemType;
    imageUrl: string | null;
  } | null;
}

export interface PurchaseHistoryResponse {
  items: PurchaseHistory[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateShopItemPayload {
  name: string;
  description?: string;
  price: number;
  type: ShopItemType;
  serverId?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export const shopApi = {
  getItems: (params?: { type?: ShopItemType; page?: number }) =>
    apiClient.get<ShopItemsResponse>('/shop/items', { params }).then((r) => r.data),

  getItem: (id: string) =>
    apiClient.get<ShopItem>(`/shop/items/${id}`).then((r) => r.data),

  purchase: (itemId: string, quantity = 1, serverId?: string) =>
    apiClient
      .post<PurchaseResult>('/shop/purchase', { itemId: Number(itemId), quantity, serverId })
      .then((r) => r.data),

  getMyPurchases: (page = 1) =>
    apiClient
      .get<PurchaseHistoryResponse>('/shop/purchases/me', { params: { page } })
      .then((r) => r.data),

  // Admin
  adminGetItems: (page = 1) =>
    apiClient
      .get<ShopItemsResponse>('/shop/admin/items', { params: { page } })
      .then((r) => r.data),

  adminCreateItem: (data: CreateShopItemPayload) =>
    apiClient.post<ShopItem>('/shop/admin/items', data).then((r) => r.data),

  adminUpdateItem: (id: string, data: Partial<CreateShopItemPayload>) =>
    apiClient.patch<ShopItem>(`/shop/admin/items/${id}`, data).then((r) => r.data),

  adminDeleteItem: (id: string) =>
    apiClient.delete<{ message: string }>(`/shop/admin/items/${id}`).then((r) => r.data),
};
