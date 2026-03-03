import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerRegister from "./pages/CustomerRegister";
import BarberLogin from "./pages/BarberLogin";
import BarberRegister from "./pages/BarberRegister";
import SalonList from "./pages/SalonList";
import SalonDetail from "./pages/SalonDetail";
import MyQueue from "./pages/MyQueue";
import BarberDashboard from "./pages/BarberDashboard";
import AdminPanel from "./pages/AdminPanel";
import { useAuth } from "./context/AuthContext";

const Protected = ({ roles, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/register" element={<CustomerRegister />} />
        <Route path="/barber/login" element={<BarberLogin />} />
        <Route path="/barber/register" element={<BarberRegister />} />
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
          path="/my-queue"
          element={
            <Protected roles={["customer"]}>
              <MyQueue />
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
    </div>
  );
};

export default App;