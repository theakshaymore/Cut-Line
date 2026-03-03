import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";
import useSocket from "../hooks/useSocket";
import WaitTimeBadge from "../components/WaitTimeBadge";

const SalonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [salon, setSalon] = useState(null);
  const [service, setService] = useState("Haircut");

  const fetchSalon = async () => {
    const { data } = await api.get(`/salons/${id}`);
    setSalon(data);
  };

  useEffect(() => {
    fetchSalon();
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("join-salon-room", { salonId: id });
    const onUpdate = ({ queue, totalWait }) => {
      setSalon((prev) => (prev ? { ...prev, queueEntries: queue, activeQueueLength: queue.length, estimatedWait: totalWait } : prev));
    };
    socket.on("queue-updated", onUpdate);
    return () => {
      socket.emit("leave-salon-room", { salonId: id });
      socket.off("queue-updated", onUpdate);
    };
  }, [socket, id]);

  const joinQueue = async () => {
    try {
      await api.post("/queue/join", { salonId: id, service });
      toast.success("Joined queue");
      navigate("/my-queue");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join queue");
    }
  };

  if (!salon) return <main className="p-6">Loading...</main>;

  return (
    <main className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-black">{salon.name}</h1>
      <p className="text-slate-600 dark:text-slate-300 mt-1">{salon.address}</p>
      <div className="mt-4 flex items-center gap-4">
        <span>Active queue: {salon.activeQueueLength}</span>
        <WaitTimeBadge minutes={salon.estimatedWait} />
      </div>
      <div className="mt-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 max-w-md">
        <label className="text-sm font-medium">Choose service</label>
        <select className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2 mt-1" value={service} onChange={(e) => setService(e.target.value)}>
          <option>Haircut</option>
          <option>Beard Trim</option>
          <option>Hair + Beard</option>
          <option>Shave</option>
        </select>
        <button className="w-full mt-3 bg-brand text-white rounded px-3 py-2" onClick={joinQueue}>Join Queue</button>
      </div>
    </main>
  );
};

export default SalonDetail;
