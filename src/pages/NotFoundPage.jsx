import { Link } from 'react-router-dom';

// The SPA rewrite in vercel.json serves index.html for every path, so unknown
// URLs reach the router. Without this catch-all they would render nothing —
// and CLAUDE.md §7 forbids a view rendering a blank screen.
export function NotFoundPage() {
  return (
    <>
      <h1 className="text-balance">Page not found</h1>
      <p className="text-secondary">That URL doesn&apos;t match anything in the store.</p>
      <p>
        <Link to="/">Back to the home page</Link>
      </p>
    </>
  );
}
