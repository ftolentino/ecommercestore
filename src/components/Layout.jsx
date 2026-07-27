import { Link, Outlet, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Home', exact: true },
  { to: '/products', label: 'Products' },
  { to: '/cart', label: 'Cart' },
];

export function Layout() {
  const { pathname } = useLocation();

  // Ply marks the active nav item on the <li>, not the <a>, so NavLink's
  // anchor-scoped className isn't a fit here.
  const isActive = (link) =>
    link.exact ? pathname === link.to : pathname === link.to || pathname.startsWith(`${link.to}/`);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <nav className="navbar">
        <ul>
          {NAV_LINKS.map((link) => (
            <li key={link.to} className={isActive(link) ? 'active' : undefined}>
              <Link to={link.to}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <main id="main" className="units-container">
        <Outlet />
      </main>
    </>
  );
}
