import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";
import useSocket from "../hooks/useSocket";
import WaitTimeBadge from "../components/WaitTimeBadge";
import { Clock3, Store, UsersRound } from "lucide-react";

const SalonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [salon, setSalon] = useState(null);
  const [service, setService] = useState("Haircut");
  const [myQueue, setMyQueue] = useState(null);

  const fetchSalon = async () => {
    const { data } = await api.get(`/salons/${id}`);
    setSalon(data);
  };

  useEffect(() => {
    fetchSalon();
  }, [id]);

  useEffect(() => {
    const fetchMyStatus = async () => {
      try {
        const { data } = await api.get("/queue/my-status");
        setMyQueue(data);
      } catch (_) {
        setMyQueue(null);
      }
    };
    fetchMyStatus();
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
      navigate("/salons");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join queue");
    }
  };

  const alreadyJoined = Boolean(myQueue?.active);

  if (!salon) return <main className="p-6">Loading...</main>;

  return (
    <main className="max-w-5xl mx-auto py-8 px-4">
      <img
        src={salon.imageUrl || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1400&q=80"}
        alt={salon.name}
        className="h-56 w-full rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
      />
      <h1 className="text-3xl font-black mt-4 flex items-center gap-2"><Store size={24} /> {salon.name}</h1>
      <p className="text-slate-600 dark:text-slate-300 mt-1">{salon.address}</p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <span className="inline-flex items-center gap-1"><UsersRound size={15} /> Active queue: {salon.activeQueueLength}</span>
        <span className="inline-flex items-center gap-1"><Clock3 size={15} /> <WaitTimeBadge minutes={salon.estimatedWait} /></span>
      </div>
      <div className="mt-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 max-w-md">
        <label className="text-sm font-medium">Choose service</label>
        <select className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2 mt-1" value={service} onChange={(e) => setService(e.target.value)}>
          <option>Haircut</option>
          <option>Beard Trim</option>
          <option>Hair + Beard</option>
          <option>Shave</option>
        </select>
        <button
          className={`w-full mt-3 rounded px-3 py-2 ${alreadyJoined ? "bg-slate-400 cursor-not-allowed" : "bg-brand"} text-white`}
          onClick={joinQueue}
          disabled={alreadyJoined}
        >
          {alreadyJoined ? "Already Joined" : "Join Queue"}
        </button>
      </div>
    </main>
  );
};

export default SalonDetail;
