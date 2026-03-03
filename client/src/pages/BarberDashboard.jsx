import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import { Armchair, Clock3, ImagePlus, Store, UploadCloud, UsersRound } from "lucide-react";
import ChairCard from "../components/ChairCard";
import QueueList from "../components/QueueList";
import useSocket from "../hooks/useSocket";
import uploadImageToImageKit from "../utils/imageUpload";

const BarberDashboard = () => {
  const socket = useSocket();
  const [chairs, setChairs] = useState([]);
  const [queue, setQueue] = useState([]);
  const [label, setLabel] = useState("");
  const [salon, setSalon] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const loadData = async () => {
    const [chairsRes, queueRes, salonRes] = await Promise.all([
      api.get("/barber/chairs"),
      api.get("/barber/queue"),
      api.get("/barber/salon"),
    ]);
    setChairs(chairsRes.data);
    setQueue(queueRes.data.filter((e) => e.status === "waiting"));
    setSalon(salonRes.data);
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

  const replaceShopPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const uploaded = await uploadImageToImageKit(file, "/nextcut/shops");
      await api.patch("/barber/salon/photo", { imageUrl: uploaded.url });
      await loadData();
      toast.success("Shop photo updated");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to update shop photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-5 grid md:grid-cols-[220px_1fr] gap-4">
        <div className="relative">
          <img
            src={salon?.imageUrl || "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1200&q=80"}
            alt="Shop"
            className="w-full h-44 md:h-full object-cover rounded-xl border border-slate-200 dark:border-slate-700"
          />
          <label className="absolute right-2 bottom-2 bg-black/70 text-white text-xs px-2 py-1 rounded cursor-pointer flex items-center gap-1">
            <ImagePlus size={14} />
            {uploadingPhoto ? "Uploading..." : "Replace"}
            <input type="file" accept="image/*" className="hidden" onChange={replaceShopPhoto} />
          </label>
        </div>
        <div className="flex flex-col justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Store size={14} /> Salon profile
            </p>
            <h2 className="text-2xl font-bold mt-1">{salon?.name || "Your Salon"}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{salon?.address || "No address yet"}</p>
          </div>
          <label className="inline-flex w-fit items-center gap-2 border border-dashed border-slate-400 dark:border-slate-600 rounded px-3 py-2 cursor-pointer text-sm">
            <UploadCloud size={16} />
            Update shop image
            <input type="file" accept="image/*" className="hidden" onChange={replaceShopPhoto} />
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-4 flex items-center justify-between">
          <div>Waiting: <b>{stats.waiting}</b></div>
          <UsersRound size={18} />
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-4 flex items-center justify-between">
          <div>Chairs active: <b>{stats.occupied}</b></div>
          <Armchair size={18} />
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-4 flex items-center justify-between">
          <div>Avg wait: <b>{stats.avgWait} min</b></div>
          <Clock3 size={18} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-5 flex gap-2">
        <input className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2" placeholder="New chair label" value={label} onChange={(e) => setLabel(e.target.value)} />
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
