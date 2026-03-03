import WaitTimeBadge from "./WaitTimeBadge";
import { BadgeAlert, UserRound } from "lucide-react";

const QueueList = ({ queue = [], onNoShow }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <h3 className="font-semibold mb-3">Queue</h3>
      <div className="space-y-2">
        {queue.map((entry) => (
          <div key={entry.id} className="border border-slate-200 dark:border-slate-700 rounded p-3 flex items-center justify-between">
            <div>
              <p className="font-medium">#{entry.position} {entry.customer?.name}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{entry.service}</p>
            </div>
            <div className="flex items-center gap-2">
              <UserRound size={15} />
              <WaitTimeBadge minutes={entry.estimatedWait} />
              {onNoShow && (
                <button className="text-xs bg-red-600 text-white px-2 py-1 rounded" onClick={() => onNoShow(entry.id)}>
                  <span className="inline-flex items-center gap-1"><BadgeAlert size={12} /> No-Show</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {queue.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Queue is empty.</p>}
      </div>
    </div>
  );
};

export default QueueList;
