import React from 'react';

/**
 * Reusable animated loading skeletons for charts, KPI cards, and lists.
 */
export const LoadingSkeleton = ({ type = 'kpi', count = 1 }) => {
  const shimmerCard = "animate-pulse bg-zinc-200/50 dark:bg-zinc-900/60 rounded-2xl border border-surface-lightBorder dark:border-surface-darkBorder";

  if (type === 'kpi') {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-9 w-full">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className={`${shimmerCard} h-24 p-4 flex flex-col justify-between`}>
            <div className="h-3 bg-zinc-300 dark:bg-zinc-800 rounded w-2/3" />
            <div className="h-6 bg-zinc-400 dark:bg-zinc-700 rounded w-1/2 mt-2" />
            <div className="h-2 bg-zinc-300 dark:bg-zinc-800 rounded w-4/5 mt-1" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className={`${shimmerCard} h-80 p-5 flex flex-col justify-between`}>
            <div className="flex justify-between items-center w-full">
              <div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-1/3" />
              <div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-12" />
            </div>
            <div className="flex-1 flex items-end justify-between gap-2.5 mt-8 px-4">
              <div className="h-[20%] bg-zinc-300 dark:bg-zinc-800 rounded-t w-full" />
              <div className="h-[50%] bg-zinc-400 dark:bg-zinc-700 rounded-t w-full" />
              <div className="h-[40%] bg-zinc-300 dark:bg-zinc-800 rounded-t w-full" />
              <div className="h-[75%] bg-zinc-400 dark:bg-zinc-700 rounded-t w-full" />
              <div className="h-[30%] bg-zinc-300 dark:bg-zinc-800 rounded-t w-full" />
              <div className="h-[90%] bg-zinc-400 dark:bg-zinc-700 rounded-t w-full" />
            </div>
            <div className="h-3 bg-zinc-300 dark:bg-zinc-800 rounded w-full mt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`${shimmerCard} w-full h-[450px] p-6 flex flex-col justify-between`}>
        <div className="flex justify-between items-center border-b border-surface-lightBorder dark:border-surface-darkBorder pb-4">
          <div className="h-5 bg-zinc-400 dark:bg-zinc-700 rounded w-1/4" />
          <div className="h-8 bg-zinc-300 dark:bg-zinc-800 rounded w-48" />
        </div>
        <div className="flex-1 flex flex-col justify-center gap-5 py-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="flex justify-between gap-4 w-full">
              <div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-1/12" />
              <div className="h-4 bg-zinc-400 dark:bg-zinc-700 rounded w-1/4" />
              <div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-1/6" />
              <div className="h-4 bg-zinc-400 dark:bg-zinc-700 rounded w-1/12" />
              <div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-1/6" />
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-surface-lightBorder dark:border-surface-darkBorder">
          <div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-24" />
          <div className="flex gap-2">
            <div className="h-8 bg-zinc-300 dark:bg-zinc-800 rounded w-16" />
            <div className="h-8 bg-zinc-300 dark:bg-zinc-800 rounded w-16" />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;
