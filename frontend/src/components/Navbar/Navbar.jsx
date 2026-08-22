import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Mic } from 'lucide-react';
import Button from '../Button/Button.jsx';
import Logo from '../common/Logo.jsx';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/services', label: 'Services' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/industries', label: 'Industries' },
  { to: '/case-studies', label: 'Case Studies' },
  { to: '/blog', label: 'Blog' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <div className="navbar__brand" onClick={() => setMobileOpen(false)}>
          <Logo />
        </div>

        <nav className="navbar__links">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__actions">
          <Link to="/login" className="navbar__signin">
            Sign in
          </Link>
          <Link to="/ai-consultant">
            <Button>
              <Mic size={15} />
              Talk to AI
            </Button>
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          className="navbar__toggle"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="navbar__mobile"
          >
            <div className="navbar__mobile-inner">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`}
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="navbar__mobile-actions">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" className="navbar__mobile-btn">
                    Sign in
                  </Button>
                </Link>
                <Link to="/ai-consultant" onClick={() => setMobileOpen(false)}>
                  <Button className="navbar__mobile-btn">
                    <Mic size={15} />
                    Talk to AI
                  </Button>
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
