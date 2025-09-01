import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Client } from '@googlemaps/google-maps-services-js';

// Firebase Admin SDKの初期化
admin.initializeApp();
const db = admin.firestore();

// Transactionインターフェースの定義 (割り勘機能用)
interface Transaction {
  from: string;
  to: string;
  amount: number;
}

// 割り勘を計算するCloud Function
export const calculateSettlement = functions.https.onCall(async (data, context) => {
  const planId: string = data.planId;
  if (!planId) {
    throw new functions.https.HttpsError('invalid-argument', 'planId is required');
  }

  const snapshot = await db.collection('plans').doc(planId).collection('expenses').get();
  const totals: Record<string, number> = {};

  snapshot.forEach((doc) => {
    const d = doc.data();
    const paidBy = d.paidBy as string;
    const amount = Number(d.amount) || 0;
    totals[paidBy] = (totals[paidBy] || 0) + amount;
  });

  const members = Object.keys(totals);
  if (members.length === 0) {
    return { transactions: [] };
  }

  const totalSpent = Object.values(totals).reduce((a, b) => a + b, 0);
  const average = totalSpent / members.length;

  const balance: Record<string, number> = {};
  members.forEach((m) => {
    balance[m] = totals[m] - average;
  });

  const creditors: { user: string; amount: number }[] = [];
  const debtors: { user: string; amount: number }[] = [];

  Object.entries(balance).forEach(([user, amount]) => {
    if (amount > 0) {
      creditors.push({ user, amount });
    } else if (amount < 0) {
      debtors.push({ user, amount: -amount });
    }
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions: Transaction[] = [];

  while (creditors.length && debtors.length) {
    const creditor = creditors[0];
    const debtor = debtors[0];
    const settled = Math.min(creditor.amount, debtor.amount);
    transactions.push({ from: debtor.user, to: creditor.user, amount: settled });
    creditor.amount -= settled;
    debtor.amount -= settled;

    if (creditor.amount === 0) creditors.shift();
    if (debtor.amount === 0) debtors.shift();
  }

  return { transactions };
});

// RouteSegmentインターフェースの定義 (ルート計算機能用)
interface RouteSegment {
  origin: string;
  destination: string;
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
ve: number;
  };
}

// ルートの距離と時間を計算するCloud Function
export const calculateRoute = functions.https.onCall(async (data, context) => {
  const placeIds: string[] = data?.placeIds;
  if (!Array.isArray(placeIds) || placeIds.length < 2) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'placeIds must be an array with at least two entries.'
    );
  }

  const client = new Client({});
  const apiKey = process.env.Maps_API_KEY || functions.config()?.gmaps?.key;
  if (!apiKey) {
    throw new functions.https.HttpsError('failed-precondition', 'Google Maps API key is not configured');
  }

  const segments: RouteSegment[] = [];
  for (let i = 0; i < placeIds.length - 1; i++) {
    const origin = `place_id:${placeIds[i]}`;
    const destination = `place_id:${placeIds[i + 1]}`;
    const resp = await client.distancematrix({
      params: {
        origins: [origin],
        destinations: [destination],
        key: apiKey,
      },
    });

    const row = resp.data.rows[0];
    const element = row.elements[0];
    segments.push({
      origin: placeIds[i],
      destination: placeIds[i + 1],
      distance: element.distance,
      duration: element.duration,
    });
  }

  return { segments };
});

// LatLngインターフェースの定義 (合流地点探索用)
interface LatLng {
  lat: number;
  lng: number;
}

// 最適な合流地点を探すCloud Function
export const findOptimalMeetingPoint = functions.https.onCall(async (data, context) => {
  const origins: LatLng[] = data?.origins;
  if (!Array.isArray(origins) || origins.length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'origins must be a non-empty array of {lat, lng} objects.'
    );
  }

  let latSum = 0;
  let lngSum = 0;
  origins.forEach((o) => {
    latSum += o.lat;
    lngSum += o.lng;
  });
  const center = {
    lat: latSum / origins.length,
    lng: lngSum / origins.length,
  };

  const client = new Client({});
  const apiKey = process.env.Maps_API_KEY || functions.config()?.gmaps?.key;
  if (!apiKey) {
    throw new functions.https.HttpsError('failed-precondition', 'Google Maps API key is not configured');
  }

  const response = await client.placesNearby({
    params: {
      location: center,
      radius: 1500,
      type: 'train_station',
      key: apiKey,
    },
  });

  const result = response.data.results[0];
  return { meetingPoint: result };
});