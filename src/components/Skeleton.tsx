'use client';

import React from 'react';

export function DashboardSkeleton() {
  return (
    <div className="h-screen w-full bg-neutral-950 flex flex-col justify-between p-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="w-12 h-12 bg-neutral-800 rounded-2xl"></div>
        <div className="w-32 h-10 bg-neutral-800 rounded-2xl"></div>
      </div>
      
      <div className="flex-1 my-6 bg-neutral-900 rounded-3xl border border-neutral-800 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-neutral-800 rounded-full mx-auto"></div>
          <div className="w-40 h-4 bg-neutral-800 rounded mx-auto"></div>
        </div>
      </div>

      <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800 space-y-4">
        <div className="w-3/4 h-6 bg-neutral-800 rounded"></div>
        <div className="w-full h-12 bg-orange-600/30 rounded-2xl"></div>
      </div>
    </div>
  );
}

export function OfferSkeleton() {
  return (
    <div className="bg-neutral-850 p-3.5 rounded-2xl border border-neutral-800 flex items-center justify-between animate-pulse">
      <div className="space-y-2 flex-1">
        <div className="w-32 h-4 bg-neutral-750 rounded"></div>
        <div className="w-20 h-3 bg-neutral-750 rounded"></div>
      </div>
      <div className="w-16 h-8 bg-neutral-750 rounded-xl"></div>
    </div>
  );
}
