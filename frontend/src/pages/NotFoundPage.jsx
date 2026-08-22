import { Link } from 'react-router-dom';
import Button from '../components/Button/Button.jsx';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <p className="not-found__code">404</p>
      <h1 className="not-found__title">Page not found</h1>
      <p className="not-found__subtitle">The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.</p>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
