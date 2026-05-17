import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

function getTimeLeft(endsAt) {
  const diff = new Date(endsAt) - new Date();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  return { h, m, s, totalSeconds: Math.floor(diff / 1000) };
}

// compact=true → "2h 15m 30s" inline text
// compact=false → block with labeled digit tiles
export default function CountdownTimer({ endsAt, compact = false, onExpire }) {
  const [left, setLeft] = useState(() => getTimeLeft(endsAt));

  useEffect(() => {
    if (!left) return;
    const id = setInterval(() => {
      const next = getTimeLeft(endsAt);
      setLeft(next);
      if (!next) onExpire?.();
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!left) return null;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-red-600 font-mono font-bold text-xs">
        <Clock className="w-3 h-3 shrink-0" />
        {left.h > 0 && `${left.h}h `}{left.m}m {String(left.s).padStart(2, '0')}s
      </span>
    );
  }

  const Tile = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 bg-red-600 text-white rounded-lg flex items-center justify-center font-mono font-bold text-sm shadow-md">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[9px] text-red-400 font-semibold uppercase tracking-wide mt-0.5">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      {left.h > 0 && <><Tile value={left.h} label="hrs" /><span className="text-red-400 font-bold text-sm mb-3">:</span></>}
      <Tile value={left.m} label="min" />
      <span className="text-red-400 font-bold text-sm mb-3">:</span>
      <Tile value={left.s} label="sec" />
    </div>
  );
}
