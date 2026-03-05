import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import {
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Store,
  Trash2,
  UserRoundPlus,
  UserX,
} from "lucide-react";

const SectionHeader = ({ title, isOpen, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full flex items-center justify-between bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-3"
  >
    <span className="font-semibold">{title}</span>
    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
  </button>
);

const AdminPanel = () => {
  const [email, setEmail] = useState("");
  const [salonName, setSalonName] = useState("");
  const [requireBarberInvite, setRequireBarberInvite] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [salons, setSalons] = useState([]);
  const [openUsers, setOpenUsers] = useState(true);
  const [openStores, setOpenStores] = useState(true);

  const loadSettings = async () => {
    const { data } = await api.get("/auth/admin/settings");
    setRequireBarberInvite(Boolean(data.requireBarberInvite));
  };

  const loadUsers = async () => {
    const { data } = await api.get("/auth/admin/users-overview");
    setCustomers(data.customers || []);
    setBarbers(data.barbers || []);
    setSalons(data.salons || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([loadSettings(), loadUsers()]);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load admin panel data");
      }
    };
    load();
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

  const banUser = async (userId, isBanned) => {
    try {
      await api.patch(`/auth/admin/users/${userId}/ban`, { isBanned });
      toast.success(isBanned ? "User banned" : "User unbanned");
      await loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user ban");
    }
  };

  const deleteUser = async (userId) => {
    try {
      await api.delete(`/auth/admin/users/${userId}`);
      toast.success("User deleted");
      await loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const setStoreListing = async (salonId, isListed) => {
    try {
      await api.patch(`/auth/admin/salons/${salonId}/listing`, { isListed });
      toast.success(isListed ? "Store relisted" : "Store delisted");
      await loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update listing");
    }
  };

  const deleteStore = async (salonId) => {
    try {
      await api.delete(`/auth/admin/salons/${salonId}`);
      toast.success("Store deleted");
      await loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete store");
    }
  };

  return (
    <main className="max-w-5xl mx-auto py-10 px-4 space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck size={22} /> Admin Panel</h1>

      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Authorized Accounts</p>
            <p className="text-sm text-slate-600 dark:text-neutral-300">
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

      <form onSubmit={sendInvite} className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-5 space-y-3">
        <input className="w-full border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 rounded px-3 py-2" type="email" placeholder="Barber email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 rounded px-3 py-2" placeholder="Salon name" value={salonName} onChange={(e) => setSalonName(e.target.value)} required />
        <button className="w-full bg-brand text-white rounded px-3 py-2 inline-flex items-center justify-center gap-2"><UserRoundPlus size={16} /> Send Invite</button>
      </form>

      <SectionHeader title={`Users (${customers.length + barbers.length})`} isOpen={openUsers} onToggle={() => setOpenUsers((v) => !v)} />
      {openUsers && (
        <section className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-4">
            <h2 className="font-semibold mb-3">Customers</h2>
            <div className="space-y-2 max-h-96 overflow-auto">
              {customers.map((user) => (
                <div key={user.id} className="border border-slate-200 dark:border-neutral-800 rounded p-3">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-slate-600 dark:text-neutral-300">{user.email} | {user.phone}</p>
                  <div className="mt-2 flex gap-2">
                    <button className="text-xs bg-amber-600 text-white rounded px-2 py-1 inline-flex items-center gap-1" onClick={() => banUser(user.id, !user.isBanned)}>
                      <UserX size={12} /> {user.isBanned ? "Unban" : "Ban"}
                    </button>
                    <button className="text-xs bg-rose-600 text-white rounded px-2 py-1 inline-flex items-center gap-1" onClick={() => deleteUser(user.id)}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
              {customers.length === 0 && <p className="text-sm text-slate-500 dark:text-neutral-400">No customers found.</p>}
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-4">
            <h2 className="font-semibold mb-3">Barbers</h2>
            <div className="space-y-2 max-h-96 overflow-auto">
              {barbers.map((user) => (
                <div key={user.id} className="border border-slate-200 dark:border-neutral-800 rounded p-3">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-slate-600 dark:text-neutral-300">{user.email} | {user.phone}</p>
                  <p className="text-xs mt-1"><b>Shop:</b> {user.salon?.name || "N/A"}</p>
                  <div className="mt-2 flex gap-2">
                    <button className="text-xs bg-amber-600 text-white rounded px-2 py-1 inline-flex items-center gap-1" onClick={() => banUser(user.id, !user.isBanned)}>
                      <UserX size={12} /> {user.isBanned ? "Unban" : "Ban"}
                    </button>
                    <button className="text-xs bg-rose-600 text-white rounded px-2 py-1 inline-flex items-center gap-1" onClick={() => deleteUser(user.id)}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
              {barbers.length === 0 && <p className="text-sm text-slate-500 dark:text-neutral-400">No barbers found.</p>}
            </div>
          </div>
        </section>
      )}

      <SectionHeader title={`Stores (${salons.length})`} isOpen={openStores} onToggle={() => setOpenStores((v) => !v)} />
      {openStores && (
        <section className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-4">
          <div className="space-y-2 max-h-96 overflow-auto">
            {salons.map((salon) => (
              <div key={salon.id} className="border border-slate-200 dark:border-neutral-800 rounded p-3">
                <p className="font-medium inline-flex items-center gap-2"><Store size={14} /> {salon.name}</p>
                <p className="text-sm text-slate-600 dark:text-neutral-300">{salon.address}</p>
                <div className="mt-2 flex gap-2">
                  <button className="text-xs bg-slate-700 text-white rounded px-2 py-1" onClick={() => setStoreListing(salon.id, !salon.isListed)}>
                    {salon.isListed ? "Delist" : "Relist"}
                  </button>
                  <button className="text-xs bg-rose-600 text-white rounded px-2 py-1 inline-flex items-center gap-1" onClick={() => deleteStore(salon.id)}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
            {salons.length === 0 && <p className="text-sm text-slate-500 dark:text-neutral-400">No stores found.</p>}
          </div>
        </section>
      )}
    </main>
  );
};

export default AdminPanel;
