'use client';

import { SkeletonPage } from '@/components/layout/SkeletonPage';

/**
 * Route-level Suspense boundary for the dashboard group. Server-rendered pages
 * stream into this skeleton instead of the whole shell flashing empty.
 */
export default function DashboardLoading() {
  return <SkeletonPage rows={3} />;
}