import type { Person, Totals, Transaction, TransactionType } from './types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro inesperado.' }));
    throw new Error(error.message ?? 'Erro inesperado.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  listPeople: () => request<Person[]>('/api/people'),
  createPerson: (name: string, age: number) =>
    request<Person>('/api/people', {
      method: 'POST',
      body: JSON.stringify({ name, age }),
    }),
  deletePerson: (id: number) =>
    request<void>(`/api/people/${id}`, {
      method: 'DELETE',
    }),
  listTransactions: () => request<Transaction[]>('/api/transactions'),
  createTransaction: (description: string, value: number, type: TransactionType, personId: number) =>
    request<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ description, value, type, personId }),
    }),
  deleteTransaction: (id: number) =>
    request<void>(`/api/transactions/${id}`, {
      method: 'DELETE',
    }),
  getTotals: () => request<Totals>('/api/totals'),
};
