import { Link, useNavigate } from "react-router-dom";
import { Moon, Scissors, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between dark:bg-black dark:border-neutral-800">
      <Link to="/" className="flex items-center gap-2 text-brand font-bold text-lg">
        <Scissors size={18} /> NextCut
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <button
          className="border border-slate-300 rounded px-2 py-1 dark:border-neutral-700"
          onClick={toggleTheme}
          type="button"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        {user && <span>{user.name}</span>}
        {user && (
          <button
            className="bg-slate-900 text-white px-3 py-1 rounded dark:bg-neutral-100 dark:text-neutral-900"
            onClick={onLogout}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
