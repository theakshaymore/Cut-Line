import { Link, useNavigate } from "react-router-dom";
import { Scissors } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 text-brand font-bold text-lg">
        <Scissors size={18} /> NextCut
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {user && <span>{user.name}</span>}
        {user && (
          <button className="bg-slate-900 text-white px-3 py-1 rounded" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;