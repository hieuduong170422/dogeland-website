import { apiClient } from './client';

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  reason: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

export interface TransactionsPage {
  items: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}

export const economyApi = {
  getBalance: () =>
    apiClient.get<{ balance: number; username: string }>('/economy/me').then((r) => r.data),

  getTransactions: (page = 1) =>
    apiClient.get<TransactionsPage>('/economy/transactions', { params: { page } }).then((r) => r.data),

  redeemGiftCode: (code: string) =>
    apiClient.post<{ message: string; amount: number }>('/economy/redeem', { code }).then((r) => r.data),
};
