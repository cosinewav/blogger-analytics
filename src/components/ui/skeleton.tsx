'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-gray-200 dark:bg-gray-800',
        className
      )}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          translateX: ['100%', '200%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

// Card skeleton for stat cards
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

// Gradient card skeleton for colored stat cards
export function GradientCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 rounded-lg p-6 shadow-sm">
      <Skeleton className="h-4 w-24 mb-4 bg-white/30" />
      <Skeleton className="h-8 w-32 mb-2 bg-white/30" />
      <Skeleton className="h-3 w-20 bg-white/30" />
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <Skeleton className="h-5 w-full" />
        </td>
      ))}
    </tr>
  );
}

// Chart skeleton
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="w-full" style={{ height }}>
      <Skeleton className="h-full w-full" />
    </div>
  );
}

// Full page loading skeleton
export function PageSkeleton() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Chart area */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm">
          <Skeleton className="h-6 w-32 mb-4" />
          <ChartSkeleton height={350} />
        </div>

        {/* Table area */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-32" />
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {Array.from({ length: 6 }).map((_, i) => (
                  <th key={i} className="py-3 px-4">
                    <Skeleton className="h-4 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} columns={6} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Videos page specific skeleton
export function VideosPageSkeleton() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-40 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>

        {/* Stats */}
        <div className="mb-4">
          <Skeleton className="h-5 w-48" />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {Array.from({ length: 8 }).map((_, i) => (
                  <th key={i} className="py-3 px-4">
                    <Skeleton className="h-4 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRowSkeleton key={i} columns={8} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <Skeleton className="h-5 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Keywords page skeleton
export function KeywordsPageSkeleton() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-40 mb-2" />
          <Skeleton className="h-5 w-56" />
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-40" />
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {Array.from({ length: 5 }).map((_, i) => (
                  <th key={i} className="py-3 px-4">
                    <Skeleton className="h-4 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRowSkeleton key={i} columns={5} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Trends page skeleton with charts
export function TrendsPageSkeleton() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-40 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Month selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-28" />
            ))}
          </div>
        </div>

        {/* Main chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
          <ChartSkeleton height={400} />
        </div>

        {/* Two column charts */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <Skeleton className="h-6 w-32 mb-4" />
            <ChartSkeleton height={350} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <Skeleton className="h-6 w-32 mb-4" />
            <ChartSkeleton height={350} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Profiles page skeleton with multiple chart areas
export function ProfilesPageSkeleton() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Skeleton className="h-10 w-32 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>

        {/* Account tabs */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28" />
          ))}
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-5 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* First row: 3 charts */}
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <Skeleton className="h-6 w-24 mb-4" />
              <ChartSkeleton height={280} />
            </div>
          ))}
        </div>

        {/* Radar chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm">
          <Skeleton className="h-6 w-32 mb-4" />
          <ChartSkeleton height={400} />
        </div>

        {/* Second row: 2 charts */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <Skeleton className="h-6 w-28 mb-4" />
              <ChartSkeleton height={350} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
