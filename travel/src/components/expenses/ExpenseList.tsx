import { usePlanStore } from '../../stores/planStore';

interface ExpenseListProps {
  planId: string; // unused but kept for compatibility
}

const ExpenseList = ({ planId }: ExpenseListProps) => {
  const expenses = usePlanStore((s) => s.expenses);

  return (
    <ul>
      {expenses.map((exp) => (
        <li key={exp.id}>
          {exp.paidBy}: {exp.description} - {exp.amount}
        </li>
      ))}
    </ul>
  );
};

export default ExpenseList;
