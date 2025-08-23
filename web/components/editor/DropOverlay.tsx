'use client';

export default function DropOverlay({ count = 0 }: { count?: number }) {
  return (
    <div className="drop-overlay flex items-center justify-center text-blue-500">
      {count > 1 && (
        <span className="badge">+{count - 1}</span>
      )}
    </div>
  );
}
