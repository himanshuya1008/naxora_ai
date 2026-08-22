import clsx from 'clsx';

// Kept as the same component name/import path (~18 dashboard call sites)
// even though the visual system underneath is a full rebuild — renaming to
// `Surface` would be pure churn across every page for zero user-visible
// gain. Uses `.surface-data` (see styles/index.css): permanent hairline
// border + ambient shadow, since always-on-screen dashboard data
// containers read as flat/unscannable with zero border, unlike marketing's
// hover-to-elevate interactive tiles.
export default function GlassCard({ as: Tag = 'div', className, children, ...props }) {
  return (
    <Tag className={clsx('surface-data p-5', className)} {...props}>
      {children}
    </Tag>
  );
}
