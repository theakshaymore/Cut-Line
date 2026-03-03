import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const CustomerLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/salons");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <main className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold">Customer Login</h1>
      <form onSubmit={onSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mt-4 space-y-3">
        <input className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="w-full bg-brand text-white rounded px-3 py-2">Login</button>
      </form>
      <Link to="/customer/register" className="text-sm text-brand mt-3 inline-block">Create account</Link>
    </main>
  );
};

export default CustomerLogin;
