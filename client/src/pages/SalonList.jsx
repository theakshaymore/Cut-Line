import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import SalonCard from "../components/SalonCard";
import { Compass, MapPin, RefreshCcw, Store, UsersRound } from "lucide-react";
import formatTime from "../utils/formatTime";

const SalonList = () => {
  const [salons, setSalons] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myQueue, setMyQueue] = useState(null);
  const [refreshingQueue, setRefreshingQueue] = useState(false);

  const fetchMyQueue = async () => {
    try {
      const { data } = await api.get("/queue/my-status");
      setMyQueue(data);
    } catch (_) {
      setMyQueue(null);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          setLocation({ latitude, longitude });
          const { data } = await api.get(`/salons?lat=${latitude}&lng=${longitude}&radius=10`);
          setSalons(data);
          await fetchMyQueue();
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to load salons");
        } finally {
          setLoading(false);
        }
      },
      async () => {
        setLoading(false);
        toast.error("Enable geolocation to see nearby salons");
        await fetchMyQueue();
      }
    );
  }, []);

  const refreshQueueStatus = async () => {
    try {
      setRefreshingQueue(true);
      await fetchMyQueue();
      toast.success("Queue status refreshed");
    } finally {
      setRefreshingQueue(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto py-8 px-4">
      <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Compass size={20} /> Nearby Salons</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Live queue + wait time estimates around your location.</p>
        </div>
        {location && (
          <span className="text-sm inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            <MapPin size={14} />
            {location.latitude.toFixed(3)}, {location.longitude.toFixed(3)}
          </span>
        )}
      </div>
      <div className="grid lg:grid-cols-[2fr_1fr] gap-4 mt-5">
        <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden animate-pulse">
                <div className="h-40 bg-slate-200 dark:bg-neutral-800" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-slate-200 dark:bg-neutral-800 rounded w-2/3" />
                  <div className="h-4 bg-slate-200 dark:bg-neutral-800 rounded w-full" />
                  <div className="h-4 bg-slate-200 dark:bg-neutral-800 rounded w-3/4" />
                </div>
              </div>
            ))}
          {!loading &&
            salons.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
        </section>
        <aside className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-4 h-fit">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold inline-flex items-center gap-2">
              <UsersRound size={16} /> My Waiting List
            </h2>
            <button
              type="button"
              onClick={refreshQueueStatus}
              disabled={refreshingQueue}
              className="text-xs border border-slate-300 dark:border-neutral-700 rounded px-2 py-1 inline-flex items-center gap-1"
            >
              <RefreshCcw size={13} />
              Refresh
            </button>
          </div>
          {myQueue?.active ? (
            <div className="rounded-xl border border-slate-200 dark:border-neutral-800 p-3 space-y-2">
              <p className="inline-flex items-center gap-2 font-medium">
                <Store size={15} /> {myQueue.entry?.salon?.name || "Active queue"}
              </p>
              <p className="text-sm">Position: <b>#{myQueue.entry?.position}</b></p>
              <p className="text-sm">Service: <b>{myQueue.entry?.service}</b></p>
              <p className="text-sm">Estimated wait: <b>{formatTime(myQueue.entry?.estimatedWait)}</b></p>
            </div>
          ) : (
            <p className="text-sm text-slate-600 dark:text-neutral-300">No active queue yet. Join a salon queue to see your status here.</p>
          )}
        </aside>
      </div>
    </main>
  );
};

export default SalonList;
