import { useEffect } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import useQueue from "../hooks/useQueue";
import useSocket from "../hooks/useSocket";
import formatTime from "../utils/formatTime";

const MyQueue = () => {
  const { status, refresh } = useQueue();
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    const onTurn = () => toast.success("It is your turn now");
    socket.on("your-turn", onTurn);
    return () => socket.off("your-turn", onTurn);
  }, [socket]);

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
      <div className="bg-white rounded-xl border p-5 mt-4">
        <p className="text-xl font-semibold">Position #{entry.position}</p>
        <p className="text-sm text-slate-600 mt-1">Estimated wait: {formatTime(entry.estimatedWait)}</p>
        <div className="mt-4 h-3 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-brand" style={{ width: `${progress}%` }} />
        </div>
        <button className="mt-4 bg-rose-600 text-white rounded px-3 py-2" onClick={leaveQueue}>Leave Queue</button>
      </div>
    </main>
  );
};

export default MyQueue;