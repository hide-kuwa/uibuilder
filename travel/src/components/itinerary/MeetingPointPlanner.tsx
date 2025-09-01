'use client';

import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '../../lib/firebase';
import HotelSuggester from '../booking/HotelSuggester';

interface Props {
  members: string[];
}

const MeetingPointPlanner: React.FC<Props> = ({ members }) => {
  const [addresses, setAddresses] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [checkin, setCheckin] = useState(
    today.toISOString().slice(0, 10)
  );
  const [checkout, setCheckout] = useState(
    tomorrow.toISOString().slice(0, 10)
  );
  const functions = getFunctions(firebaseApp);

  const handleSearch = async () => {
    try {
      const fn = httpsCallable(functions, 'findOptimalMeetingPoint');
      const origins = members.map(() => ({ lat: 0, lng: 0 }));
      const res: any = await fn({ origins });
      setResult(res.data.meetingPoint);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 bg-white text-black rounded">
      <h3 className="font-bold mb-2">Meeting Point Planner</h3>
      {members.map((m) => (
        <div key={m} className="mb-2">
          <label className="mr-2">{m}</label>
          <input
            className="border p-1"
            value={addresses[m] || ''}
            onChange={(e) => setAddresses({ ...addresses, [m]: e.target.value })}
            placeholder="Starting address"
          />
        </div>
      ))}
      <div className="mb-2">
        <label className="mr-2">チェックイン</label>
        <input
          type="date"
          className="border p-1"
          value={checkin}
          onChange={(e) => setCheckin(e.target.value)}
        />
        <label className="mx-2">チェックアウト</label>
        <input
          type="date"
          className="border p-1"
          value={checkout}
          onChange={(e) => setCheckout(e.target.value)}
        />
      </div>
      <button onClick={handleSearch} className="px-2 py-1 bg-primary text-white rounded">
        最適な合流地点を探す
      </button>
      {result && (
        <>
          <div className="mt-2">おすすめ: {result.name || JSON.stringify(result)}</div>
          <div className="mt-2">
            <HotelSuggester
              location={result.name}
              checkinDate={checkin}
              checkoutDate={checkout}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default MeetingPointPlanner;
