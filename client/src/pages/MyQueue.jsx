import api from "../utils/api";
import useQueue from "../hooks/useQueue";
import formatTime from "../utils/formatTime";
import { Clock3, GaugeCircle, UsersRound } from "lucide-react";

const MyQueue = () => {
  const { status, refresh } = useQueue();

  const leaveQueue = async () => {
    await api.delete("/queue/leave");
    await refresh();
  };

  if (!status) return <main className="p-6">Loading...</main>;
  if (!status.active) return <main className="p-6">No active queue.</main>;

  const { entry } = status;
  const progress = Math.max(10, 100 - entry.position * 12);

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold">My Queue Status</h1>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mt-4">
        <p className="text-xl font-semibold flex items-center gap-2"><UsersRound size={18} /> Position #{entry.position}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-2"><Clock3 size={15} /> Estimated wait: {formatTime(entry.estimatedWait)}</p>
        <div className="mt-4 h-3 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-brand" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs mt-2 text-slate-500 dark:text-slate-400 inline-flex items-center gap-1"><GaugeCircle size={14} /> Progress to your turn</p>
        <button className="mt-4 bg-rose-600 text-white rounded px-3 py-2" onClick={leaveQueue}>Leave Queue</button>
      </div>
    </main>
  );
};

export default MyQueue;
