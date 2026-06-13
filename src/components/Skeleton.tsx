import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={`animate-pulse bg-neutral-800 rounded-lg ${className}`}></div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col md:flex-row">
      <div className="w-full md:w-[400px] bg-neutral-900 border-r border-neutral-800 p-6 space-y-8">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
      <div className="flex-1 bg-neutral-900/50 p-4">
        <Skeleton className="h-full w-full rounded-3xl" />
      </div>
    </div>
  );
};
