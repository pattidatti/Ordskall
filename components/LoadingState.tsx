import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
      {/* Text Skeleton */}
      <div className="space-y-6">
        <div className="h-16 w-3/4 bg-slate-200 rounded-lg"></div>
        <div className="h-6 w-1/4 bg-slate-200 rounded"></div>
        <div className="space-y-3 pt-4">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 rounded w-4/6"></div>
        </div>
        <div className="h-32 bg-slate-200 rounded-lg mt-8"></div>
      </div>
      
      {/* Image Skeleton */}
      <div className="aspect-[4/3] bg-slate-200 rounded-2xl w-full h-full min-h-[300px]"></div>
    </div>
  );
};