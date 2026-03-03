import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import ChairCard from "../components/ChairCard";
import QueueList from "../components/QueueList";
import useSocket from "../hooks/useSocket";

const BarberDashboard = () => {
  const socket = useSocket();
  const [chairs, setChairs] = useState([]);
  const [queue, setQueue] = useState([]);
  const [label, setLabel] = useState("");

  const loadData = async () => {
    const [chairsRes, queueRes] = await Promise.all([api.get("/barber/chairs"), api.get("/barber/queue")]);
    setChairs(chairsRes.data);
    setQueue(queueRes.data.filter((e) => e.status === "waiting"));
  };

  useEffect(() => {
    loadData().catch(() => toast.error("Failed to load dashboard"));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("queue-updated", ({ queue: q }) => setQueue(q));
    socket.on("chair-updated", loadData);
    socket.on("chair-service-suggestion", (p) => toast(p.message));
    return () => {
      socket.off("queue-updated");
      socket.off("chair-updated", loadData);
      socket.off("chair-service-suggestion");
    };
  }, [socket]);

  const stats = useMemo(() => {
    const occupied = chairs.filter((c) => c.status === "occupied").length;
    const avgWait = queue.length ? Math.round(queue.reduce((a, c) => a + c.estimatedWait, 0) / queue.length) : 0;
    return { occupied, waiting: queue.length, avgWait };
  }, [chairs, queue]);

  const callAction = async (fn) => {
    try {
      await fn();
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-3 mb-5">
        <div className="bg-white border rounded p-4">Waiting: <b>{stats.waiting}</b></div>
        <div className="bg-white border rounded p-4">Chairs active: <b>{stats.occupied}</b></div>
        <div className="bg-white border rounded p-4">Avg wait: <b>{stats.avgWait} min</b></div>
      </div>

      <div className="bg-white rounded-xl border p-4 mb-5 flex gap-2">
        <input className="border rounded px-3 py-2" placeholder="New chair label" value={label} onChange={(e) => setLabel(e.target.value)} />
        <button
          className="bg-brand text-white rounded px-3 py-2"
          onClick={() => callAction(async () => { await api.post("/barber/chairs", { label }); setLabel(""); })}
        >
          Add Chair
        </button>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <section className="grid md:grid-cols-2 gap-4">
          {chairs.map((chair) => (
            <ChairCard
              key={chair.id}
              chair={chair}
              queueAvailable={queue.length}
              onAssign={(chairId) => callAction(() => api.patch(`/barber/chair/${chairId}/assign`))}
              onDone={(chairId) => callAction(() => api.patch(`/barber/chair/${chairId}/done`))}
              onIdle={(chairId) => callAction(() => api.patch(`/barber/chair/${chairId}/idle`))}
            />
          ))}
        </section>
        <QueueList queue={queue} onNoShow={(entryId) => callAction(() => api.patch(`/barber/queue/${entryId}/noshow`))} />
      </div>
    </main>
  );
};

export default BarberDashboard;