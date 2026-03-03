import WaitTimeBadge from "./WaitTimeBadge";

const QueueList = ({ queue = [], onNoShow }) => {
  return (
    <div className="bg-white rounded-xl border p-4">
      <h3 className="font-semibold mb-3">Queue</h3>
      <div className="space-y-2">
        {queue.map((entry) => (
          <div key={entry.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <p className="font-medium">#{entry.position} {entry.customer?.name}</p>
              <p className="text-sm text-slate-600">{entry.service}</p>
            </div>
            <div className="flex items-center gap-2">
              <WaitTimeBadge minutes={entry.estimatedWait} />
              {onNoShow && (
                <button className="text-xs bg-red-600 text-white px-2 py-1 rounded" onClick={() => onNoShow(entry.id)}>
                  No-Show
                </button>
              )}
            </div>
          </div>
        ))}
        {queue.length === 0 && <p className="text-sm text-slate-500">Queue is empty.</p>}
      </div>
    </div>
  );
};

export default QueueList;