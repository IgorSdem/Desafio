export type TransactionType = 'Expense' | 'Income';

export type Person = {
  id: number;
  name: string;
  age: number;
};

export type Transaction = {
  id: number;
  description: string;
  value: number;
  type: TransactionType;
  personId: number;
  personName: string;
  createdAt: string;
};

export type PersonTotal = {
  personId: number;
  personName: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

export type Totals = {
  people: PersonTotal[];
  general: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
};

