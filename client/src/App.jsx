import { Navigate, Route, Routes, Link } from "react-router-dom";
import { useEffect } from "react";
import toast from "react-hot-toast";
import Navbar from "./components/Navbar";
import Breadcrumbs from "./components/Breadcrumbs";
import Landing from "./pages/Landing";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerRegister from "./pages/CustomerRegister";
import BarberLogin from "./pages/BarberLogin";
import BarberRegister from "./pages/BarberRegister";
import SalonList from "./pages/SalonList";
import SalonDetail from "./pages/SalonDetail";
import BarberDashboard from "./pages/BarberDashboard";
import AdminPanel from "./pages/AdminPanel";
import { useAuth } from "./context/AuthContext";
import useSocket from "./hooks/useSocket";

const getRoleHome = (role) => {
  if (role === "admin") return "/admin";
  if (role === "barber") return "/barber/dashboard";
  return "/salons";
};

const Protected = ({ roles, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicOnly = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to={getRoleHome(user.role)} replace />;
  return children;
};

const TurnPopupListener = () => {
  const { user } = useAuth();
  const socket = useSocket();
  useEffect(() => {
    if (!socket || user?.role !== "customer") return undefined;
    const handler = (payload) => {
      const message = payload?.message || "You are next";
      const detail = [payload?.chairLabel, payload?.salonName].filter(Boolean).join(" | ");
      toast.success(detail ? `${message}: ${detail}` : message);
    };
    socket.on("your-turn", handler);
    return () => socket.off("your-turn", handler);
  }, [socket, user?.role]);
  return null;
};

const App = () => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-black dark:text-neutral-100">
      <Navbar />
      <Breadcrumbs />
      <TurnPopupListener />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/customer/login" element={<PublicOnly><CustomerLogin /></PublicOnly>} />
        <Route path="/customer/register" element={<PublicOnly><CustomerRegister /></PublicOnly>} />
        <Route path="/barber/login" element={<PublicOnly><BarberLogin /></PublicOnly>} />
        <Route path="/barber/register" element={<PublicOnly><BarberRegister /></PublicOnly>} />
        <Route
          path="/salons"
          element={
            <Protected roles={["customer"]}>
              <SalonList />
            </Protected>
          }
        />
        <Route
          path="/salons/:id"
          element={
            <Protected roles={["customer"]}>
              <SalonDetail />
            </Protected>
          }
        />
        <Route
          path="/barber/dashboard"
          element={
            <Protected roles={["barber"]}>
              <BarberDashboard />
            </Protected>
          }
        />
        <Route
          path="/admin"
          element={
            <Protected roles={["admin"]}>
              <AdminPanel />
            </Protected>
          }
        />
      </Routes>
      <Link
        to="/admin"
        className="fixed bottom-5 right-5 z-50 rounded-full bg-brand text-white px-4 py-2 shadow-lg hover:opacity-90"
      >
        Admin
      </Link>
    </div>
  );
};

export default App;
