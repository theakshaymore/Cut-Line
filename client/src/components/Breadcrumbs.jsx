import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const labelMap = {
  customer: "Customer",
  barber: "Barber",
  salons: "Home",
  login: "Login",
  register: "Register",
  dashboard: "Dashboard",
  admin: "Admin",
  queue: "Queue",
  my: "My",
};

const Breadcrumbs = () => {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4 text-sm text-slate-600 dark:text-neutral-300">
      <div className="inline-flex items-center gap-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-full px-3 py-1">
        <Link to="/" className="inline-flex items-center gap-1 hover:text-brand">
          <Home size={14} />
          Home
        </Link>
        {segments.map((segment, idx) => {
          const to = `/${segments.slice(0, idx + 1).join("/")}`;
          const label = labelMap[segment] || segment;
          const isLast = idx === segments.length - 1;
          return (
            <span className="inline-flex items-center gap-2" key={to}>
              <ChevronRight size={14} />
              {isLast ? (
                <span className="text-slate-900 dark:text-neutral-100">{label}</span>
              ) : (
                <Link to={to} className="hover:text-brand">
                  {label}
                </Link>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default Breadcrumbs;
