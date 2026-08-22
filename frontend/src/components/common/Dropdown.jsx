import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './Dropdown.css';

/**
 * Generic portal-based dropdown/popover primitive. Renders its menu into
 * document.body so it can never be trapped by an ancestor's stacking context
 * (e.g. a header with `backdrop-filter` — any filter/backdrop-filter creates
 * a new stacking context, which silently defeats a child's z-index no matter
 * how high it is set). Positions itself against the trigger's own bounding
 * box, computed fresh on open and kept in sync on scroll/resize.
 *
 * Usage:
 *   <Dropdown
 *     trigger={({ toggle, triggerRef, open }) => (
 *       <button ref={triggerRef} onClick={toggle}>...</button>
 *     )}
 *   >
 *     {({ close }) => <div>...menu content, call close() on item click...</div>}
 *   </Dropdown>
 */
export default function Dropdown({ trigger, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const location = useLocation();

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  const updateRect = useCallback(() => {
    if (triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    updateRect();

    const handlePointerDown = (e) => {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      close();
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [open, close, updateRect]);

  // Close automatically on route change (e.g. a menu item navigated away).
  useEffect(() => {
    close();
  }, [location.pathname, close]);

  const menuStyle = rect
    ? {
        position: 'fixed',
        top: rect.bottom + 8,
        ...(align === 'right' ? { right: window.innerWidth - rect.right } : { left: rect.left }),
      }
    : null;

  return (
    <>
      {trigger({ toggle, triggerRef, open })}
      {createPortal(
        <AnimatePresence>
          {open && rect && (
            <motion.div
              ref={menuRef}
              className="dropdown-portal-menu"
              style={menuStyle}
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              {children({ close })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
