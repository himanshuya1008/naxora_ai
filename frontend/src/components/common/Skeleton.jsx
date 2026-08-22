import clsx from 'clsx';

/**
 * Base shimmer block. Pages compose these into layouts that echo their real
 * content shape (a stat-tile skeleton is 4 short blocks in a grid, a table
 * skeleton is rows of varying-width bars) rather than showing a single
 * generic spinner — this is what makes the loading state feel premium
 * instead of just "not broken yet".
 */
export default function Skeleton({ className }) {
  return <div className={clsx('animate-pulse rounded-md bg-champagne/25', className)} />;
}
