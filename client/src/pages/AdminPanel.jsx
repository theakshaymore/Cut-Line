import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import { ShieldCheck, UserRoundPlus } from "lucide-react";

const AdminPanel = () => {
  const [email, setEmail] = useState("");
  const [salonName, setSalonName] = useState("");
  const [requireBarberInvite, setRequireBarberInvite] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [barbers, setBarbers] = useState([]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await api.get("/auth/admin/settings");
        setRequireBarberInvite(Boolean(data.requireBarberInvite));
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load settings");
      }
    };
    loadSettings();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/auth/admin/users-overview");
      setCustomers(data.customers || []);
      setBarbers(data.barbers || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const sendInvite = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/admin/send-invite", { email, salonName });
      toast.success("Invite sent");
      setEmail("");
      setSalonName("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send invite");
    }
  };

  const updatePolicy = async (nextValue) => {
    try {
      setSavingPolicy(true);
      await api.patch("/auth/admin/settings", { requireBarberInvite: nextValue });
      setRequireBarberInvite(nextValue);
      toast.success(`Authorized Accounts ${nextValue ? "enabled" : "disabled"}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update setting");
    } finally {
      setSavingPolicy(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck size={22} /> Admin Panel</h1>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Authorized Accounts</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {requireBarberInvite
                ? "ON: Barber registration requires an invite token."
                : "OFF: Barber registration does not require a token."}
            </p>
          </div>
          <button
            type="button"
            disabled={savingPolicy}
            onClick={() => updatePolicy(!requireBarberInvite)}
            className={`relative w-14 h-8 rounded-full transition ${
              requireBarberInvite ? "bg-brand" : "bg-slate-400"
            } ${savingPolicy ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                requireBarberInvite ? "right-1" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>
      <form onSubmit={sendInvite} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mt-4 space-y-3">
        <input className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" type="email" placeholder="Barber email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" placeholder="Salon name" value={salonName} onChange={(e) => setSalonName(e.target.value)} required />
        <button className="w-full bg-brand text-white rounded px-3 py-2 inline-flex items-center justify-center gap-2"><UserRoundPlus size={16} /> Send Invite</button>
      </form>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mt-4">
        <h2 className="font-semibold mb-3">All Customers</h2>
        <div className="space-y-2 max-h-72 overflow-auto">
          {customers.map((customer) => (
            <div key={customer.id} className="border border-slate-200 dark:border-slate-700 rounded p-3">
              <p className="font-medium">{customer.name}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{customer.email} | {customer.phone}</p>
            </div>
          ))}
          {customers.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No customers found.</p>}
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mt-4">
        <h2 className="font-semibold mb-3">All Barbers & Shops</h2>
        <div className="space-y-2 max-h-80 overflow-auto">
          {barbers.map((barber) => (
            <div key={barber.id} className="border border-slate-200 dark:border-slate-700 rounded p-3">
              <p className="font-medium">{barber.name}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{barber.email} | {barber.phone}</p>
              <p className="text-sm mt-1"><b>Shop:</b> {barber.salon?.name || "N/A"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{barber.salon?.address || "No shop address"}</p>
            </div>
          ))}
          {barbers.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No barbers found.</p>}
        </div>
      </section>
    </main>
  );
};

export default AdminPanel;
