import React from 'react';
import { Package } from 'lucide-react';

export default function Loader({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-[3px]' };
  return (
    <div className={`${sizes[size]} border-brand-200 border-t-brand-500 rounded-full animate-spin ${className}`} />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5">
      <div className="relative">
        <div className="w-14 h-14 border-[3px] border-brand-100 border-t-brand-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-orange-400 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-400 animate-pulse font-medium">Loading...</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="skeleton w-full" style={{ aspectRatio: '1' }} />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-3 w-1/3 rounded-full" />
        <div className="skeleton h-4 w-5/6 rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="flex justify-between items-center pt-1">
          <div className="skeleton h-5 w-1/4 rounded" />
          <div className="skeleton h-4 w-1/5 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex gap-3 p-3 rounded-2xl bg-white border border-gray-100">
          <div className="skeleton w-14 h-14 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="skeleton h-3 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
          <div className="skeleton h-4 w-12 rounded self-center shrink-0" />
        </div>
      ))}
    </div>
  );
}
