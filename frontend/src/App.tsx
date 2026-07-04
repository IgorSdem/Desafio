import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Plus, ReceiptText, RefreshCw, Trash2, Users } from 'lucide-react';
import { api } from './api';
import type { Person, Totals, Transaction, TransactionType } from './types';

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [personName, setPersonName] = useState('');
  const [personAge, setPersonAge] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState<TransactionType>('Expense');
  const [personId, setPersonId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const selectedPerson = useMemo(
    () => people.find((person) => person.id === Number(personId)),
    [people, personId],
  );

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [peopleResult, transactionsResult, totalsResult] = await Promise.all([
        api.listPeople(),
        api.listTransactions(),
        api.getTotals(),
      ]);

      setPeople(peopleResult);
      setTransactions(transactionsResult);
      setTotals(totalsResult);

      if (!personId && peopleResult.length > 0) {
        setPersonId(String(peopleResult[0].id));
      }
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Nao foi possivel carregar os dados.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedPerson?.age !== undefined && selectedPerson.age < 18 && type === 'Income') {
      setType('Expense');
    }
  }, [selectedPerson, type]);

  async function handleCreatePerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      await api.createPerson(personName, Number(personAge));
      setPersonName('');
      setPersonAge('');
      await loadData();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Nao foi possivel cadastrar a pessoa.');
    }
  }

  async function handleDeletePerson(id: number) {
    setError('');

    try {
      await api.deletePerson(id);
      if (personId === String(id)) {
        setPersonId('');
      }
      await loadData();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Nao foi possivel excluir a pessoa.');
    }
  }

  async function handleCreateTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      await api.createTransaction(description, Number(value), type, Number(personId));
      setDescription('');
      setValue('');
      setType('Expense');
      await loadData();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Nao foi possivel cadastrar a transacao.');
    }
  }

  const personOptions = people.map((person) => (
    <option key={person.id} value={person.id}>
      {person.name} ({person.age} anos)
    </option>
  ));

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Controle residencial</p>
          <h1>Gastos e receitas da casa</h1>
        </div>
        <button className="icon-button" type="button" onClick={loadData} title="Atualizar dados">
          <RefreshCw size={18} />
        </button>
      </header>

      {error && <div className="alert">{error}</div>}

      <section className="summary-grid" aria-label="Totais gerais">
        <Summary label="Receitas" value={totals?.general.totalIncome ?? 0} tone="income" />
        <Summary label="Despesas" value={totals?.general.totalExpense ?? 0} tone="expense" />
        <Summary label="Saldo liquido" value={totals?.general.balance ?? 0} tone="balance" />
      </section>

      <section className="workspace">
        <div className="panel">
          <div className="panel-heading">
            <Users size={20} />
            <h2>Pessoas</h2>
          </div>

          <form className="form-grid" onSubmit={handleCreatePerson}>
            <label>
              Nome
              <input value={personName} onChange={(event) => setPersonName(event.target.value)} required />
            </label>
            <label>
              Idade
              <input
                min="0"
                type="number"
                value={personAge}
                onChange={(event) => setPersonAge(event.target.value)}
                required
              />
            </label>
            <button className="primary-button" type="submit">
              <Plus size={16} />
              Cadastrar pessoa
            </button>
          </form>

          <div className="list">
            {people.map((person) => (
              <article className="row-card" key={person.id}>
                <div>
                  <strong>{person.name}</strong>
                  <span>ID {person.id} · {person.age} anos</span>
                </div>
                <button
                  className="icon-button danger"
                  type="button"
                  onClick={() => handleDeletePerson(person.id)}
                  title="Excluir pessoa e suas transacoes"
                >
                  <Trash2 size={17} />
                </button>
              </article>
            ))}
            {!loading && people.length === 0 && <p className="empty">Nenhuma pessoa cadastrada.</p>}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <ReceiptText size={20} />
            <h2>Transacoes</h2>
          </div>

          <form className="form-grid" onSubmit={handleCreateTransaction}>
            <label>
              Descricao
              <input value={description} onChange={(event) => setDescription(event.target.value)} required />
            </label>
            <label>
              Valor
              <input
                min="0.01"
                step="0.01"
                type="number"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                required
              />
            </label>
            <label>
              Tipo
              <select value={type} onChange={(event) => setType(event.target.value as TransactionType)}>
                <option value="Expense">Despesa</option>
                <option value="Income" disabled={selectedPerson ? selectedPerson.age < 18 : false}>
                  Receita
                </option>
              </select>
            </label>
            <label>
              Pessoa
              <select value={personId} onChange={(event) => setPersonId(event.target.value)} required>
                <option value="" disabled>
                  Selecione
                </option>
                {personOptions}
              </select>
            </label>
            <button className="primary-button" type="submit" disabled={people.length === 0}>
              <Plus size={16} />
              Cadastrar transacao
            </button>
          </form>

          <div className="list">
            {transactions.map((transaction) => (
              <article className="row-card" key={transaction.id}>
                <div>
                  <strong>{transaction.description}</strong>
                  <span>{transaction.personName} · {transaction.type === 'Income' ? 'Receita' : 'Despesa'}</span>
                </div>
                <b className={transaction.type === 'Income' ? 'income' : 'expense'}>
                  {money.format(transaction.value)}
                </b>
              </article>
            ))}
            {!loading && transactions.length === 0 && <p className="empty">Nenhuma transacao cadastrada.</p>}
          </div>
        </div>
      </section>

      <section className="panel totals-panel">
        <h2>Totais por pessoa</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pessoa</th>
                <th>Receitas</th>
                <th>Despesas</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {totals?.people.map((total) => (
                <tr key={total.personId}>
                  <td>{total.personName}</td>
                  <td>{money.format(total.totalIncome)}</td>
                  <td>{money.format(total.totalExpense)}</td>
                  <td>{money.format(total.balance)}</td>
                </tr>
              ))}
              {totals && (
                <tr className="general-row">
                  <td>Total geral</td>
                  <td>{money.format(totals.general.totalIncome)}</td>
                  <td>{money.format(totals.general.totalExpense)}</td>
                  <td>{money.format(totals.general.balance)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Summary({ label, value, tone }: { label: string; value: number; tone: 'income' | 'expense' | 'balance' }) {
  return (
    <article className={`summary ${tone}`}>
      <span>{label}</span>
      <strong>{money.format(value)}</strong>
    </article>
  );
}
