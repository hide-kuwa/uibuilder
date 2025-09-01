import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Props {
  location: string;
  checkinDate: string;
  checkoutDate: string;
}

interface HotelInfo {
  id: string;
  name: string;
  imageUrl?: string;
  price?: number;
  url: string;
  reviewAverage?: number;
}

const HotelSuggester: React.FC<Props> = ({ location, checkinDate, checkoutDate }) => {
  const [hotels, setHotels] = useState<HotelInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotels = async () => {
      if (!location || !checkinDate || !checkoutDate) return;
      setLoading(true);
      setError(null);
      try {
        const appId = process.env.NEXT_PUBLIC_RAKUTEN_APP_ID;
        const endpoint = 'https://app.rakuten.co.jp/services/api/Travel/VacantHotelSearch/20170426';
        const res = await axios.get(endpoint, {
          params: {
            applicationId: appId,
            format: 'json',
            keyword: location,
            checkinDate,
            checkoutDate,
            hits: 5,
          },
        });
        const list = (res.data.hotels || []).map((h: any) => {
          const info = h.hotel[0].hotelBasicInfo;
          return {
            id: String(info.hotelNo),
            name: info.hotelName,
            imageUrl: info.hotelImageUrl,
            price: info.hotelMinCharge,
            url: info.hotelInformationUrl,
            reviewAverage: info.reviewAverage,
          } as HotelInfo;
        });
        setHotels(list);
      } catch (e: any) {
        console.error(e);
        setError('ホテル情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [location, checkinDate, checkoutDate]);

  if (loading) return <div>検索中...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!hotels.length) return null;

  return (
    <div className="space-y-2">
      {hotels.map((h) => (
        <div key={h.id} className="p-4 bg-white rounded shadow flex gap-4">
          {h.imageUrl && (
            <img src={h.imageUrl} alt={h.name} className="w-24 h-24 object-cover" />
          )}
          <div className="flex-1">
            <div className="font-bold">{h.name}</div>
            {h.price && (
              <div>料金: ￥{h.price.toLocaleString()}</div>
            )}
            {h.reviewAverage && (
              <div>評価: {h.reviewAverage}</div>
            )}
            <a
              href={h.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 px-2 py-1 bg-primary text-white rounded"
            >
              詳細・予約はこちら
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HotelSuggester;
