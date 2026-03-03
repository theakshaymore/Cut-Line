import { useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";

const AdminPanel = () => {
  const [email, setEmail] = useState("");
  const [salonName, setSalonName] = useState("");

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

  return (
    <main className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <form onSubmit={sendInvite} className="bg-white border rounded-xl p-5 mt-4 space-y-3">
        <input className="w-full border rounded px-3 py-2" type="email" placeholder="Barber email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" placeholder="Salon name" value={salonName} onChange={(e) => setSalonName(e.target.value)} required />
        <button className="w-full bg-brand text-white rounded px-3 py-2">Send Invite</button>
      </form>
    </main>
  );
};

export default AdminPanel;