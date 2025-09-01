import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';

interface Props {
  planId: string;
}

const BudgetTracker: React.FC<Props> = ({ planId }) => {
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [transportationCost, setTransportationCost] = useState(0);
  const [accommodationCost, setAccommodationCost] = useState(0);
  const [ticketCost, setTicketCost] = useState(0);

  useEffect(() => {
    if (!planId) return;
    const planRef = doc(db, 'plans', planId);
    const unsubPlan = onSnapshot(planRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setTransportationCost(
        Number(data.transportationCost ?? data.routeCost ?? 0)
      );
      setAccommodationCost(Number(data.accommodationCost ?? 0));
      setTicketCost(Number(data.ticketCost ?? 0));
    });

    const expRef = collection(db, 'plans', planId, 'expenses');
    const unsubExpenses = onSnapshot(expRef, (snap) => {
      const total = snap.docs.reduce((sum, d) => {
        return sum + (Number(d.data().amount) || 0);
      }, 0);
      setExpenseTotal(total);
    });

    return () => {
      unsubPlan();
      unsubExpenses();
    };
  }, [planId]);

  const handleFieldChange = async (field: string, value: number) => {
    const ref = doc(db, 'plans', planId);
    await updateDoc(ref, { [field]: value });
  };

  const total =
    expenseTotal + transportationCost + accommodationCost + ticketCost;

  return (
    <div className="p-4 bg-white rounded shadow space-y-2">
      <h3 className="font-bold">現在の総予算: ￥{total.toLocaleString()}</h3>
      <div>
        <label className="mr-2">宿泊費</label>
        <input
          type="number"
          className="border p-1"
          value={accommodationCost}
          onChange={(e) => {
            const v = Number(e.target.value);
            setAccommodationCost(v);
            handleFieldChange('accommodationCost', v);
          }}
        />
      </div>
      <div>
        <label className="mr-2">チケット代</label>
        <input
          type="number"
          className="border p-1"
          value={ticketCost}
          onChange={(e) => {
            const v = Number(e.target.value);
            setTicketCost(v);
            handleFieldChange('ticketCost', v);
          }}
        />
      </div>
    </div>
  );
};

export default BudgetTracker;
