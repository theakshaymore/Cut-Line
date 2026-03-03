import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const BarberLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const { user } = await login(email, password);
      if (user.role !== "barber" && user.role !== "admin") {
        toast.error("This login is for barber/admin users.");
        return;
      }
      navigate(user.role === "admin" ? "/admin" : "/barber/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      <div className="grid md:grid-cols-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80"
          alt="Barber dashboard"
          className="h-full min-h-[260px] object-cover"
        />
        <div className="p-6">
          <h1 className="text-2xl font-bold">Barber Login</h1>
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <input className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button className="w-full bg-brand text-white rounded px-3 py-2">Login</button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default BarberLogin;
