'use client';

import { SkeletonPage } from '@/components/layout/SkeletonPage';

/**
 * A guild page loads settings, channels and roles in parallel; the skeleton
 * matches the module grid so the layout does not shift when data lands.
 */
export default function GuildLoading() {
  return <SkeletonPage rows={2} />;
}