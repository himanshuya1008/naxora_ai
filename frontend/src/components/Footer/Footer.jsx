import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { SERVICES } from '../../data/services.js';
import Logo from '../common/Logo.jsx';
import './Footer.css';

const SOCIAL_LINKS = [
  { href: 'https://github.com', label: 'GitHub', icon: Github },
  { href: 'https://linkedin.com', label: 'LinkedIn', icon: Linkedin },
  { href: 'https://twitter.com', label: 'Twitter', icon: Twitter },
];

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { to: '/services', label: 'Services' },
      { to: '/pricing', label: 'Pricing' },
      { to: '/ai-consultant', label: 'AI Sales Consultant' },
      { to: '/book-demo', label: 'Book a Demo' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About Us' },
      { to: '/industries', label: 'Industries We Serve' },
      { to: '/case-studies', label: 'Case Studies' },
      { to: '/contact', label: 'Contact Us' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { to: '/blog', label: 'Blog' },
      { to: '/login', label: 'Sign in' },
      { to: '/register', label: 'Create account' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          <div className="footer__brand">
            <Logo />
            <p className="footer__tagline">
              Enterprise AI Sales Intelligence Platform powered by Voice AI &amp; Customer DNA Intelligence.
            </p>
            <div className="footer__social">
              {SOCIAL_LINKS.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} className="footer__social-link">
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="footer__col">
              <p className="footer__col-title">{col.title}</p>
              <ul className="footer__col-links">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="footer__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="footer__col">
            <p className="footer__col-title">Services</p>
            <ul className="footer__col-links">
              {SERVICES.slice(0, 5).map((service) => (
                <li key={service.slug}>
                  <Link to={`/services/${service.slug}`} className="footer__link">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">© {new Date().getFullYear()} Nexora AI. All rights reserved.</div>
      </div>
    </footer>
  );
}
