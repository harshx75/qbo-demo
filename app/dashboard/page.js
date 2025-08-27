'use client';

import DashboardContent from '@/components/DashbaordContent';
import { Suspense } from 'react';

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <div className="ml-4 text-slate-600 font-medium">Loading...</div>
          </div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}