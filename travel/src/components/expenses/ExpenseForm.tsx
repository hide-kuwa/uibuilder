import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface ExpenseFormProps {
  planId: string;
  members: string[]; // list of member ids or names
}

const ExpenseForm = ({ planId, members }: ExpenseFormProps) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [whoPaid, setWhoPaid] = useState(members[0] || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    await addDoc(collection(db, 'plans', planId, 'expenses'), {
      amount: Number(amount),
      description,
      paidBy: whoPaid,
      createdAt: new Date()
    });
    setAmount('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        placeholder="amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="text"
        placeholder="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <select value={whoPaid} onChange={(e) => setWhoPaid(e.target.value)}>
        {members.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <button type="submit">Add Expense</button>
    </form>
  );
};

export default ExpenseForm;
