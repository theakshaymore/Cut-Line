import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const BarberRegister = () => {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") || "", [params]);
  const { registerBarberWithToken } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    salonName: "",
    address: "",
    lat: "",
    lng: "",
    avgServiceTime: "20",
  });

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Invite token missing");
    try {
      await registerBarberWithToken(token, form);
      navigate("/barber/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Barber registration failed");
    }
  };

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold">Barber Registration</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Invite token: {token ? "valid link" : "missing"}</p>
      <form onSubmit={onSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mt-4 grid md:grid-cols-2 gap-3">
        <input className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" name="name" placeholder="Name" value={form.name} onChange={onChange} required />
        <input className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" name="phone" placeholder="Phone" value={form.phone} onChange={onChange} required />
        <input className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
        <input className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" name="salonName" placeholder="Salon Name" value={form.salonName} onChange={onChange} required />
        <input className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" name="avgServiceTime" type="number" min="5" placeholder="Avg Service Time" value={form.avgServiceTime} onChange={onChange} required />
        <input className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2 md:col-span-2" name="address" placeholder="Address" value={form.address} onChange={onChange} required />
        <input className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" name="lat" placeholder="Latitude" value={form.lat} onChange={onChange} required />
        <input className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" name="lng" placeholder="Longitude" value={form.lng} onChange={onChange} required />
        <button className="md:col-span-2 bg-brand text-white rounded px-3 py-2">Create Barber Account</button>
      </form>
    </main>
  );
};

export default BarberRegister;
